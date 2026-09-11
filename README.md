# Joe's Builds Website Archive

This repository stores the dormant code and archive materials for the Joe's Builds website overhaul.

The original site lives at:

https://joejoeleo00.wixsite.com/joesbuilds

## Purpose

- Preserve the old Wix website as reference material.
- Store future hand-built website code in a normal git repository.
- Keep the project ready to revive or deploy later, without requiring the site to be active now.

## Important Note About Wix

Wix does not provide a clean export of the original source code as a normal HTML/CSS/JavaScript project. The files in `archive/` are reference captures of the public site, not the editable Wix source.

When the new site is designed, its source code should live in `src/` and can later be deployed to GitHub Pages, Netlify, Vercel, Cloudflare Pages, or another host if needed.

## Structure

```text
archive/
  old-wix-screenshots/
  source-snapshots/
docs/
src/
```

## Status

The static portfolio in `src/` presents six full project chapters with a persistent project index. Infinity Entertainment Table leads, followed by Lumen River Desk, Alexa-Powered Water Dispenser, LED Study Table, Rustic Pipe Lamp, and Custom Ring Necklace. Each chapter reveals a large project photograph or clearly labeled system diagram and opens its existing build documentation.

The design uses a carbon/graphite palette with signal orange, self-hosted Outfit typography, rounded media, short reveal animations, and subtle surface reflections. The mobile index scrolls horizontally. Normal page scrolling, direct project links, browser Back, and reduced-motion preferences are preserved. Infinity includes Built, Inside, CAD reference, and In use views with original build footage.

The atmosphere pass adds warm lighting, a pointer-responsive construction field, a short signature entrance, and layered media crossfades. Each project opens with its design question and a plain explanation before the build documentation. See [the current design notes](docs/launch-direction.md) for behavior and media provenance.

See [the reel analysis and design notes](docs/reel-analysis.md) for the references, implemented effects, and the later CAD/asset phase.

The site has no build dependencies. `src/index.html` contains the content and native project dialogs, `src/styles.css` contains the responsive design, `src/depth.css` defines shared media transitions, and `src/main.js` handles the viewer, project navigation, and motion. Outfit is bundled with its SIL Open Font License in `src/assets/fonts/`.

## Local Preview

Open `src/index.html` directly in a browser, or run a simple local server from `src/`:

```bash
python3 -m http.server 4173
```

Then visit:

```text
http://127.0.0.1:4173/
```

On Windows, use `python -m http.server 4173 --bind 127.0.0.1` from `src/`. Refresh the browser after editing; the static server does not provide hot reload.

## Validation

From the repository root:

```bash
python tools/validate.py
node --check src/main.js
node --check src/gallery.js
node --check src/atmosphere.js
node --test tools/check-interactions.cjs
git diff --check
```

Project links can be opened directly, for example `http://127.0.0.1:4173/#project-infinity`. The Built / Inside / CAD controls use repository images; the CAD view is a labeled reference image, not an interactive 3D model.
