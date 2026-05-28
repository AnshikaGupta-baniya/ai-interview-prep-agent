import httpx
from app.config import get_settings


async def get_embedding(text: str) -> list[float]:
    settings = get_settings()

    # Try Jina first
    if settings.jina_api_key and settings.jina_api_key != "none":
        try:
            return await _jina_embedding(text, settings.jina_api_key)
        except Exception as e:
            print(f"Jina embedding failed: {e}, falling back...")

    # Try OpenAI
    if settings.openai_api_key and settings.openai_api_key != "none":
        try:
            return await _openai_embedding(text, settings.openai_api_key)
        except Exception as e:
            print(f"OpenAI embedding failed: {e}")

    raise ValueError(
        "No embedding provider available. "
        "Set JINA_API_KEY in environment variables."
    )


async def _jina_embedding(text: str, api_key: str) -> list[float]:
    async with httpx.AsyncClient(timeout=30) as client:
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
        )
        response.raise_for_status()
        data = response.json()
        return data["data"][0]["embedding"]


async def _openai_embedding(text: str, api_key: str) -> list[float]:
    from openai import AsyncOpenAI
    client = AsyncOpenAI(api_key=api_key)
    response = await client.embeddings.create(
        model="text-embedding-3-small",
        input=text.strip(),
    )
    return response.data[0].embedding