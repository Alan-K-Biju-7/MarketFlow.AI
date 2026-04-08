📦 MarketFlow AI — Website‑to‑Social Content Engine  

MarketFlow AI is an AI‑driven system that turns any public website URL into a ready‑to‑deploy social content pack. It analyzes the brand behind the site, writes platform‑specific posts, scores their engagement potential, and attaches contextually relevant catalog images from Pexels.  
The goal is to compress the workflow of “understand the brand → write posts → pick images” from hours of manual work into under a minute for founders, marketers, and agencies.

***



🧠 Project Overview  

Most small and mid‑sized brands have a website but lack time and resources to consistently create on‑brand social content. Typical pain points include:

- Having to re‑read the website each time to remember positioning and offerings  
- Writing different copy for Instagram, LinkedIn, and X/Twitter  
- Manually judging “what will perform well”  
- Browsing stock sites to find images that actually fit the brand  

MarketFlow AI solves this by:

- Scraping and summarizing a brand’s website into a structured **Brand Profile**  
- Generating **5 social posts** tailored to specific platforms  
- Computing an **engagement score label** (High / Medium / Low) per post using heuristic rules  
- Attaching **Pexels catalog images** that match the brand’s industry, products, and audience  
- Returning everything as a clean JSON payload that any frontend, scheduler, or downstream AI can consume

Core functional capabilities:

- URL‑based brand understanding (text + color palette)  
- Structured brand profiling (name, description, offerings, audience, tone, keywords, colors)  
- Multi‑platform post generation (Instagram, LinkedIn, X)  
- Heuristic engagement scoring and labeling  
- Context‑aware stock image retrieval from Pexels with safe fallbacks  
- Single API (`POST /analyze`) suitable for UI and programmatic use

***

❓ Motivation and Problem Statement  

Teams typically face:

- Repetitive work re‑deriving brand voice and audience from web content  
- Fragmented workflows spanning copywriting tools, stock image sites, and analytics docs  
- Inconsistent content quality across platforms  
- Difficulty scaling content production for multiple brands or clients  

MarketFlow AI provides a single pipeline that:

- Reads the website once and creates a reusable Brand Profile  
- Generates coherent, platform‑aware posts in bulk  
- Automatically suggests which posts are likely to perform better  
- Supplies matching visuals with zero manual image search  

***

🚀 Key Functional Features  

### 1. Automated Brand Profiling  

Given a website URL, MarketFlow AI:

- Downloads and parses the home page HTML  
- Extracts readable text sections (titles, headings, body copy)  
- Detects dominant brand colors from inline styles and CSS  
- Sends this context to an LLM, which returns a strict JSON **Brand Profile** containing:  
  - Brand name and narrative description  
  - Products and services  
  - Target audience segments  
  - Tone of voice  
  - Core keywords  
  - Suggested color palette  

This brand profile is the single source of truth for all downstream generation.

***

### 2. Multi‑Platform Post Generation  

Using the Brand Profile, the system asks the LLM to generate a fixed set of posts:

- 5 posts per run:
  - 2 × Instagram  
  - 2 × LinkedIn  
  - 1 × X  
- Each post includes:
  - Platform enum (`Instagram` | `LinkedIn` | `X`)  
  - Caption text tuned to that platform’s norms  
  - Hashtag list  
  - Optional call‑to‑action  

The prompt enforces platform‑specific constraints such as:

- Length ranges (shorter on X, mid‑length on Instagram, longer on LinkedIn)  
- Tone (more professional on LinkedIn, more casual/visual on Instagram)  
- Reasonable hashtag counts per platform  

Outputs are validated against strict schemas so posts are predictable and machine‑readable.

***

### 3. Engagement Scoring and Labeling  

Each generated post is passed through a deterministic analytics module that estimates its engagement potential using heuristics based on social media best practices:

- Caption length vs platform‑specific “sweet spot”  
- Number of hashtags within optimal ranges per platform  
- Emoji usage (roughly 2–5 ideal, too few/too many penalized)  
- Presence of clear calls‑to‑action (e.g., “Join”, “Learn more”, “Shop”, “Sign up”, “Try”)  
- Use of questions and exclamation marks as engagement triggers  

The module assigns a numeric score (0–100) and a label:

- **High** (≥ 70)  
- **Medium** (50–69)  
- **Low** (< 50)  

This label is displayed on each post card in the UI and can be used by other systems to prioritize content.

***

### 4. Context‑Aware Image Selection (Pexels Catalog)  


Instead of generating images, the project uses the Pexels stock image API to retrieve photos that fit the brand and post context.

The image selection logic:

- Interprets **brand name** and **industry** (e.g., Apple ≠ apples; Tesla = electric vehicles; Starbucks = coffee and cafes; Neurobots = robotics competitions).  
- Looks at **products/services** (e.g., “Apple Watch”, “AirPods”, “handcrafted drinks”, “robotics championship”).  
- Builds smart Pexels queries such as:
  - `"smartwatch wrist"` for Apple Watch  
  - `"wireless earbuds"` for AirPods  
  - `"coffee cup latte art"` for Starbucks  
  - `"robotics team tech competition"` for Neurobots  
  - `"electric sedan"` for Tesla Model 3  
- Adapts queries to platform style (lifestyle‑oriented for Instagram, professional scenes for LinkedIn, dynamic scenes for X).  
- Calls the Pexels search endpoint and selects a suitable result, using the large‑size URL.

If Pexels returns no results or the API fails, the system falls back to a deterministic placeholder image service using seeded randomness to maintain visual variety across posts while remaining predictable.

***

### 5. UI Workflow and Post Handoff  

On the frontend, the React application:

- Presents a simple form: website URL + tone preset  
- Calls `POST /analyze` and shows a loading state  
- Renders a grid of **Post Cards** once data is received, each showing:
  - Platform badge (Instagram / LinkedIn / X)  
  - Caption and hashtags  
  - Engagement label badge (High / Medium / Low)  
  - Linked image preview (from Pexels or fallback)  
  - “Copy” button to copy caption + hashtags via the Clipboard API  
- Offers filters to view posts per platform or “All”  

This output can be:

- Copied directly into social platforms  
- Exported by another service (CSV/JSON) for schedulers or marketing tools  
- Fed into other AIs for further refinement or translation

***

🧩 System Workflow (High‑Level Process Flow)  

Website URL  
  ↓  
HTML Fetch & Parsing  
  ↓  
Brand Text & Color Extraction  
  ↓  
Brand Profile Generation (LLM)  
  ↓  
Validated Brand Profile  
  ↓  
Post Generation (LLM)  
  ↓  
Heuristic Engagement Scoring  
  ↓  
Context‑Aware Image Search (Pexels) + Fallbacks  
  ↓  
Assembled Content Pack (profile + posts + scores + image URLs)  
  ↓  
React UI / External Consumers  

***

🏗️ System Architecture  

**Backend**

- Python 3  
- FastAPI for the HTTP API, routing, and automatic OpenAPI docs  
- Pydantic models for:
  - Request payloads (`/analyze`)  
  - `BrandProfile`  
  - `GeneratedPost`  
  - Response schemas  
- HTTP client + HTML parser for:
  - Fetching website HTML  
  - Extracting readable text via DOM traversal and filtering  
- LLM client for:
  - Brand profile creation from website text and colors  
  - Platform‑specific post generation from the Brand Profile  
- Analytics module:
  - Pure Python heuristics for engagement scoring and labeling  
- Pexels client for:
  - Query construction (brand + product + platform context)  
  - Catalog search and image URL extraction  
- Fallback image logic:
  - Deterministic placeholder image URLs derived from brand and platform seeds  

**Frontend**

- React (component‑based SPA)  
- Tailwind CSS for utility‑first styling of cards, badges, and layout  
- HTTP client for calling the backend API  
- Clipboard API for quick “copy caption” actions  
- Simple client‑side filtering and state management via React hooks  

***

⚙️ Core API  

### `POST /analyze`  

Generate brand profile, posts, engagement scores, and image URLs for a given website.

**Request**

```json
{
  "url": "https://www.tesla.com",
  "tone_preset": "auto"
}
```

**Response (shape)**

```json
{
  "brand_profile": {
    "brand_name": "Tesla",
    "description": "...",
    "products_services": ["Electric vehicles", "Energy storage", "Solar"],
    "target_audience": ["EV buyers", "Tech enthusiasts", "Sustainability-focused consumers"],
    "tone": "Innovative and visionary",
    "keywords": ["EV", "sustainability", "innovation"],
    "colors": [
      { "name": "Red", "hex": "#e31937" },
      { "name": "Black", "hex": "#000000" }
    ]
  },
  "posts": [
    {
      "platform": "Instagram",
      "caption": "...",
      "hashtags": ["#Tesla", "#ElectricVehicle"],
      "engagement_score": 82,
      "engagement_score_label": "High",
      "image_url": "https://images.pexels.com/photos/..."
    },
    {
      "platform": "LinkedIn",
      "caption": "...",
      "hashtags": ["#Sustainability", "#Innovation"],
      "engagement_score": 67,
      "engagement_score_label": "Medium",
      "image_url": "https://images.pexels.com/photos/..."
    }
    // 3 more posts (2nd Instagram, 2nd LinkedIn, 1 X)
  ]
}
```

***

⚙️ Local Setup (Quick Start)  

### Backend

```bash
cd backend
python -m venv venv
# Windows: venv\Scripts\activate
source venv/bin/activate

pip install -r requirements.txt

# .env
# GROQ_API_KEY=your_llm_key
# PEXELS_API_KEY=your_pexels_key

uvicorn app.main:app --reload
```

- API docs (auto‑generated): `http://localhost:8000/docs`

### Frontend

```bash
cd frontend
npm install
npm start   # or npm run dev
```

- UI: `http://localhost:3000`

***

🧠 Technologies Employed  

| Layer            | Technologies & Purpose                                                                 |
|------------------|----------------------------------------------------------------------------------------|
| Backend API      | FastAPI (routing, OpenAPI docs), Python 3, Pydantic (schemas & validation)            |
| Web Scraping     | HTTP client + HTML parser for lightweight text and color extraction                    |
| LLM Integration  | Hosted LLM via cloud API (brand profiling & post generation)                           |
| Analytics        | Custom Python heuristics for engagement scoring and labels                             |
| Image Catalog    | Pexels API for brand‑ and product‑aware stock images, plus deterministic fallbacks     |
| Frontend         | React, Tailwind CSS, browser Clipboard & fetch capabilities                            |
| Dev & Tooling    | Virtualenv, environment variables for keys, Uvicorn for local API server              |

***

💡 Demonstration Workflow  

1. Enter a brand website URL (e.g., Apple, Tesla, Neurobots, Starbucks).  
2. Click “Generate”.  
3. System scrapes the site, builds a Brand Profile, and generates 5 posts.  
4. Each post displays:
   - Platform  
   - Caption and hashtags  
   - Engagement label  
   - Image preview  
5. Copy any post into your social tool of choice, or have another system consume the JSON and schedule content automatically.

***

👨‍💻 Project Context  

This project is designed as a practical, extensible content engine for agencies, founders, and marketing tools. Another AI integrating with MarketFlow AI only needs to:

- Call `POST /analyze` with a URL,  
- Parse the Brand Profile and posts,  
- Optionally re‑rank posts using its own logic, or translate/adapt them for other markets and platforms.
