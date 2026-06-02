from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import get_settings
from app.routes import analyze

settings = get_settings()

app = FastAPI(
    title=settings.app_name,
    description="AI-powered marketing content generator"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(analyze.router)

@app.get("/")
def read_root():
    return {"message": "MarketFlow AI API is running", "status": "ok"}
