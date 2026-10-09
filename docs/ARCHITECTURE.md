# CCNA Path â€” Architecture Guide

This document explains how the platform is structured and how to add new
**pages, components, tools and content** without breaking the build.

The site is built with **Astro 5** in `output: 'static'` mode. Every route is
**pre-rendered to crawlable HTML**; interactive features (CLI simulator, quizzes,
calculators) are small **client-side island scripts** loaded only on the pages
that use them.

---

## 1. Directory map

```
/
â”œâ”€â”€ astro.config.mjs         # Astro config (static output, sitemap)
â”œâ”€â”€ netlify.toml             # Netlify build + headers config
â”œâ”€â”€ package.json
â”œâ”€â”€ scripts/
â”‚   â”œâ”€â”€ verify-build.mjs     # post-build link/canonical/SEO checks
â”‚   â”œâ”€â”€ audit-dist.mjs       # deeper output audit (template leaks, ids, a11y)
â”‚   â”œâ”€â”€ smoke-routes.mjs     # boots the server and checks every route
â”‚   â””â”€â”€ migrate-content.mjs  # one-off legacy data â†’ content migration
â”œâ”€â”€ public/
â”‚   â”œâ”€â”€ favicon.svg
â”‚   â”œâ”€â”€ og-default.svg
â”‚   â””â”€â”€ legacy/              # the ORIGINAL single-page app, preserved at /legacy/
â””â”€â”€ src/
    â”œâ”€â”€ content.config.ts    # Content Collections + zod validation
    â”œâ”€â”€ content/             # one folder per collection of JSON / Markdown
    â”‚   â”œâ”€â”€ labs/  lessons/  quizzes/  tools/
    â”‚   â”œâ”€â”€ interview/  incidents/  glossary/  articles/
    â”œâ”€â”€ layouts/
    â”‚   â””â”€â”€ BaseLayout.astro # HTML shell: head, header, footer, JSON-LD
    â”œâ”€â”€ components/          # the shared design system (30+ components)
    â”‚   â”œâ”€â”€ Icon.astro          PageHeader.astro  Section.astro
    â”‚   â”œâ”€â”€ Button.astro       Card.astro        Badge.astro   Alert.astro
    â”‚   â”œâ”€â”€ TabBar.astro       Accordion.astro   EmptyState.astro
    â”‚   â”œâ”€â”€ Stat.astro         ProgressRing.astro  ProgressIndicator.astro
    â”‚   â”œâ”€â”€ CodeBlock.astro    Kbd.astro         CTABand.astro
    â”‚   â”œâ”€â”€ Topology.astro     ThemeToggle.astro SearchOverlay.astro
    â”‚   â”œâ”€â”€ CollectionBrowser.astro  AchievementGrid.astro
    â”‚   â”œâ”€â”€ RecentlyVisited.astro    RelatedResources.astro
    â”‚   â”œâ”€â”€ Breadcrumbs.astro  Sidebar.astro    SearchBox.astro
    â”‚   â”œâ”€â”€ DataTable.astro    CliSimulator.astro  BaseHead.astro
    â”‚   â””â”€â”€ Header.astro       Footer.astro
    â”œâ”€â”€ pages/               # file-based routing (each file = a URL)
    â”‚   â”œâ”€â”€ index.astro  404.astro  about.astro  search.astro
    â”‚   â”œâ”€â”€ dashboard.astro  path.astro  profile.astro  premium.astro
    â”‚   â”œâ”€â”€ robots.txt.ts  search-index.json.ts
    â”‚   â””â”€â”€ <collection>/index.astro + [slug].astro
    â”œâ”€â”€ lib/                 # framework-free utilities
    â”‚   â”œâ”€â”€ site.js           nav groups, sections, footer, quick links
    â”‚   â”œâ”€â”€ curriculum.js     builds the staged learning sequence
    â”‚   â”œâ”€â”€ achievements.js   badge rules (pure predicates)
    â”‚   â”œâ”€â”€ url.js  format.js  validation.js  a11y.js
    â”‚   â””â”€â”€ content.js  seo.js
    â”œâ”€â”€ scripts/             # browser (island) scripts
    â”‚   â”œâ”€â”€ navigation.js  search.js  search-palette.js  quiz.js
    â”‚   â”œâ”€â”€ calculators.js  progress.js  dashboard.js  recent.js
    â”‚   â”œâ”€â”€ theme.js  tabs.js  topology.js  copy.js  cli-simulation.js
    â”‚   â””â”€â”€ engine/          # CLI engine (ES modules)
    â”‚       â”œâ”€â”€ devices.js  cli.js  lab-cli.js
    â””â”€â”€ styles/              # split CSS, imported by BaseLayout
        â”œâ”€â”€ tokens.css       # colour ramps, both themes, type/spacing/motion scales
        â”œâ”€â”€ base.css         # reset + theme-aware element defaults + a11y
        â”œâ”€â”€ layout.css       # shells: header, nav, footer, sidebar, hero, grids
        â”œâ”€â”€ components.css   # buttons, cards, tabs, terminal, code, search
        â””â”€â”€ pages.css        # page/template-level composition
```

### The three rules

1. **Content lives in `src/content/`**, never hard-coded into pages.
2. **Shared UI lives in `src/components/`**, never copy-pasted between pages.
3. **Scripts are loaded only where the component that needs them is rendered.**
   Astro bundles each `<script>` once and includes it only on pages that use it.

---

## 2. Design system conventions

The site is built from a small number of shared pieces. Two rules keep the
~135 generated pages consistent:

### 1. Never style a page directly â€” compose components

Use the shared components rather than writing new CSS per page:

| Need | Use |
| --- | --- |
| Page title block | `PageHeader` |
| A titled block with a "view all" link | `Section` |
| A content card | `Card` |
| A labelled list of results | `CollectionBrowser` |
| Nothing to show / no results | `EmptyState` |
| Loading placeholder | `.skeleton` + `.spinner` |
| Inline tip / error | `Alert` |
| Keyboard shortcut hint | `Kbd` |
| Config or CLI snippet | `CodeBlock` |
| Terminal sandbox | `CliSimulator` |
| Network diagram | `Topology` |

### 2. Only ever read semantic tokens

Components reference `--text`, `--text-secondary`, `--accent`, `--surface`,
`--border`, `--danger`â€¦ â€” **never** raw colours like `#58a6ff`. Both themes are
defined in `tokens.css`, so a component written against semantic tokens works
in light and dark for free.

Add new tokens in `tokens.css`, inside the theme block that needs them, and
alias legacy names if backwards compatibility is required.

### Themed surfaces

The root element carries `data-theme="light|dark"`. A tiny inline script in
`BaseHead` applies the stored value **before first paint** (no flash);
`scripts/theme.js` handles toggling, persistence (`ccna_path_theme`) and
OS-preference following.

### Motion

Motion is short (90â€“320ms) and functional â€” it exists to show state changes,
not to decorate. Everything is disabled automatically under
`prefers-reduced-motion: reduce`.

### Astro constraint to remember

Astro does **not** support dynamic slot names (`slot={`x-${i}`}` throws at
compile time). That is why `TabBar` renders only the tablist (panels are
authored by the page and linked by `data-panel`), and `Accordion` takes its
content as `items[].text` / `items[].html` rather than per-index slots.

---

## 3. How to add a new PAGE (static, no content)

Create a file in `src/pages/`. The path becomes the URL (clean, no extension):

```astro
---
// src/pages/about.astro  â†’  /about/
import BaseLayout from '../layouts/BaseLayout.astro';
---
<BaseLayout title="About" description="About CCNA Path." path="/about/">
  <section class="container">
    <h1>About</h1>
    <p>â€¦</p>
  </section>
</BaseLayout>
```

Always pass `title`, `description` and `path` to `BaseLayout` so the page gets a
unique title, meta description, canonical URL and Open Graph tags.

---

## 4. How to add a new COMPONENT

Components are small, presentational `.astro` files. They take **props** and
render markup. They must not read content directly.

```astro
---
// src/components/Stat.astro
const { label, value } = Astro.props;
---
<div class="card">
  <div class="card__kicker">{label}</div>
  <p class="card__title">{value}</p>
</div>
```

Use it anywhere: `import Stat from '../components/Stat.astro';` then
`<Stat label="Labs" value={78} />`.

Rules:
- Keep styling in `src/styles/` (or a scoped `<style>` block) â€” not inline where
  a reusable class already exists.
- If a component needs interactivity, add a `<script>` that imports a module
  from `src/scripts/`.
- Astro does **not** interpolate `{expressions}` inside quoted attributes â€”
  write ``class={`badge badge--${level}`}`` or use the shared `Badge` component,
  never `class="badge badge--{level}"` (that renders literally).

---

## 5. How to add new CONTENT (a lab, lesson, quiz, â€¦)

1. **Check the schema** in `src/content.config.ts`. Every entry must satisfy it,
   or the build will fail with a helpful error.
2. **Create a file** in the matching folder. The filename becomes the URL slug.

Example â€” a new lab, `src/content/labs/configure-ssh.json`:

```json
{
  "title": "Configure SSH on a Switch",
  "scenario": "Enable secure remote management using SSH.",
  "description": "Enable SSH access and disable Telnet.",
  "category": "Security",
  "difficulty": "intermediate",
  "status": "published",
  "allowedCommands": ["enable", "configure terminal", "hostname"],
  "objectives": [{ "text": "Set the hostname", "cmd": "hostname SW1" }],
  "concepts": [{ "title": "Why SSH?", "body": "SSH encrypts management traffic." }]
}
```

It is immediately live at `/labs/configure-ssh/` and appears on `/labs/` and
`/search/`. No page code needs to change.

**Common fields** (all collections): `title`, `description`, `category`,
`difficulty` (`beginner|intermediate|advanced`), `tags`, `status`
(`published|draft`), `related` (`[{collection, slug}]`), `resources`
(`[{label, href}]`).

The **filename is the URL slug** â€” Astro 5's Content Layer turns it into
`entry.id`, which pages use for `getStaticPaths()` and for building links
(`entry.slug` does **not** exist in Astro 5; always use `entry.id`).

`related` links to entries in *other* collections by their slug, e.g.
`{ "collection": "lessons", "slug": "subnetting" }` â†’ `/lessons/subnetting/`.
Every detail template renders `related` + `resources` automatically through
the shared `RelatedResources.astro` component, which renders nothing when
both lists are empty.

Set `"status": "draft"` to keep an entry out of listings, search and the sitemap
while you work on it.

---

## 6. How to add a new TOOL

Tools are two parts:

1. **Content entry** â€” `src/content/tools/my-tool.json` with a `toolType`.
2. **Widget behaviour** â€” add a branch to `src/scripts/calculators.js` keyed on
   `data-calculator="<name>"`, and render the matching markup in
   `src/pages/tools/[slug].astro`.

`calculators.js` auto-binds any element with `data-calculator` and writes results
into `[data-<name>-out="key"]` slots. Existing tools: `subnet`, `mask`.

---

## 7. Scripts ("islands") and loading rules

| Script | Loaded by | Purpose |
| --- | --- | --- |
| `navigation.js` | `Header.astro` | mobile menu (global, tiny) |
| `search.js` | index & search pages | filter cards client-side |
| `quiz.js` | `quizzes/[slug].astro` | grade MCQs |
| `calculators.js` | `tools/[slug].astro` | subnet + mask tools |
| `cli-simulation.js` | `CliSimulator.astro` | IOS terminal |
| `progress.js` | pages with progress UI | read/write localStorage |

Because Astro bundles `<script>` per component, a page only ships the JS it
actually renders. **Do not add global `<script>` tags to `BaseLayout`.**

---

## 8. Styling

- Use **design tokens** from `tokens.css` (`var(--accent)`, `var(--sp-4)` â€¦)
  instead of hard-coded values.
- Prefer existing component classes (`.card`, `.btn`, `.badge`, `.alert`,
  `.terminal`, `.progress`) before writing new CSS.
- Page-specific rules go in `pages.css`; reusable ones go in `components.css`.

---

## 9. SEO checklist for every new page

- Pass `title`, `description` and `path` to `BaseLayout`.
- `BaseLayout` emits canonical, Open Graph, Twitter cards and the
  Organization/WebSite JSON-LD automatically.
- Add page-specific JSON-LD via the `schema` prop (see `src/lib/seo.js`:
  `articleSchema`, `learningResourceSchema`, `breadcrumbSchema`, `faqSchema`).
- Pass `breadcrumbs` for a visible trail + `BreadcrumbList` schema.
- Set `noindex` for utility pages (404, internal previews).
- `/robots.txt` and `/sitemap-index.xml` are generated at build time.

---

## 10. Tests & build

```bash
npm install           # install dependencies
npm run dev           # local dev server (http://localhost:4321)
npm run build         # static build â†’ dist/
npm run verify        # post-build integrity check (run after build)
npm run audit         # deeper output audit (template leaks, ids, a11y)
npm run test          # build + verify + audit
npm run smoke         # boot a server and check every route's status
npm run preview       # preview the built site
npm run migrate:content  # regenerate content from the legacy app
```

The build **fails loudly** if any content entry violates its schema â€” that is the
main safety net. Run `npm run build` before every deploy.

`npm run verify` (`scripts/verify-build.mjs`) is the second safety net. It scans
every built page for the failure modes that are otherwise invisible in a static
build: internal links pointing at non-existent routes (including `/undefined/`
links caused by using `entry.slug` instead of `entry.id`), missing canonical
URLs, unresolved `{expression}` braces in attributes, and missing SEO files
(`404.html`, `robots.txt`, `sitemap-index.xml`). It exits non-zero on failure,
so it can gate a deploy.

`npm run audit` (`scripts/audit-dist.mjs`) is the third safety net. It re-reads
the output HTML and reports template leaks (`{expr}`, `undefined`, `NaN`,
`[object Object]`) in **visible text**, broken internal hrefs, duplicate element
ids within a page, form controls with no accessible name, and pages with no
stylesheet link. `/legacy/` is skipped -- it is frozen on purpose.

---

## 11. Legacy preservation

The original single-page application (dashboard, CLI sandbox, guided labs,
profile/premium demo) is preserved **untouched** under `public/legacy/` and is
served at **`/legacy/`**. It remains functional and is excluded from the sitemap
and disallowed in `robots.txt`. Migration is gradual: the new Astro routes stand
alongside it until parity is reached.

