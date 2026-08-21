# LifeStep Web

LifeStep helps Canadian newcomers prepare for real-life situations through interactive English conversations.

## Development

```bash
yarn install
yarn dev
```

The development server runs on `http://localhost:3600`. Set `API_BASE_URL` for the development proxy. Browser requests activate a device through `/api/user/activate-device` before calling the LifeStep APIs.

Production uses the Next.js standalone output. The Docker runtime listens on port `8084`. `.github/workflows/deploy.yml` is aligned with Flash Maple and runs for future pushes to `main` once the required repository secrets are configured.

## Product routes

- `/` — public website
- `/app` — Journey map and journey-type onboarding
- `/app/stage` — bilingual scenario list
- `/app/scenario` — Knowledge, Vocabulary, Conversation, and Review
- `/app/about`, `/app/settings`, `/app/messages` — app utilities
