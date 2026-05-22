from groq import AsyncGroq
from openai import AsyncOpenAI
from functools import lru_cache
from app.config import get_settings


# ── LLM Client (Groq — free, fast, OpenAI-compatible) ────────────
@lru_cache()
def get_llm_client() -> AsyncGroq:
    settings = get_settings()
    return AsyncGroq(api_key=settings.groq_api_key)


# ── Embeddings Client (OpenAI still needed for embeddings) ────────
# Groq does not offer embeddings — we use a free alternative below
@lru_cache()
def get_openai_client() -> AsyncOpenAI:
    settings = get_settings()
    return AsyncOpenAI(api_key=settings.openai_api_key)


async def chat_completion(
    messages: list[dict],
    model: str | None = None,
    temperature: float = 0.7,
    response_format: dict | None = None,
    max_tokens: int | None = None,
) -> str:
    """
    All LLM calls go through Groq (free).
    Llama 3.1 70B is the model — matches GPT-4o quality for most tasks.
    JSON mode is supported via response_format.
    """
    settings = get_settings()
    client = get_llm_client()

    kwargs = {
        "model": model or settings.llm_model,
        "messages": messages,
        "temperature": temperature,
        "max_tokens": max_tokens or settings.max_tokens_per_request,
    }
    if response_format:
        kwargs["response_format"] = response_format

    response = await client.chat.completions.create(**kwargs)
    return response.choices[0].message.content


async def get_embedding(text: str) -> list[float]:
    """
    Groq has no embeddings API.
    We use a completely free alternative: Hugging Face sentence-transformers
    running locally — no API key, no cost, ever.
    See embedder.py for the local embedding setup.
    """
    settings = get_settings()

    # If OpenAI key exists, use it (best quality)
    if settings.openai_api_key and settings.openai_api_key != "none":
        client = get_openai_client()
        response = await client.embeddings.create(
            model=settings.embedding_model,
            input=text.strip(),
        )
        return response.data[0].embedding

    # Otherwise fall back to local sentence-transformers (free)
    from app.core.local_embedder import get_local_embedding
    return await get_local_embedding(text)
