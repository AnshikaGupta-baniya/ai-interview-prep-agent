import httpx
from app.config import get_settings


async def get_embedding(text: str) -> list[float]:
    """
    Gets text embedding from Jina AI free API.
    - 1M free tokens/month
    - No local model needed
    - No memory issues on Render free tier
    - 768-dimensional vectors
    """
    settings = get_settings()

    # Use Jina if key is set
    if settings.jina_api_key and settings.jina_api_key != "none":
        return await _jina_embedding(text, settings.jina_api_key)

    # Fall back to OpenAI if key is set
    if settings.openai_api_key and settings.openai_api_key != "none":
        return await _openai_embedding(text, settings.openai_api_key)

    # Last resort — local fastembed
    return await _local_embedding(text)


async def _jina_embedding(text: str, api_key: str) -> list[float]:
    """Jina AI embedding API — free tier."""
    async with httpx.AsyncClient() as client:
        response = await client.post(
            "https://api.jina.ai/v1/embeddings",
            headers={
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json",
            },
            json={
                "input": [text],
                "model": "jina-embeddings-v3",
            },
            timeout=30,
        )
        response.raise_for_status()
        data = response.json()
        return data["data"][0]["embedding"]


async def _openai_embedding(text: str, api_key: str) -> list[float]:
    """OpenAI embedding fallback."""
    from openai import AsyncOpenAI
    client = AsyncOpenAI(api_key=api_key)
    response = await client.embeddings.create(
        model="text-embedding-3-small",
        input=text.strip(),
    )
    return response.data[0].embedding


async def _local_embedding(text: str) -> list[float]:
    """Local fastembed — last resort, only for local dev."""
    import asyncio
    from fastembed import TextEmbedding
    loop = asyncio.get_event_loop()
    model = TextEmbedding(model_name="fast-bge-small-en")
    vector = await loop.run_in_executor(
        None,
        lambda: list(list(model.embed([text]))[0])
    )
    return vector