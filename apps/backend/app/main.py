from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.config import get_settings
from app.api import health, resume, session, question, answer


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Runs on startup — pre-loads heavy models so first
    request is not slow.
    """
    print("Loading FastEmbed model on startup...")
    from app.services.embedder import get_embedding_model
    get_embedding_model()
    print("FastEmbed model ready.")
    yield
    print("Shutting down...")


settings = get_settings()

app = FastAPI(
    title="AI Interview Prep Agent",
    version="1.0.0",
    description="RAG + LLM powered interview preparation backend",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

PREFIX = f"/api/{settings.api_version}"

app.include_router(health.router, prefix=PREFIX)
app.include_router(resume.router, prefix=PREFIX)
app.include_router(session.router, prefix=PREFIX)
app.include_router(question.router, prefix=PREFIX)
app.include_router(answer.router, prefix=PREFIX)