/**
 * site.js — single source of truth for site-wide config.
 *
 * Anything reused across layouts/components/pages (brand, navigation,
 * footer columns, content-section registry) lives here so there is exactly
 * one place to update when the platform grows.
 */

import { SITE_URL } from '../config/seo.config.mjs';

export const SITE = {
  name: 'CCNA Path',
  tagline: 'Learn networking in your browser',
  description:
    'CCNA Path is a hands-on networking education platform: guided CLI labs, in-depth CCNA lessons, quizzes, subnet tools, interview questions and incident troubleshooting scenarios.',
  // Owned by the SEO config so the canonical domain has exactly one home.
  url: SITE_URL,
  locale: 'en',
  author: 'CCNA Path',
  twitter: '@ccnapath',
};

/**
 * The eight content collections the platform is built from.
 * `icon` is a key from Icon.astro's set (not an emoji) so every section
 * renders identically on every platform.
 */
export const SECTIONS = [
  {
    collection: 'lessons',
    href: '/lessons',
    label: 'Lessons',
    short: 'Lesson',
    icon: 'book',
    unit: 'lesson',
    description:
      'Build a complete mental model of networking — physical to application layer — with focused, exam-aligned theory.',
  },
  {
    collection: 'labs',
    href: '/labs',
    label: 'Guided Labs',
    short: 'Lab',
    icon: 'flask',
    unit: 'lab',
    description:
      'Configure real switches and routers in a simulated Cisco IOS environment with objectives and instant grading.',
  },
  {
    collection: 'quizzes',
    href: '/quizzes',
    label: 'Quizzes & MCQs',
    short: 'Quiz',
    icon: 'help-circle',
    unit: 'quiz',
    description:
      'Test recall under exam conditions. Every option is marked and every answer is explained.',
  },
  {
    collection: 'tools',
    href: '/tools',
    label: 'Network Tools',
    short: 'Tool',
    icon: 'sliders',
    unit: 'tool',
    description:
      'Subnet calculator, mask converter and everyday helpers. Everything runs in your browser.',
  },
  {
    collection: 'interview',
    href: '/interview-questions',
    label: 'Interview Questions',
    short: 'Interview',
    icon: 'mic',
    unit: 'question',
    description:
      'Model answers plus the follow-ups interviewers actually ask, written the way strong candidates answer.',
  },
  {
    collection: 'incidents',
    href: '/incidents',
    label: 'Incident Scenarios',
    short: 'Incident',
    icon: 'alert-triangle',
    unit: 'scenario',
    description:
      'Read the symptom, form a hypothesis, prove it with the CLI, then resolve the fault for good.',
  },
  {
    collection: 'glossary',
    href: '/glossary',
    label: 'Glossary',
    short: 'Glossary',
    icon: 'book-open',
    unit: 'term',
    description:
      'Plain-English definitions of every protocol and acronym you will be asked about.',
  },
  {
    collection: 'articles',
    href: '/articles',
    label: 'Articles',
    short: 'Article',
    icon: 'file-text',
    unit: 'article',
    description: 'Long-form study guides, deep dives and background reading for exam day.',
  },
];

/**
 * Header navigation, grouped so the bar stays short enough to scan.
 * `match` (derived from href) is the URL prefix used for the active state.
 */
export const NAV_GROUPS = [
  {
    id: 'learn',
    label: 'Learn',
    items: [
      { href: '/path/', label: 'Learning path', desc: 'The recommended order, stage by stage.', icon: 'route' },
      { href: '/lessons/', label: 'Lessons', desc: 'Theory, structured by layer.', icon: 'book' },
      { href: '/labs/', label: 'Guided labs', desc: 'Practise on a simulated switch.', icon: 'flask' },
      { href: '/quizzes/', label: 'Quizzes & MCQs', desc: 'Test yourself with explanations.', icon: 'help-circle' },
    ],
  },
  {
    id: 'practice',
    label: 'Practice',
    items: [
      { href: '/tools/', label: 'Network tools', desc: 'Calculators for the real world.', icon: 'sliders' },
      { href: '/interview-questions/', label: 'Interview prep', desc: 'Questions with model answers.', icon: 'mic' },
      { href: '/incidents/', label: 'Incidents', desc: 'Diagnose and fix broken networks.', icon: 'alert-triangle' },
    ],
  },
  {
    id: 'reference',
    label: 'Reference',
    items: [
      { href: '/glossary/', label: 'Glossary', desc: 'Terms, acronyms and protocols.', icon: 'book-open' },
      { href: '/articles/', label: 'Articles', desc: 'Study guides and deep dives.', icon: 'file-text' },
      { href: '/dashboard/', label: 'Dashboard', desc: 'Your progress and streaks.', icon: 'gauge' },
      { href: '/profile/', label: 'Profile & badges', desc: 'Achievements you have earned.', icon: 'award' },
    ],
  },
];

/** Difficulty levels shared by every collection schema. */
export const DIFFICULTIES = ['beginner', 'intermediate', 'advanced'];

/** Footer columns — kept deliberately small and crawlable. */
export const FOOTER_COLUMNS = [
  {
    title: 'Learn',
    links: [
      { href: '/path/', label: 'Learning path' },
      { href: '/lessons/', label: 'CCNA Lessons' },
      { href: '/labs/', label: 'Guided Labs' },
      { href: '/quizzes/', label: 'Quizzes & MCQs' },
    ],
  },
  {
    title: 'Practice',
    links: [
      { href: '/tools/', label: 'Network Tools' },
      { href: '/interview-questions/', label: 'Interview Questions' },
      { href: '/incidents/', label: 'Incident Scenarios' },
      { href: '/articles/', label: 'Articles' },
    ],
  },
  {
    title: 'Project',
    links: [
      { href: '/dashboard/', label: 'Dashboard' },
      { href: '/premium/', label: 'Premium' },
      { href: '/about/', label: 'About' },
      { href: '/legacy/', label: 'Classic App (v1)' },
      { href: '/sitemap-index.xml', label: 'Sitemap' },
    ],
  },
];

/**
 * Starter links shown in the ⌘K search overlay before the reader types.
 * Static means the overlay is useful with no network round trip and no
 * flash of empty content.
 */
export const QUICK_LINKS = [
  { href: '/path/', label: 'Learning path', type: 'Navigate', icon: 'route' },
  { href: '/dashboard/', label: 'My dashboard', type: 'Navigate', icon: 'gauge' },
  { href: '/tools/subnet-calculator/', label: 'Subnet calculator', type: 'Tool', icon: 'calculator' },
  { href: '/labs/', label: 'Guided labs', type: 'Navigate', icon: 'flask' },
  { href: '/lessons/', label: 'Lessons', type: 'Navigate', icon: 'book' },
  { href: '/quizzes/', label: 'Quizzes & MCQs', type: 'Navigate', icon: 'help-circle' },
  { href: '/glossary/', label: 'Glossary', type: 'Navigate', icon: 'book-open' },
  { href: '/premium/', label: 'Premium', type: 'Navigate', icon: 'sparkles' },
];
