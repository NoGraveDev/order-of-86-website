const SCENES = [
  {
    "id": "s-glacier-gate",
    "realm": "Frosthollow",
    "name": "Glacier Gate",
    "detail": "A blue ice arch guards the silent pass.",
    "type": "still"
  },
  {
    "id": "s-cinder-bazaar",
    "realm": "Ember Wastes",
    "name": "Cinder Bazaar",
    "detail": "Obsidian awnings shade an empty market of fired clay.",
    "type": "still"
  },
  {
    "id": "s-golden-orchard",
    "realm": "Sunward Heights",
    "name": "Golden Orchard",
    "detail": "Ivory paths wind between trees heavy with sunlight.",
    "type": "still"
  },
  {
    "id": "s-moss-chapel",
    "realm": "The Deepwood",
    "name": "Moss Chapel",
    "detail": "The forest holds an ancient chapel in its roots.",
    "type": "still"
  },
  {
    "id": "s-pearl-sanctum",
    "realm": "Abyssal Reaches",
    "name": "Pearl Sanctum",
    "detail": "A shell sanctuary rises from turquoise sands.",
    "type": "still"
  },
  {
    "id": "s-amethyst-bridge",
    "realm": "Violet Highlands",
    "name": "Amethyst Bridge",
    "detail": "Crystal spans cross the high violet ravine.",
    "type": "still"
  },
  {
    "id": "s-thorn-manor",
    "realm": "The Shadowmire",
    "name": "Thorn Manor",
    "detail": "A crooked house sleeps behind a wall of thorns.",
    "type": "still"
  },
  {
    "id": "s-palehowl-mill",
    "realm": "Starter Lands",
    "name": "Palehowl Mill",
    "detail": "Golden fields surround the mill at the end of the lane.",
    "type": "still"
  },
  {
    "id": "s-obsidian-stair",
    "realm": "Ember Wastes",
    "name": "Obsidian Stair",
    "detail": "Black steps climb through the glowing canyon.",
    "type": "still"
  },
  {
    "id": "s-cloud-observatory",
    "realm": "Sunward Heights",
    "name": "Cloud Observatory",
    "detail": "Brass instruments watch the sky from ivory terraces.",
    "type": "still"
  },
  {
    "id": "frosthollow",
    "realm": "Frosthollow",
    "name": "The Frozen Lake of Echoes",
    "detail": "Ancient howls preserved beneath the perfectly frozen lake.",
    "type": "still"
  },
  {
    "id": "ember",
    "realm": "Ember Wastes",
    "name": "The Crucible",
    "detail": "The volcanic arena of the Ember Wastes, framed by obsidian.",
    "type": "still"
  },
  {
    "id": "sunward",
    "realm": "Sunward Heights",
    "name": "The Monochrome Monastery",
    "detail": "White stone, golden light and a monastery above the clouds.",
    "type": "still"
  },
  {
    "id": "deepwood",
    "realm": "The Deepwood",
    "name": "The Heartwood",
    "detail": "The ancient tree whose roots connect the entire Deepwood.",
    "type": "still"
  },
  {
    "id": "abyssal",
    "realm": "Abyssal Reaches",
    "name": "The Divide",
    "detail": "The divided coastal capital, poised between land and ocean.",
    "type": "still"
  },
  {
    "id": "violet",
    "realm": "Violet Highlands",
    "name": "Archivum",
    "detail": "The fortress-city of spell-carved stone and libraries.",
    "type": "still"
  },
  {
    "id": "shadowmire",
    "realm": "The Shadowmire",
    "name": "The Blot Pools",
    "detail": "The dark pools where Blotted dogs renew their patterns.",
    "type": "still"
  },
  {
    "id": "starter",
    "realm": "Starter Lands",
    "name": "Under Palehowl",
    "detail": "Cottages and open paths beneath the smallest moon. A place for every dog.",
    "type": "still"
  },
  {
    "id": "s-ice-hall",
    "realm": "Frosthollow",
    "name": "The Ice Hall",
    "detail": "A blue glacial council cavern, where words echo for days.",
    "type": "still"
  },
  {
    "id": "s-bernards-watch",
    "realm": "Frosthollow",
    "name": "The Bernard\u2019s Watch",
    "detail": "A lone mountain vigil above the snow-covered passes.",
    "type": "still"
  },
  {
    "id": "s-stripe-caverns",
    "realm": "Ember Wastes",
    "name": "The Stripe Caverns",
    "detail": "Orange and black bands run through the volcanic earth.",
    "type": "still"
  },
  {
    "id": "s-solitary-peaks",
    "realm": "Ember Wastes",
    "name": "The Solitary Peaks",
    "detail": "Isolated volcanic spires where Tiger Wizards meditate.",
    "type": "still"
  },
  {
    "id": "s-purified-plateau",
    "realm": "Sunward Heights",
    "name": "The Purified Plateau",
    "detail": "High, clear air above a plateau where only truth can be spoken.",
    "type": "still"
  },
  {
    "id": "s-color-pools",
    "realm": "Sunward Heights",
    "name": "The Color Pools",
    "detail": "Mineral springs, each holding one perfect, unbroken color.",
    "type": "still"
  },
  {
    "id": "s-noon-spire",
    "realm": "Sunward Heights",
    "name": "The Noon Spire",
    "detail": "A natural stone formation that casts no shadow.",
    "type": "still"
  },
  {
    "id": "s-meadow-marks",
    "realm": "The Deepwood",
    "name": "The Meadow of Marks",
    "detail": "Wildflowers hold the coat patterns of the Deepwood\u2019s dogs.",
    "type": "still"
  },
  {
    "id": "s-dalmatian-post",
    "realm": "The Deepwood",
    "name": "The Dalmatian\u2019s Post",
    "detail": "A lone watchtower guarding the forest against fire.",
    "type": "still"
  },
  {
    "id": "s-mirror-caves",
    "realm": "Abyssal Reaches",
    "name": "The Mirror Caves",
    "detail": "Bioluminescent crystals reflect across a sheltered sea cave.",
    "type": "still"
  },
  {
    "id": "s-deep-shelf",
    "realm": "Abyssal Reaches",
    "name": "The Deep Shelf",
    "detail": "The edge where the continental shelf drops into the true abyss.",
    "type": "still"
  },
  {
    "id": "s-assembly-hall",
    "realm": "Violet Highlands",
    "name": "The Grand Assembly Hall",
    "detail": "Stone tiers beneath the vast roof of Pawtheon\u2019s debate hall.",
    "type": "still"
  },
  {
    "id": "s-classic-terraces",
    "realm": "Violet Highlands",
    "name": "The Classic Terraces",
    "detail": "Tiered hillside settlements above a scholarly river valley.",
    "type": "still"
  },
  {
    "id": "s-inscription-walls",
    "realm": "Violet Highlands",
    "name": "The Inscription Walls",
    "detail": "Ancient carved walls preserving the history of Pawtheon.",
    "type": "still"
  },
  {
    "id": "s-zombie-crypts",
    "realm": "The Shadowmire",
    "name": "The Zombie Crypts",
    "detail": "Archives where old knowledge decays and reforms.",
    "type": "still"
  },
  {
    "id": "s-rots-edge",
    "realm": "The Shadowmire",
    "name": "The Rot\u2019s Edge",
    "detail": "The uneasy border where the Shadowmire meets the Great Rot.",
    "type": "still"
  },
  {
    "id": "s-starter-crossroads",
    "realm": "Starter Lands",
    "name": "The Open Crossroads",
    "detail": "A new view of the paths between Pawtheon\u2019s breed-realms.",
    "type": "still"
  },
  {
    "id": "a-crystal-cascade",
    "realm": "Frosthollow",
    "name": "Crystal Cascade",
    "detail": "Ribbons of glacial water tumble into a silver-blue pool.",
    "type": "animated",
    "effect": "cascade",
    "color": "#b8f6ff",
    "frames": 48
  },
  {
    "id": "a-volcanic-foundry",
    "realm": "Ember Wastes",
    "name": "Volcanic Foundry",
    "detail": "The furnace breathes, embers rise and molten channels flow.",
    "type": "animated",
    "effect": "foundry",
    "color": "#ffc070",
    "frames": 48
  },
  {
    "id": "a-sunwheel",
    "realm": "Sunward Heights",
    "name": "Sunwheel Sanctuary",
    "detail": "Golden light travels around the great wheel above the terraces.",
    "type": "animated",
    "effect": "sunwheel",
    "color": "#ffe29b",
    "frames": 48
  },
  {
    "id": "a-firefly-grove",
    "realm": "The Deepwood",
    "name": "Firefly Grove",
    "detail": "Fireflies drift and glow between the ancient trees.",
    "type": "animated",
    "effect": "fireflies",
    "color": "#e8f39a",
    "frames": 48
  },
  {
    "id": "a-rain-harbor",
    "realm": "Abyssal Reaches",
    "name": "Rain Harbor",
    "detail": "Rain crosses the harbor as the lighthouse sweeps the waves.",
    "type": "animated",
    "effect": "harbor",
    "color": "#a8d9e3",
    "frames": 48
  },
  {
    "id": "a-spellfall-library",
    "realm": "Violet Highlands",
    "name": "Spellfall Library",
    "detail": "Floating runes trace a slow current through the archive.",
    "type": "animated",
    "effect": "spellfall",
    "color": "#e1b8ff",
    "frames": 48
  },
  {
    "id": "a-wisp-marsh",
    "realm": "The Shadowmire",
    "name": "Wisp Marsh",
    "detail": "Pale wisps rise above pools veiled in drifting mist.",
    "type": "animated",
    "effect": "wisps",
    "color": "#aaf6ce",
    "frames": 48
  },
  {
    "id": "a-wish-lanterns",
    "realm": "Starter Lands",
    "name": "Wish Lanterns",
    "detail": "Warm lanterns float above the quiet village square.",
    "type": "animated",
    "effect": "wishes",
    "color": "#ffcd86",
    "frames": 48
  },
  {
    "id": "a-petal-sanctuary",
    "realm": "The Deepwood",
    "name": "Petal Sanctuary",
    "detail": "Magenta petals turn on the breeze above the mossy stones.",
    "type": "animated",
    "effect": "petals",
    "color": "#ff80ff",
    "frames": 48
  },
  {
    "id": "a-tidal-gateway",
    "realm": "Abyssal Reaches",
    "name": "Tidal Gateway",
    "detail": "Water pours through the ancient arch and rings spread below.",
    "type": "animated",
    "effect": "gateway",
    "color": "#a5f5e4",
    "frames": 48
  },
  {
    "id": "a-sled-paths",
    "realm": "Frosthollow",
    "name": "The Sled Paths",
    "effect": "snow",
    "color": "#cef3fa",
    "detail": "Snow crosses the ancient paths between Frosthollow\u2019s settlements.",
    "type": "animated"
  },
  {
    "id": "a-truth-mirror",
    "realm": "Frosthollow",
    "name": "The Truth Mirror",
    "effect": "shimmer",
    "color": "#a9f2fa",
    "detail": "Cold light travels over the hidden mirror beneath the frozen lake.",
    "type": "animated"
  },
  {
    "id": "a-aurora-pass",
    "realm": "Frosthollow",
    "name": "Aurora over the Pass",
    "effect": "aurora",
    "color": "#67eec5",
    "detail": "Bands of green light ripple above the frozen mountain route.",
    "type": "animated"
  },
  {
    "id": "a-ash-gardens",
    "realm": "Ember Wastes",
    "name": "The Ash Gardens",
    "effect": "embers",
    "color": "#ffb04c",
    "detail": "Embers rise through a forest of burning and renewal.",
    "type": "animated"
  },
  {
    "id": "a-forge-spire",
    "realm": "Neutral Towers",
    "name": "The Forge Spire",
    "effect": "fire",
    "color": "#ffb04c",
    "detail": "Flames flare from the black tower above its volcanic caldera.",
    "type": "animated"
  },
  {
    "id": "a-magma-channel",
    "realm": "Ember Wastes",
    "name": "The Magma Channel",
    "effect": "lava",
    "color": "#ffb04c",
    "detail": "A new view of molten channels in an obsidian forge.",
    "type": "animated"
  },
  {
    "id": "a-solar-spire",
    "realm": "Neutral Towers",
    "name": "The Solar Spire",
    "effect": "rays",
    "color": "#fff1a6",
    "detail": "Golden beams tether the floating tower above its white-stone settlement.",
    "type": "animated"
  },
  {
    "id": "a-star-vault",
    "realm": "Neutral Towers",
    "name": "The Vault of Last Resort",
    "effect": "pulse",
    "color": "#fff1a6",
    "detail": "The Condensed Star pulses inside the Solar Spire\u2019s protected vault.",
    "type": "animated"
  },
  {
    "id": "a-solar-steps",
    "realm": "Sunward Heights",
    "name": "The Solaris Ascent",
    "effect": "light",
    "color": "#fff1a6",
    "detail": "Moonlight glints across a new view of the white cliff stairways.",
    "type": "animated"
  },
  {
    "id": "a-heartwood-chambers",
    "realm": "The Deepwood",
    "name": "Inside the Heartwood",
    "effect": "pollen",
    "color": "#bade7c",
    "detail": "Pollen drifts through chambers grown inside the living tree.",
    "type": "animated"
  },
  {
    "id": "a-root-network",
    "realm": "The Deepwood",
    "name": "The Ancient Roots",
    "effect": "roots",
    "color": "#8be4a2",
    "detail": "Green light travels through the Heartwood\u2019s old root network.",
    "type": "animated"
  },
  {
    "id": "a-herding-grounds",
    "realm": "The Deepwood",
    "name": "The Herding Grounds",
    "effect": "leaves",
    "color": "#88c95b",
    "detail": "Wind carries leaves across the rolling hills.",
    "type": "animated"
  },
  {
    "id": "a-tidal-courts",
    "realm": "Abyssal Reaches",
    "name": "The Tidal Courts",
    "effect": "tide",
    "color": "#81e5e7",
    "detail": "Ripples pass through chambers that the tide claims and releases.",
    "type": "animated"
  },
  {
    "id": "a-tidewatch",
    "realm": "Neutral Towers",
    "name": "The Tidewatch",
    "effect": "water",
    "color": "#81e5e7",
    "detail": "The downward-growing tower meets the subterranean scrying lake.",
    "type": "animated"
  },
  {
    "id": "a-frost-vault",
    "realm": "Neutral Towers",
    "name": "The Frost Vault",
    "effect": "drips",
    "color": "#cef3fa",
    "detail": "Water drops through the icy archive beneath the Tidewatch.",
    "type": "animated"
  },
  {
    "id": "a-violet-citadel",
    "realm": "Neutral Towers",
    "name": "The Violet Citadel",
    "effect": "runes",
    "color": "#c7a1f0",
    "detail": "Purple inscriptions awaken across the mountaintop fortress.",
    "type": "animated"
  },
  {
    "id": "a-violet-archive",
    "realm": "Neutral Towers",
    "name": "The Violet Archive",
    "effect": "books",
    "color": "#c7a1f0",
    "detail": "Books drift between the great library\u2019s stone shelves.",
    "type": "animated"
  },
  {
    "id": "a-echo-chamber",
    "realm": "Neutral Towers",
    "name": "The Echo Chamber",
    "effect": "echo",
    "color": "#c7a1f0",
    "detail": "Bands of arcane light move through the circular chamber.",
    "type": "animated"
  },
  {
    "id": "a-shifting-grounds",
    "realm": "The Shadowmire",
    "name": "The Shifting Grounds",
    "effect": "mist",
    "color": "#85bcae",
    "detail": "Mist slides past the marsh buildings that sink and rise.",
    "type": "animated"
  },
  {
    "id": "a-shiny-beacon",
    "realm": "The Shadowmire",
    "name": "The Shiny\u2019s Beacon",
    "effect": "beacon",
    "color": "#73e5c8",
    "detail": "The fixed light of the Shadowmire reaches across the darkness.",
    "type": "animated"
  },
  {
    "id": "a-fungi-hollow",
    "realm": "The Shadowmire",
    "name": "The Luminous Hollow",
    "effect": "fungi",
    "color": "#9ae8ca",
    "detail": "A new marsh clearing lit by slowly pulsing fungi.",
    "type": "animated"
  },
  {
    "id": "a-heartstring-tower",
    "realm": "Neutral Towers",
    "name": "The Heartstring Tower",
    "effect": "heart",
    "color": "#ff00ff",
    "detail": "Magenta light pulses from the curved tower across its valley.",
    "type": "animated"
  },
  {
    "id": "a-palehowl-festival",
    "realm": "Starter Lands",
    "name": "The Palehowl Festival",
    "effect": "lanterns",
    "color": "#e4f0ad",
    "detail": "Moon lanterns sway over a Starter Lands festival plaza.",
    "type": "animated"
  },
  {
    "id": "a-sorting-circle",
    "realm": "Starter Lands",
    "name": "The Sorting Ceremony",
    "effect": "sparkles",
    "color": "#e4f0ad",
    "detail": "Six colored crystals glint beneath Palehowl\u2019s faint light.",
    "type": "animated"
  }
];
