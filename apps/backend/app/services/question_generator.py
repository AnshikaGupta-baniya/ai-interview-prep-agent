from tenacity import retry, stop_after_attempt, wait_exponential
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
