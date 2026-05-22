import os

files = {}

files["app/api/session.py"] = """import uuid
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
"""

files["app/api/question.py"] = """import uuid
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
"""

files["app/api/answer.py"] = """import uuid
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
"""

files["app/services/transcriber.py"] = """import io
from groq import AsyncGroq
from app.config import get_settings


async def transcribe_audio(audio_bytes: bytes, filename: str) -> str:
    settings = get_settings()
    client = AsyncGroq(api_key=settings.groq_api_key)

    audio_file = (filename, io.BytesIO(audio_bytes), _get_mime_type(filename))

    transcription = await client.audio.transcriptions.create(
        file=audio_file,
        model=settings.whisper_model,
        language="en",
        response_format="text",
    )

    return transcription.strip()


def _get_mime_type(filename: str) -> str:
    ext = filename.lower().split(".")[-1]
    mime_map = {
        "m4a": "audio/m4a",
        "mp4": "audio/mp4",
        "mp3": "audio/mpeg",
        "wav": "audio/wav",
        "webm": "audio/webm",
        "ogg": "audio/ogg",
    }
    return mime_map.get(ext, "audio/m4a")
"""

files["app/services/evaluator.py"] = """import json
from tenacity import retry, stop_after_attempt, wait_exponential
from app.core.llm import chat_completion
from app.prompts.evaluate_answer import build_evaluation_prompt


@retry(stop=stop_after_attempt(3), wait=wait_exponential(min=2, max=10))
async def evaluate_answer(
    question: str,
    resume_chunk: str,
    transcript: str,
    target_role: str,
    seniority: str,
) -> dict:
    messages = build_evaluation_prompt(
        question=question,
        resume_chunk=resume_chunk,
        transcript=transcript,
        target_role=target_role,
        seniority=seniority,
    )

    raw = await chat_completion(
        messages=messages,
        temperature=0.3,
        max_tokens=1000,
        response_format={"type": "json_object"},
    )

    result = json.loads(raw)

    required = ["scores", "strengths", "gaps", "ideal_answer", "coaching_tip"]
    for field in required:
        if field not in result:
            raise ValueError(f"Missing field in evaluation: {field}")

    for dim in ["situation", "task", "action", "result", "relevance"]:
        score = result["scores"].get(dim, 3)
        result["scores"][dim] = max(1, min(5, int(score)))

    return result
"""

files["app/services/question_generator.py"] = """from tenacity import retry, stop_after_attempt, wait_exponential
from app.core.llm import chat_completion
from app.prompts.generate_question import build_question_prompt


@retry(stop=stop_after_attempt(3), wait=wait_exponential(min=2, max=10))
async def generate_question(
    resume_chunk: str,
    target_role: str,
    seniority: str,
    question_type: str,
    is_followup: bool = False,
    weak_dimension: str = None,
) -> str:
    messages = build_question_prompt(
        resume_chunk=resume_chunk,
        target_role=target_role,
        seniority=seniority,
        question_type=question_type,
        is_followup=is_followup,
        weak_dimension=weak_dimension,
    )

    question = await chat_completion(
        messages=messages,
        temperature=0.7,
        max_tokens=200,
    )

    return question.strip()
"""

for path, content in files.items():
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        f.write(content)
    print(f"Written: {path}")

print("\nAll backend files written successfully")
