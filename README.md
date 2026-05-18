# Mathieu Konstruct Solutions Website

This folder is ready to upload to the GitHub repository:

`https://github.com/mathieu1-tech/mathieu1`

Final GitHub Pages URL:

`https://mathieu1-tech.github.io/mathieu1/`

## Files included

- `index.html` — main website homepage
- `admin.html` — optional local browser content editor
- `assets/css/` — website and admin styles
- `assets/js/` — website interactions, editable site data, admin tools
- `assets/images/` — website, catalog, product, material, and gallery images
- `assets/catalog/` — downloadable PDF catalogs
- `.nojekyll` — keeps GitHub Pages from ignoring asset folders

## How to upload to GitHub

1. Open `https://github.com/mathieu1-tech/mathieu1`.
2. Upload **all files and folders from this ZIP**, not the ZIP itself.
3. Make sure `index.html` is in the root of the repository.
4. Commit the changes to the `main` branch.

## How to enable GitHub Pages

1. Go to the repository **Settings**.
2. Open **Pages**.
3. Under **Build and deployment**, choose **Deploy from a branch**.
4. Select branch: `main`.
5. Select folder: `/root`.
6. Save.

Your site should publish at:

`https://mathieu1-tech.github.io/mathieu1/`

## How to update images later

1. Replace images inside `assets/images/`.
2. Keep the same filename when possible.
3. If you use a new filename, update the matching image path in `assets/js/site-data.js` or the HTML.
4. Product/unit images are styled with `object-fit: contain` so they remain fully visible and uncropped.

## How to update the catalog PDF later

1. Replace the PDF in `assets/catalog/`.
2. Keep this filename when possible:

`PREFAB-CATALOG-MKS-CO-LTD-2026.pdf`

If the filename changes, update all catalog links in `index.html` and `assets/js/main.js`.

## Local preview

You can double-click `index.html` to preview the site locally. For the most accurate test, open the folder with a simple local server or upload directly to GitHub Pages.

## Notes

The contact/quote form is frontend-safe for GitHub Pages. It does not require a backend server.
