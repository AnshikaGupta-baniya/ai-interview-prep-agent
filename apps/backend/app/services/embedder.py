import tiktoken
import uuid
from app.core.embeddings import get_embedding
from app.db.chroma import get_or_create_collection
from app.models.resume import ParsedResume
from app.config import get_settings


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
        vector = await get_embedding(chunk["text"])
        embeddings.append(vector)

    collection.upsert(
        ids=[c["id"] for c in chunks],
        embeddings=embeddings,
        documents=[c["text"] for c in chunks],
        metadatas=[c["metadata"] for c in chunks],
    )
    return len(chunks)