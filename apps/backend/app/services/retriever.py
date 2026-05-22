import asyncio

from sentence_transformers import SentenceTransformer

from app.db.chroma import get_or_create_collection

_model = None


def get_embedding_model():

    global _model

    if _model is None:
        _model = SentenceTransformer("all-MiniLM-L6-v2")

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


async def retrieve_top_chunk(resume_id, query):

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


def build_retrieval_query(target_role, question_type):

    return (
        f"{target_role} "
        f"{question_type} "
        f"experience leadership skills achievements"
    )