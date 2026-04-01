# Hugo Bilingual Resume

This project is a bilingual Hugo resume site built to be easy to maintain by editing structured content files instead of rewriting templates for every resume tweak.

It is also a learning project. The current repo now supports reusable resume templates and reusable job-targeted variants, so the same Hugo structure can scale into a larger personal-site or multi-resume setup later.

## What This Site Does

- Serves English and Hebrew resume pages
- Uses YAML data files for structured resume content
- Supports reusable resume variants such as `fullstack` and `backend`
- Supports reusable resume templates such as `classic` and `compact`
- Uses front matter to select which template and variant a page renders
- Uses `i18n` files for interface labels
- Supports RTL for Hebrew
- Supports light mode, dark mode, and print-friendly output

## Project Structure

    hugo/
      assets/
        scss/
          main.scss
          _template-classic.scss
          _template-compact.scss
        css/
          main.css
      content/
        en/
          _index.md
          backend.md
          compact.md
        he/
          _index.md
          backend.md
          compact.md
      data/
        resumes/
          fullstack/
            en.yaml
            he.yaml
          backend/
            en.yaml
            he.yaml
      i18n/
        en.toml
        he.toml
      layouts/
        _default/
          baseof.html
          section.html
        partials/
          resume/
            render.html
            resolve.html
            templates/
              classic.html
              compact.html
          head.html
          language-switcher.html
          theme-toggle.html
        index.html
      static/
      hugo.toml
      package.json

## How Hugo Flows In This Repo

The data flow in this project is:

1. `hugo.toml` defines site config, languages, and build behavior.
2. `content/` defines pages and selects a `template` and `variant` in front matter.
3. `data/resumes/<variant>/<lang>.yaml` stores the actual resume content for each variant.
4. `i18n/*.toml` stores translated UI labels like section names.
5. `layouts/partials/resume/resolve.html` resolves the active data and template choice.
6. `layouts/partials/resume/render.html` dispatches to the selected template partial.
7. `layouts/_default/baseof.html` provides the shared page shell with a stable header and footer.
8. `assets/scss/main.scss` is the source stylesheet entry.
9. `npm run build:css` compiles it into `assets/css/main.css`.
10. Hugo fingerprints the generated CSS and builds the final static site into `public/`.

## Template And Variant Model

This repo separates two ideas:

- Template:
  - controls layout, section presentation, and template-specific styling
- Variant:
  - controls the content emphasis for a target role

Current examples:

- Templates:
  - `classic`
  - `compact`
- Variants:
  - `fullstack`
  - `backend`

The default home pages currently render:

- `template = "classic"`
- `variant = "fullstack"`

## Where To Edit Things

### Resume content

Edit these files:

- `data/resumes/fullstack/en.yaml`
- `data/resumes/fullstack/he.yaml`
- `data/resumes/backend/en.yaml`
- `data/resumes/backend/he.yaml`

Use them for:

- name
- title
- summary
- skills
- experience
- education
- projects
- languages

Each variant is a reusable content preset for a target role.

### Page selection

Edit these files:

- `content/en/_index.md`
- `content/he/_index.md`
- `content/en/backend.md`
- `content/he/backend.md`
- `content/en/compact.md`
- `content/he/compact.md`

Use front matter like:

    template: "classic"
    variant: "fullstack"

### Interface labels

Edit these files:

- `i18n/en.toml`
- `i18n/he.toml`

Use them for:

- Summary
- Skills
- Experience
- Education
- Projects
- Languages

### Layout and rendering

Edit:

- `layouts/partials/resume/render.html`
- `layouts/partials/resume/resolve.html`
- `layouts/partials/resume/templates/classic.html`
- `layouts/partials/resume/templates/compact.html`
- `layouts/_default/baseof.html`
- `layouts/partials/language-switcher.html`
- `layouts/partials/theme-toggle.html`

Use these when changing:

- template selection/fallback behavior
- section order
- HTML structure
- switcher placement
- theme toggle placement

### Styling

Edit:

- `assets/scss/main.scss`
- `assets/scss/_template-classic.scss`
- `assets/scss/_template-compact.scss`

This source entry file currently imports:

- design tokens
- theme tokens
- base styles
- controls styles
- template styles
- RTL helpers
- responsive rules
- print rules

The generated file `assets/css/main.css` is build output and should not be edited by hand.

## Markdown vs YAML

This repo mainly uses YAML because a resume is structured data.

Use YAML when:

- content has repeated fields
- content is list-like or card-like
- the same structure is rendered in multiple languages
- you want reusable job-targeted variants

Use Markdown when:

- content is long-form writing
- content is article-like
- you want normal pages, posts, or docs

If this project grows into a bigger personal site later, a good model is:

- `content/` for blog posts, notes, docs, and long pages
- `data/` for structured datasets such as projects, links, timelines, FAQs, or resource directories

## Commands

Install dependencies:

    npm install

Run the dev server:

    npm run dev

Validate formatting, linting, and build:

    npm run validate

Format files:

    npm run format

Production build:

    npm run build

## Theme and Language Behavior

- Language switching is handled by Hugo multilingual configuration
- Hebrew pages use RTL layout rules
- Theme preference defaults to system preference
- Manual theme choice is stored in `localStorage`
- Print mode hides non-document UI such as site controls
- Pages choose a resume `template` and `variant` through front matter
- The shared page header and footer stay stable while the selected resume template renders inside `main`

## Maintenance Notes

- Edit resume content in YAML first, not in templates
- Edit labels in `i18n` files, not inline in HTML
- Keep variants reusable so job-specific tailoring stays structured
- Keep templates generic so both languages and variants stay in sync
- Keep commits small and milestone-based
- Use `npm run validate` before committing

## Reusing This Structure Later

This repo is a good base for learning Hugo fundamentals:

- `content/` teaches page structure
- `data/` teaches structured rendering
- `i18n/` teaches multilingual labels
- `layouts/` teaches template composition
- `assets/` teaches Hugo-managed styling

This repo now separates:

- templates: visual layout and section presentation
- variants: job-targeted content emphasis

That makes it a stronger base for future resume experiments without duplicating the whole site.

## Current Status

Implemented:

- bilingual English/Hebrew resume pages
- template-driven, variant-aware resume rendering
- reusable `classic` and `compact` template paths
- reusable `fullstack` and `backend` resume variants
- language switcher
- light/dark theme toggle
- RTL support
- print-friendly styling
- formatting/linting/tooling baseline

Still possible to add later:

- GitHub Pages deployment
- GitHub Actions CI
- Dependabot
- more resume templates
- more job-targeted resume variants
- broader personal-site sections
- blog or notes content under `content/`
