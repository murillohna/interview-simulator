'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { InterviewSession, Question, Answer, FeedbackResult, AnswerMode } from '@/types'
import { getSession, updateSession } from '@/lib/session'
import Header from '@/components/layout/Header'
import ProgressBar from '@/components/layout/ProgressBar'
import QuestionCard from '@/components/interview/QuestionCard'
import AnswerModeToggle from '@/components/interview/AnswerModeToggle'
import TextAnswerInput from '@/components/interview/TextAnswerInput'
import MultipleChoiceInput from '@/components/interview/MultipleChoiceInput'
import SubmitButton from '@/components/interview/SubmitButton'
import StreamingText from '@/components/results/StreamingText'
import { ArrowRight, RefreshCw } from 'lucide-react'

const TOTAL_QUESTIONS = 5

function parseFeedback(markdown: string, questionId: string): FeedbackResult {
  const sections = markdown.split(/^## /m).filter(Boolean)
  const get = (heading: string) =>
    sections.find((s) => s.toLowerCase().startsWith(heading.toLowerCase()))?.replace(/^[^\n]+\n/, '') ?? ''

  const bulletLines = (text: string) =>
    text
      .split('\n')
      .filter((l) => l.trim().startsWith('- '))
      .map((l) => l.trim().slice(2).trim())
      .filter(Boolean)

  const strengths = bulletLines(get('strengths'))
  const improvements = bulletLines(get('areas for improvement'))
  const sampleAnswer = get('sample answer').trim()

  const scoreMatch = markdown.match(/## Score\s*\n\s*(\d)/)
  const overallScore = Math.min(5, Math.max(1, parseInt(scoreMatch?.[1] ?? '3'))) as 1|2|3|4|5

  const starSection = get('star breakdown')
  let starEvaluation = null
  if (starSection) {
    const extract = (label: string) => {
      const m = starSection.match(new RegExp(`\\*\\*${label}:\\*\\*\\s*([^\\n]+)`))
      return m?.[1]?.trim() ?? ''
    }
    starEvaluation = {
      situation: extract('Situation'),
      task: extract('Task'),
      action: extract('Action'),
      result: extract('Result'),
    }
  }

  return { questionId, strengths, improvements, starEvaluation, overallScore, sampleAnswer, rawMarkdown: markdown }
}

export default function InterviewPage() {
  const router = useRouter()
  const [session, setSession] = useState<InterviewSession | null>(null)
  const [question, setQuestion] = useState<Question | null>(null)
  const [answerMode, setAnswerMode] = useState<AnswerMode>('text')
  const [textAnswer, setTextAnswer] = useState('')
  const [selectedChoice, setSelectedChoice] = useState<'A'|'B'|'C'|'D' | null>(null)
  const [loadingQuestion, setLoadingQuestion] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [streamedText, setStreamedText] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [feedbackDone, setFeedbackDone] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchQuestion = useCallback(async (s: InterviewSession, mode: AnswerMode = 'text') => {
    setLoadingQuestion(true)
    setError(null)
    setStreamedText('')
    setFeedbackDone(false)
    setTextAnswer('')
    setSelectedChoice(null)
    try {
      const res = await fetch('/api/generate-question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionType: s.config.questionType,
          difficulty: s.config.difficulty,
          jobDescription: s.config.jobDescription,
          resumeText: s.config.resumeText,
          previousQuestions: s.questions.map((q) => q.text),
          answerMode: mode,
        }),
      })
      if (!res.ok) throw new Error('Failed to generate question')
      const data = await res.json()
      const q: Question = data.question
      setQuestion(q)
      const updated = updateSession(s, { questions: [...s.questions, q] })
      setSession(updated)
    } catch {
      setError('Failed to load question. Please try again.')
    } finally {
      setLoadingQuestion(false)
    }
  }, [])

  useEffect(() => {
    const s = getSession()
    if (!s || s.phase !== 'interview') {
      router.replace('/setup')
      return
    }
    setSession(s)
    if (s.questions.length > s.currentQuestionIndex) {
      setQuestion(s.questions[s.currentQuestionIndex])
    } else {
      fetchQuestion(s, 'text')
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function handleSubmit() {
    if (!session || !question) return
    const answer: Answer = {
      questionId: question.id,
      mode: answerMode,
      textAnswer: answerMode === 'text' ? textAnswer : null,
      selectedChoice: answerMode === 'multiple-choice' ? selectedChoice : null,
    }

    const updatedSession = updateSession(session, { answers: [...session.answers, answer] })
    setSession(updatedSession)
    setSubmitting(true)
    setIsStreaming(true)
    setStreamedText('')
    setError(null)

    try {
      const res = await fetch('/api/generate-feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question,
          answer,
          jobDescription: session.config.jobDescription,
          resumeText: session.config.resumeText,
        }),
      })
      if (!res.ok || !res.body) throw new Error('Feedback failed')

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let fullText = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value)
        fullText += chunk
        setStreamedText(fullText)
      }

      setIsStreaming(false)
      const fb = parseFeedback(fullText, question.id)
      const finalSession = updateSession(updatedSession, {
        feedback: [...updatedSession.feedback, fb],
      })
      setSession(finalSession)
      setFeedbackDone(true)
    } catch {
      setIsStreaming(false)
      setError('Failed to get feedback. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  function handleNext() {
    if (!session) return
    const nextIndex = session.currentQuestionIndex + 1
    if (nextIndex >= TOTAL_QUESTIONS) {
      const finalSession = updateSession(session, { phase: 'results' })
      setSession(finalSession)
      router.push('/results')
      return
    }
    const updated = updateSession(session, { currentQuestionIndex: nextIndex })
    setSession(updated)
    setQuestion(null)
    setAnswerMode('text')
    fetchQuestion(updated, 'text')
  }

  const currentIndex = session?.currentQuestionIndex ?? 0
  const canSubmit =
    answerMode === 'text' ? textAnswer.trim().length > 0 : selectedChoice !== null

  if (!session) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-brand-500 border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Header showExit />
      <main className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        <ProgressBar current={currentIndex + 1} total={TOTAL_QUESTIONS} />

        {loadingQuestion ? (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 flex flex-col items-center gap-3">
            <div className="animate-spin rounded-full h-7 w-7 border-2 border-brand-500 border-t-transparent" />
            <p className="text-sm text-slate-400">Generating your question...</p>
          </div>
        ) : question ? (
          <>
            <QuestionCard question={question} />

            {!feedbackDone && (
              <div className="space-y-4">
                <AnswerModeToggle
                  value={answerMode}
                  onChange={setAnswerMode}
                  disabled={submitting}
                  hasChoices={!!question.choices && question.choices.length > 0}
                />

                {answerMode === 'text' || !question.choices ? (
                  <TextAnswerInput
                    value={textAnswer}
                    onChange={setTextAnswer}
                    disabled={submitting}
                  />
                ) : (
                  <MultipleChoiceInput
                    choices={question.choices}
                    selected={selectedChoice}
                    onChange={setSelectedChoice}
                    disabled={submitting}
                  />
                )}

                <SubmitButton
                  onClick={handleSubmit}
                  disabled={!canSubmit}
                  loading={submitting}
                />
              </div>
            )}

            {(streamedText || isStreaming) && (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                <h3 className="text-sm font-semibold text-slate-700 mb-4">AI Feedback</h3>
                <StreamingText text={streamedText} isStreaming={isStreaming} />
              </div>
            )}

            {error && (
              <div className="flex items-center justify-between bg-rose-50 border border-rose-200 rounded-xl p-4">
                <p className="text-sm text-rose-700">{error}</p>
                <button
                  onClick={() => feedbackDone ? handleNext() : handleSubmit()}
                  className="flex items-center gap-1.5 text-xs font-medium text-rose-700 hover:text-rose-900"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Retry
                </button>
              </div>
            )}

            {feedbackDone && (
              <button
                onClick={handleNext}
                className="w-full py-3 px-6 bg-slate-800 text-white font-semibold rounded-xl hover:bg-slate-900 transition-colors flex items-center justify-center gap-2 shadow-sm"
              >
                {currentIndex + 1 >= TOTAL_QUESTIONS ? 'See Full Results' : 'Next Question'}
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </>
        ) : null}
      </main>
    </div>
  )
}
