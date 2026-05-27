import uuid
from datetime import datetime, timezone
from fastapi import APIRouter, UploadFile, File, HTTPException, Depends, Form

from app.config import get_settings, Settings
from app.services.resume_parser import extract_text, parse_resume
from app.services.embedder import embed_and_index
from app.db.supabase import get_supabase
from app.models.resume import ResumeUploadResponse
from slowapi import Limiter
from slowapi.util import get_remote_address
from fastapi import Request

limiter = Limiter(key_func=get_remote_address)

router = APIRouter(prefix="/resume", tags=["Resume"])


@router.post("/upload", response_model=ResumeUploadResponse)
@limiter.limit("10/hour")
async def upload_resume(
    file: UploadFile = File(...),
    user_id: str = Form(default="anonymous"),
    settings: Settings = Depends(get_settings),
):
    # ── Validate file type ───────────────────────────────────────
    allowed = {
        "application/pdf",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    }
    if file.content_type not in allowed:
        raise HTTPException(status_code=400, detail="Only PDF and DOCX accepted.")

    file_bytes = await file.read()

    # ── Validate file size ───────────────────────────────────────
    size_mb = len(file_bytes) / (1024 * 1024)
    if size_mb > settings.max_resume_size_mb:
        raise HTTPException(status_code=413, detail=f"File exceeds {settings.max_resume_size_mb}MB.")

    resume_id = str(uuid.uuid4())

    # ── Upload to Supabase Storage ───────────────────────────────
    supabase = get_supabase()
    storage_path = f"{user_id}/{resume_id}/{file.filename}"
    supabase.storage.from_(settings.supabase_storage_bucket).upload(
        path=storage_path,
        file=file_bytes,
        file_options={"content-type": file.content_type},
    )
    file_url = supabase.storage.from_(
        settings.supabase_storage_bucket
    ).get_public_url(storage_path)

    # ── Extract text ─────────────────────────────────────────────
    raw_text = extract_text(file_bytes, file.filename)
    if not raw_text.strip():
        raise HTTPException(status_code=422, detail="Could not extract text. Is it a scanned image?")

    # ── Parse via GPT-4o ─────────────────────────────────────────
    parsed = await parse_resume(raw_text)

    # ── Embed + Index in ChromaDB ────────────────────────────────
    chunk_count = await embed_and_index(resume_id, parsed)

    # ── Save record to Supabase DB ───────────────────────────────
    created_at = datetime.now(timezone.utc)
    supabase.table("resumes").insert({
        "id": resume_id,
        "user_id": user_id,
        "file_name": file.filename,
        "file_url": file_url,
        "parsed_json": parsed.model_dump(),
        "embedding_model": settings.embedding_model,
        "chroma_collection_id": f"resume_{resume_id.replace('-', '_')}",
        "created_at": created_at.isoformat(),
    }).execute()

    return ResumeUploadResponse(
        resume_id=resume_id,
        parsed_json=parsed,
        chunk_count=chunk_count,
        status="indexed",
        created_at=created_at,
    )