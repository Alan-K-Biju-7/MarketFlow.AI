from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import analyze

app = FastAPI(
    title="MarketFlow AI API",
    description="AI-powered marketing content generator"
)

# ADD THIS CORS MIDDLEWARE (CRITICAL!)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(analyze.router)

@app.get("/")
def read_root():
    return {"message": "MarketFlow AI API is running", "status": "ok"}
