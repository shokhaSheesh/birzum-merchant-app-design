# Birzum Merchant App

Mobile merchant app for Birzum nasiya (BNPL), built as a React front end. It mirrors the existing web merchant cabinet, redesigned for phones.

## Stack

- React 19, TypeScript, Vite
- Tailwind CSS v4 (design tokens live in `src/shared/styles/index.css`)
- React Router
- lucide-react icons
- oxlint, Prettier

## Commands

```bash
npm install
npm run dev        # local dev server
npm run build      # type-check and production build
npm run lint
npm run format
```

## Structure

```
src/
  app/                 App shell: router and layouts
    layouts/           DeviceLayout (phone-width frame), TabLayout (bottom tabs)
  features/            One folder per product area
    auth/
    home/
    applications/
    profile/
      pages/           Routed screens
      components/      Feature-only components (add when needed)
      data/            Mock data and types (add when needed)
  shared/              Used by more than one feature
    ui/                Button, TabBar, other primitives
    lib/               cn, formatSum
    config/            Route paths
    styles/            Tailwind entry and design tokens
    assets/            Logo and images
```

## Rules

- Features import from `shared`, never from each other. Anything two features need moves to `shared`.
- Import with the `@/` alias (`@/shared/ui/Button`), not long relative paths.
- Colors, fonts and radii come from the tokens in `src/shared/styles/index.css`. Do not hardcode hex values in components.
- Money is formatted with `formatSum` from `@/shared/lib/format`.
- The app is designed at phone width. `DeviceLayout` centers it at 430px on larger screens.
