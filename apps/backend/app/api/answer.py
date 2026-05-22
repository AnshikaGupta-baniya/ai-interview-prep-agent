import uuid
from datetime import datetime, timezone
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from app.db.supabase import get_supabase
from app.services.transcriber import transcribe_audio
from app.services.evaluator import evaluate_answer
from app.models.evaluation import EvaluateRequest, EvaluationResponse, StarScores

router = APIRouter(prefix="/answer", tags=["Answer"])


@router.post("/transcribe")
async def transcribe(
    audio_file: UploadFile = File(...),
    question_id: str = Form(...),
):
    audio_bytes = await audio_file.read()
    if len(audio_bytes) == 0:
        raise HTTPException(status_code=400, detail="Empty audio file.")

    transcript = await transcribe_audio(
        audio_bytes=audio_bytes,
        filename=audio_file.filename or "answer.m4a",
    )

    return {
        "transcript": transcript,
        "question_id": question_id,
        "confidence": 1.0,
    }


@router.post("/evaluate", response_model=EvaluationResponse)
async def evaluate(req: EvaluateRequest):
    supabase = get_supabase()

    question = supabase.table("questions").select(
        "id, question_text, resume_chunk, session_id"
    ).eq("id", req.question_id).execute()

    if not question.data:
        raise HTTPException(status_code=404, detail="Question not found.")

    q = question.data[0]

    session = supabase.table("sessions").select(
        "target_role, seniority"
    ).eq("id", req.session_id).execute()

    if not session.data:
        raise HTTPException(status_code=404, detail="Session not found.")

    s = session.data[0]

    evaluation = await evaluate_answer(
        question=q["question_text"],
        resume_chunk=q["resume_chunk"],
        transcript=req.transcript,
        target_role=s["target_role"],
        seniority=s["seniority"],
    )

    evaluation_id = str(uuid.uuid4())
    overall = round(
        (evaluation["scores"]["situation"] +
         evaluation["scores"]["task"] +
         evaluation["scores"]["action"] +
         evaluation["scores"]["result"] +
         evaluation["scores"]["relevance"]) / 5, 2
    )

    supabase.table("evaluations").insert({
        "id": evaluation_id,
        "question_id": req.question_id,
        "session_id": req.session_id,
        "transcript": req.transcript,
        "score_situation": evaluation["scores"]["situation"],
        "score_task": evaluation["scores"]["task"],
        "score_action": evaluation["scores"]["action"],
        "score_result": evaluation["scores"]["result"],
        "score_relevance": evaluation["scores"]["relevance"],
        "overall_score": overall,
        "strengths": evaluation["strengths"],
        "gaps": evaluation["gaps"],
        "ideal_answer": evaluation["ideal_answer"],
        "coaching_tip": evaluation["coaching_tip"],
        "follow_up_question": evaluation.get("follow_up_question"),
        "weak_dimension": evaluation.get("weak_dimension"),
        "raw_llm_response": evaluation,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }).execute()

    evals = supabase.table("evaluations").select(
        "overall_score"
    ).eq("session_id", req.session_id).execute()

    if evals.data:
        avg = round(
            sum(e["overall_score"] for e in evals.data) / len(evals.data), 2
        )
        supabase.table("sessions").update({
            "avg_score": avg
        }).eq("id", req.session_id).execute()

    return EvaluationResponse(
        evaluation_id=evaluation_id,
        scores=StarScores(**evaluation["scores"]),
        overall_score=overall,
        strengths=evaluation["strengths"],
        gaps=evaluation["gaps"],
        ideal_answer=evaluation["ideal_answer"],
        coaching_tip=evaluation["coaching_tip"],
        follow_up_question=evaluation.get("follow_up_question"),
        weak_dimension=evaluation.get("weak_dimension"),
    )
