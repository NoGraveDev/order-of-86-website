# Pawtheon world — Blender and expansion guide

This is a playable, third-person exploration prototype based on the supplied Pawtheon bible. Seven distinct realm areas surround a connected Starter Lands hub. The initial assets are procedural stylized 3D models. They are not final character sculpts or a finished RPG.

## Walk

WASD / arrows: move relative to camera. Shift: run. Space: jump. Drag: look. Wheel: zoom. E: collect a nearby crystal lizard, otherwise read a nearby landmark. P: choose a dog. C: collection book. H: play a seven-tone magical howl. M: atlas and travel. B: workshop. Touch: left thumbstick, drag scene to look, Jump button.

## Dogs and crystal lizards

Dogs opens a searchable picker for all 86 unique IDs in the supplied directory. Filter by Order or search names, numbers, breeds, coat colors, and accessories. Choosing a dog replaces the avatar, including breed patterns, hat color, eyes, glasses/visor, and clothing; all dogs share movement abilities. Choice persists on this device. The directory has 13 named Arcane dogs, despite its 14-wizard heading; those 13 plus the Wanderer and other Orders total 86. No extra dog was invented. These remain procedural interpretations, not original collection artwork or finished Blender sculpts. Heads and bodies now have denser geometry and integrated coat patterns. Every dog has a lower jaw, neutral closed mouth seam, philtrum, nostrils and toe seams. The bible does not contain a per-dog mouth trait field: no teeth, tongue, pipe, expression, or mouth item has been invented as a canonical trait. Original image/metadata references are required to finalize individual mouths. Only the Wanderer has a sharp pointed hat and upturned brim; other hats have softened folded tips. Unspecified decorative hat bands and clasps were removed.

There are 36 crystal lizards to collect, four per each of the nine canonical varieties. They wander beside paths in their home realms. Move within 2.8 meters and press E or tap Collect. A lizard is collected once and disappears from the world; catches persist on this device across sessions and dog choices. Lizards opens the collection book showing counts and habitats. Clearing browser data clears this progress; there is no account or cross-device sync.

## The other 85 dogs

All 86 identities have a roaming actor assigned to their native realm by the directory’s breed-to-realm mapping. The selected dog’s roaming actor is hidden, leaving 85 other dogs. The Wanderer roams the Starter Lands when another dog is selected. Switch dogs to immediately return your old dog to the roaming roster. Approach a visible dog and press E / tap Meet for its directory identity. Lizards have interaction priority.

Movement uses deterministic short walking routes within the home realm; it is not full navmesh pathfinding or combat AI. To keep the expanded world practical, only the nearest 16 actors within 85m render at once. Distant dogs continue to be represented by their simulation state. World GLB export includes the other 85 dogs in their current poses as well as the player.

## Add things

Open Build, choose an object and color, and place it in front of the character. Reopen Build to select, scale, rotate, reposition, or remove the object. Save layout downloads the procedural object layout. Load layout adds those objects to the scene. Imported models are session-only: export the world before closing to preserve them. Discoveries persist in browser local storage.

## Make a detailed character in Blender later

The included gray Classic is a replaceable articulated stand-in, with round spectacles and a purple pointed hat, following Wizard #6164. It is not a finished high-detail Blender character.

1. Model the detailed character in Blender with a consistent scale and its feet at ground level. Preserve the gray Classic silhouette, muzzle, ears, round glasses, and purple hat with upturned brim. The scripture contains competing histories; the directory appearance is used here.
2. Use a separate render-quality collection for fur and high-resolution modifiers; keep a lighter game collection with baked textures for web use. A practical target is 30,000–80,000 triangles, depending on device, and 1K–2K textures.
3. Rig and animate in Blender. Export idle and walk clips with those words in their names. The viewer selects clips by name, otherwise it plays the first available animation. It does not auto-rig static models.
4. Export File → Export → glTF 2.0 → glTF Binary (.glb). Embed textures and leave Draco/mesh compression disabled. Target local +Z as forward in glTF. The viewer fits the longest dimension to 2.8 world units and moves the feet to the ground.
5. Open Build → Replace player to test the character immediately. If it faces backward, correct its orientation in Blender and export again.

## Export the world to Blender

Choose Build → Export world .glb. In Blender, choose File → Import → glTF 2.0. Terrain, landmarks, user objects, and the current player pose are exported as editable geometry. Runtime movement, UI, audio, sky moons, and gameplay logic are not Blender scene contents. This is a scene export, not an animated game project or native .blend file. Save it as .blend inside Blender and add cameras and lights for rendering. Toon materials are converted to rough standard materials on export for compatibility; set up your preferred cel shading in Blender.

## Source extension points

- `wizards.js`: all 86 identity records and palette data.
- `characters.js`: reusable articulated avatar factory.
- `collectibles.js`: nine variants, stable spawn IDs, save validation, range detection and duplicate-safe pickup.
- `geography.js`: shared bounds, walkable height function, roads and 21 additional landmark records.
- `world-detail.js`: instanced biome dressing, landmark detail and tree collision records.
- `realm-dogs.js`: native realm assignments, roaming simulation, proximity interaction and selected-player exclusion.
- `world-data.js`: realm IDs, placement, names, visual palette, and landmark lore.
- `game.js`: deterministic terrain, reusable prop builders, landmarks, third-person controller, collision circles, creature movement, asset loading and export.
- `style.css`: desktop and touch controls, atlas, workshop and lore panels.
- Add custom geometry under `User_Placed_Objects` for world exports. Register collision circles when adding solid structures. Imported props currently have no automatic collision, and the controller uses approximate circles for original trees and major landmarks.
- Seed 6164 keeps procedural terrain dressing reproducible. Terrain is approximately 960 meters across the playable area (480m radius): three times the original diameter and nine times its area. Seven radial routes connect to circular roads at 220m and 390m, with 21 additional lore locations. Terrain has broad hills and off-path ridges. Instanced trees, grasses, pillars, stones and flowers add detail without one draw call per prop.

## Scope and lore choices

Implemented: all seven realm environments, Starter Lands, seven shaped moons, six Order landmark representations plus the Ice Hall and Ancient Oak, representative crystal lizards, ambient particles, lore discoveries, and extensible asset workflow. Tidewatch has a surface representation; its underground interiors remain to be built. World scale and locations are compressed for exploration, not a canonical geographical survey.

Not yet implemented: the full bestiary, authored NPC dialogue, pathfinding and combat behaviors, combat, inventory, authored quests, animated conversations, multiplayer, saved imported model storage, building interiors, full terrain physics, and a production character rig.

The supplied bible contains contradictory wizard counts, dates, origin stories, and geography. This prototype preserves the named realm and character identity without resolving theological debates. The open Violet meadows surround a localized Citadel landmark. Lore text uses brief supplied descriptions rather than invented canonical events.

Three.js 0.180.0 is vendored locally with its MIT license. Fonts have local serif/sans-serif fallbacks. No external model downloads are needed to play.

## Trait audit limits

The 86 unique IDs were checked against the supplied directory fields: name, Order, breed, fur, eyes, and clothing/accessory. In conflicts, the directory is the implementation source: Graystorm #5538 has Sleepy Eyes although its biography says Black Eyes; Goldleaf #6873 is Wild although a biography route says Forge Spire; Tideforge #5275 retains a brown base and a blue split accent rather than replacing its coat with the contradictory prose’s sun-gold. There are 13 named Arcane dogs in the directory despite a 14-wizard heading, yielding 86 with the Wanderer. All per-dog mouth traits remain unspecified. These disagreements are recorded rather than silently treated as verified visual canon.

## Wisdom owls, building, and spells

Six animated wisdom owls fly near realm approaches: Common Owl in Starter Lands, Great Horned Owl in Deepwood, Spectacled Owl in Violet Highlands, Snowy Owl in Frosthollow, Ember Owl in Ember Wastes, and Barn Owl in Shadowmire. They are ambient wildlife and are not collectible. Owl perches are decorative build objects, not landing AI.

The workshop now also offers a moon lantern, wooden bench, stone arch, inscribed rune stone, owl perch, scrying well, and unlit brazier. They support the same positioning, rotation, scaling, removal, layout save/load, and GLB export as previous props. Brazier ignition is preserved in a layout’s optional `lit` field. New props remain decorative rather than adding automatic collision.

Press F or tap the spell button. Spell availability follows the selected dog’s Order, not its native breed realm, as specified by the bible. The names and durations below are gameplay adaptations of Order domains, not newly asserted canon. All spells are exploration tools without combat damage.

- Flame — Measured Flame: launches a short-lived flame, igniting a nearby placed brazier when the flame passes within range; 4-second recharge.
- Wild — Living Grove: grows twelve temporary flowers around the player; lasts 12 seconds, 6-second recharge.
- Radiant — Revealing Light: marks uncollected lizards within 65 meters for 8 seconds; 6-second recharge.
- Deep — Water Sight: creates a 10-second trail to the nearest undiscovered landmark; 5-second recharge.
- Arcane — Folded Step: moves the player 9 meters forward, adjusting the destination around registered colliders and clamping to world bounds; 5-second recharge. This is a blink rather than walking pathfinding.
- Dream — Dream Threads: connects to dogs within 25 meters and pauses their wandering for 8 seconds; 6-second recharge.
- Wanderer — Palehowl’s Possibility: marks the nearest uncollected crystal lizard for 8 seconds; 4-second recharge.

Cooldown is shared across character switches. Spell time pauses while a dialog is open. Temporary spell visuals expire and are excluded from world export. The current imported player model uses the last selected dog’s Order. Spell effects are session state; collection saves are unaffected.

`magic-and-owls.js` contains owl geometry/animation, the extra prop registry and spell effects. `realm-dogs.js` respects the Dream spell’s temporary calm state.

## Directory workshop expansion

Twenty additional buildable representations are defined in `directory-items.js`: six major relics, seven named Moon Shards, Stone Dog, Hollow Stone, First Ember, Echo Egg, Friendship Fern, Dream-Threads, and Singing Stone. This brings the workshop to 31 object types. Category groups and lore descriptions identify each item and select its default canonical color. Seventeen placed displays add detail around realm landmarks; approach and press E to inspect their lore. User-placed directory items are also inspectable.

Duplicate copies a selected workshop object's kind, color, scale, rotation and brazier ignition ahead of the player. Imported models are excluded from duplication. All new workshop types support layout save/load and GLB export. These are decorative representations: unique relic originals are not multiplied in the lore, mirrors do not render reflections, eggs do not hatch, and relics do not grant extra spells.

## Wizard stories and the meeting quest
All 86 wizard IDs have source-grounded directory story summaries. Meet an NPC with E to read their story and record their ID once toward the 86-wizard quest. The journal lists native realms and tracks distance/cardinal direction to a selected wizard. To complete all 86, switch playable characters and meet your previous character. Progress is saved in this browser, independent of the selected dog. Full biographies can be imported in the journal from JSON keyed by ID (or array entries with id and story/biography), or Markdown using the bible's ## Wizard #ID headings. Imports are validated and saved locally. Included summaries are not verbatim imports of the full biography archive.

The coat and hat palettes now use clearer named colors with neutral white illumination. Unsupported blue Split accents are removed in favor of a darker same-hue split. Exact original hex values and unspecified secondary coat/mouth traits still require original art or metadata. Deterministic repeat texture maps add ground grain, bark furrows and foliage variation while preserving the cel-inspired geometry. NPC patrols have a larger radius and faster visible walking; every movement is gated by the native biome and feet follow terrain. Up to 32 nearby NPCs render together.

## Blender architecture, original art and full biographies
Seven individual structures are now generated by Blender 4.5.9 LTS from `blender/build_structures.py`: Forge Spire, Solar Spire, Heartwood Spire, Violet Citadel, Dream Spire, Ice Hall and Tidewatch. Each has its own downloadable .blend and a runtime .glb in models/. GLBs replace the principal procedural placeholders after loading, with existing geometry retained only on load failure. Smaller decorative ruins remain procedural. These are detailed exterior representations, not navigable building interiors. Tidewatch has a terrain depression exposing the descending galleries. Meshes are consolidated by material for a small draw-call footprint.

All 86 portraits were downloaded from theorderof86.com/wizard-images/ID.png and reviewed as four contact sheets, with individual checks for ambiguous mouth accessories. Exact pixel samples supply per-ID fur, muzzle, hat, hat-band, eyewear, clothing and neckwear colors in art-palettes.js. Frostforge and Shadowspot have dark scarves, Blizzardflame green, Brownthorn pale gray. Physical metadata comes from the site's published wizard-dogs-data.js; portraits take visual precedence over contradictory biography prose. Original portraits appear in the picker. Back views and full-body anatomy remain 3D interpretations of bust artwork; coat patch layouts are approximations, not exact pixel artwork reproduction.

All 86 complete biographies (93,689 characters combined) are imported from the site's wizard-stories.json, with escaped newlines normalized. Read through NPC conversation or the selected-dog story button. Reading remotely does not advance the meeting quest. Existing user-imported story overrides remain local. The public site did not expose a full item story archive and its lore page showed Coming Soon when checked. Item entries therefore use the supplied Master Bible, explicitly labeled; generic furnishings have descriptive entries rather than invented canonical biographies.

Atlas now contains a north-up world overview with terrain regions, roads, landmarks, all unselected wizard positions and a live player heading/position marker. It updates while open, with the existing realm travel list below.

## Reset, the traveling Wanderer, and Moon Shards
Settings contains Reset World with an explicit confirmation. It removes only the selected dog, discoveries, meeting-quest, lizard and shard save keys, then reloads the world; session-placed objects and imported models are discarded. Imported story overrides and downloaded files are retained.

The NPC Wanderer follows a continuous route from the Starter Lands through the seven realms and back, at 2.6m/s. His route pauses when selected, when dialogs are open or when calmed by Dream magic. Other NPCs remain within their native biomes. The selected player already has unrestricted realm travel.

Twenty-one persistent collectible Moon Shards (three per moon) appear beside realm approaches. Approach and press E/tap Collect; they take interaction priority and vanish after a successful pickup. Collection shows each moon's progress and lore. IDs are stable and validated on reload; duplicate credit is prevented. Workshop shards remain decorative and do not count toward collection.
