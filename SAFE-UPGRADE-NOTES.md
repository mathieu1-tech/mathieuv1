# Mathieu Konstruct Solutions - Safe Website Upgrade Notes

## Files changed
- `index.html`
- `assets/css/style.css`
- `assets/js/main.js`

## Safe upgrades added
- Added safer SEO/social metadata and preload hints.
- Added skip-to-content accessibility link.
- Improved mobile spacing, focus states, dark-mode consistency, and reduced-motion support.
- Added image lazy-loading/decoding safeguards and broken-image fallback styling.
- Improved keyboard/accessibility support for forms, navigation, and links.
- Added active navigation highlighting while scrolling.
- Added clearer form status feedback and double-submit protection.
- Preserved all existing sections, content, product data, image paths, admin page, and site-data.js structure.

## GitHub Pages upload
Upload/replace the full project contents in your GitHub repository, then visit:
https://mathieu1-tech.github.io/mathieu/

If using GitHub web upload, keep the same folder structure:
- `index.html`
- `admin.html`
- `assets/css/style.css`
- `assets/js/main.js`
- `assets/js/site-data.js`
- `assets/images/`
- `assets/catalog/`

## Limitations
This remains a static GitHub Pages website. Forms open the visitor's email app with prepared inquiry details; they do not submit to a private backend server.
