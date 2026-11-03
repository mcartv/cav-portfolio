# INDEX/ — CAV Portfolio

A responsive creative-developer portfolio with Swiss editorial typography, a 3D rotating project carousel, and a locked filmmaking archive.

**Status:** source ready for local development and a future static Vercel deployment. **Not deployed.**

## Stack

- React 19 with JSX
- Vite 7
- Tailwind CSS 4 using the official `@tailwindcss/vite` integration
- Lucide React icons
- CSS 3D transforms (no WebGL required)

## Run locally

Requires a recent Node.js version compatible with Vite 7 (Node 20.19+ or 22.12+).

```bash
git clone https://github.com/mcartv/cav-portfolio.git
cd cav-portfolio
npm install
npm run dev
```

Open the local address printed by Vite (typically `http://localhost:5173`).

## Production build

```bash
npm run build
npm run preview
```

Vite outputs static assets into `dist/`.

### Later: deploy to Vercel

- Framework preset: **Vite**
- Build command: `npm run build`
- Output directory: `dist`
- Install command: `npm install`

No deployment has been triggered by this repository conversion.

## Structure

```
index.html
src/
  main.jsx            # React entry
  App.jsx             # Site sections and interactions
  index.css           # Tailwind theme + bespoke motion styles
  data/projects.js    # Portfolio project content
vite.config.js
package.json
```

## Features

- Oversized editorial hero with entrance animation
- Responsive About section
- Circular 3D-style carousel with click, arrows, arrow keys and touch swipes
- Accessible project-details modal (focus, Escape, scroll locking)
- Skills index
- Mock 404 / locked filmmaking archive
- Contact and GitHub links
- Reduced-motion preference support
- No backend or database required

## Before publishing

1. Replace the introduction, skills and sample project descriptions with verified personal information.
2. Replace abstract card art with real project screenshots and improve each case study.
3. Change the placeholder `hello@example.com` email and LinkedIn link.
4. Review all repository links and ensure you want to expose them.
5. Optionally add a favicon, Open Graph preview, actual résumé and analytics.

The filmmaking section is intentionally unavailable until work is ready to publish.
