import json
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
