from pydantic import BaseModel
from typing import Optional


class QuestionGenerateRequest(BaseModel):
    session_id: str
    is_followup: bool = False
    parent_question_id: Optional[str] = None
    # If followup, pass the weakest dimension so LLM can drill in
    weak_dimension: Optional[str] = None


class QuestionGenerateResponse(BaseModel):
    question_id: str
    question_text: str
    resume_chunk: str          # What RAG retrieved — shown in debug/dev mode
    question_type: str
    is_followup: bool