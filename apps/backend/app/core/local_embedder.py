from sentence_transformers import SentenceTransformer
import asyncio

# Loads once, stays in memory — no API calls, no cost
_model = None

def get_model() -> SentenceTransformer:
    global _model
    if _model is None:
        # all-MiniLM-L6-v2: tiny (80MB), fast, good quality
        # Downloads once to your machine, then cached forever
        print("Loading local embedding model (first time only)...")
        _model = SentenceTransformer("all-MiniLM-L6-v2")
        print("Embedding model loaded.")
    return _model


async def get_local_embedding(text: str) -> list[float]:
    """
    Runs sentence-transformer in a thread pool so it doesn't
    block FastAPI's async event loop.
    Returns a 384-dimensional vector (vs OpenAI's 1536).
    Still excellent for semantic similarity search.
    """
    loop = asyncio.get_event_loop()
    model = get_model()
    vector = await loop.run_in_executor(
        None,
        lambda: model.encode(text, normalize_embeddings=True).tolist()
    )
    return vector
