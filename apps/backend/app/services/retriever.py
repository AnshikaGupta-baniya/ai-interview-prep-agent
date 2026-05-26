import asyncio
from fastembed import TextEmbedding
from app.db.chroma import get_or_create_collection

_model = None


def get_embedding_model() -> TextEmbedding:
    global _model
    if _model is None:
        _model = TextEmbedding(model_name="BAAI/bge-small-en-v1.5")
    return _model


async def get_local_embedding(text: str) -> list[float]:
    loop = asyncio.get_event_loop()
    model = get_embedding_model()
    vector = await loop.run_in_executor(
        None,
        lambda: list(list(model.embed([text]))[0])
    )
    return vector


async def retrieve_diverse_chunk(
    resume_id: str,
    query: str,
    used_chunks: list,
    n_results: int = 10,
) -> str:
    query_vector = await get_local_embedding(query)
    collection = get_or_create_collection(resume_id)

    results = collection.query(
        query_embeddings=[query_vector],
        n_results=min(n_results, collection.count()),
        include=["documents", "metadatas", "distances"],
    )

    if not results["documents"] or not results["documents"][0]:
        raise ValueError(f"No chunks found for resume_id={resume_id}")

    documents = results["documents"][0]

    for doc in documents:
        already_used = any(
            _chunks_similar(doc, used) for used in used_chunks
        )
        if not already_used:
            return doc

    return documents[0]


def _chunks_similar(chunk1: str, chunk2: str) -> bool:
    return chunk1[:100].strip() == chunk2[:100].strip()


async def retrieve_top_chunk(resume_id: str, query: str) -> str:
    query_vector = await get_local_embedding(query)
    collection = get_or_create_collection(resume_id)

    results = collection.query(
        query_embeddings=[query_vector],
        n_results=1,
        include=["documents", "metadatas", "distances"],
    )

    if not results["documents"] or not results["documents"][0]:
        raise ValueError(f"No chunks found for resume_id={resume_id}")

    return results["documents"][0][0]


def build_retrieval_query(
    target_role: str,
    question_type: str,
    exclude_chunks: list = None,
) -> str:
    type_keywords = {
        "behavioural": "leadership collaboration conflict resolution team management",
        "technical": "technical skills tools technologies implementation architecture",
        "situational": "problem solving decision making challenges outcomes results",
    }
    keywords = type_keywords.get(question_type, "experience skills achievements")
    return f"{target_role} {keywords}"