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
