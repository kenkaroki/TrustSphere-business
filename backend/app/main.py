from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import business, ai, auth
from app.models.database import init_db, close_db

app = FastAPI(
    title="Business Growth Platform API",
    description="AI-powered platform to help SMEs grow and succeed",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173" , "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize database
@app.on_event("startup")
async def startup_event():
    await init_db()

@app.on_event("shutdown")
async def shutdown_event():
    await close_db()

# Include routers
app.include_router(auth.router)
app.include_router(business.router)
app.include_router(ai.router)

@app.get("/")
async def root():
    return {
        "message": "Business Growth Platform API",
        "version": "1.0.0",
        "ai_model": "Gemini 2.5 Flash"
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy"}
