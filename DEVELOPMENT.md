# MarketFlow AI Development

## Stack

- Backend: FastAPI, Pydantic v2, Groq SDK, Pexels API, pytest
- Frontend: Vite, React 18, Tailwind CSS, Vitest, Testing Library
- Tooling: Docker Compose, GitHub Actions CI

## Local Setup

```bash
cp .env.example .env
python -m venv .venv
source .venv/bin/activate
pip install -r requirements-dev.txt
```

```bash
cd frontend
npm ci
```

## Run Locally

```bash
uvicorn app.main:app --reload
```

```bash
cd frontend
npm run dev
```

The API runs on `http://localhost:8000`.
The frontend runs on `http://localhost:5173`.

## Verify

```bash
pytest
```

```bash
cd frontend
npm test
npm run build
npm audit --audit-level=moderate
```

## Docker

```bash
cp .env.example .env
docker compose up --build
```

The Docker frontend is served on `http://localhost:8080`.

## Required Environment Variables

- `GROQ_API_KEY`: Required for brand profile and post generation.
- `PEXELS_API_KEY`: Optional. Without it, image URLs fall back to placeholders.
- `CORS_ORIGINS`: Optional comma-separated list of allowed frontend origins.
