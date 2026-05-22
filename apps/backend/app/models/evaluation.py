from pydantic import BaseModel, Field
from typing import Optional


class StarScores(BaseModel):
    situation: int = Field(..., ge=1, le=5)
    task: int = Field(..., ge=1, le=5)
    action: int = Field(..., ge=1, le=5)
    result: int = Field(..., ge=1, le=5)
    relevance: int = Field(..., ge=1, le=5)

    @property
    def overall(self) -> float:
        return round(
            (self.situation + self.task + self.action +
             self.result + self.relevance) / 5, 2
        )


class EvaluateRequest(BaseModel):
    question_id: str
    session_id: str
    transcript: str


class EvaluationResponse(BaseModel):
    evaluation_id: str
    scores: StarScores
    overall_score: float
    strengths: str
    gaps: str
    ideal_answer: str
    coaching_tip: str
    follow_up_question: Optional[str] = None
    weak_dimension: Optional[str] = None