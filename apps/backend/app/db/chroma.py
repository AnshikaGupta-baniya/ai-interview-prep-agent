import chromadb
from functools import lru_cache
from app.config import get_settings


@lru_cache()
def get_chroma_client() -> chromadb.Client:
    """
    Production: EphemeralClient (in-memory)
    Development: PersistentClient (local disk)

    WHY: Railway free tier has no persistent disk.
    Vectors are rebuilt on each resume upload — acceptable
    because resume uploads are infrequent and fast.

    For true production: migrate to Pinecone (we cover in Phase 8)
    """
    settings = get_settings()

    if settings.environment == "production":
        return chromadb.EphemeralClient()
    else:
        from pathlib import Path
        path = str(Path(__file__).parent.parent.parent / "chroma_data")
        return chromadb.PersistentClient(path=path)


def get_or_create_collection(resume_id: str) -> chromadb.Collection:
    client = get_chroma_client()
    collection_name = f"resume_{resume_id.replace('-', '_')}"
    return client.get_or_create_collection(
        name=collection_name,
        metadata={"hnsw:space": "cosine"}
    )