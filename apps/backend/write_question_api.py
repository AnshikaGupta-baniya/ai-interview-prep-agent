content = """import uuid
from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException
from app.db.supabase import get_supabase
from app.models.question import QuestionGenerateRequest, QuestionGenerateResponse
from app.services.retriever import retrieve_diverse_chunk, build_retrieval_query
from app.services.question_generator import generate_question

router = APIRouter(prefix="/question", tags=["Question"])


@router.post("/generate", response_model=QuestionGenerateResponse)
async def generate_question_endpoint(req: QuestionGenerateRequest):
    supabase = get_supabase()

    # Get session details
    session = supabase.table("sessions").select(
        "id, resume_id, target_role, seniority, question_type, total_questions"
    ).eq("id", req.session_id).execute()

    if not session.data:
        raise HTTPException(status_code=404, detail="Session not found.")

    s = session.data[0]

    # Get all questions already asked in this session
    # to know which chunks have been used
    asked = supabase.table("questions").select(
        "resume_chunk, sequence_number"
    ).eq("session_id", req.session_id).execute()

    used_chunks = [q["resume_chunk"] for q in (asked.data or [])]

    # Get last evaluation score to decide follow-up vs new chunk
    last_eval = supabase.table("evaluations").select(
        "overall_score, weak_dimension"
    ).eq("session_id", req.session_id).order(
        "created_at", desc=True
    ).limit(1).execute()

    last_score = None
    weak_dimension = None
    should_followup = False

    if last_eval.data:
        last_score = last_eval.data[0]["overall_score"]
        weak_dimension = last_eval.data[0]["weak_dimension"]
        # Only follow up if score is genuinely weak (< 3)
        should_followup = last_score < 3 and req.is_followup

    # Question type rotation — assess different skills
    question_type_rotation = [
        "behavioural", "technical", "situational",
        "behavioural", "technical", "situational",
        "behavioural", "technical", "situational",
        "behavioural",
    ]
    sequence = s["total_questions"]
    question_type = question_type_rotation[sequence % len(question_type_rotation)]

    # Build retrieval query
    query = build_retrieval_query(
        target_role=s["target_role"],
        question_type=question_type,
        exclude_chunks=used_chunks if not should_followup else [],
    )

    # Retrieve chunk — diverse if moving forward, same if following up
    if should_followup and used_chunks:
        resume_chunk = used_chunks[-1]  # reuse last chunk for follow-up
    else:
        resume_chunk = await retrieve_diverse_chunk(
            resume_id=s["resume_id"],
            query=query,
            used_chunks=used_chunks,
        )

    # Generate question
    question_text = await generate_question(
        resume_chunk=resume_chunk,
        target_role=s["target_role"],
        seniority=s["seniority"],
        question_type=question_type,
        is_followup=should_followup,
        weak_dimension=weak_dimension if should_followup else None,
    )

    # Save question
    question_id = str(uuid.uuid4())
    new_sequence = s["total_questions"] + 1

    supabase.table("questions").insert({
        "id": question_id,
        "session_id": req.session_id,
        "resume_chunk": resume_chunk,
        "question_text": question_text,
        "question_type": question_type,
        "sequence_number": new_sequence,
        "is_followup": should_followup,
        "parent_question_id": req.parent_question_id,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }).execute()

    supabase.table("sessions").update({
        "total_questions": new_sequence
    }).eq("id", req.session_id).execute()

    return QuestionGenerateResponse(
        question_id=question_id,
        question_text=question_text,
        resume_chunk=resume_chunk,
        question_type=question_type,
        is_followup=should_followup,
    )
"""

with open("app/api/question.py", "w", encoding="utf-8") as f:
    f.write(content)
print("question.py updated")
