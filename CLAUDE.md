# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Common Commands

```bash
npm ci              # Install dependencies
npm start           # Development server at http://localhost:4200
npm test            # Run tests in watch mode
npm run test-build  # Run tests once (CI mode, headless Chrome)
npm run lint        # ESLint
npm run lint-build  # ESLint with --max-warnings 0
npm run stylelint   # Stylelint for CSS/SCSS
npm run prettier    # Prettier check
npm run build       # Production build
```

### Data Processing Scripts

```bash
npm run factorio-build    # Build Factorio mod data
npm run minify-data       # Minify game data files
npm run update-hash       # Update data hashes
npm run generate-hash     # Generate new hash mappings
```

## Architecture

### State Management

The app uses a custom signal-based store pattern (not NgRx). Core store classes are in `src/app/store/`:

- `Store<T>` - Base class with `signal`, `load`, `apply`, `updateField` methods
- `EntityStore<T>` - Extends Store for entity collections with `updateEntity`, `resetFields`
- Services extend these: `SettingsService`, `ObjectivesService`, `ItemsService`, `RecipesService`, `MachinesService`, `PreferencesService`, `DatasetsService`

### Calculation Engine

- `SimplexService` - Core calculator using linear programming (glpk-ts) to solve production requirements
- `RateService` - Rate/ratio calculations for items and recipes
- `RecipeService` - Recipe adjustment calculations (modules, beacons, productivity)

### Routing Structure

```
/:id                    # Game ID (factorio, dsp, satisfactory, etc.)
/:id/wizard             # Setup wizard
/:id/list               # Main list view
/:id/flow               # Sankey/flow diagram
/:id/data/*             # Data browser (items, recipes, categories)
```

### Path Aliases

Use `~/*` for `src/app/*` imports:
```typescript
import { Rational } from '~/models/rational';
import { spread } from '~/helpers';
```

### Component Naming

- Components: `lab-*` prefix (kebab-case selectors)
- Directives: `lab*` prefix (camelCase selectors)

### Key Models

- `Rational` (`~/models/rational.ts`) - Arbitrary precision rational number class used throughout calculations
- `Dataset` (`~/models/dataset.ts`) - Loaded game data structure
- `ObjectiveState` (`~/models/objective.ts`) - Production objectives (items/recipes to produce)
- `Step` (`~/models/step.ts`) - Calculated production step result

### UI Framework

PrimeNG components with Bootstrap grid. Custom d3-sankey implementation in `src/app/d3-sankey/`.

## Code Style

- Explicit return types required on all functions
- Imports auto-sorted by `simple-import-sort`
- Use `===` for equality checks
- Unused variables prefixed with `_`
- Test files: `*.spec.ts` alongside source files
