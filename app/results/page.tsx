'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { InterviewSession } from '@/types'
import { getSession, clearSession } from '@/lib/session'
import Header from '@/components/layout/Header'
import FeedbackCard from '@/components/results/FeedbackCard'
import { Trophy, RotateCcw, Download } from 'lucide-react'
import Link from 'next/link'

function avgScore(scores: number[]) {
  if (!scores.length) return 0
  return Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10
}

const SCORE_LABEL: Record<string, string> = {
  '5': 'Outstanding',
  '4': 'Strong',
  '3': 'Solid',
  '2': 'Developing',
  '1': 'Needs Work',
}

function getScoreLabel(avg: number) {
  return SCORE_LABEL[String(Math.round(avg))] ?? 'Solid'
}

export default function ResultsPage() {
  const router = useRouter()
  const [session, setSession] = useState<InterviewSession | null>(null)

  useEffect(() => {
    const s = getSession()
    if (!s || s.feedback.length === 0) {
      router.replace('/setup')
      return
    }
    setSession(s)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function handleDownload() {
    if (!session) return
    const lines: string[] = ['InterviewIQ — Session Summary', '='.repeat(40), '']
    session.feedback.forEach((fb, i) => {
      const q = session.questions.find((q) => q.id === fb.questionId)
      const a = session.answers.find((a) => a.questionId === fb.questionId)
      lines.push(`Question ${i + 1}: ${q?.text ?? ''}`)
      lines.push(`Your answer: ${a?.textAnswer ?? `Option ${a?.selectedChoice}`}`)
      lines.push(`Score: ${fb.overallScore}/5`)
      lines.push('')
      lines.push('Strengths:')
      fb.strengths.forEach((s) => lines.push(`  - ${s}`))
      lines.push('Areas for Improvement:')
      fb.improvements.forEach((s) => lines.push(`  - ${s}`))
      if (fb.starEvaluation) {
        lines.push('')
        lines.push('STAR Breakdown:')
        const { situation, task, action, result } = fb.starEvaluation
        lines.push(`  S: ${situation}`)
        lines.push(`  T: ${task}`)
        lines.push(`  A: ${action}`)
        lines.push(`  R: ${result}`)
      }
      lines.push(`Sample Answer: ${fb.sampleAnswer}`)
      lines.push('')
      lines.push('-'.repeat(40))
      lines.push('')
    })

    const blob = new Blob([lines.join('\n')], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'interviewiq-summary.txt'
    a.click()
    URL.revokeObjectURL(url)
  }

  function handleRestart() {
    clearSession()
    router.push('/setup')
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-brand-500 border-t-transparent" />
      </div>
    )
  }

  const scores = session.feedback.map((f) => f.overallScore)
  const avg = avgScore(scores)
  const label = getScoreLabel(avg)

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <main className="max-w-2xl mx-auto px-4 py-10 space-y-8">
        {/* Summary header */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 text-center">
          <div className="w-14 h-14 bg-brand-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Trophy className="w-7 h-7 text-brand-600" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-1">Session Complete</h1>
          <p className="text-slate-500 text-sm mb-6">
            {session.feedback.length} question{session.feedback.length !== 1 ? 's' : ''} answered ·{' '}
            {session.config.questionType.charAt(0).toUpperCase() + session.config.questionType.slice(1)} ·{' '}
            {session.config.difficulty.charAt(0).toUpperCase() + session.config.difficulty.slice(1)}
          </p>

          <div className="flex items-center justify-center gap-6 mb-6">
            <div>
              <div className="text-4xl font-bold text-brand-600">{avg}</div>
              <div className="text-xs text-slate-400 mt-0.5">Avg Score</div>
            </div>
            <div className="h-12 w-px bg-slate-200" />
            <div>
              <div className="text-2xl font-bold text-slate-800">{label}</div>
              <div className="text-xs text-slate-400 mt-0.5">Overall</div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={handleDownload}
              className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <Download className="w-4 h-4" />
              Download Summary
            </button>
            <button
              onClick={handleRestart}
              className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 text-white text-sm font-semibold hover:bg-brand-700 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              Practice Again
            </button>
          </div>
        </div>

        {/* Individual feedback */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-slate-800">Question-by-Question Breakdown</h2>
          {session.feedback.map((fb, i) => {
            const q = session.questions.find((q) => q.id === fb.questionId)
            const a = session.answers.find((a) => a.questionId === fb.questionId)
            if (!q || !a) return null
            return <FeedbackCard key={fb.questionId} feedback={fb} question={q} answer={a} index={i} />
          })}
        </div>

        <div className="text-center pb-8">
          <Link href="/" className="text-sm text-slate-400 hover:text-slate-600 transition-colors">
            ← Back to home
          </Link>
        </div>
      </main>
    </div>
  )
}
