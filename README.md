# LifeStep

LifeStep is a multilingual web app that helps newcomers to Canada build confidence for real-life situations through guided English practice.

![LifeStep preview](public/og.png)

## Highlights

- Personalized study, work, and family learning journeys
- Life-stage maps with progress tracking and practical scenarios
- Knowledge, vocabulary, conversation, and review activities
- Multilingual interface support for ten languages
- Text-to-speech playback with configurable voice settings
- Browser push notifications and an in-app notification center
- Installable PWA with responsive desktop and mobile layouts
- Offline app-shell loading with cached learning content
- Light and dark themes

## Tech stack

- [Next.js 16](https://nextjs.org/) App Router and standalone output
- [React 19](https://react.dev/) and TypeScript
- [Tailwind CSS 4](https://tailwindcss.com/)
- [Radix UI](https://www.radix-ui.com/), shadcn, and Lucide icons
- Service Worker, Web Push, browser storage, and text-to-speech APIs

This repository contains the web client. Journey progress, scenario content, feedback, and push subscription APIs are provided by a separate backend service.

### Offline behavior

The app registers a Service Worker at the site root so the `/app` launch URL is controlled even though it has no trailing slash. On the first connected visit—and once after each deployment—it warms the localized app shell, Next.js static assets, and the main learning routes. Subsequent launches can load the cached app while offline. Journey progress, scenario lists, and scenario details are cached after a successful API response; if the API is unavailable, the app uses the most recent cached response or bundled preview content.

Feedback, push subscription changes, and start/complete mutations still require a connection and are never reported as successfully synced while offline.

## Getting started

### Requirements

- Node.js 24
- Yarn 1.x
- A compatible backend API for data-backed features

Copy the documented environment file, install dependencies, and start the development server:

```bash
cp .env.example .env.local
yarn install --frozen-lockfile
yarn dev
```

Open [http://localhost:3600](http://localhost:3600). Without a reachable backend, supported learning screens use bundled preview content so the interface can still be developed.

## Commands

| Command | Description |
| --- | --- |
| `yarn dev` | Start the development server on port `3600` |
| `yarn dev:prod` | Start the development server with production-mode configuration checks |
| `yarn build` | Create a local production build using development fallbacks |
| `yarn build:prod` | Create a deployable production build; required production variables must be set |
| `yarn start` | Start a built application |
| `yarn lint` | Run ESLint |

## Configuration

Use `.env.local` for local values. It is ignored by Git; `.env.example` documents safe development defaults.

| Variable | Required in production | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_ENV` | Yes, set by `build:prod` | Selects `development`, `test`, or `production` behavior |
| `NEXT_PUBLIC_API_ORIGIN` | Yes | Public backend API origin used by the Next.js proxy and browser requests |
| `NEXT_PUBLIC_SITE_URL` | Yes | Canonical public URL used for metadata, sitemap, and sharing |
| `ALLOWED_DEV_ORIGINS` | No | Comma-separated hosts allowed to access the development server |

Values prefixed with `NEXT_PUBLIC_` are compiled into the browser bundle and must never contain secrets. Keep credentials, private keys, tokens, and production-only values out of committed files.

For GitHub Actions deployment, add `NEXT_PUBLIC_API_ORIGIN` and `NEXT_PUBLIC_SITE_URL` under **Settings → Secrets and variables → Actions → Variables**.

The deployment workflow also expects these encrypted GitHub Actions secrets:

| Secret | Purpose |
| --- | --- |
| `SSH_PRIVATE_KEY` | Private key used by the deployment runner |
| `SSH_SERVER_IP` | Deployment server address |
| `SSH_USERNAME` | Deployment server user |

## Deployment

The workflow in `.github/workflows/deploy.yml` runs when `main` is updated. It installs dependencies, validates the production configuration, builds a standalone Next.js application and Docker image, transfers that image over SSH, and replaces the running container on port `8084`.

Forks should configure their own Actions variables and secrets before enabling the deployment workflow.

## Project structure

```text
app/          Next.js routes, layouts, metadata, and application pages
components/   Shared UI, providers, application shell, and audio controls
features/     Feature-level pages and home-page components
lib/          API clients, configuration, stores, content, TTS, and utilities
messages/     Localized interface dictionaries and learning copy
public/       Icons, fonts, preview images, and the service worker
tests/        Automated tests
```

## Contributing

1. Fork the repository and create a focused branch.
2. Keep secrets and environment-specific production values out of source control.
3. Record notable changes in `CHANGELOG.md` under `Unreleased`.
4. Run `yarn lint` and `yarn build` before opening a pull request.

## License

LifeStep is available under the [MIT License](LICENSE).
