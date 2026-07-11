# hariaksha.github.io

Personal academic website for **Hari Gunda** — Boren & Gilman Research Scholar and undergraduate researcher at the University of Alabama — live at [hariaksha.com](https://hariaksha.com).

## About the Site

A multi-page portfolio built with Jekyll, presenting research, experience, education, and contact information across dedicated pages behind a persistent left sidebar. It includes:

- **Home** — hero (tagline, social links, CV download), research interest tags, and an about statement
- **Research** — working papers and works in progress with expandable abstracts and repository links
- **Experience** — professional and personal timeline with a toggle between modes, all entries shown by default
- **Languages** — proficiency blocks for Indonesian, German, and Telugu
- **Honors & Awards** — all 15 scholarships, fellowships, and recognitions from the CV, each with expandable details
- **Education** — degrees, GPA, minors, concentrations, and relevant coursework
- **Featured** — conference presentations, datasets, press coverage, and podcast appearances
- **Contact** — calendar booking links and a direct-message form (no email address exposed on the page)

## Tech Stack

| Layer | Technology |
|---|---|
| Site generator | Jekyll (built natively by GitHub Pages, no custom CI build step needed) |
| Markup | HTML5 + Liquid templates |
| Styling | Custom CSS (`styles.css`) with CSS variables for theming and dark mode |
| Interactivity | Vanilla JavaScript (`scripts.js`) |
| Contact form | [Web3Forms](https://web3forms.com) (relays submissions without exposing the destination email client-side) |
| Fonts | EB Garamond + Inter (Google Fonts) |
| Icons | Font Awesome 6 |
| Hosting | GitHub Pages with custom domain |
| CV | LaTeX (`CV.tex`), compiled to PDF with [Tectonic](https://tectonic-typesetting.github.io/) |
| SEO | Open Graph + Twitter Card meta tags, `sitemap.xml`, `robots.txt` |

## Structure

```
hariaksha.github.io/
├── _config.yml             # Jekyll site config
├── _layouts/
│   └── default.html        # Shared page shell (head, sidebar, footer, scripts)
├── _includes/
│   ├── sidebar.html         # Left nav: photo, name, tagline, links, CV, theme toggle
│   ├── footer.html          # Per-page footer
│   └── research-modal.html  # Shared "+ Abstract" / "+ Details" modal markup
├── index.html               # Home page (hero + research interests + about)
├── research/index.html
├── experience/index.html
├── education/index.html
├── languages/index.html
├── awards/index.html
├── featured/index.html
├── contact/index.html
├── styles.css               # All styling, including dark mode and responsive layout
├── scripts.js                # Dark mode toggle, modals, experience filter, contact form submit
├── sitemap.xml               # SEO sitemap
├── robots.txt                 # Crawler directives
├── CNAME                      # Custom domain (hariaksha.com)
├── assets/
│   ├── img/                   # Headshot, sidebar photo, press/feature images
│   └── files/
│       └── CV/
│           ├── CV.tex          # LaTeX source of truth for the CV
│           └── CV.pdf          # Compiled output, served to visitors
├── coptic-binding/            # Project sub-page (standalone, non-Jekyll)
├── ethiopian-bookbinding/      # Project sub-page (standalone, non-Jekyll)
├── french-link-stitch/         # Project sub-page (standalone, non-Jekyll)
├── .devcontainer/              # Dev container config
└── .github/workflows/
    ├── scrape_talks.yml        # Existing talk-location scraper
    └── rebuild-cv.yml          # Recompiles CV.pdf daily so its footer date stays current
```

## Features

- **Dark mode** — toggle persisted across sessions via `localStorage`
- **Left sidebar navigation** — sticky on desktop, collapses to a horizontal bar on mobile; active page highlighted server-side via Liquid
- **Scroll progress bar** — thin indicator at the top of the viewport
- **Research/award modals** — click "+ Abstract" or "+ Details" on any entry to open a formatted popup
- **Experience toggle** — switch between Professional and Fun timelines
- **Contact form** — submits via Web3Forms with inline success/error messaging, no email address in the page source
- **Responsive layout** — mobile-friendly nav and fluid grid/card layouts

## Local Development

This site is a Jekyll site, so it needs to be built rather than opened directly as static HTML (pages use Liquid front matter and `{% include %}` tags).

```bash
git clone https://github.com/Hariaksha/hariaksha.github.io.git
cd hariaksha.github.io
gem install bundler jekyll
jekyll serve
```

Then visit `http://localhost:4000`.

### Rebuilding the CV

```bash
cd assets/files/CV
tectonic CV.tex
```

This also happens automatically once a day via `.github/workflows/rebuild-cv.yml`, and on every push that touches `CV.tex`.

## Deployment

The site is deployed automatically via **GitHub Pages**, which builds Jekyll natively on push to the default branch. The custom domain is configured in `CNAME` and DNS.

## Contact

Questions or collaboration? Use the [contact form](https://hariaksha.com/contact/) on the site or [schedule a meeting](https://zcal.co/hariaksha/30min).
