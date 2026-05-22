def build_evaluation_prompt(
    question: str,
    resume_chunk: str,
    transcript: str,
    target_role: str,
    seniority: str,
) -> list[dict]:

    system = (
        f"You are a senior hiring expert evaluating a {seniority}-level "
        f"{target_role} candidate using the STAR framework. "
        f"Return ONLY valid JSON. No markdown. No explanation outside JSON."
    )

    user = f"""Evaluate this interview answer:

QUESTION: {question}

CANDIDATE EXPERIENCE (from resume — ground ideal answer in this):
{resume_chunk}

CANDIDATE ANSWER:
{transcript}

Return this exact JSON:
{{
  "scores": {{
    "situation": <1-5>,
    "task": <1-5>,
    "action": <1-5>,
    "result": <1-5>,
    "relevance": <1-5>
  }},
  "strengths": "<1-2 sentences>",
  "gaps": "<1-2 sentences>",
  "ideal_answer": "<model STAR answer using candidate resume experience>",
  "coaching_tip": "<one specific actionable tip referencing their exact words>",
  "follow_up_question": "<drill-down on the weakest STAR dimension>",
  "weak_dimension": "<situation|task|action|result|relevance>"
}}
"""

    return [
        {"role": "system", "content": system},
        {"role": "user", "content": user},
    ]