export type QuestionType = 'behavioral' | 'open-ended' | 'situational'
export type Difficulty = 'easy' | 'medium' | 'hard'
export type AnswerMode = 'text' | 'multiple-choice'

export interface SessionConfig {
  questionType: QuestionType
  difficulty: Difficulty
  jobDescription: string | null
  resumeText: string | null
  resumeFileName: string | null
}

export interface Choice {
  id: 'A' | 'B' | 'C' | 'D'
  text: string
}

export interface Question {
  id: string
  text: string
  type: QuestionType
  difficulty: Difficulty
  choices: Choice[] | null
  followUp: string | null
}

export interface Answer {
  questionId: string
  mode: AnswerMode
  textAnswer: string | null
  selectedChoice: 'A' | 'B' | 'C' | 'D' | null
}

export interface StarEvaluation {
  situation: string
  task: string
  action: string
  result: string
}

export interface FeedbackResult {
  questionId: string
  strengths: string[]
  improvements: string[]
  starEvaluation: StarEvaluation | null
  overallScore: 1 | 2 | 3 | 4 | 5
  sampleAnswer: string
  rawMarkdown: string
}

export interface InterviewSession {
  id: string
  createdAt: string
  config: SessionConfig
  questions: Question[]
  answers: Answer[]
  feedback: FeedbackResult[]
  currentQuestionIndex: number
  phase: 'setup' | 'interview' | 'results'
}
