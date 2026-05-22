from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from enum import Enum


class SeniorityLevel(str, Enum):
    junior = "junior"
    mid = "mid"
    senior = "senior"
    lead = "lead"
    principal = "principal"


class QuestionType(str, Enum):
    behavioural = "behavioural"
    technical = "technical"
    situational = "situational"
    mixed = "mixed"


class SessionStartRequest(BaseModel):
    resume_id: str
    target_role: str = Field(..., example="Product Manager")
    seniority: SeniorityLevel
    question_type: QuestionType = QuestionType.mixed


class SessionStartResponse(BaseModel):
    session_id: str
    target_role: str
    seniority: str
    created_at: datetime


class SessionSummary(BaseModel):
    session_id: str
    target_role: str
    seniority: str
    total_questions: int
    avg_score: Optional[float] = None
    status: str
    created_at: datetime