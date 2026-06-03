# MarketFlow AI Development

## Stack

- Backend: FastAPI, Pydantic v2, Groq SDK, Gemini/Nano Banana image generation, Pexels API, pytest
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
- `GEMINI_API_KEY`: Optional. Enables Gemini/Nano Banana campaign image generation.
- `GEMINI_IMAGE_MODEL`: Optional. Defaults to `gemini-2.5-flash-image`; can be changed to another supported Gemini image model.
- `IMAGE_PROVIDER`: Optional. Use `hybrid`, `gemini`, or `pexels`; the frontend can also choose this per campaign.
- `PEXELS_API_KEY`: Optional. Used for stock images and as the hybrid fallback.
- `PUBLIC_API_BASE_URL`: Optional. Public backend URL used when serving generated image files.
- `VITE_API_URL`: Optional frontend API URL for Vite.
- `CORS_ORIGINS`: Optional comma-separated list of allowed frontend origins.

## Image Providers

- `hybrid`: Tries Gemini/Nano Banana first, then falls back to Pexels and placeholders.
- `gemini`: Requests a generated campaign image from Gemini and still keeps Pexels as a reliability fallback.
- `pexels`: Uses Pexels stock imagery only.

Generated Gemini images are stored in `generated_assets/` and served from `/generated-assets`.
