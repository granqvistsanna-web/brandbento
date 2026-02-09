## Project Overview

This is a TypeScript React moodboard/brand design app (BrandBento) using Zustand for state management. Key areas: bento grid tiles, color palettes, typography, props panel, dark/light mode. Always use brand typography settings and dynamic tokens — never hardcode Tailwind classes for brand-controlled styles.

## UI/Component Design Philosophy

When designing UI components, start with the SIMPLEST possible implementation first. Do not over-engineer with decorative elements, complex layouts, or 'Swiss Precision' aesthetics. Wait for user feedback before adding complexity. Simple and flexible > impressive and rigid.

## Code Editing Practices

When editing large files or stores, use small incremental edits rather than full file rewrites. Watch for circular dependencies when extracting code to separate files. After any refactor that moves code between files, immediately run the build to catch import issues.

## Verification

After making code changes, always run `npm run build` (or the project's build/typecheck command) to verify zero type errors before presenting work as complete. Do not rely solely on Playwright/browser verification.

## Debugging Approach

When the user reports a visual bug (e.g., element not appearing, clipped, overlapping), check CSS overflow, z-index, and positioning properties FIRST before doing broad codebase exploration. Diagnose before exploring.

## Working With User Inputs

When the user provides reference images, curated lists, or specific design references, use them directly. Do not explore the codebase for alternatives or present generic options when the user has already specified what they want.
