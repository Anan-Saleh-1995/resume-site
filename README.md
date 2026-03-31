# Hugo Bilingual Resume

This project is a bilingual Hugo resume site built to be easy to maintain by editing text files instead of templates for day-to-day resume updates.

It is also a learning project. The structure here is intentionally simple so the same Hugo concepts can be reused later for a bigger personal site, blog, or documentation-style website.

## What This Site Does

- Serves an English and Hebrew version of the same resume
- Uses YAML data files for structured resume content
- Uses Hugo templates to render both languages from the same layout logic
- Uses `i18n` files for interface labels
- Supports RTL for Hebrew
- Supports light mode, dark mode, and print-friendly output

## Project Structure

    hugo/
      assets/
        css/
          main.css
      content/
        en/_index.md
        he/_index.md
      data/
        resume/
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
          head.html
          language-switcher.html
          resume-main.html
          theme-toggle.html
        index.html
      static/
      hugo.toml
      package.json

## How Hugo Flows In This Repo

The data flow in this project is:

1. `hugo.toml` defines site config, languages, and build behavior.
2. `content/` defines the language-aware page nodes.
3. `data/resume/*.yaml` stores the actual resume content.
4. `i18n/*.toml` stores translated UI labels like section names.
5. `layouts/` renders the content into HTML.
6. `assets/css/main.css` styles the site and is processed by Hugo.
7. Hugo builds the final static site into `public/`.

## Where To Edit Things

### Resume content

Edit these files:

- `data/resume/en.yaml`
- `data/resume/he.yaml`

Use them for:

- name
- title
- summary
- links
- skills
- experience
- education
- projects

### Interface labels

Edit these files:

- `i18n/en.toml`
- `i18n/he.toml`

Use them for:

- Summary
- Links
- Skills
- Experience
- Education
- Projects

### Layout and structure

Edit:

- `layouts/partials/resume-main.html`
- `layouts/_default/baseof.html`
- `layouts/partials/language-switcher.html`
- `layouts/partials/theme-toggle.html`

Use these when changing:

- section order
- HTML structure
- switcher placement
- theme toggle placement

### Styling

Edit:

- `assets/css/main.css`

This file currently contains:

- design tokens
- base styles
- layout styles
- resume component styles
- RTL helpers
- responsive rules
- print rules

## Markdown vs YAML

This repo mainly uses YAML because a resume is structured data.

Use YAML when:

- content has repeated fields
- content is list-like or card-like
- the same structure is rendered in multiple languages

Use Markdown when:

- content is long-form writing
- content is article-like
- you want normal pages, posts, or docs

If this project grows into a bigger personal site later, a good model is:

- `content/` for blog posts, notes, docs, and long pages
- `data/` for structured datasets such as projects, links, timelines, FAQs

## Commands

Install dependencies:

    npm install

Run the dev server:

    hugo server

Validate formatting, linting, and build:

    npm run validate

Format files:

    npm run format

Production build:

    hugo

## Theme and Language Behavior

- Language switching is handled by Hugo multilingual configuration
- Hebrew pages use RTL layout rules
- Theme preference defaults to system preference
- Manual theme choice is stored in `localStorage`
- Print mode hides non-document UI such as site controls

## Maintenance Notes

- Edit resume content in YAML first, not in templates
- Edit labels in `i18n` files, not inline in HTML
- Keep templates generic so both languages stay in sync
- Keep commits small and milestone-based
- Use `npm run validate` before committing

## Reusing This Structure Later

This repo is a good base for learning Hugo fundamentals:

- `content/` teaches page structure
- `data/` teaches structured rendering
- `i18n/` teaches multilingual labels
- `layouts/` teaches template composition
- `assets/` teaches Hugo-managed styling

For a future personal site or wiki-style project, keep the same mental model and expand it instead of replacing it.

## Current Status

Implemented:

- bilingual English/Hebrew resume
- YAML-driven resume rendering
- language switcher
- light/dark theme toggle
- RTL support
- print-friendly styling
- formatting/linting/tooling baseline

Still possible to add later:

- GitHub Pages deployment
- GitHub Actions CI
- Dependabot
- broader personal-site sections
- blog or notes content under `content/`
