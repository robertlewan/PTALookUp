# proficiencyMoveLists.json — extraction notes

Source: `data/_raw_pokedex_text.txt` (pypdf dump of `PTA (old)/PTA3Pokedex.pdf`),
the "Proficiency Lists" chapter, non-type section.

Parser: `data/_parse_proficiency_lists.py` (re-run any time to regenerate
`proficiencyMoveLists.json` from the raw text).

## Section boundaries

- Start: `text.find('Bruiser List')` → offset **2096445**. The text
  immediately before it is `Blades/Claw List Continued`, followed by the
  `Proficiency Lists` running header/footer and a `===== PAGE 759 =====`
  marker, then `Bruiser List` starts fresh. **Correction (see "Any / Avian /
  Blades/Claws" section below): this boundary was originally read as the
  start of a separate "non-type section," with `Blades/Claw List` assumed to
  belong to an excluded "type-proficiency section" before it. That was
  wrong — `Any`, `Avian`, and `Blades/Claws` are the first three lists in
  this *same* Move Groups section (its own intro paragraph lists all 32 in
  one TOC), just missed because the boundary search started one list group
  too late. They were added in the follow-up pass.**
- End: `text.find('Signature Moves', start)` → offset **2150040**. This is
  the *second* occurrence of the string "Signature Moves" in the file (the
  first, at offset 14750, is an unrelated table-of-contents mention early in
  the document — searching for the next occurrence *after* the Bruiser List
  start correctly lands on the real "Signature Moves" chapter heading that
  follows `Winged List Continued`, with a GM-note paragraph about
  custom-Pokémon proficiency lists in between).
- Confidence: **high / unambiguous**. Both boundaries were verified by
  reading the surrounding text, not just the search hit.

## Proficiency lists found

**29 lists** extracted (28 named `<Name> List` + 1 named `Normal Block`):

Bruiser, Cutesy, Draconian, Energy Blast, Elemental Attack, Fangs, Floral,
Glutton, Hexwork, Healer, Horned, Lepidopteran, Martial, Punches, Kicks,
Magnetism, Munition, **Normal Block**, Parasitic, Piscian, Prickly, Pulse,
Sound, Spellcraft, Stampeding, Tricky, Weather, Weird, Winged.

This exactly matches the 28 `<Name> List` names given in the task prompt —
no missing or extra names in that pattern. The one addition, **Normal
Block**, is the "formatting quirk" the prompt warned a regex scan might
miss: it is structurally identical to the other lists (heading → flavor
text → move stat blocks → `Normal Block Continued` across a page break) but
its heading doesn't end in the word "List", so a `<Name> List` regex
wouldn't catch it. It was included because:
- It sits in the same section, same format, same page range as the other 28.
- It is an actively-used proficiency tag in `pokemon.json` (`"Normal
  Block"`, `"Normal Block (No Special Attacks) (...)"`, etc. — 60+
  occurrences), i.e. it's exactly the kind of proficiency→move-list mapping
  this extraction exists to fill in.

Two sub-lists are nested inside **Martial List** (Punches List, Kicks List)
per its own flavor text explaining the "Martial" / "Martial Punches" /
"Punches" / "Kicks" proficiency-tag conventions used in `pokemon.json`.
These were extracted as their own top-level entries (with `flavorText:
null`, since the prompt's format never gives them their own flavor
paragraph — only Martial's intro paragraph describes all three).

**Elemental Attack List** has internal `Electric` / `Fire` / `Ice`
sub-dividers (not real list headings, no dash-format moves follow them
directly as a new list) — these were treated as cosmetic labels and
discarded; all 14 of their moves were folded into the single "Elemental
Attack" entry, matching how `pokemon.json` proficiency tags reference this
list (e.g. "Elemental Attacks E, F, and/or I").

Four lists span a page break with a "`<Name> List Continued`" (or `Normal
Block Continued`) sub-heading and no new flavor text: **Elemental Attack**,
**Normal Block** (2 continuations), **Stampeding**, **Winged**. These were
merged into their parent list, not treated as separate proficiencies, per
the task instructions.

## Move-name extraction method

Each move stat-block line has the form `<Move Name> - <Range> <Type>
<Category>: <Frequency> <Power>. <Effect text>.` Rather than a naive scan
for every " - " (which breaks on two real patterns in this text: moves whose
effect text ends by mentioning their own name in Title Case right before the
next entry, e.g. `...while using Sky Uppercut. Sucker Punch - ...`, and
effect text ending in a capitalized status keyword right before the next
entry, e.g. `...the target is Paralyzed. Breaking Swipe - ...`), the parser
anchors only on dashes immediately followed by a real header token (`Melee`,
`Ranged`, `Self`, or one of the 18 type words, for the handful of Field
moves formatted as `<Type> Field Effect:` e.g. `Rain Dance - Water Field
Effect: ...`), then walks backward through Title-Case words to recover the
move name, stopping at the first word that isn't a clean Title-Case token
(which reliably excludes trailing-period status words like `Paralyzed.` or
self-referential mentions like `Uppercut.`).

Two source typos were handled: `Mega Punch- Melee...` and `Mega Kick-
Melee...` are missing the space before the dash — the anchor regex allows
zero-or-more spaces before the dash, so these still resolved to the correct
names (`Mega Punch`, `Mega Kick`).

## Cross-reference against allMoves.json

**Total move-name entries: 321** (counting each list's moves separately —
many moves legitimately appear on multiple lists, e.g. `Body Slam` is on
Bruiser, Piscian, and Stampeding; `Slam` is on Bruiser, Piscian, and
Stampeding; `Poison Jab` is on Horned, Punches, and Prickly — this is
expected, not a dedup bug).

**Unmatched against `allMoves.json`: 0.** Every one of the 321 move-name
entries across all 29 lists matched an exact `name` field in
`allMoves.json` on the first pass (case-sensitive exact match, no
near-miss reconciliation needed).

Per-list move counts:

| Proficiency | Moves |
|---|---|
| Bruiser | 21 |
| Cutesy | 7 |
| Draconian | 5 |
| Energy Blast | 7 |
| Elemental Attack | 14 |
| Fangs | 9 |
| Floral | 8 |
| Glutton | 6 |
| Hexwork | 12 |
| Healer | 6 |
| Horned | 7 |
| Lepidopteran | 5 |
| Martial | 13 |
| Punches | 15 |
| Kicks | 10 |
| Magnetism | 4 |
| Munition | 6 |
| Normal Block | 42 |
| Parasitic | 4 |
| Piscian | 9 |
| Prickly | 8 |
| Pulse | 6 |
| Sound | 9 |
| Spellcraft | 21 |
| Stampeding | 23 |
| Tricky | 13 |
| Weather | 7 |
| Weird | 9 |
| Winged | 15 |
| **Total** | **321** |

## Flavor text

25 of 29 lists have a 1–2 sentence flavor paragraph immediately after the
heading (`flavorText` populated). **Punches** and **Kicks** have
`flavorText: null` — they're sub-lists of Martial and only Martial's own
intro paragraph describes them (as noted above). The 4 "Continued" chunks
contribute no additional flavor text, per the task's own instructions.

Flavor text is transcribed as printed, including the source PDF's own
line-wrap hyphenation artifacts (e.g. "wild en- ergy", "use- ful", "Spe-
cial Attacks") — this matches the convention already used in `allMoves.json`
(whose `effect` fields retain the same kind of artifact, e.g. `"Ground-
type"`, `"Electric- type"` in existing entries), so it was left unfixed for
consistency rather than silently "corrected."

## Files touched

- `data/proficiencyMoveLists.json` (new — the deliverable)
- `data/proficiencyMoveLists_README.md` (new — this file)
- `data/_parse_proficiency_lists.py` (new scratch/tooling script, kept
  alongside the repo's existing `_parse_*.py` scripts for reproducibility)

No other files in `data/` were modified.

## Follow-up: Any / Avian / Blades/Claws lists added (2026-08-15)

The original 29-list extraction above missed the first three entries of the
Move Groups section's own table of contents:

```
     Any        Magnetism
     Avian   Munition
     Blades/Claws  Normal Block
     Bruiser   Parasitic
     ...
```

(`_raw_pokedex_text.txt:69847-69862`.) The section start boundary
(`text.find('Bruiser List')`) landed one list-group too late — `Any List`,
`Avian List`, and `Blades/Claws List` sit *before* `Bruiser List` in the same
chapter (`_raw_pokedex_text.txt:69868-70086`), not in a separate excluded
section as the original notes assumed. Confirmed by checking `pokemon.json`:
`Avian` (41 families), `Blades` (19 families), and `Claws` (23 families) are
all actively-used proficiency tags with no matching list to resolve moves
against, before this fix.

**Any List** (46 moves, e.g. Tackle, Toxic, Protect, Substitute): per the
section's own intro paragraph, "any Pokémon can learn from the Any List"
regardless of proficiency tags — accordingly no `pokemon.json` family lists
"Any" as an explicit proficiency (it's implicit for everyone), but the list
is included for completeness/parity with the book and in case future
features want it (e.g. an "always available" moves reference). No dedicated
flavor paragraph follows the heading (unlike the other lists), so
`flavorText: null`, matching the precedent already set for `Punches`/`Kicks`.

**Avian List** (4 moves: Brave Bird, Drill Peck, Peck, Mirror Move) — added
as `"Avian"`, matching `pokemon.json`'s tag exactly.

**Blades/Claws List** (15 moves: Aerial Ace, Air Slash, Crush Claw, Cut, Fury
Cutter, Fury Swipes, Metal Claw, Night Slash, Psycho Cut, Razor Wind,
Scratch, Shadow Claw, Slash, Solar Blade, X-Scissor) is one single list in
the book (one heading, no internal sub-division), but `pokemon.json` uses
**two different tag strings** for it — `"Blades"` and `"Claws"` — never the
book's own `"Blades/Claws"` spelling. Since `movesForProficiency`
(`src/utils/moves.ts`) looks up `proficiencyMoveListByName` by exact string,
a single `"Blades/Claws"` entry would resolve neither tag. Added as **two**
entries, `"Blades"` and `"Claws"`, with identical `moves`/`flavorText`, so
both tags resolve correctly in the app.

All 65 new move names (46 + 4 + 15) were verified against `allMoves.json`
the same way as the original 29 lists: 0 unmatched, 0 duplicates within a
list.

**Updated totals: 33 lists (was 29), 401 total move-name entries counting
`Claws` and `Blades` separately (was 321).**
