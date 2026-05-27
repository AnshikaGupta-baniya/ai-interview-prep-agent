from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.api import health, resume, session, question, answer

settings = get_settings()

app = FastAPI(
    title="AI Interview Prep Agent",
    version="1.0.0",
    description="RAG + LLM powered interview preparation backend",
    docs_url="/docs",
    redoc_url="/redoc",
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


@app.on_event("startup")
async def startup():
    print(f"Environment: {settings.environment}")
    print(f"Swagger UI: http://localhost:8000/docs")