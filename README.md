# hariaksha.github.io

Personal academic website for **Hari Gunda** — Boren & Gilman Research Scholar and undergraduate researcher at the University of Alabama — live at [hariaksha.com](https://hariaksha.com).

## About the Site

A single-page portfolio designed to present research, experience, education, and contact information in a clean, readable format. It includes:

- **Hero** — tagline, social links, and CV download
- **Research Interests** — tag-based overview of focus areas
- **About** — personal statement and background
- **Research** — working papers and works in progress with expandable abstracts and GitHub links
- **Experience** — professional and personal timeline with toggle between modes
- **Education** — degrees, GPA, minors, and concentrations
- **Languages** — proficiency levels for Indonesian, German, and Telugu
- **Honors & Awards** — scholarships, fellowships, and recognitions with expandable details
- **Featured** — conference presentations, press coverage, and podcast appearances
- **Contact** — calendar booking links and direct email

## Tech Stack

| Layer | Technology |
|---|---|
| Markup | HTML5 |
| Styling | Custom CSS (`styles.css`) with CSS variables for theming |
| Interactivity | Vanilla JavaScript (`scripts.js`) |
| Fonts | EB Garamond + Inter (Google Fonts) |
| Icons | Font Awesome 6 |
| Hosting | GitHub Pages with custom domain |
| SEO | Open Graph + Twitter Card meta tags, `sitemap.xml`, `robots.txt` |

## Structure

```
hariaksha.github.io/
├── index.html              # Main single-page site
├── styles.css              # All styling, including dark mode and responsive layout
├── scripts.js              # Scroll progress, dark mode toggle, modals, collapsibles
├── sitemap.xml             # SEO sitemap
├── robots.txt              # Crawler directives
├── CNAME                   # Custom domain (hariaksha.com)
├── assets/
│   ├── img/                # Headshot and press/feature images
│   └── files/              # CV PDF
├── coptic-binding/         # Project sub-page
├── ethiopian-bookbinding/  # Project sub-page
├── french-link-stitch/     # Project sub-page
├── .devcontainer/          # Dev container config
└── .github/                # GitHub Actions workflows
```

## Features

- **Dark mode** — toggle persisted across sessions via `localStorage`
- **Scroll progress bar** — thin indicator at the top of the viewport
- **Research modals** — click "+ Abstract" on any paper to open a formatted popup
- **Collapsible sections** — experience and awards sections collapse beyond the first few items
- **Experience toggle** — switch between Professional and Fun timelines
- **Responsive layout** — mobile-friendly hamburger nav and fluid grid

## Local Development

No build step required. Clone the repo and open `index.html` directly in a browser, or use any static file server:

```bash
git clone https://github.com/Hariaksha/hariaksha.github.io.git
cd hariaksha.github.io
# Option 1 — Python
python -m http.server 8000
# Option 2 — Node
npx serve .
```

Then visit `http://localhost:8000`.

## Deployment

The site is deployed automatically via **GitHub Pages** on push to the default branch. The custom domain is configured in `CNAME` and DNS.

## Contact

Questions or collaboration? Reach out at [hgunda@crimson.ua.edu](mailto:hgunda@crimson.ua.edu) or [schedule a meeting](https://zcal.co/hariaksha/30min).
