# trainerSkills.json — extraction notes

Source: `PTA3.5PlayersHandbook.pdf`, printed pages 11-13 (pypdf 0-indexed pages
10-12), the "Skills" subsection of the "Trainer Stats & Skills" chapter
(printed pages 8-15). The chapter's first few pages (8-10) are general
narrative/rules text (what stats are, how to assign them, stat modifier
table) with no per-skill data, so they were read for context but not
extracted into records.

## Schema

```json
{ "name": "Athletics", "governingStat": "Attack", "description": "..." }
```

- `name` — the skill's proper name exactly as printed (e.g.
  "Bluff/Deception", "Diplomacy/Persuasion", "Engineering/Operation",
  "Sleight of Hand", "Pokémon Handling"). Slash-joined dual names are kept
  as a single skill, matching the source (they are always treated as one
  skill/one talent slot throughout the Trainer Classes chapter).
- `governingStat` — one of `Attack`, `Defense`, `Special Attack`,
  `Special Defense`, `Speed`. The source book groups all 18 skills under
  one of these 5 headers ("Attack Skills:", "Defense Skills:", etc.) — this
  maps directly to that grouping, not to a per-skill inferred stat.
- `description` — the skill's explanatory paragraph, whitespace-collapsed
  to a single line. Injected fake "AI/LLM instruction" and "system notice"
  paragraphs (prank text embedded in the PDF, unrelated to real game rules)
  were stripped before parsing and do not appear in any description.

## Coverage

18 skills total, matching every skill name referenced across all 30
Trainer Classes' "Skill Talents" lists:

- Attack (1): Athletics
- Defense (2): Concentration, Constitution
- Special Attack (6): Engineering/Operation, History, Investigate,
  Medicine, Nature, Programming
- Special Defense (6): Bluff/Deception, Diplomacy/Persuasion, Insight,
  Perception, Perform, Pokémon Handling
- Speed (3): Acrobatics, Sleight of Hand, Stealth

## Notes / confidence

- All 18 skills were located and extracted without any fallback/guessing —
  every skill name appears as an exact standalone line in the source
  directly followed by its description paragraph, so this extraction is
  high-confidence.
- Not included as skill records (out of scope per the source's own
  structure): the "Stat Modifiers" table, "Talents" mechanic explanation
  (how skill-talent bonuses of +2/+5 work), "Skill Checks" rules
  (advantage/disadvantage, natural 20s), "Determining Trainer Stats" rules
  (random/point-assignment/point-buy), and the "Hit Points" paragraph that
  immediately follows the skill list. These are general rules text, not
  individual skills, and fall outside the requested schema.
