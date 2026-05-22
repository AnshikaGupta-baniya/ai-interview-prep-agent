from __future__ import annotations
import json
import fitz                          # PyMuPDF — import name is fitz
from docx import Document
from io import BytesIO
from tenacity import retry, stop_after_attempt, wait_exponential

from app.core.llm import chat_completion
from app.models.resume import ParsedResume
from app.prompts.parse_resume import build_parse_prompt


def extract_text_from_pdf(file_bytes: bytes) -> str:
    """
    PyMuPDF extracts text page by page.
    We join with newlines to preserve structure.
    """
    doc = fitz.open(stream=file_bytes, filetype="pdf")
    pages = [page.get_text() for page in doc]
    doc.close()
    return "\n".join(pages)


def extract_text_from_docx(file_bytes: bytes) -> str:
    """
    python-docx reads paragraph by paragraph.
    Tables and headers are included as paragraphs.
    """
    doc = Document(BytesIO(file_bytes))
    paragraphs = [p.text for p in doc.paragraphs if p.text.strip()]
    return "\n".join(paragraphs)


def extract_text(file_bytes: bytes, filename: str) -> str:
    """Router: choose parser based on file extension."""
    ext = filename.lower().split(".")[-1]
    if ext == "pdf":
        return extract_text_from_pdf(file_bytes)
    elif ext in ("docx", "doc"):
        return extract_text_from_docx(file_bytes)
    else:
        raise ValueError(f"Unsupported file type: .{ext}. Use PDF or DOCX.")


@retry(
    stop=stop_after_attempt(3),
    wait=wait_exponential(multiplier=1, min=2, max=10)
)
async def parse_resume(raw_text: str) -> ParsedResume:
    """
    Sends raw resume text to GPT-4o with JSON mode enabled.
    Retries up to 3 times with exponential backoff on failure.
    
    WHY JSON mode? It forces GPT-4o to always return valid JSON,
    eliminating parsing errors from markdown code blocks or prose.
    """
    messages = build_parse_prompt(raw_text)

    raw_json = await chat_completion(
        messages=messages,
        temperature=0.1,          # Low temp for factual extraction
        response_format={"type": "json_object"},
    )

    data = json.loads(raw_json)
    return ParsedResume(**data)