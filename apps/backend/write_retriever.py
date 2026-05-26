content = """import asyncio
from sentence_transformers import SentenceTransformer
from app.db.chroma import get_or_create_collection

_model = None


def get_embedding_model() -> SentenceTransformer:
    global _model
    if _model is None:
        _model = SentenceTransformer("all-MiniLM-L6-v2")
    return _model


async def get_local_embedding(text: str) -> list:
    loop = asyncio.get_event_loop()
    model = get_embedding_model()
    vector = await loop.run_in_executor(
        None,
        lambda: model.encode(text, normalize_embeddings=True).tolist()
    )
    return vector


async def retrieve_diverse_chunk(
    resume_id: str,
    query: str,
    used_chunks: list,
    n_results: int = 10,
) -> str:
    '''
    Retrieves the most relevant chunk that has NOT been used yet.

    Strategy:
    1. Get top-N results from ChromaDB
    2. Filter out chunks already used in this session
    3. Return the best unused chunk
    4. If all chunks used — start over from the top result
       (session has covered all experience, cycle back)

    This ensures every question comes from a different
    work experience block until all are exhausted.
    '''
    query_vector = await get_local_embedding(query)
    collection = get_or_create_collection(resume_id)

    # Get more results so we have options to filter from
    results = collection.query(
        query_embeddings=[query_vector],
        n_results=min(n_results, collection.count()),
        include=["documents", "metadatas", "distances"],
    )

    if not results["documents"] or not results["documents"][0]:
        raise ValueError(f"No chunks found for resume_id={resume_id}")

    documents = results["documents"][0]

    # Find first chunk not yet used in this session
    for doc in documents:
        # Compare by content — avoid exact matches already used
        already_used = any(
            _chunks_similar(doc, used) for used in used_chunks
        )
        if not already_used:
            return doc

    # All chunks used — cycle back to top result
    # This handles resumes with few experience blocks
    return documents[0]


def _chunks_similar(chunk1: str, chunk2: str) -> bool:
    '''
    Checks if two chunks are from the same experience block.
    Compares first 100 chars as a fingerprint.
    '''
    return chunk1[:100].strip() == chunk2[:100].strip()


async def retrieve_top_chunk(resume_id: str, query: str) -> str:
    '''Original top-1 retrieval — kept for backward compatibility.'''
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
    '''
    Builds a semantic query for ChromaDB retrieval.
    Varies by question type to retrieve different aspects
    of the candidate's experience.
    '''
    type_keywords = {
        "behavioural": "leadership collaboration conflict resolution team management",
        "technical": "technical skills tools technologies implementation architecture",
        "situational": "problem solving decision making challenges outcomes results",
    }
    keywords = type_keywords.get(question_type, "experience skills achievements")
    return f"{target_role} {keywords}"
"""

with open("app/services/retriever.py", "w", encoding="utf-8") as f:
    f.write(content)
print("retriever.py updated")
