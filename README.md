# PTA Lookup

A companion app for **Pokémon Tabletop Adventures (PTA)**, a Pokémon-themed tabletop RPG. Look up trainer classes and Pokémon, then build and save trainer character sheets with a Pokémon party.

Built with Expo (React Native) so it runs as a mobile app (Android APK) as well as in a browser during development.

## Features

- **Trainer Classes** — browse all base and advanced classes, favored stats, skill talents, and full level-by-level feature text.
- **Pokédex** — browse Pokémon families by type, see stats, skills, passives, and complete move lists per evolutionary stage.
- **Character Sheets** — create trainers, assign classes/levels, track stats and HP, pick skill talents, manage inventory, and save locally on-device.
- **Party Management** — add Pokémon to a trainer's party from the dex, track nickname/level/current HP/status conditions, with the full dex entry available as reference.

## Data

Game data lives in [`data/`](data) as JSON, extracted from the PTA 3.5 Players Handbook and Pokédex source documents:

- `data/trainerClasses.json` / `data/trainerSkills.json`
- `data/pokemon.json` / `data/pokemonSkills.json`

See the `*_README.md` files alongside each dataset for schema notes and any entries flagged for manual review.

## Development

```bash
npm install
npm run web      # browser preview
npm run android   # requires Android SDK / emulator or a device
```

## Building an APK

APKs are built automatically by GitHub Actions ([`.github/workflows/build-apk.yml`](.github/workflows/build-apk.yml)) on every push to `main`, and can also be triggered manually from the Actions tab. The workflow runs `expo prebuild` + a Gradle debug build and uploads `app-debug.apk` as a downloadable build artifact — no local Android toolchain needed.
