# Birzum Merchant App

Mobile apps for Birzum nasiya (BNPL), built as a React front end: the merchant app, which mirrors the existing web merchant cabinet, and the client app for shoppers under `/customer`. Profile switches between them.

## Stack

- React 19, TypeScript, Vite
- Tailwind CSS v4 (design tokens live in `src/shared/styles/index.css`)
- React Router
- lucide-react icons, qrcode.react
- oxlint, Prettier

## Commands

```bash
npm install
npm run dev        # local dev server
npm run build      # type-check and production build
npm run lint
npm run format
```

## Deployment

The app is a single-page app, so the host must serve `index.html` for every path (`/login`, `/clients/1`, and so on). `vercel.json` does this on Vercel. On another host, add the equivalent fallback rule.

## Structure

```
src/
  app/                 App shell: router, layouts and the two tab bar sets
    layouts/           DeviceLayout (phone-width frame), TabLayout (bottom tabs)
  entities/            Business data shared by several features
    clients/           Client and application types, mock store, hooks, shared rows
  features/            One folder per product area
    auth/
    home/
    clients/
    applications/
    calculator/
    notifications/
    profile/
    customer-auth/     Client app: sign-in and sign-up
    customer-app/      Client app: tab screens
      pages/           Routed screens
      components/      Feature-only components (add when needed)
      data/            Mock data and types (add when needed)
  shared/              Used by more than one feature
    ui/                Button, FormScreen, OtpScreen, fields, Select, DatePicker, Sheet, InfoList, StatusBadge, Avatar, TabBar
    i18n/              Uzbek and Russian strings, useI18n
    lib/               cn, formatSum
    config/            Route paths
    styles/            Tailwind entry and design tokens
    assets/            Logo and images
```

## Design rules

Read [DESIGN.md](DESIGN.md) before building a screen. It defines colors, buttons, icons, form controls, the calendar and where things go. Open `/kit` in the running app to see every shared control.

## Rules

- Features import from `entities` and `shared`, never from each other. `entities` imports only from `shared`.
- Data or domain UI that two features need moves to `entities`; generic controls move to `shared/ui`.
- Import with the `@/` alias (`@/shared/ui/Button`), not long relative paths.
- Colors, fonts and radii come from the tokens in `src/shared/styles/index.css`. Do not hardcode hex values in components.
- Use the role tokens (`bg-primary`, `text-brand`, `bg-surface`) so the dark theme keeps working.
- Money is formatted with `formatSum` from `@/shared/lib/format`.
- The app is designed at phone width. `DeviceLayout` centers it at 430px on larger screens.
