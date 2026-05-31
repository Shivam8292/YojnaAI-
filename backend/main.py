import os
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

# Import routers
from routes.eligibility import router as eligibility_router
from routes.schemes import router as schemes_router
from services.retriever import count_schemes

# Initialize rate limiter (10 requests per minute on eligibility checks, other limits configured on endpoints)
limiter = Limiter(key_func=get_remote_address)

app = FastAPI(
    title="Sarkar Saathi API",
    description="Multilingual AI-powered government scheme eligibility finder API",
    version="1.0.0"
)

# Register rate limiter error handler
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# CORS configuration
origins = [
    "http://localhost:5173",  # React development port
    "http://127.0.0.1:5173",
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(eligibility_router)
app.include_router(schemes_router)

# Limit health check to 60 requests per minute
@app.get("/api/health")
@limiter.limit("60/minute")
async def health_check(request: Request):
    # Dynamic database doc counts
    docs_count = count_schemes()
    return {
        "status": "ok",
        "chroma_docs": docs_count,
        "model_loaded": True
    }

if __name__ == "__main__":
    import uvicorn
    # Check if env keys are present
    groq_key = os.getenv("GROQ_API_KEY")
    tavily_key = os.getenv("TAVILY_API_KEY")
    if not groq_key:
        print("WARNING: GROQ_API_KEY is not set in environment variables.")
    if not tavily_key:
        print("WARNING: TAVILY_API_KEY is not set in environment variables.")
        
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
