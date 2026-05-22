from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class WorkExperience(BaseModel):
    company: str
    role: str
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    responsibilities: list[str] = []
    achievements: list[str] = []
    technologies: list[str] = []


class Education(BaseModel):
    institution: str
    degree: str
    field: Optional[str] = None
    graduation_year: Optional[str] = None


class ParsedResume(BaseModel):
    full_name: Optional[str] = None
    email: Optional[str] = None
    summary: Optional[str] = None
    skills: list[str] = []
    work_experiences: list[WorkExperience] = []
    education: list[Education] = []
    certifications: list[str] = []
    projects: list[str] = []


class ResumeUploadResponse(BaseModel):
    resume_id: str
    parsed_json: ParsedResume
    chunk_count: int
    status: str = "indexed"
    created_at: datetime