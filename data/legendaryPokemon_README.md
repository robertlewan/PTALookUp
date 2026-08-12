# legendaryPokemon.json — extraction notes

Source: `E:/PTU/PTA (old)/Copy of PTA3GameMastersGuide.pdf`, the "Legendary
Pokémon" chapter (printed pages 153-249, pypdf 0-indexed pages 152-248).
Raw page text was dumped to `data/_raw_gmguide_text.txt` first; the parser
(`data/_parse_legendary.py`) works off that dump, driven by the chapter's own
table-of-contents (printed pages 2-3) rather than by hand-transcription.

**Count: 108 families / 142 stat-block stages**, extracted from all 108
table-of-contents entries (the brief estimated "roughly 100" — the real count
is 108 once every TOC line, including two-Pokémon-per-line entries like
"Kubfu / Urshifu", is counted as one family). 0 TOC entries failed to match
any stat block, and 0 stat blocks were left unclaimed by any family
(`_debug_legendary_review_notes.txt` and `_debug_legendary_stages.json` are
the working files behind that count, kept alongside the output for
traceability, per the task's allowance for `_*` scratch files).

## Schema

Identical to `pokemon.json`'s family/stage schema (see that file), so this
array can be concatenated onto it directly:

```json
{
  "familyId": "mewtwo",
  "familyName": "Mewtwo",
  "rarity": "Legendary",
  "biology": { "eggGroups": [], "hatchRate": null, "diet": "Omnivore", "habitats": ["Cave", "Urban Abandoned"] },
  "evolutionText": null,
  "proficiencies": ["Psychic", "Bruiser", "Elemental Attack", "Energy Blast"],
  "megaEvolution": true,
  "gigantamax": false,
  "stages": [ { "name": "Mewtwo", "types": [...], "size": "Large", "weight": "Heavy", "stats": {...}, "skills": [...], "passives": [...], "moveModifiers": {...}, "moves": [...] } ]
}
```

Differences from the base Pokédex schema (both are intentional, minimal
additions — everything else, including field names/nesting, is identical):

- `biology.eggGroups` is always `[]` and `biology.hatchRate` is always
  `null`. Confirmed by grepping the whole PDF: the string "Egg Group" never
  appears anywhere in this book — legendaries genuinely have no egg
  group/hatch rate data to extract, not a parser miss.
- `rarity` is the literal string `"Legendary"` for **every** entry (see
  "On `rarity`" below) — there's no per-species Common/Uncommon/Rare tier
  the way the base Pokédex has.
- `moves[]` and `passives[]`/`skills[]` items carry one **extra, optional**
  field not present in `pokemon.json`: `"special": "Legendary" | "Ultra
  Beast" | null`. Legendary stat blocks print a distinct second tier of
  moves/passives/skills under a "Legendary" or "Ultra Beast" sub-heading
  (their signature abilities — e.g. Mewtwo's `Mindslaver`, Regigigas's
  `Slow Start`, Silvally's `RKS System`) that regular Pokédex entries don't
  have a concept of. Ordinary moves/passives/skills keep `"special": null`
  (or the key is simply absent for the base-tier `skills`, matching
  `pokemon.json`'s existing shape exactly there), so this is purely
  additive and won't break anything reading the merged array as
  `pokemon.json`-shaped.

## Multi-stage / multi-forme families

Most entries are a single stand-alone stage. Where the book documents
genuine alternate formes or a short evolution, they're grouped as multiple
`stages` under one family, same convention `pokemon.json` uses for
evolution lines:

- **Two-stage evolutions**: Type: Null → Silvally; Poipole → Naganadel;
  Kubfu → Urshifu (Single Strike) / Urshifu (Rapid Strike, 3 stages
  total); Meltan → Melmetal.
- **Alternate formes bundled under one TOC entry**: Deoxys (Balance /
  Attack / Defense / Speed, 4 stages); Necrozma (base / Dusk Mane / Dawn
  Wings / Ultra Mantle, 4 stages); Kyurem (base / Black Fusion / White
  Fusion); Kyogre and Groudon (base / Primal Reversion each); Dialga,
  Palkia, Giratina (Altered Form / Origin Form each); Zygarde (10% / 50% /
  Complete); Eternatus (base / Eternamax); Zacian and Zamazenta (Hero of
  Many Battles / Crowned Sword-or-Shield each); Calyrex (Ice Rider / base
  / Shadow Rider); Hoopa (Bound / Unbound); Cosmog → Cosmoem → Solgaleo /
  Lunala (4 stages, one family — the evolution branches into two final
  forms).
- **Regional/thematic variants with their own TOC line**: the "Paradox"
  Pokémon are printed as `<Modern Species> (<Codename>)`, e.g. `Donphan
  (Great Tusk)`, `Suicune (Walking Wake)`, `Koraidon (Winged King)` — each
  is its own single-stage family exactly as titled in the TOC, *not* folded
  into the modern species' own family (Donphan the modern species isn't in
  this book at all — only its Paradox relative is). Likewise the
  fan-original Galar-style variants `Articuno (Remote Isles)`, `Zapdos
  (Remote Isles)`, `Moltres (Remote Isles)` are extra stages folded into
  their base bird's family since the TOC only lists the bird once.
- **Bare "Form" stage names renamed for clarity**: the source prints
  Shaymin's two forms as stat blocks literally named `Land Form` and `Sky
  Form` (no "Shaymin" prefix in the stat block itself — see "Known
  content quirks" below) and Meloetta's as `Aria Form` / `Pirouette Form`.
  These were the only 4 such bare names in the whole document, and each
  was renamed to `Shaymin (Land Form)`, `Shaymin (Sky Form)`, `Meloetta
  (Aria Form)`, `Meloetta (Pirouette Form)` for readability/lookup, since
  "Land Form" alone is meaningless out of context.

**Mega Evolution / Gigantamax forms were intentionally excluded from
`stages`** (Mega Mewtwo X/Y, Mega Latias, Mega Latios, Mega Diancie, Mega
Rayquaza, Gigantamax Melmetal) — this matches the established convention in
`pokemon.json` (e.g. Bulbasaur's family has `"megaEvolution": true` but no
separate "Mega Venusaur" stage). The `megaEvolution`/`gigantamax` boolean
flags are still set correctly by detecting these stat blocks internally
before dropping them from the output; their full stat/move text is still
sitting in `_debug_legendary_stages.json` if a future pass wants to add a
proper `megaForm`/`gigantamaxForm` field to the shared schema.

## On `rarity`

Every entry uses the blanket value `"Legendary"`, matching this chapter's
own title and the schema example given in the task brief. The book's own
"Legendary Indicators" intro (printed p.153) actually describes five
narrative sub-categories — Time-Displaced (Paradox), Ultra Beasts, Man-made
Legendaries, Beings of Nature/Oddities, and Gods — with a matching capture-
rate-modifier table (Time-Displaced/Ultra Beast −25, Man-made −50, Beings of
Nature −100, Gods −500; captured separately as reference text — see
`gmGuide_README.md`, this table sits right next to the main Capture Rates
section this book links out to). Those sub-categories are **not** stored as
a per-entry field here, to keep this schema a strict superset of
`pokemon.json`'s — but they're mechanically recoverable if ever wanted:
"Ultra Beast" tier = the 10 families whose stat blocks use an `"Ultra
Beast"` bonus-ability heading (Nihilego through Poipole/Naganadel, matching
the printed TOC's Ultra Beast cluster); "Paradox" tier = the 18 families
whose `familyName` is the `<Species> (<Codename>)` pattern described above.

## Known content quirks (verified against the source, not parser bugs)

- **Shaymin (Land Form) and Meloetta (Aria Form) have empty `skills`,
  `passives`, and `moves`.** The source prints these two forms as a bare
  name + type/size/weight/stat line only; the *shared* Skills/Passives/
  Moves block for both forms of each Pokémon is printed once, under the
  second form (`Sky Form` / `Pirouette Form`) instead. A skills line even
  says "Flight (can fly)[Land Form does not have Flight]", confirming both
  forms are meant to share the listed abilities with that one exception.
  Left as-extracted (empty for the first form) rather than editorially
  copying the second form's data over, since that's an interpretive call
  a consuming app might want to make itself.
- **Necrozma Dusk Mane, Necrozma Dawn Wings, Dialga Origin Form, Palkia
  Origin Form, Giratina Origin Form, and Eternatus Eternamax all have
  empty `moves`/`passives`/`skills` too, but for a different reason**: the
  source prints only a bare `(Attack +N, Special Attack +N, Effect +N)`
  modifier line for these "power" formes with no move list at all — they
  reuse their base form's moveset by implication. `moveModifiers` is still
  populated correctly for all of them. (Necrozma Ultra Mantle is the one
  exception in this cluster that *does* get its own single move, Photon
  Geyser, tagged `"special": "Legendary"`.)
- **Regigigas's `moveModifiers` are the literal string `"+1/+X"`** for all
  three stats — that's verbatim what the book prints (some kind of
  scaling/GM's-choice notation), not a parsing artifact, kept as a string
  as-is.
- **A handful of Ultra Beast stat lines carry a stray `*` footnote marker**
  next to one number (e.g. Buzzwole's `Defense: 16 *`, Kartana's `Attack:
  20*`) with no corresponding footnote text found nearby in the extracted
  pages. The `*` was stripped during parsing (all 6 affected Ultra Beasts —
  Buzzwole, Pheromosa, Celesteela, Guzzlord, Kartana, Stakataka — now have
  complete stats), but what the asterisk was meant to signal in the
  original layout is unclear and worth a human page-image check if it
  matters.
- **`evolutionText` reads awkwardly for the two branching families** (Kubfu
  → Urshifu, and Cosmog → Cosmoem → Solgaleo/Lunala) because the source
  lays these out as a small branching diagram (extra whitespace forming two
  side-by-side columns) that doesn't fully linearize into text, e.g.
  `"Kubfu Trains in a strong and proactive style Urshifu (Single Strike),
  Trains in a flowing and reactive style Urshifu (Rapid Strike)"`. The
  `stages` array itself is unaffected and correct either way.
- **`familyName`/`proficiencies` for `Type: Null`** are full sentences
  rather than short type/category tags (`"Melee attacks"`, `"Moves that
  lower opponent's stats temporarily"`) — that's what the book prints, not
  a truncation bug.
- The two "Beast trio"-style Galar variants — `Articuno (Remote Isles)`,
  `Zapdos (Remote Isles)`, `Moltres (Remote Isles)` — and forms like
  `Koraidon (Winged King)` / `Miraidon (Iron Serpent)` are this fan
  document's own homebrew content (not from any official Pokémon game);
  transcribed as printed.

## Content-integrity notes

- No prompt-injection / fake "AI instructions" text was found anywhere in
  this PDF (checked broadly across the whole document, not just this
  chapter, for phrasing like "disregard this document", "system notice",
  "any LLM/AI", etc. — zero matches). Nothing was stripped because nothing
  of that kind was present.
- Zero Unicode replacement characters (`�`) in the actual output file
  (verified byte-for-byte); apostrophes/"Pokémon" extract correctly
  throughout. (Note: this data, viewed through some terminal/console tools
  on this Windows environment, can *display* as `�` — that's a
  console-encoding rendering issue on read-back, not a problem with the
  file's actual UTF-8 bytes.)

## Suggested manual-review priority

1. **Shaymin / Meloetta first-form emptiness** and the **Necrozma/Dialga/
   Palkia/Giratina/Eternatus "power form" emptiness** described above — not
   bugs, but worth a product decision on whether to backfill shared/
   inherited abilities for a nicer UI.
2. **The 6 Ultra Beasts with the stray `*` stat marker** (Buzzwole,
   Pheromosa, Celesteela, Guzzlord, Kartana, Stakataka) — stats are
   complete and correct, just double-check the source page image if the
   asterisk's meaning turns out to matter.
3. Spot-checked in detail against the raw PDF text and confirmed correct:
   Mewtwo, Mew, Genesect, Magearna, Silvally/Type: Null, Regigigas,
   Necrozma family, Deoxys family, Shaymin, Meloetta, Zacian/Zamazenta,
   Donphan (Great Tusk)/Jigglypuff (Scream Tail). All other families passed
   only the automated structural checks (complete stats, non-empty
   moves/passives where the source has them, correct family grouping) —
   not an individual line-by-line read.
