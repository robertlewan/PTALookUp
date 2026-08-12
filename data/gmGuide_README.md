# gmGuide.json — extraction notes

Source: `E:/PTU/PTA (old)/Copy of PTA3GameMastersGuide.pdf`. Raw page text
was dumped to `data/_raw_gmguide_text.txt` (all 260 pages); the extractor
(`data/_parse_gmguide.py`) pulls 8 specific sections out of that dump by
pypdf page range (each range independently verified against the printed
page numbers and section headings, not just trusted from the table of
contents — the sibling `trainerClasses.json` extraction found the source
book's own TOC page numbers can drift by a page or so in places, so each
boundary here was confirmed by reading the actual page content).

**Count: 8 sections**, matching all 8 requested by the task brief. All 8
have non-empty `body` text (3.7 KB – 33 KB each); only `capture-rates` has
a non-null `table`.

## Page ranges used (pypdf 0-indexed = printed page − 1 throughout this PDF)

| Section | pypdf pages | Printed pages |
|---|---|---|
| Acting as Game Master | 19–21 | 20–22 |
| Capture Rates | 22 | 23 |
| Encounter Building | 23–32 | 24–33 |
| Loyalty | 33–36 | 34–37 |
| Evolution | 37 | 38 |
| Skill Checks | 38–44 | 39–45 |
| Downtime | 45–47 | 46–48 |
| Pokécredit Rewards | 48 | 49 |

Each range was bounded by the *next* section's own heading appearing on the
page (e.g. Capture Rates ends exactly where the "Encounter Building" heading
starts), not by TOC page numbers alone.

## Schema

```json
{
  "id": "capture-rates",
  "title": "Capture Rates",
  "body": "Players will have access to Poké Balls...",
  "table": { "columns": [...], "rows": [...] }
}
```

- `id` — kebab-case slug, one per section.
- `body` — the section's prose, reflowed into paragraphs (blank-line
  separated in the source), word-wrap hyphenation fixed, page-number
  footers and the page's running-header caption (e.g. "Acting as Game
  Master" printed at the bottom of every page in that section) stripped.
  Embedded reference tables that aren't the headline Capture Rates table
  (e.g. the Nature-roll d20 table in Acting as Game Master, the Alpha/
  Totem/Titan ability blocks in Encounter Building, the Task-Difficulty
  tables throughout Skill Checks, the Rare Goods 1d100 table in Pokécredit
  Rewards) are left as flowing text inside `body` rather than pulled into
  their own `table` fields — only the Capture Rates table was specifically
  requested as structured data.
- `table` — `null` for every section except `capture-rates`.

## The Capture Rates table

```json
{
  "columns": ["Rarity Tier", "First Stage", "Second Stage", "Final Stage"],
  "rows": [
    ["Common (circle)", 50, 35, 20],
    ["Uncommon (diamond)", 40, 25, 10],
    ["Rare (star)", 30, 15, 0]
  ]
}
```

**Interpretation note (the source text doesn't label the three rows
directly — this is the extractor's reading, documented so it can be
double-checked):** the printed table is genuinely just three unlabeled rows
of numbers:

```
 First Stage Second Stage Final Stage
          50            35            20
          40            25            10
          30            15              0
```

The row labels ("Common (circle)" / "Uncommon (diamond)" / "Rare (star)")
were inferred from the two worked examples given in the same section's
prose, both of which are captured verbatim in `body`:

- *"A Greedent is a final stage Pokémon of a common (circle) family. Its
  base capture rate is **20**."* → row 1 (50/35/**20**) = Common.
- *"A Lampent is the second stage of an uncommon (diamond) family. Its
  base capture rate is **25**."* → row 2 (40/**25**/10) = Uncommon.

That leaves row 3 (30/15/0) as Rare (star) by elimination, which also lines
up with the base Pokédex's own three-symbol rarity system referenced two
sentences earlier in the same section ("Base rarities refer to the first
stage's rarity in the wild as defined by the symbols found in the
Pokédex" — the Pokédex's own rarity tiers are Common ●, Uncommon ◆, Rare ★,
matching `pokemon.json`'s `rarity` field values and the sibling Pokédex
extraction's `RARITY_MAP`). This mapping (Common → 50/35/20, Uncommon →
40/25/10, Rare → 30/15/0) is a reasonable-confidence reading, not something
printed explicitly as a labeled table in the source — flagging here per the
task brief in case a reviewer wants to re-derive it independently.

Separately, this same "Legendary Pokémon" chapter (see
`legendaryPokemon_README.md`) has its own follow-on capture-rate-modifier
table for legendaries specifically (Time-Displaced/Ultra Beast −25, Man-made
−50, Beings of Nature/Oddities −100, Gods −500) — that one is *not* part of
this `capture-rates` section (different chapter, different page range) and
wasn't pulled into `gmGuide.json`, since the task brief scoped this table to
the GM-mechanics chapter's own Capture Rates section specifically.

## Content-integrity notes

- No prompt-injection / fake "AI instructions" text was found anywhere in
  this PDF — checked broadly (phrases like "disregard this document",
  "system notice", "any LLM/AI", "automated processing notice", etc.) both
  within these 8 sections and across the whole 260-page document. Nothing
  was stripped because nothing of that kind was present in this PDF.
- Zero Unicode replacement characters (`�`) in the actual output file,
  verified byte-for-byte; "Pokémon", "Pokécredit(s)", and curly apostrophes
  (’) all extract correctly. (As with `legendaryPokemon.json`: this data
  can *display* as `�` through some terminal tools on this Windows
  environment when piped through certain commands — that's a
  console-rendering issue on read-back, not a problem with the file's
  actual UTF-8 bytes; confirmed by checking character ordinals directly.)
- Running-header page captions (the section title reprinted at the bottom
  of every page, e.g. "Loyalty", "Skill Checks", "Original Downtime by
  Mackenzie Downtime") and bare page-number footer lines were stripped from
  `body`. Spot-checked all 8 sections for leftover fragments of these —
  none found.

## What was intentionally left out (per task brief)

Skipped entirely, as instructed: "The World of Pokémon", "Services in the
Pokémon World", all nine per-region chapters (Kanto through Paldea, printed
pages 50–149), "Other People of the World", "Creating Your Own Pokémon",
"Legendary Z-Moves", and the two Indexes at the end. These are flavor/lore
or NPC-roster content, not GM mechanics reference data.

## Suggested manual-review priority

1. **The Capture Rates row-label inference** described above — the numbers
   themselves are transcribed directly from the source table, only the
   three row *labels* (Common/Uncommon/Rare) are an inferred reading.
2. Everything else is straightforward paragraph-reflow of prose the source
   prints as continuous text — spot-checked `capture-rates`, `evolution`,
   and `pokecredit-rewards` in full against the raw PDF text and confirmed
   accurate; the other 5 (longer) sections were checked for structural
   soundness (paragraph count, no leftover footers/page numbers, no
   truncation at page boundaries) rather than read line-by-line in full.
