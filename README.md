
<div align="center">

# INDEX/ — CAV Portfolio

### A Creative Developer Portfolio

**Where technology, design, and storytelling intersect.**

An interactive personal portfolio exploring the intersection of software development, visual design, and creative experimentation.

[**Live Portfolio**](https://cav-portfolio.vercel.app) · [**GitHub Profile**](https://github.com/mcartv)

<br />

![React](https://img.shields.io/badge/React-19-149ECA?style=flat-square&logo=react&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-7-646CFF?style=flat-square&logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?style=flat-square&logo=javascript&logoColor=black)
![Vercel](https://img.shields.io/badge/Deployed_on-Vercel-000000?style=flat-square&logo=vercel&logoColor=white)

</div>

---

## 01. Overview

**INDEX/** is a personal portfolio developed by **Carl Arthur V. Buenavidez**, a Bachelor of Science in Information Technology student with an interest in building thoughtful digital experiences.

Rather than following a conventional portfolio layout, INDEX/ combines editorial design principles, interactive components, and motion-driven storytelling to create an engaging browsing experience.

The portfolio serves as both a professional showcase of software development projects and a space for creative experimentation.

It draws inspiration from Swiss graphic design, Japanese minimalism, cinematic presentation, and interactive web experiences.

### Design Philosophy

> Every interaction should have a purpose. Every transition should feel intentional. Every detail should contribute to the experience.

The design emphasizes:

- **Visual hierarchy** — expressive typography balanced with precise spacing.
- **Intentional motion** — carefully timed animations that support navigation and storytelling.
- **Interactive exploration** — meaningful interactions beyond conventional clicking and scrolling.
- **Minimalist composition** — restrained colors, structured grids, and deliberate use of negative space.
- **Attention to detail** — consistent interaction states, transitions, and responsive layouts.

---

## 02. Features

### Interactive Portfolio Experience

- Responsive editorial-style interface.
- Oversized typography and asymmetric layouts.
- Scroll-triggered storytelling and staggered element reveals.
- Magnetic buttons and cursor-responsive interactions.
- Subtle geometric decorations and animated visual details.
- Accessibility considerations, including reduced-motion support.

### 3D Project Carousel

An interactive project showcase developed using CSS 3D transformations.

Features include:

- Rotating project cards with depth and perspective.
- Mouse, keyboard, and touch-based navigation.
- Animated card selection and expansion.
- 3D flip transitions between cards and project details.
- Reverse-flip closing animations.
- A permanent "More projects to come" card indicating ongoing development.

### Interactive Project Case Studies

Projects can be explored through expanded case-study views containing:

- Project descriptions and technology stacks.
- Challenges and solutions.
- Individual contributions and technical highlights.
- Screenshot galleries with thumbnails.
- Fullscreen image viewing.
- Links to repositories and live applications.

Project screenshots and case-study content are managed through the portfolio's Content Studio.

### About and Credentials

A résumé-inspired About section presenting:

- Personal introduction and technical interests.
- Academic background.
- Experience and areas of focus.
- Interactive profile presentation.
- Courses, seminars, and certifications.

The certificate archive provides image previews, document links, and structured credential information.

### Cinematic Filmmaking Archive

A hidden section dedicated to filmmaking, visual composition, and storytelling.

Its design uses a distinct cinematic identity with:

- Dark screening-room aesthetics.
- Film-inspired transitions and subtle grain.
- Animated editorial typography.
- Interactive film reels.
- Film posters and still-image viewing.
- Production credits and descriptions.
- A dedicated creative-process section.

The archive can be populated through Content Studio without modifying application code.

### Hidden Pixel Arcade

An interactive Easter egg accessible through a small pixel-art aircraft within the portfolio.

Activating the aircraft reveals a hidden arcade with two playable modes.

**Classic Invasion**
- Retro Space Invaders-inspired gameplay.
- Increasingly challenging enemy formations.
- Player movement, shooting, scoring, and lives.
- Keyboard and touch controls.

**Endless Survival**
- Continuous enemy spawning and progressive difficulty.
- Boss encounters with multiple attack phases.
- Collectible weapon power-ups.
- Upgradeable weapons and defensive shields.
- Pixel-art effects, explosions, and combat feedback.
- Locally stored personal high scores.

Both modes are implemented using the HTML Canvas API.

---

## 03. Featured Projects

### SMaRT–PDM

**Scholarship Management and Records Tracking**

A web and Android-based scholarship management platform developed for the Office of Student Financial Assistance at Pambayang Dalubhasaan ng Marilao.

The system includes scholarship applications, student monitoring, community service management, payouts, role-based access control, and reporting.

**Technologies:** React, Flutter, Node.js, Supabase

[View Repository](https://github.com/mcartv/SMaRT-PDM) · [Live Application](https://smart-pdm.vercel.app/landing)

### Song Painter

**Audio-Driven Visual Art**

A creative application that transforms uploaded music into visual artwork using audio-responsive graphics.

The application combines music playback, adjustable visual controls, and canvas-based rendering to create dynamic compositions.

**Technologies:** React, TypeScript, Vite, Canvas API

[View Repository](https://github.com/mcartv/song-painter)

### Budget Tracker

**Personal Finance Tracking Application**

A lightweight browser-based application for managing personal income and expenses.

It provides transaction recording, financial summaries, theme switching, and local browser-based data persistence.

**Technologies:** JavaScript, HTML, CSS, Vite

[View Repository](https://github.com/mcartv/budget-tracker)

---

## 04. Technology Stack

| Category | Technologies |
|---|---|
| Frontend | React 19, JavaScript, JSX |
| Build Tool | Vite 7 |
| Styling | Tailwind CSS 4, Custom CSS |
| Icons | Lucide React |
| Animation | CSS Transitions, Keyframes, Intersection Observer |
| Graphics | CSS 3D Transforms, HTML Canvas |
| Content Management | GitHub API, GitHub OAuth |
| Hosting | Vercel |
| Version Control | Git, GitHub |

The public portfolio uses a static frontend architecture, while authenticated content-management operations are handled by Vercel serverless functions.

---

## 05. Getting Started

### Prerequisites

Ensure that the following tools are installed:

- Node.js 20.19+ or 22.12+
- npm
- Git

### Installation

Clone the repository:

```bash
git clone https://github.com/mcartv/cav-portfolio.git
```

Navigate into the project:

```bash
cd cav-portfolio
```

Install the dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Open the local address displayed in your terminal, typically:

```text
http://localhost:5173
```

### Production Build

Generate an optimized production build:

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

The generated static files are placed in the `dist/` directory.

**Note:** The Vite development server does not independently provide the GitHub-backed admin API. The authenticated editor requires Vercel Functions and the appropriate environment configuration.

---

## 06. Project Structure

```text
cav-portfolio/
│
├── api/
│   └── admin.js              # GitHub-backed content API
│
├── public/
│   ├── certificates/         # Certificate images
│   ├── projects/             # Project screenshots
│   └── films/                # Film posters and stills
│
├── src/
│   ├── components/
│   │   ├── ArcadeHub.jsx
│   │   ├── ArchiveWindows.jsx
│   │   ├── EndlessShooter.jsx
│   │   ├── FilmArchive.jsx
│   │   ├── Magnetic.jsx
│   │   ├── ProjectGallery.jsx
│   │   └── SpaceInvaders.jsx
│   │
│   ├── data/
│   │   ├── profile.json
│   │   ├── profile.js
│   │   ├── projects.json
│   │   └── projects.js
│   │
│   ├── Admin.jsx             # Content Studio interface
│   ├── App.jsx               # Main portfolio application
│   ├── index.css             # Theme and animation styles
│   └── main.jsx              # Application entry point
│
├── ADMIN_SETUP.md
├── index.html
├── package.json
├── vite.config.js
└── README.md
```

---

## 07. Content Studio

INDEX/ includes a private, GitHub-backed content management interface designed to simplify portfolio updates.

Instead of introducing a traditional database, the editor uses structured JSON files and the GitHub API to manage published content.

### Capabilities

| Module | Functionality |
|---|---|
| Profile | Edit personal information, introduction, education, and experience |
| Projects | Manage project information, case studies, and screenshots |
| Certificates | Add credentials and upload certificate images |
| Film Archive | Manage films, credits, posters, and descriptions |

### Publishing Workflow

```text
Content Studio
      |
      v
Authenticated GitHub API
      |
      v
Update Repository Content
      |
      v
GitHub Commit
      |
      v
Vercel Deployment
      |
      v
Updated Public Portfolio
```

Content changes are committed to the repository and published through the connected Vercel deployment workflow.

### Authentication

The editor uses GitHub OAuth with server-side authorization and encrypted session cookies.

Editing access is restricted to the configured repository owner.

The admin interface is located at:

```text
https://cav-portfolio.vercel.app/?admin=1
```

### Environment Configuration

The authenticated editor requires these server-side environment variables:

```env
GITHUB_OAUTH_CLIENT_ID=
GITHUB_OAUTH_CLIENT_SECRET=
ADMIN_SESSION_SECRET=
ADMIN_SITE_URL=
```

These values must be configured privately in the deployment environment.

**Never commit actual authentication secrets, access tokens, or private credentials to the repository.**

For complete setup instructions, refer to [ADMIN_SETUP.md](./ADMIN_SETUP.md).

---

## 08. Deployment

The portfolio is deployed on **Vercel**, with GitHub integration used for version control and automated deployment.

### Deployment Configuration

| Setting | Value |
|---|---|
| Framework | Vite |
| Build Command | `npm run build` |
| Output Directory | `dist` |
| Install Command | `npm install` |
| Production Branch | `main` |

Production website:

**https://cav-portfolio.vercel.app**

Updates pushed to the connected production branch trigger new deployments, provided automatic Git integration remains enabled.

---

## 09. Accessibility and Performance

The portfolio includes several considerations intended to improve usability across devices and interaction methods.

- Responsive layouts for desktop and mobile.
- Keyboard-operable interactive elements.
- Touch support for the project carousel and arcade.
- Reduced-motion media-query support.
- Semantic HTML and accessible control labels.
- Lazy loading for applicable imagery.
- CSS-based animations where appropriate.
- Optimized production builds through Vite.

Accessibility, animation smoothness, and device compatibility remain areas of ongoing testing and refinement.

---

## 10. Future Improvements

INDEX/ is an evolving personal project. Planned areas for improvement include:

- Further refinement of carousel and modal animations.
- More polished project screenshot presentation.
- Additional real project documentation and case studies.
- Mobile interaction and accessibility improvements.
- Expanded filmmaking and visual storytelling content.
- Performance optimization across devices.
- Improvements to Content Studio editing and publishing workflows.

Development emphasizes iterative refinement rather than adding features without purpose.

---

## 11. Author

**Carl Arthur V. Buenavidez**

Bachelor of Science in Information Technology  
Pambayang Dalubhasaan ng Marilao  
Philippines

Interested in full-stack development, interactive interfaces, creative coding, and visual storytelling.

**GitHub:** [github.com/mcartv](https://github.com/mcartv)

**Portfolio:** [cav-portfolio.vercel.app](https://cav-portfolio.vercel.app)

---

<div align="center">

### CRAFTED WITH INTENTION.

*An ongoing exploration of technology, design, and storytelling.*

**INDEX/ © 2026 — Carl Arthur V. Buenavidez**

</div>
