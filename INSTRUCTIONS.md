# Futuristic style patch — Extended integration notes

This commit enhances the previous neon theme and adds:
- Global font imports (Orbitron, Inter, Roboto Mono) for a futuristic look.
- Responsive typographic scale and container width.
- Improved animated background (aurora) and subtle grid overlay for a tech feel.
- Loader component (src/components/Loader.tsx) styled as a neon conic spinner.
- NeonButton updated to be dependency-free and responsive.

How to use
1. The CSS is already imported in `src/index.tsx`. If you previously imported the CSS elsewhere, remove duplicates.
2. Use the Loader component where you show loading states: `import Loader from './components/Loader';` then `<Loader label="Thinking" />`.
3. Use NeonButton in place of existing buttons for consistent style: `import NeonButton from './components/NeonButton';`.
4. Replace your top-level layout with `.app-shell` container or adjust to your layout system.
5. Tweak colors via CSS variables at the top of `src/styles/futuristic.css`.

Accessibility & performance notes
- Reduced motion respected via media queries.
- Aurora and overlay are `pointer-events: none` so they don't interfere with interactions.
- Test color contrast on critical text and form controls (the theme emphasizes neon accents; adjust where necessary).

If you'd like, I can now open a Pull Request with these changes on branch `futuristic-style`.
