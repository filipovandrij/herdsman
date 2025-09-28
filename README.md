# Herdsman (PixiJS + TypeScript)

## Run
- Install: `npm i`
- Dev: `npm run dev`

## Project structure (src)
- core: game orchestration (e.g., `core/Game.ts`)
- entities: world objects (`Player`, `Animal`, `Yard`, `Field`, `Assistant`)
- ui: pure UI layers (`MainMenuUI`, `ShopUI`, `ScoreUI`)
- services: singletons/configs (`Config`, `AudioManager`)
- main.ts: entry, boots main menu, then game

## OOP / SOLID (how it’s applied)
- Single Responsibility (SRP):
  - `entities/*` render/update themselves only
  - `ui/*` handles only UI drawing and interactions
  - `core/Game` orchestrates systems (input, spawn, follow, scoring)
  - `services/*` isolates cross‑cutting concerns (config, audio)
- Open/Closed (OCP):
  - New entities/systems/UI can be added without changing existing classes
- Liskov Substitution (LSP):
  - `Entity` defines a stable interface (`container`, `update(dt)`); subclasses respect it
- Interface Segregation (ISP):
  - Small, focused classes; consumers don’t depend on what they don’t use
- Dependency Inversion (DIP):
  - High‑level logic depends on abstractions via module boundaries (`Config`, `AudioManager`), not UI/DOM specifics

## Patterns and best practices
- Composition over inheritance:
  - Pixi `Container` composition for scene graph; `Entity` is a thin base
- Facade/Orchestrator:
  - `core/Game` coordinates input, spawning, following, scoring, UI wiring
- Configuration as data:
  - `services/Config.ts` centralizes sizes, colors, speeds, costs; gameplay tuning without code changes
- State machine ready (scenes):
  - Start menu → play; `Game` is ready to split into `MainMenuScene` / `PlayScene`
- Data‑driven updates:
  - Frame‑based `update(dt)` loop, normalized by seconds
- Deterministic, pure helpers (extensible):
  - Simple math/selection kept in `Game` for brevity; easily movable to `utils/` or `systems/`

## Code style
- TypeScript strict: explicit types for public APIs; avoid `any`
- Small cohesive modules, readable names:
  - Verbs for functions (`moveTowards`, `setTarget`), nouns for data (`spawnRateLevel`)
- Guard clauses / early returns; minimal nesting
- UI vs logic separation:
  - `ui/*` has no gameplay logic; gameplay lives in `core`/`entities`
- Time‑based movement:
  - All motion uses seconds `dt` (frame‑rate independent)
- Comments for intent (no noise); configs centralized in `Config`

## AC coverage (brief)
- Field (green), Player (red), Animals (white), Yard (yellow), Score on top
- Click or WASD movement (WASD used by default; click can be re‑enabled quickly)
- Animals follow the player (snake) with max group size (configurable)
- Score increases when animals reach the yard
- Extras: random spawner, patrol, shop/upgrades, assistant, audio, main menu

## Next steps (optional)
- Split `Game` into scenes (`MainMenuScene`, `PlayScene`)
- Extract systems: `SpawnerSystem`, `FollowSystem`, `Physics`, `ScoreSystem`
- Add asset pipeline (`services/Assets.ts`) and RNG utils
