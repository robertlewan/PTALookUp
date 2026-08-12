# pokemon.json — extraction notes

Source: `E:/PTU/PTA (old)/PTA3Pokedex.pdf` (810 pages). Raw page text was
dumped to `data/_raw_pokedex_text.txt`; the parser (`data/_parse_pokemon.py`,
consolidated by `data/_build_pokemon_json.py`) works off that dump, driven by
the book's own table of contents (which lists every family, grouped by type,
ending with the "Water Type Families" section).

**Count: 448 families**, matching the table of contents exactly (448
family-entry lines counted independently against the printed TOC — every
listed family is present, none missing). This includes dual-Pokémon TOC
entries like "Volbeat and Illumise" or "Sawk and Throh", which are stored as
a single family with two stages rather than two families.

The background extraction job that produced this file ran for a very long
time on its final cross-validation pass (unsurprising: this Pokédex is ~4x
the length of the companion Game Master's Guide, whose equivalent Legendary
extraction alone used 300k+ tokens) and was stopped before it could write
this README or a final quality pass. The data itself was already complete at
that point; the two real defects introduced during the original extraction
were found by manual spot-checking afterward and fixed directly in
`pokemon.json` (no re-extraction needed):

## Fixes applied post-extraction

1. **Duplicate `familyId`s (21 instances, fixed).** Some `familyId`s are a
   slug of `familyName`, and 19 names appear twice in the book for genuinely
   distinct dex entries (e.g. a base "Meowth" family and a separate
   "Meowth (Tropical Climate)/(Cold Climate)" regional-variant family, both
   named "Meowth"; "Oricorio" appears 4 times, once per nectar-style form).
   Collisions were resolved by suffixing later occurrences: `meowth`,
   `meowth-2`; `oricorio`, `oricorio-2`, `oricorio-3`, `oricorio-4`; etc.
   Un-suffixed as before: 448 total families, 448 now-unique `familyId`s.

2. **Flavor-text bleed into `proficiencies` (31 instances found, 27 cleaned,
   4 dropped as unsalvageable).** The PDF's 2-column layout occasionally let
   a flavor-text paragraph run into a `proficiencies` line during extraction
   — sometimes a Pokémon's *own* flavor text, sometimes (due to page-order
   drift) an unrelated neighboring Pokémon's entirely, e.g. Falinks'
   proficiencies briefly included Hawlucha's description, and one Oricorio
   form's included Unown's. Cleaned by truncating each proficiency string at
   the first "<Capitalized word(s)> <is/are/live/dwell/...>" sentence
   boundary, keeping only the short tag prefix (verified against the
   originals; a handful needed a one-off hand patch to restore the intended
   tag exactly, e.g. "Elemental" → "Elemental Attack"). This is a mechanical
   cleanup, not a re-extraction from source — if the correct tag itself
   (not just the trailing lore) had already been dropped upstream, this pass
   could not recover it. Given ~2500 total proficiency entries across the
   dataset, the ~30 affected is a small fraction, but the app's Pokédex
   detail screen is the place to notice if any tag still looks truncated or
   wrong.

No other systemic issues were found in a broader pass (zero families with
0 HP stat blocks, zero families with empty `stages`, rarity breakdown of
132 Rare / 245 Uncommon / 71 Common looks sane for the source book's symbol
legend).

## Schema

```json
{
  "familyId": "bulbasaur",
  "familyName": "Bulbasaur",
  "rarity": "Uncommon",
  "biology": { "eggGroups": ["Grass", "Monster"], "hatchRate": "10 Days", "diet": "Herbivore", "habitats": ["Forests", "Grasslands"] },
  "evolutionText": "Bulbasaur Ivysaur Venusaur",
  "proficiencies": ["Grass", "Elemental Attack", "Bruiser"],
  "megaEvolution": true,
  "gigantamax": false,
  "stages": [
    {
      "name": "Bulbasaur",
      "types": ["Grass", "Poison"],
      "size": "Small",
      "weight": "Light",
      "stats": { "hp": 30, "defense": 6, "specialDefense": 7, "speed": 5, "speedFt": 25, "attack": 5, "specialAttack": 7 },
      "skills": [{ "name": "...", "description": "..." }],
      "passives": [{ "name": "...", "description": "..." }],
      "moveModifiers": { "attack": 2, "specialAttack": 3, "effect": 2 },
      "moves": [{ "name": "...", "frequency": "...", "range": "...", "moveType": "...", "category": "...", "power": "...", "effect": "..." }]
    }
  ]
}
```

Note: `moveModifiers` values are stored in the source PDF's own "+N" signed
format; the app's data layer (`src/data/index.ts`) normalizes these to plain
numbers at load time, so components should always receive numbers, not
strings — treat that normalization as load-bearing if this file is consumed
outside the app.

Merges with `data/legendaryPokemon.json` at the app's data layer
(`src/data/index.ts`) into a single combined Pokédex.
