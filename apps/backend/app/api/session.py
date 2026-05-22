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
