# Agent Development Guide

## Package Manager

**⚠️ IMPORTANT: This is a pnpm monorepo. Always use `pnpm` instead of `npm`.**

## Type Checking

The project uses TypeScript with strict type checking to ensure code quality.

### Running Type Checks

To check for TypeScript errors across the frontend:

```bash
cd frontend
pnpm typecheck
```

This runs `astro check` which validates:
- TypeScript types in `.ts` and `.tsx` files
- TypeScript in Astro component frontmatter
- Props and type safety in React components

### When to Run Type Checks

- Before committing changes
- After refactoring or adding new features
- When updating dependencies that might affect types
- Before creating a pull request

### Common Type Issues

- **Ref assignments**: Use proper ref callbacks that return `void`
- **Sanity types**: Import types from `@sanity/client` when working with CMS data
- **React 19 types**: Ensure compatibility with the newer React type system

## Testing

Run tests with:

```bash
cd frontend
pnpm test
```

## Development Workflow

1. Make code changes
2. Run `pnpm typecheck` to verify types
3. Run `pnpm test` to verify functionality
4. Test manually with `pnpm dev`
5. Commit changes

---

## Design System

Semantic-first design system using Tailwind CSS v4. Always use semantic tokens, never raw colors. Dark mode works automatically via `prefers-color-scheme`.

### Semantic Tokens

All tokens defined in `frontend/src/styles/tailwind.css`:

**Primary (Brand Yellow):**
- `primary` / `primary-foreground` - Buttons, selected states

**Background & Surface:**
- `background` - Page background
- `surface` / `surface-foreground` - Cards, panels

**Foreground (Text):**
- `foreground` - Primary text
- `foreground-secondary` - Supporting text
- `foreground-muted` - Subtle/disabled text

**Accent (Purple):**
- `accent` / `accent-foreground` - Highlights, progress

**Border:**
- `border` / `border-muted` - Borders

**States:**
- `positive` / `neutral` / `negative` - Opinion colors

### Rules

1. Never use base tokens (`lemon-400`, `gray-900`, etc) - use semantic tokens only
2. Dark mode overrides use `:root` inside `@media (prefers-color-scheme: dark)` (not `@theme`)
3. Only create new tokens if truly semantic and reusable

### CVA Utilities

Located in `frontend/src/lib/styles/variants/`. Only create when pattern repeats 3+ times.

**Button:** Import `button` from `@/lib/styles`
- Variants: `default` (surface + border), `primary` (yellow), `ghost` (transparent)
- Sizes: `default`, `sm`, `lg`

**Creating new utilities:**
1. Name like component (`button`, `card`), not `buttonVariants`
2. Export from `lib/styles/index.ts`
3. Use semantic tokens only

**cn utility:** Import from `@/lib/styles` - combines classes with proper precedence
