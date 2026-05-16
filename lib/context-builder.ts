import { Difficulty, QuestionType } from '@/types'

const DIFFICULTY_CALIBRATION: Record<Difficulty, string> = {
  easy: 'entry-level analyst or recent graduate entering consulting or business',
  medium: 'associate-level professional or MBA hire with 2-4 years of experience',
  hard: 'experienced manager, principal, or senior leader with 6+ years of experience',
}

const BASE_PERSONA = `You are an expert behavioral interview coach specializing in business and management consulting. You think in structured frameworks (MECE, hypothesis-driven analysis, stakeholder mapping, issue trees) and evaluate answers by the standards of top-tier consulting firms (McKinsey, BCG, Bain) and corporate strategy roles. You are direct, precise, and constructive.`

export function buildSystemContext(opts: {
  resumeText: string | null
  jobDescription: string | null
  questionType: QuestionType
  difficulty: Difficulty
}): string {
  const parts: string[] = [BASE_PERSONA]

  if (opts.resumeText) {
    parts.push(`\n<candidate_profile>\n${opts.resumeText}\n</candidate_profile>`)
  }

  if (opts.jobDescription) {
    const jd = opts.jobDescription.slice(0, 1500)
    parts.push(`\n<target_role>\n${jd}\n</target_role>`)
  }

  parts.push(
    `\nCalibrate your questions and feedback for a ${DIFFICULTY_CALIBRATION[opts.difficulty]}.`
  )

  return parts.join('\n')
}
