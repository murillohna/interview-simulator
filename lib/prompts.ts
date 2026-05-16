import { Answer, Question, QuestionType, Difficulty } from '@/types'

const TYPE_DESCRIPTIONS: Record<QuestionType, string> = {
  behavioral:
    'behavioral (STAR method — Situation, Task, Action, Result) focusing on past experience and demonstrated competencies',
  'open-ended':
    'open-ended case or analytical question that tests business acumen and structured thinking',
  situational:
    'situational judgment question presenting a hypothetical scenario to assess decision-making and values',
}

const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  easy: 'Easy',
  medium: 'Medium',
  hard: 'Hard',
}

export function buildQuestionPrompt(opts: {
  questionType: QuestionType
  difficulty: Difficulty
  previousQuestions: string[]
  answerMode: 'text' | 'multiple-choice'
  hasResume: boolean
  hasJobDescription: boolean
}): string {
  const avoidList =
    opts.previousQuestions.length > 0
      ? `\nDo NOT repeat or closely paraphrase any of these previously asked questions:\n${opts.previousQuestions.map((q, i) => `${i + 1}. ${q}`).join('\n')}`
      : ''

  const personalization =
    opts.hasResume || opts.hasJobDescription
      ? '\nPersonalize the question using the candidate profile and/or target role provided in the system context.'
      : '\nFocus on consulting and business strategy competencies typical of a professional services environment.'

  if (opts.answerMode === 'multiple-choice') {
    return `Generate one ${TYPE_DESCRIPTIONS[opts.questionType]} interview question at ${DIFFICULTY_LABELS[opts.difficulty]} difficulty level.${personalization}${avoidList}

Return valid JSON matching this schema exactly (no extra text, no markdown code fences):
{
  "questionText": "<the interview question>",
  "choices": [
    { "id": "A", "text": "<plausible but suboptimal answer>" },
    { "id": "B", "text": "<clearly strong answer demonstrating best practice>" },
    { "id": "C", "text": "<plausible but suboptimal answer>" },
    { "id": "D", "text": "<weak or evasive answer>" }
  ],
  "followUp": "<optional follow-up question an interviewer might ask, or null>"
}

Ensure exactly one choice (B) is clearly the strongest answer. The others should be plausible but miss key elements.`
  }

  return `Generate one ${TYPE_DESCRIPTIONS[opts.questionType]} interview question at ${DIFFICULTY_LABELS[opts.difficulty]} difficulty level.${personalization}${avoidList}

Return valid JSON matching this schema exactly (no extra text, no markdown code fences):
{
  "questionText": "<the interview question>",
  "choices": null,
  "followUp": "<optional follow-up question an interviewer might ask, or null>"
}`
}

export function buildFeedbackPrompt(opts: {
  question: Question
  answer: Answer
  questionType: QuestionType
}): string {
  const answerText =
    opts.answer.mode === 'text'
      ? opts.answer.textAnswer || '(no answer provided)'
      : opts.answer.selectedChoice
        ? `Selected option ${opts.answer.selectedChoice}: ${
            opts.question.choices?.find((c) => c.id === opts.answer.selectedChoice)?.text ||
            '(unknown option)'
          }`
        : '(no option selected)'

  const starSection =
    opts.questionType === 'behavioral'
      ? `
## STAR Breakdown
**Situation:** <assess whether the situation was clearly defined>
**Task:** <assess whether the candidate's specific responsibility was clear>
**Action:** <assess the quality and specificity of actions described>
**Result:** <assess whether a concrete, measurable result was provided>`
      : ''

  return `Evaluate this interview answer for a consulting/business professional. Be specific, honest, and constructive.

**Question:** ${opts.question.text}

**Candidate's Answer:** ${answerText}

Respond using this exact markdown structure (no deviations):

## Strengths
- <specific strength observed in the answer>
- <another strength, or omit if fewer than 2>

## Areas for Improvement
- <specific gap or missed element>
- <another gap, or omit if fewer than 2>${starSection}

## Sample Answer
<A strong model answer for this question, 3-5 sentences, tailored to the candidate's background if available>

## Score
<Single integer from 1 to 5, where 1=poor, 3=adequate, 5=excellent>`
}
