import uuid
from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException
from app.db.supabase import get_supabase
from app.models.question import QuestionGenerateRequest, QuestionGenerateResponse
from app.services.retriever import retrieve_top_chunk, build_retrieval_query
from app.services.question_generator import generate_question

router = APIRouter(prefix="/question", tags=["Question"])


@router.post("/generate", response_model=QuestionGenerateResponse)
async def generate_question_endpoint(req: QuestionGenerateRequest):
    supabase = get_supabase()

    session = supabase.table("sessions").select(
        "id, resume_id, target_role, seniority, question_type, total_questions"
    ).eq("id", req.session_id).execute()

    if not session.data:
        raise HTTPException(status_code=404, detail="Session not found.")

    s = session.data[0]
    query = build_retrieval_query(s["target_role"], s["question_type"])
    resume_chunk = await retrieve_top_chunk(s["resume_id"], query)

    question_text = await generate_question(
        resume_chunk=resume_chunk,
        target_role=s["target_role"],
        seniority=s["seniority"],
        question_type=s["question_type"],
        is_followup=req.is_followup,
        weak_dimension=req.weak_dimension,
    )

    question_id = str(uuid.uuid4())
    sequence = s["total_questions"] + 1

    supabase.table("questions").insert({
        "id": question_id,
        "session_id": req.session_id,
        "resume_chunk": resume_chunk,
        "question_text": question_text,
        "question_type": s["question_type"],
        "sequence_number": sequence,
        "is_followup": req.is_followup,
        "parent_question_id": req.parent_question_id,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }).execute()

    supabase.table("sessions").update({
        "total_questions": sequence
    }).eq("id", req.session_id).execute()

    return QuestionGenerateResponse(
        question_id=question_id,
        question_text=question_text,
        resume_chunk=resume_chunk,
        question_type=s["question_type"],
        is_followup=req.is_followup,
    )
