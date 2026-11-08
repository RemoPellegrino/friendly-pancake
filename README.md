# Gamify Music Theory

A browser-only music practice game for children. Built with React, strict TypeScript, standard HTML/CSS/SVG and Vite. Deploy the static build to Netlify. No native app, backend, cookies or SQLite are needed.

## Run locally

Use Node.js 24 (also configured for Netlify):

```sh
npm ci --allow-scripts= --ignore-scripts
npm run dev
```

Open the URL printed by Vite. `npm start` and `npm run web` are aliases. The install override handles an incompatible machine-level npm setting; it does not change your global npm configuration.

## Publish on Netlify

### Connect your repository

1. Push this project to your Git repository.
2. In Netlify, add a project by importing that repository.
3. Use build command `npm run build` and publish directory `dist` (already declared in `netlify.toml`).
4. Deploy. Future pushes to the configured production branch rebuild the site.

### Upload a build manually

```sh
npm run build
```

Upload the entire **dist folder** using Netlify's manual deploy interface, not the source folder or just index.html. For repeatable builds and the included Netlify header configuration, connecting Git is recommended.

The project is ready to deploy, but no Netlify account has been connected and no public deployment has been made by this migration.

## Games

- **Note names:** natural notes, treble/bass clef, independently configurable inclusive ranges from C2 to C6. Answers pair letter names with fixed-Do solfege.
- **Note lengths:** whole, half, quarter and eighth notes, counted in 4/4 time.
- **Rests:** the corresponding four rest values in 4/4 time.

Each answer counts once. Feedback reveals the correct answer; Next question advances. Each mode has separate correct/wrong counters. New session resets only the current mode.

## Progress and offline use

Settings, locale and counters are stored in `localStorage` under the existing `music-theory-v1` key. Existing Expo browser progress survives when the browser and origin (protocol, host and port) stay the same. Moving from localhost to Netlify, using another browser, or changing the domain starts with separate progress. Clearing browser site data clears progress. There is no cross-device sync or server database.

Production builds include a service worker that caches the app and assets. Visit once online and allow the app to finish caching; it can then reopen and practise offline. This works over HTTPS (provided by Netlify) or localhost. The development server does not install a service worker. Browser storage may be evicted by the browser, and private browsing can discard progress.

To test the production build locally:

```sh
npm run build
npm run preview
```

## Translations

All interface text and answer labels live in the `Locale` folders. Existing locale files and default selection are preserved.

1. Copy a locale folder, translate values, and keep keys and answer array order unchanged.
2. Import/register it in `Locale/index.ts`.
3. It appears in Settings; language changes take effect immediately and are saved.

Use `Translation` from `Locale/index.ts` to check new translations. `en-UK` remains the requested folder ID; the HTML language tag uses `en-GB` for it.

## Checks

```sh
npm run typecheck
npm run lint
npm test
npm run build
```

Clefs and rests use bundled SVG outlines from Bravura under the SIL Open Font License; see `assets/Bravura-LICENSE.txt`. Regenerate with `npm run generate:glyphs`.
