import uuid
from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException
from app.db.supabase import get_supabase
from app.models.session import SessionStartRequest, SessionStartResponse

router = APIRouter(prefix="/session", tags=["Session"])


@router.post("/start", response_model=SessionStartResponse)
async def start_session(req: SessionStartRequest):
    session_id = str(uuid.uuid4())
    created_at = datetime.now(timezone.utc)
    supabase = get_supabase()

    resume = supabase.table("resumes").select("id").eq(
        "id", req.resume_id
    ).execute()

    if not resume.data:
        raise HTTPException(status_code=404, detail="Resume not found.")

    supabase.table("sessions").insert({
        "id": session_id,
        "resume_id": req.resume_id,
        "target_role": req.target_role,
        "seniority": req.seniority,
        "question_type": req.question_type,
        "status": "active",
        "total_questions": 0,
        "created_at": created_at.isoformat(),
    }).execute()

    return SessionStartResponse(
        session_id=session_id,
        target_role=req.target_role,
        seniority=req.seniority,
        created_at=created_at,
    )


@router.get("/history")
async def get_history(user_id: str = "anonymous"):
    supabase = get_supabase()
    result = supabase.table("sessions").select(
        "id, target_role, seniority, total_questions, avg_score, status, created_at"
    ).order("created_at", desc=True).execute()
    return result.data
@router.get("/{session_id}/detail")
async def get_session_detail(session_id: str):
    """
    Returns full session detail including all questions,
    transcripts, scores and ideal answers for revision.
    """
    supabase = get_supabase()

    # Get session info
    session = supabase.table("sessions").select(
        "id, target_role, seniority, total_questions, avg_score, created_at, status"
    ).eq("id", session_id).execute()

    if not session.data:
        raise HTTPException(status_code=404, detail="Session not found.")

    # Get all questions for this session
    questions = supabase.table("questions").select(
        "id, question_text, question_type, sequence_number, is_followup"
    ).eq("session_id", session_id).order(
        "sequence_number", desc=False
    ).execute()

    # Get all evaluations for this session
    evaluations = supabase.table("evaluations").select(
        "question_id, transcript, score_situation, score_task, "
        "score_action, score_result, score_relevance, overall_score, "
        "strengths, gaps, ideal_answer, coaching_tip, weak_dimension"
    ).eq("session_id", session_id).execute()

    # Map evaluations by question_id
    eval_map = {
        e["question_id"]: e
        for e in (evaluations.data or [])
    }

    # Combine questions with their evaluations
    qa_pairs = []
    for q in (questions.data or []):
        evaluation = eval_map.get(q["id"], {})
        qa_pairs.append({
            "sequence_number": q["sequence_number"],
            "question_id": q["id"],
            "question_text": q["question_text"],
            "question_type": q["question_type"],
            "is_followup": q["is_followup"],
            "transcript": evaluation.get("transcript", ""),
            "scores": {
                "situation": evaluation.get("score_situation", 0),
                "task": evaluation.get("score_task", 0),
                "action": evaluation.get("score_action", 0),
                "result": evaluation.get("score_result", 0),
                "relevance": evaluation.get("score_relevance", 0),
            },
            "overall_score": evaluation.get("overall_score", 0),
            "strengths": evaluation.get("strengths", ""),
            "gaps": evaluation.get("gaps", ""),
            "ideal_answer": evaluation.get("ideal_answer", ""),
            "coaching_tip": evaluation.get("coaching_tip", ""),
            "weak_dimension": evaluation.get("weak_dimension", ""),
        })

    return {
        "session": session.data[0],
        "qa_pairs": qa_pairs,
    }