
from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    # Groq (free LLM)
    groq_api_key: str
    llm_model: str = "llama-3.3-70b-versatile"
    max_tokens_per_request: int = 2000

    # OpenAI (optional - for embeddings only)
    openai_api_key: str = "none"
    embedding_model: str = "text-embedding-3-small"

    # Whisper
    whisper_model: str = "whisper-large-v3"

    # Supabase
    supabase_url: str
    supabase_service_key: str
    supabase_storage_bucket: str = "resumes"

    # ChromaDB
    chroma_host: str = "localhost"
    chroma_port: int = 8001

    # App
    environment: str = "development"
    api_version: str = "v1"
    max_resume_size_mb: int = 10
    chunk_size_tokens: int = 512
    chunk_overlap_tokens: int = 100

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


@lru_cache()
def get_settings() -> Settings:
    return Settings()
