# Cosmic Trail

A scout troop website — a scroll journey from deep space down to the summit.
Plain HTML/CSS/JS, no build step. Deployed via GitHub Pages.

## Structure
- `index.html` — the page (placeholder text in `[ brackets ]`, replace later)
- `css/styles.css` — cosmic theme, parallax, mountains, reveal animations
- `js/main.js` — starfield, scroll-driven warp + parallax, self-drawing trail, photo reel
- `js/photos.js` — the album manifest (swap in real photos here)
- `photos/` — drop troop photos here

## Adding album photos
Edit `js/photos.js`. For a local file, use just the filename (it loads from `photos/`);
or paste a full URL. Captions are optional:

```js
window.GALLERY = [
  { src: 'philmont-2025.jpg', caption: 'Philmont, 2025' },
  { src: 'https://…/photo.jpg', caption: 'Summit day' },
];
```

The current entries are stock placeholders.

## Local preview
Open `index.html` in a browser, or run a tiny server:
`python3 -m http.server` then visit http://localhost:8000
