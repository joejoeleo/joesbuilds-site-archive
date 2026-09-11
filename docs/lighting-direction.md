# Lighting direction to preserve

User direction: make the plus/line interaction more visible away from the background light. Let amber dust dominate the illuminated area and recede in the darker areas. Remove dedicated card lighting; cards should appear to pass through the background light while scrolling.

Implemented one viewport-fixed amber light. The canvas samples the same elliptical light placement used by the CSS background. Plus signs, dots, and connecting lines fade toward that light; dust brightens there. Card rims and a subtle surface reflection respond to their position in that same light. Separate card amber halos and chapter glows have been removed. Neutral depth shadows remain.

Keep the existing typography, copy, palette, plus-sign pointer behavior, and gentle dust current. Current particle count: 38 desktop / 20 small screens. Cursor force remains 25% above the original dust implementation. Motion-off, project-dialog, and hidden-tab pauses still apply.

Future refinements should tune this shared-light behavior rather than reintroducing independent lights attached to every card. Visual review can guide intensity and positioning.

Latest preference: remove the amber perimeter outline from all project frames, including the project-opening media. Keep the background-light reflection and neutral depth shadows; do not restore the light-responsive rim border.

September 10 completion: card surface reflections now use the background light's actual position projected into each frame. Reflections update on scrolling even with autonomous motion disabled, and refresh after chapter entrance animations settle. The light stays in place as the cards pass through it.
