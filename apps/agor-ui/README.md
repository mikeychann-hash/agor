# Agor UI

UI components for Agor - Agent Orchestrator

## Tech Stack

- **Vite + React + TypeScript** - Fast, modern development
- **Ant Design** - UI component library
- **React Flow** - Interactive session tree canvas
- **Storybook** - Component development and documentation

## Getting Started

```bash
# Install dependencies
npm install

# Run Storybook (component development)
npm run storybook

# Run type checking
npm run typecheck

# Run linter
npm run lint

# Build for production
npm run build
```

## Project Structure

```
src/
├── types/          # TypeScript type definitions
│   ├── session.ts  # Session types
│   ├── task.ts     # Task types
│   └── concept.ts  # Concept types
│
├── components/     # React components
│   ├── TaskListItem/
│   ├── SessionCard/
│   └── SessionCanvas/
│
└── mocks/          # Mock data for Storybook
    ├── sessions.ts
    ├── tasks.ts
    └── concepts.ts
```

## Components

### TaskListItem

Compact task display showing status, description, and metadata.

### SessionCard

Session information card containing tasks, git state, concepts, and genealogy.

### SessionCanvas

Interactive canvas for visualizing session trees with React Flow.

## Development

- **Storybook**: http://localhost:6006/
- All components have `.stories.tsx` files for isolated development
- Mock data available in `src/mocks/`

## Scripts

- `npm run dev` - Start Vite dev server
- `npm run storybook` - Start Storybook
- `npm run typecheck` - Run TypeScript type checking
- `npm run lint` - Run ESLint
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
]);
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x';
import reactDom from 'eslint-plugin-react-dom';

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
]);
```
