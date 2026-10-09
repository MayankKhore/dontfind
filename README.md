# CCNA Path

A scalable, SEO-first networking education platform built with **Astro 5**
(static site generation) and deployed on **Netlify**.

Every page is pre-rendered to crawlable HTML with clean URLs; interactive
features (CLI simulator, quizzes, calculators) are small client-side islands
loaded only on the pages that use them.

## Highlights

- **8 content collections** — labs, lessons, quizzes, tools, interview
  questions, incident scenarios, glossary entries and articles — all validated
  with zod schemas.
- **A real design system** — a two-theme token layer (dark default + light),
  a fluid type scale, a 4px spacing grid, and 30+ composable components shared
  by every page, so the ~135 generated pages stay visually identical.
- **Light & dark themes** — dark is the default brand theme; light is a fully
  designed alternative. The stored choice is applied before first paint, so
  there is no flash.
- **Pre-rendered, crawlable pages** with canonical URLs, Open Graph/Twitter
  metadata, JSON-LD structured data, `robots.txt` and an auto-generated sitemap.
- **Interactive, keyboard-accessible** — ⌘K/Ctrl+K global search, dropdown
  navigation, WAI-ARIA tabs, native disclosures, focus-trapped overlays and
  clear loading / empty / error / success / disabled states throughout.
- **Progress without an account** — lessons, labs and quizzes record locally,
  powering the dashboard, learning path, profile and achievements.
- **Preserved legacy app** at `/legacy/` — the original single-page version,
  including the full CLI sandbox, guided labs and demo profile/premium, still
  works untouched.

## Quick start

```bash
npm install
npm run dev        # http://localhost:4321
```

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` | Build the static site into `dist/` |
| `npm run preview` | Preview the production build |
| `npm run verify` | Check every built page for broken links / missing canonicals |
| `npm run audit` | Deeper output audit: template leaks, broken hrefs, duplicate ids, unlabelled controls |
| `npm run test` | `build` + `verify` + `audit` |
| `npm run smoke` | Boot the server and check every route returns the right status |
| `npm run migrate:content` | Regenerate content from the legacy app data |

## Project layout

```
src/
  components/   shared Astro components (Icon, Card, Button, Tabs, Topology, …)
  content/      8 content collections (JSON + Markdown)
  layouts/      BaseLayout (head, header, footer, JSON-LD)
  lib/          framework-free utilities (site, curriculum, achievements, seo, …)
  pages/        file-based routes (clean URLs, no extensions)
  scripts/      browser islands (search palette, quiz, CLI sim, dashboard, …)
  styles/       split CSS (tokens, base, layout, components, pages)
public/
  legacy/       the original app, served at /legacy/
docs/
  ARCHITECTURE.md   how to add pages, components, tools and content
```

## Design system at a glance

| Layer | File | Contains |
| --- | --- | --- |
| Tokens | `styles/tokens.css` | Colour ramps, both themes, type/spacing/radius/motion scales, z-index |
| Base | `styles/base.css` | Reset, theme-aware element defaults, a11y, print |
| Layout | `styles/layout.css` | Containers, header, dropdown nav, mobile drawer, footer, hero, grids |
| Components | `styles/components.css` | Buttons, cards, badges, alerts, forms, tabs, terminal, code, search overlay |
| Pages | `styles/pages.css` | Lesson reader, quiz, tools, incidents, interview, dashboard, path, premium |

Components read **only** semantic tokens (`--text`, `--accent`, `--surface`…),
never raw hues, which is why a theme swap costs nothing at runtime.

See **[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)** for the full guide.

## Deployment (Netlify)

`netlify.toml` is included. Netlify runs `npm run build` and publishes `dist/`.

## Notes

- Not affiliated with Cisco Systems.
- Learning progress is stored locally in the browser using the same
  `localStorage` keys as the original app (`ccna_path_progress`,
  `ccna_path_streak`), so existing users keep their progress.
