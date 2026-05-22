from typing import Optional


def build_question_prompt(
    resume_chunk: str,
    target_role: str,
    seniority: str,
    question_type: str,
    is_followup: bool = False,
    weak_dimension: Optional[str] = None,
) -> list[dict]:

    followup_instruction = ""

    if is_followup and weak_dimension:
        followup_instruction = (
            f"\nThis is a follow-up. "
            f"The candidate was weak on '{weak_dimension}'. "
            f"Drill deeper into that area."
        )

    system = (
        f"You are a senior interviewer for "
        f"{seniority}-level {target_role} roles. "
        f"You ask sharp, realistic interview questions. "
        f"Return ONLY the question text."
    )

    user = f"""Candidate experience:
\"\"\"{resume_chunk}\"\"\"

Generate 1 {question_type} interview question.

Requirements:
- Grounded in the experience above
- Appropriate for {seniority} {target_role}
- Sounds like a real interviewer
{followup_instruction}

Return ONLY the question text.
"""

    return [
        {"role": "system", "content": system},
        {"role": "user", "content": user},
    ]