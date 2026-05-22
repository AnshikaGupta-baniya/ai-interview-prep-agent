// Shared TypeScript types across the entire app

export interface ParsedResume {
  full_name: string | null;
  email: string | null;
  summary: string | null;
  skills: string[];
  work_experiences: WorkExperience[];
  education: Education[];
  certifications: string[];
  projects: string[];
}

export interface WorkExperience {
  company: string;
  role: string;
  start_date: string | null;
  end_date: string | null;
  responsibilities: string[];
  achievements: string[];
  technologies: string[];
}

export interface Education {
  institution: string;
  degree: string;
  field: string | null;
  graduation_year: string | null;
}

export interface ResumeUploadResponse {
  resume_id: string;
  parsed_json: ParsedResume;
  chunk_count: number;
  status: string;
  created_at: string;
}

export interface SessionStartResponse {
  session_id: string;
  target_role: string;
  seniority: string;
  created_at: string;
}

export interface QuestionResponse {
  question_id: string;
  question_text: string;
  resume_chunk: string;
  question_type: string;
  is_followup: boolean;
}

export interface StarScores {
  situation: number;
  task: number;
  action: number;
  result: number;
  relevance: number;
}

export interface EvaluationResponse {
  evaluation_id: string;
  scores: StarScores;
  overall_score: number;
  strengths: string;
  gaps: string;
  ideal_answer: string;
  coaching_tip: string;
  follow_up_question: string | null;
  weak_dimension: string | null;
}

export interface SessionSummary {
  session_id: string;
  target_role: string;
  seniority: string;
  total_questions: number;
  avg_score: number | null;
  status: string;
  created_at: string;
}
