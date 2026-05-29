# Troop [000] — Field Guide

A bright, outdoor scout-troop site (topographic field-guide look).
Plain HTML/CSS/JS, no build step. Deployed via GitHub Pages.

Signature moment: in **The Album** section, the ridgeline of mountains
lifts away as you scroll to reveal a wall of trail photos behind it.

## Files
- `index.html` — the page (placeholder text in `[ brackets ]`)
- `css/styles.css` — field-guide theme, topo lines, the ridge-reveal
- `js/main.js` — smooth scroll, hero parallax, the ridge-lift reveal, photo wall
- `js/photos.js` — the album manifest (swap in real photos here)
- `photos/` — drop troop photos here

## Adding album photos
Edit `js/photos.js`. Local filename loads from `photos/`; full URLs work too:

```js
window.GALLERY = [
  { src: 'philmont-2025.jpg', caption: 'Philmont, 2025' },
];
```
The wall shows 12 tiles (4×3) and cycles the list if there are fewer.

## Local preview
Open `index.html`, or run `python3 -m http.server` and visit http://localhost:8000
