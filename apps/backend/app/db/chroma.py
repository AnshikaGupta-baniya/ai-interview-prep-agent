import chromadb

from chromadb.config import Settings
from functools import lru_cache
from pathlib import Path


CHROMA_DATA_PATH = str(
    Path(__file__).parent.parent.parent / "chroma_data"
)


@lru_cache()
def get_chroma_client():

    return chromadb.PersistentClient(
        path=CHROMA_DATA_PATH,
        settings=Settings(
            anonymized_telemetry=False
        )
    )


def get_or_create_collection(resume_id: str):

    client = get_chroma_client()

    collection_name = (
        f"resume_{resume_id.replace('-', '_')}"
    )

    return client.get_or_create_collection(
        name=collection_name,
        metadata={"hnsw:space": "cosine"}
    )