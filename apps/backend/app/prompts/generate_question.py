from typing import Optional


def build_question_prompt(
    resume_chunk: str,
    target_role: str,
    seniority: str,
    question_type: str,
    is_followup: bool = False,
    weak_dimension: str | None = None,
    used_questions: list | None = None,
) -> list[dict]:

    followup_instruction = ""
    if is_followup and weak_dimension:
        followup_instruction = (
            f"\nThis is a follow-up. The candidate scored poorly on "
            f"'{weak_dimension}'. Drill deeper into that dimension only."
        )

    # Build used questions warning for the LLM
    used_questions_block = ""
    if used_questions:
        # Only show last 10 to avoid token overflow
        recent = used_questions[-10:]
        formatted = "\n".join(f"- {q}" for q in recent)
        used_questions_block = f"""
IMPORTANT — These questions have already been asked. 
Do NOT repeat or rephrase any of these:
{formatted}
"""

    type_instructions = {
        "behavioural": (
            "Ask a behavioural question using STAR framing. "
            "Focus on leadership, teamwork, conflict, or communication."
        ),
        "technical": (
            "Ask a technical question about specific tools, technologies, "
            "or methodologies mentioned. Probe depth of knowledge."
        ),
        "situational": (
            "Ask a situational question about a specific challenge, "
            "decision, or outcome. Focus on problem-solving and results."
        ),
    }

    type_instruction = type_instructions.get(
        question_type,
        "Ask an insightful interview question."
    )

    system = (
        f"You are a senior interviewer for {seniority}-level "
        f"{target_role} roles. "
        f"You ask sharp, specific, non-repetitive questions. "
        f"Every question must assess a completely new angle. "
        f"Return ONLY the question text. No preamble."
    )

    user = f"""Candidate experience:
\"\"\"{resume_chunk}\"\"\"

{type_instruction}
{followup_instruction}
{used_questions_block}

Requirements:
- Grounded in the specific experience above
- Calibrated for {seniority} {target_role} level
- Completely different angle from all previously asked questions
- One question only

Return ONLY the question text."""

    return [
        {"role": "system", "content": system},
        {"role": "user", "content": user},
    ]