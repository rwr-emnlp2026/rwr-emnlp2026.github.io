# Refuse without Refusal — project page

Project page for **Refuse without Refusal: A Structural Analysis of Safety-Tuning Responses for Reducing False Refusals in Language Models** (EMNLP 2026).

- Page: https://rwr-emnlp2026.github.io/
- Paper: https://arxiv.org/abs/2609.04714
- Code: https://github.com/mz-kim/Refuse-without-Refusal

## Structure

```text
index.html            page content
static/css/site.css   shared styles (same file in the KoNA page repo)
static/css/page.css   page-specific components
static/js/site.js     shared behaviour: toggles, copy button, section highlighting
static/js/page.js     result data from the paper's tables and the interactive pieces
static/img/           figures from the paper, social preview image, favicon
```

The page is plain HTML, CSS and JavaScript with no build step. Result numbers are copied from the camera-ready tables; `static/js/page.js` holds Table 2 and the smaller analysis tables.

## Local preview

```bash
python3 -m http.server 8000
# open http://localhost:8000/
```

GitHub Pages serves the `main` branch root.
