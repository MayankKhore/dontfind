/**
 * seo.js — metadata + structured data builders.
 *
 * Pages hand these the *content* facts they already have (a title, a
 * description, a difficulty, a date) and get back correct, budgeted head tags
 * and schema.org markup. Nothing here invents marketing copy, so the output
 * can never become keyword stuffing.
 *
 * Type selection lives in config/seo.config.js; this module only knows how
 * to render the types a page legitimately qualifies for.
 */

import { SITE, SECTIONS } from './site.js';
import { absoluteUrl, assetUrl, canonical } from './url.js';
import {
  SITE_URL,
  TITLE_MAX,
  DESCRIPTION_MIN,
  DESCRIPTION_MAX,
  SOCIAL_IMAGE,
  SOCIAL,
} from '../config/seo.config.mjs';

/* ------------------------------------------------------------------ *
 * Text helpers
 * ------------------------------------------------------------------ */

/** Collapse whitespace and strip control characters. */
function clean(value) {
  return String(value ?? '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Trim to a character budget on a word boundary.
 *
 * Never returns a half-word (the old answer.slice(0, 155) could end
 * mid-sentence, which reads as sloppy in every SERP).
 */
export function truncate(text, max, ellipsis = '…') {
  const value = clean(text);
  if (!value) return '';
  if (value.length <= max) return value;

  const hard = value.slice(0, max);
  const lastSpace = hard.lastIndexOf(' ');
  // Only honour the word boundary if it does not gut the string.
  const cut = lastSpace > max * 0.6 ? hard.slice(0, lastSpace) : hard;
  return `${cut.replace(/[\s,;:.—-]+$/, '')}${ellipsis}`;
}

/**
 * Page title: {title} | CCNA Path, clamped to the SERP budget.
 *
 * The brand suffix is dropped rather than the descriptive part being cut to
 * ribbons — a truncated brand still identifies the site, a truncated noun
 * phrase ("Configuring VLANs and access po…") does not.
 */
export function buildTitle(rawTitle) {
  const title = clean(rawTitle);
  if (!title) return `${SITE.name} — ${SITE.tagline}`;

  const brandSuffix = ` | ${SITE.name}`;
  const full = `${title}${brandSuffix}`;
  if (full.length <= TITLE_MAX) return full;

  const budget = TITLE_MAX - brandSuffix.length;
  return `${truncate(title, budget, '')}${brandSuffix}`;
}

/**
 * Meta description clamped to the SERP budget.
 *
 * Falls back to the site description only when a page supplies nothing, so a
 * new page is never shipped with a blank description.
 */
export function buildDescription(rawDescription) {
  const description = clean(rawDescription);
  if (!description) return truncate(SITE.description, DESCRIPTION_MAX);
  return truncate(description, DESCRIPTION_MAX);
}

/** Human label for a difficulty level, for educationalLevel. */
export const EDUCATIONAL_LEVELS = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
};

/** learningResourceType per collection — each page declares only its own. */
export const RESOURCE_TYPES = {
  lessons: 'Lesson',
  labs: 'Lab',
  quizzes: 'Quiz',
  tools: 'Tool',
  interview: 'Practice',
  incidents: 'Troubleshooting scenario',
  glossary: 'Definition',
  articles: 'Article',
};

/**
 * Convert a human duration ("45 min", "1 h 30") to the ISO 8601 duration
 * schema.org requires (PT45M). Returns undefined when unparseable so the
 * property is omitted rather than emitted invalid.
 */
export function isoDuration(input) {
  const value = clean(input).toLowerCase();
  if (!value) return undefined;

  const hours = value.match(/(\d+(?:\.\d+)?)\s*(?:h|hr|hrs|hour|hours)/);
  const minutes = value.match(/(\d+(?:\.\d+)?)\s*(?:m|min|mins|minute|minutes)/);
  if (!hours && !minutes) return undefined;

  const h = hours ? parseFloat(hours[1]) : 0;
  const m = minutes ? parseFloat(minutes[1]) : 0;
  if (!h && !m) return undefined;

  return `PT${h ? `${h}H` : ''}${m ? `${m}M` : ''}`;
}

/** Only emit a date schema.org will accept. */
function isoDate(value) {
  const raw = clean(value);
  if (!raw) return undefined;
  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) return undefined;
  return date.toISOString();
}

/** Drop undefined keys so the JSON-LD never carries empty properties. */
function compact(object) {
  return Object.fromEntries(Object.entries(object).filter(([, v]) => v !== undefined && v !== null && v !== ''));
}

/* ------------------------------------------------------------------ *
 * Page-level metadata
 * ------------------------------------------------------------------ */

/**
 * Everything <BaseHead> needs for one page, resolved once.
 * ogType is article only for genuinely article-like content.
 */
export function buildMeta({
  title,
  description,
  path,
  image = SOCIAL_IMAGE.path,
  imageAlt,
  ogType = 'website',
  publishedTime,
  modifiedTime,
  collection,
} = {}) {
  const url = canonical(path);
  const imageUrl = assetUrl(image);
  const fullTitle = buildTitle(title);
  const fullDescription = buildDescription(description);
  const section = collection ? SECTIONS.find((s) => s.collection === collection) : undefined;

  return {
    title: fullTitle,
    description: fullDescription,
    canonical: url,
    ogType,
    image: imageUrl,
    imageAlt: imageAlt || SOCIAL_IMAGE.alt,
    imageWidth: SOCIAL_IMAGE.width,
    imageHeight: SOCIAL_IMAGE.height,
    sectionLabel: section?.label || SITE.name,
    publishedTime: isoDate(publishedTime),
    modifiedTime: isoDate(modifiedTime),
    // Keep the site description under the minimum by construction so the
    // audit never flags the fallback path.
    descriptionLength: fullDescription.length,
  };
}

export { SOCIAL, SOCIAL_IMAGE, DESCRIPTION_MIN, DESCRIPTION_MAX, TITLE_MAX };


const ORGANIZATION_ID = `${SITE_URL}/#organization`;
const WEBSITE_ID = `${SITE_URL}/#website`;

/** Base Organization + WebSite graph, emitted on every page. */
export function siteSchema() {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': ORGANIZATION_ID,
        name: SITE.name,
        url: SITE_URL,
        description: SITE.description,
      },
      {
        '@type': 'WebSite',
        '@id': WEBSITE_ID,
        name: SITE.name,
        url: SITE_URL,
        description: SITE.description,
        publisher: { '@id': ORGANIZATION_ID },
        potentialAction: {
          '@type': 'SearchAction',
          target: `${SITE_URL}/search/?q={search_term_string}`,
          'query-input': 'required name=search_term_string',
        },
      },
    ],
  };
}

/**
 * WebPage describing the document itself. Other nodes reference it by
 * @id, which lets a consumer treat the page as one entity rather than a
 * bag of unrelated blobs.
 */
export function webPageSchema({ title, description, path }) {
  const url = canonical(path);
  return compact({
    '@type': 'WebPage',
    '@id': `${url}#webpage`,
    url,
    name: title,
    description,
    isPartOf: { '@id': WEBSITE_ID },
    about: { '@id': ORGANIZATION_ID },
    inLanguage: 'en',
  });
}

/**
 * TechArticle for genuinely editorial content (lessons, articles, incident
 * write-ups, interview answers).
 *
 * mainEntityOfPage must be a WebPage **object**, not a bare URL string —
 * the old code emitted a string, which validators reject. Dates are emitted
 * only when the content supplies one; a fabricated date would be misleading
 * structured data.
 */
export function articleSchema({
  title,
  description,
  path,
  datePublished,
  dateModified,
  difficulty,
  keywords,
}) {
  const url = canonical(path);
  const published = isoDate(datePublished);
  const modified = isoDate(dateModified) || published;

  return compact({
    '@type': 'TechArticle',
    '@id': `${url}#article`,
    mainEntityOfPage: { '@id': `${url}#webpage` },
    headline: truncate(title, 110),
    description,
    url,
    inLanguage: 'en',
    isAccessibleForFree: true,
    datePublished: published,
    dateModified: modified,
    author: { '@id': ORGANIZATION_ID },
    publisher: { '@id': ORGANIZATION_ID },
    proficiencyLevel: difficulty ? EDUCATIONAL_LEVELS[difficulty] || difficulty : undefined,
    keywords: keywords?.length ? keywords.join(', ') : undefined,
  });
}

/**
 * LearningResource for hands-on practice (labs, and any page where the reader
 * performs the task rather than only reading about it).
 *
 * timeRequired is emitted as an ISO 8601 duration — the previous "12 min"
 * string was invalid. learningResourceType comes from the collection, so a
 * lab is never mislabelled and a quiz is never called a lab.
 */
export function learningResourceSchema({
  title,
  description,
  path,
  collection = 'labs',
  difficulty,
  timeRequired,
  teaches,
  keywords,
}) {
  const url = canonical(path);
  return compact({
    '@type': 'LearningResource',
    '@id': `${url}#learningresource`,
    name: title,
    description,
    url,
    inLanguage: 'en',
    learningResourceType: RESOURCE_TYPES[collection] || 'Practice',
    educationalLevel: difficulty ? EDUCATIONAL_LEVELS[difficulty] || difficulty : undefined,
    teaches,
    timeRequired: isoDuration(timeRequired),
    interactivityType: 'hands-on',
    isAccessibleForFree: true,
    provider: { '@id': ORGANIZATION_ID },
    mainEntityOfPage: { '@id': `${url}#webpage` },
    keywords: keywords?.length ? keywords.join(', ') : undefined,
  });
}

/** Quiz — a real schema.org type for an assessment page. */
export function quizSchema({
  title,
  description,
  path,
  difficulty,
  questionCount,
  timeRequired,
  keywords,
}) {
  const url = canonical(path);
  return compact({
    '@type': 'Quiz',
    '@id': `${url}#quiz`,
    name: title,
    description,
    url,
    inLanguage: 'en',
    educationalLevel: difficulty ? EDUCATIONAL_LEVELS[difficulty] || difficulty : undefined,
    numberOfQuestions: questionCount,
    timeRequired: isoDuration(timeRequired),
    isAccessibleForFree: true,
    provider: { '@id': ORGANIZATION_ID },
    mainEntityOfPage: { '@id': `${url}#webpage` },
    keywords: keywords?.length ? keywords.join(', ') : undefined,
  });
}

/**
 * SoftwareApplication for the browser tools.
 *
 * offers with price 0 describes the real access model (everything is free
 * and runs locally) instead of leaving Google to guess.
 */
export function softwareSchema({
  title,
  description,
  path,
  applicationCategory = 'UtilitiesApplication',
  keywords,
}) {
  const url = canonical(path);
  return compact({
    '@type': 'SoftwareApplication',
    '@id': `${url}#software`,
    name: title,
    description,
    url,
    inLanguage: 'en',
    applicationCategory,
    operatingSystem: 'Any (web browser)',
    browserRequirements: 'Requires JavaScript',
    isAccessibleForFree: true,
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    provider: { '@id': ORGANIZATION_ID },
    mainEntityOfPage: { '@id': `${url}#webpage` },
    keywords: keywords?.length ? keywords.join(', ') : undefined,
  });
}

/**
 * DefinedTerm for a glossary entry — far more accurate than the TechArticle
 * the glossary pages used to emit for a short definition.
 */
export function definedTermSchema({ term, definition, path, acronymFor }) {
  const url = canonical(path);
  return compact({
    '@type': 'DefinedTerm',
    '@id': `${url}#definedterm`,
    name: term,
    description: definition,
    url,
    inLanguage: 'en',
    alternateName: acronymFor,
    inDefinedTermSet: { '@id': `${SITE_URL}/glossary/#definedtermset` },
    mainEntityOfPage: { '@id': `${url}#webpage` },
  });
}

/** DefinedTermSet for the glossary index. */
export function definedTermSetSchema({ name, description, path, terms = [] }) {
  const url = canonical(path);
  return compact({
    '@type': 'DefinedTermSet',
    '@id': `${url}#definedtermset`,
    name,
    description,
    url,
    inLanguage: 'en',
    hasDefinedTerm: terms.map((t) => ({ '@id': `${canonical(t.path)}#definedterm` })),
  });
}

/** Course for the staged learning path. */
export function courseSchema({ name, description, path }) {
  const url = canonical(path);
  return compact({
    '@type': 'Course',
    '@id': `${url}#course`,
    name,
    description,
    url,
    inLanguage: 'en',
    isAccessibleForFree: true,
    provider: { '@id': ORGANIZATION_ID },
    mainEntityOfPage: { '@id': `${url}#webpage` },
    hasCourseInstance: {
      '@type': 'CourseInstance',
      courseMode: 'online',
      courseWorkload: 'PT40H',
    },
  });
}

/**
 * BreadcrumbList from an ordered array of { href, label }.
 *
 * The final crumb deliberately carries no item: it is the current page, and
 * pointing it at itself is how trails end up describing a cycle.
 */
export function breadcrumbSchema(items = []) {
  return {
    '@type': 'BreadcrumbList',
    '@id': `${absoluteUrl(items[0]?.href || '/')}#breadcrumb`,
    itemListElement: items.map((item, i) =>
      compact({
        '@type': 'ListItem',
        position: i + 1,
        name: item.label,
        item: i === items.length - 1 ? undefined : absoluteUrl(item.href),
      }),
    ),
  };
}

/**
 * Compose the whole page graph in one object.
 *
 * A single @graph (rather than three sibling <script> blocks) lets the
 * Organization/WebSite nodes be referenced by @id instead of duplicated,
 * and keeps the head to one parseable JSON-LD payload.
 */
export function pageGraph({ meta, breadcrumbs, nodes = [] }) {
  const graph = [
    ...siteSchema()['@graph'],
    webPageSchema({
      title: meta.title,
      description: meta.description,
      path: meta.canonical,
    }),
    ...nodes.filter(Boolean),
  ];

  // Only emit a trail when there is somewhere to go back to.
  if (breadcrumbs && breadcrumbs.length > 1) {
    graph.push(breadcrumbSchema(breadcrumbs));
  }

  return { '@context': 'https://schema.org', '@graph': graph };
}

export { SITE_URL, ORGANIZATION_ID, WEBSITE_ID };

