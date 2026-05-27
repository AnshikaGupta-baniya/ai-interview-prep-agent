import tiktoken
import uuid
import asyncio
from fastembed import TextEmbedding
from app.db.chroma import get_or_create_collection
from app.models.resume import ParsedResume
from app.config import get_settings

# FastEmbed — lightweight quantized model
# Uses ~50MB vs sentence-transformers ~500MB
# Perfect for Render free tier
_model = None


def get_embedding_model() -> TextEmbedding:
    global _model
    if _model is None:
        print("Loading FastEmbed model...")
        _model = TextEmbedding(
            model_name="fast-bge-small-en"  # only 23MB
        )
        print("FastEmbed model ready.")
    return _model


async def get_local_embedding(text: str) -> list[float]:
    """
    Runs FastEmbed in thread pool so it doesn't block FastAPI.
    Returns 384-dimensional vector.
    """
    loop = asyncio.get_event_loop()
    model = get_embedding_model()
    vector = await loop.run_in_executor(
        None,
        lambda: list(list(model.embed([text]))[0])
    )
    return vector


def chunk_resume(
    parsed: ParsedResume,
    chunk_size: int = 512,
    overlap: int = 100,
) -> list[dict]:
    enc = tiktoken.encoding_for_model("gpt-4o")
    chunks = []

    for exp in parsed.work_experiences:
        text = (
            f"Company: {exp.company}\n"
            f"Role: {exp.role}\n"
            f"Duration: {exp.start_date or 'N/A'} to {exp.end_date or 'Present'}\n"
            f"Responsibilities: {'; '.join(exp.responsibilities)}\n"
            f"Achievements: {'; '.join(exp.achievements)}\n"
            f"Technologies: {', '.join(exp.technologies)}"
        )

        tokens = enc.encode(text)

        if len(tokens) <= chunk_size:
            chunks.append({
                "id": str(uuid.uuid4()),
                "text": text,
                "metadata": {
                    "company": exp.company,
                    "role": exp.role,
                    "type": "work_experience",
                },
            })
        else:
            for i in range(0, len(tokens), chunk_size - overlap):
                sub_tokens = tokens[i: i + chunk_size]
                sub_text = enc.decode(sub_tokens)
                chunks.append({
                    "id": str(uuid.uuid4()),
                    "text": sub_text,
                    "metadata": {
                        "company": exp.company,
                        "role": exp.role,
                        "type": "work_experience_partial",
                    },
                })

    if parsed.skills:
        skill_text = f"Skills: {', '.join(parsed.skills)}"
        if parsed.summary:
            skill_text = f"Summary: {parsed.summary}\n" + skill_text
        chunks.append({
            "id": str(uuid.uuid4()),
            "text": skill_text,
            "metadata": {
                "type": "skills_summary",
                "company": "",
                "role": "",
            },
        })

    return chunks


async def embed_and_index(resume_id: str, parsed: ParsedResume) -> int:
    settings = get_settings()
    chunks = chunk_resume(
        parsed,
        chunk_size=settings.chunk_size_tokens,
        overlap=settings.chunk_overlap_tokens,
    )
    collection = get_or_create_collection(resume_id)

    embeddings = []
    for chunk in chunks:
        vector = await get_local_embedding(chunk["text"])
        embeddings.append(vector)

    collection.upsert(
        ids=[c["id"] for c in chunks],
        embeddings=embeddings,
        documents=[c["text"] for c in chunks],
        metadatas=[c["metadata"] for c in chunks],
    )
    return len(chunks)