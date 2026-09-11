# Portfolio design direction — September 8, 2026

## Direction

An interactive engineering exhibition: charcoal surfaces, lime instrument markings, large project imagery, sparse monospaced labels, and motion that responds to exploring the work. Joseph's name stays visible, but the first screen belongs to a project.

The old page gave almost everything the same visual weight. Its large name, introductory panel, uniform card treatment, and UI/Arduino placeholders concealed the most interesting material: the actual mechanisms, build stages, and operating footage. More effects alone would leave that hierarchy intact. This iteration changes the hierarchy and the motion together.

## Saved collection review

The connected Instagram session exposed six reels in [Vibe Code Projects](https://www.instagram.com/joe.leonardis/saved/vibe-code-projects/2213509885894732/). This review uses their visible captions and sampled playback frames, not a full audio transcript. No comments or messages were sent to obtain the creators' gated resource lists.

| Reference | Observed design idea | Application to this portfolio |
| --- | --- | --- |
| [design4me__ — mouse-reactive components](https://www.instagram.com/design4me__/reel/DbdURMOIzV2/) | The collection thumbnail shows a luminous 3D head treatment; playback shows a magnetizing-line surface. The caption describes mouse-reactive Framer components. | A magnetic line field behind the featured build responds to the pointer. A slight perspective tilt gives the image viewer depth. Keep the native cursor and readable copy. |
| [danneuenhaus — O.R.C.A.](https://www.instagram.com/danneuenhaus/reel/DcyYSeOgmGs/) | Dark technical displays, lime geometry, dot matrices, circular radar constructions, fine rules and compact labels. This is a motion graphics/UI study, not evidence of a functioning website component. | This is the strongest art-direction reference. Borrow its restraint, framing, indexing and technical precision. Use real project labels instead of invented radar telemetry or a loading sequence. |
| [alaa.alaff — Higgsfield workflow](https://www.instagram.com/alaa.alaff/reel/DcRHjuOI-7u/) | A character-led website is shown in the collection thumbnail; sampled playback shows the Higgsfield workflow. The caption offers prompts. | The useful idea is a dominant visual subject that carries the opening. Here that subject is the Infinity Table. Generated project films and mechanism imagery are deferred; actual build footage is available now. |
| [setupsai — animated components](https://www.instagram.com/setupsai/reel/DXHHJQ6kgic/) | Playback shows animation documentation and an example importing from `animejs`, with geometric animation examples. | Use consistent easing, short image transitions and stagger-free, once-only gallery reveals. This first version implements its small effect set with browser APIs, so the static site needs no framework migration. |
| [srii_tech_ — 3D websites](https://www.instagram.com/srii_tech_/reel/Dci-Pn-vvnH/) | Spatial, full-screen website examples; the caption names Three.js, WebGL, GSAP and React Three Fiber. A sampled frame shows a blue world-like scene with clouds. | Present the project as an object to inspect, with discrete views now. A later real model can add orbiting, labeled components and an exploded assembly within the same viewer. A complete 3D world would distract from finding the engineering work. |
| [cindie.zhu — advanced design effects](https://www.instagram.com/cindie.zhu/reel/DcxV37-CJOC/) | A montage of visual effects and repository-based implementation; sampled playback explicitly identifies Shadergradient as one resource. The caption recommends isolating effects and checking compatibility and licensing. | Adopt a small, coherent set of effects. Atmospheric material treatments could later complement the LED projects, but the portfolio does not need every effect library shown in a montage. The complete four-repository list was not established from the sampled frames. |

## Implemented in this iteration

- The Infinity Table is the opening subject, with a direct link to its detailed build.
- Built / Inside / CAD buttons switch between real repository images. The CAD view explicitly says it is an archived image.
- Pointer-reactive canvas lines and gentle perspective movement give the opening a spatial feel.
- Asymmetrical photography, open captions and contrasting functional-diagram panels replace the uniform card presentation.
- All six requested projects retain their detailed views and original factual descriptions. The excluded projects are not displayed.
- The Infinity operating video also appears in a dedicated overview section, rather than only inside its dialog.
- Native dialogs support keyboard focus and Escape. Each project has a direct hash URL, and browser Back closes a project opened from the overview.
- A visible motion control and system reduced-motion support stop visual effects. The canvas stops when offscreen, the tab is hidden, or a project dialog is open.
- Video is user-initiated and does not preload. Photos in the overview are lazy-loaded except for the opening image.

## Assets and later mechanism work

The repository contains a CAD screenshot and build documentation for Infinity, but no `.step`, `.stp`, `.f3d` or `.glb` model. Lumen and the Alexa water dispenser have factual descriptions but no matching photography. Their diagram panels express known functions; they are not fabricated CAD or images of a claimed build.

For the next asset phase, prioritize:

1. **Infinity:** export the existing CAD assembly with components preserved. Use the actual model for an exploded assembly and system-specific views. Identify the exact revision before aligning it with build photographs.
2. **Lumen:** add a clean desk photo and touchscreen capture. These will improve the website more than an unrelated generated hero image.
3. **Water dispenser:** add a finished-build photo and a short operating clip.
4. **Lamp and study table:** use dimensions and construction photographs to create explanatory models. Any inferred internal geometry should be identified as an illustration until verified against the build.

The visual system and project viewer can accommodate those assets without redesigning the entire site again.

## Review boundaries

This is a local design iteration on `codex/interactive-portfolio`. It has not been pushed to GitHub or published. Static validation checks the project scope, unique IDs, local asset references, stylesheet structure, JavaScript syntax and HTTP delivery. Interactive browser QA and cross-device visual review have not been performed in this iteration.
