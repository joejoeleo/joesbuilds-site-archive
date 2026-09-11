# Launch design — September 9, 2026

The overview is a sequence of six project chapters with a persistent name index. Each chapter has a short entrance animation, a large original photograph or system diagram, a concise introduction, and an opening into the documented build. Normal scrolling moves between projects; the index provides direct jumps. No scrolling is intercepted.

## Visual direction

- Carbon `#090B0C`, graphite `#171B1E`, soft white `#F1F0EB`, steel `#718087`, signal orange `#FF4D00`.
- Outfit variable font, self-hosted under the included SIL Open Font License. Light geometric headings, monospaced technical labels, and fine construction lines.
- Rounded images, video elements, media frames, and dialogs. Subtle frame highlights and pointer reflections add depth without a continuous render loop.
- Native dialogs with direct links, keyboard focus handling, Escape, browser Back, and shared media transitions where supported.
- Motion can be paused and respects the operating system preference. Playback is user initiated; original videos have native controls and do not preload.

## Media provenance and next assets

Infinity, LED Study Table, Rustic Pipe Lamp, and Custom Ring Necklace use original repository photographs. Infinity also includes original demonstration footage and an explicitly labeled archived CAD screenshot. The screenshot is not an interactive model.

Lumen River Desk and Alexa-Powered Water Dispenser currently have no project photography in the repository. Their chapters use functional system diagrams labeled as diagrams. Replace those stages with original project photography when available. No generated product images or fabricated mechanism animations were introduced.

The original detailed project content and media remain intact. Full CAD inspection, mechanism animation, future concept sketches, and a separately edited launch film remain later work.

## Atmosphere and project storytelling

The first arrival has a brief signature and construction-line entrance. The line resolves into the first project indicator; repeat arrivals in the session get a short fade. Deep links, history restoration, and reduced-motion preferences skip the full entrance. Any input dismisses it immediately. CSS supplies a timed fallback if the enhancement script fails.

One fixed ambient light illuminates the background and is reflected by the project frames as they scroll past it. Plus signs and connecting lines recede in the light and become clearer in dark areas; amber dust does the opposite. There are 38 soft amber motes (20 on small screens), with a gentle cursor current. Dedicated card halos and chapter glows have been removed. See [the lighting direction](lighting-direction.md) for the user's preferences to preserve. Particle light is cached as a small sprite. The canvas pauses with motion disabled, while a dialog is open, or when the tab is hidden. The construction field is capped at roughly 200 points and a 1.5 pixel ratio.

Built / Inside / CAD / In use share a fixed media stage. Images decode before a layered crossfade, tabs have a sliding selection indicator, and request ordering prevents a slower old selection from replacing a newer one. Failed loads leave the previous view available. Video uses its poster during entry and retains native controls.

Each project now opens with a permanent design question, an explanation of what it does, and a short description of its construction. These precede the preserved build documentation. The introduction does not require waiting or an extra click; a keyboard-accessible button also jumps directly to the details.

`src/atmosphere.css` and `src/atmosphere.js` implement the ambient and entrance layers. `src/gallery.js` handles the layered media viewer. `node --test tools/check-interactions.cjs` checks load ordering, cancellation, failure recovery, motion-off behavior, and playback state without a browser.

## Current validation

Run `python tools/validate.py`, `node --check src/main.js`, and `git diff --check` from the repository root. The static validator checks project scope, IDs, anchors, local assets, image labels, and user-controlled video loading. Browser visual and interaction review remains part of the next preview review.
