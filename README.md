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

This repo now includes a first-pass static portfolio prototype in `src/`.

## Local Preview

Open `src/index.html` directly in a browser, or run a simple local server from `src/`:

```bash
python3 -m http.server 4173
```

Then visit:

```text
http://127.0.0.1:4173/
```
