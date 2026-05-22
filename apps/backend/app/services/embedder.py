import tiktoken
import uuid
import asyncio

from sentence_transformers import SentenceTransformer

from app.db.chroma import get_or_create_collection
from app.config import get_settings

_model = None


def get_embedding_model():
    global _model

    if _model is None:
        print("Loading embedding model...")
        _model = SentenceTransformer("all-MiniLM-L6-v2")
        print("Embedding model ready.")

    return _model


async def get_local_embedding(text):
    loop = asyncio.get_event_loop()

    model = get_embedding_model()

    vector = await loop.run_in_executor(
        None,
        lambda: model.encode(
            text,
            normalize_embeddings=True
        ).tolist()
    )

    return vector


def chunk_resume(parsed, chunk_size=512, overlap=100):

    enc = tiktoken.encoding_for_model("gpt-4o")

    chunks = []

    for exp in parsed.work_experiences:

        responsibilities = "; ".join(exp.responsibilities)
        achievements = "; ".join(exp.achievements)
        technologies = ", ".join(exp.technologies)

        text = (
            f"Company: {exp.company}\n"
            f"Role: {exp.role}\n"
            f"Duration: {exp.start_date or 'N/A'} to {exp.end_date or 'Present'}\n"
            f"Responsibilities: {responsibilities}\n"
            f"Achievements: {achievements}\n"
            f"Technologies: {technologies}"
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

                sub_tokens = tokens[i:i + chunk_size]

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


async def embed_and_index(resume_id, parsed):

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