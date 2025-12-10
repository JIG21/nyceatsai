# Futuristic style patch — Integration notes

This patch upgrades the app with a unified futuristic/neon theme, updated background, loader, fonts, sizes, and a reusable button and loader component. It aims to create a cohesive app-like UI across pages.

Files added in branch `futuristic-style`:
- `src/styles/futuristic.css` — global theme, typography scale, aurora background, loader styles, responsive layout.
- `src/components/NeonButton.tsx` — reusable neon button.
- `src/components/NeonLoader.tsx` — accessible neon loader component.
- `src/index.tsx` — example top-level integration that includes the aurora background and imports the CSS.

How to finalize:
1. If your project uses TypeScript JSX, ensure `react` and `react-dom` types are present.
2. Install `classnames` if not present: `npm i classnames` or `yarn add classnames`.
3. Add the Google Fonts link in your `public/index.html` for Orbitron + Inter for maximum effect.
4. Replace or enhance existing components to use `NeonButton` and `NeonLoader` where appropriate.
5. Validate color contrast for critical text.

If you want tweaks (different color palette, metallic chrome, stronger motion, dark/light modes), tell me which direction and I will update the branch before creating the PR.
