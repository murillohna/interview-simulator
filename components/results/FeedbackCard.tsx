import { FeedbackResult, Question, Answer } from '@/types'
import { CheckCircle2, AlertCircle, Star } from 'lucide-react'
import StarBreakdown from './StarBreakdown'

const SCORE_LABELS: Record<number, { label: string; color: string }> = {
  1: { label: 'Needs Work', color: 'text-rose-600 bg-rose-50 border-rose-200' },
  2: { label: 'Fair', color: 'text-orange-600 bg-orange-50 border-orange-200' },
  3: { label: 'Adequate', color: 'text-amber-600 bg-amber-50 border-amber-200' },
  4: { label: 'Good', color: 'text-blue-600 bg-blue-50 border-blue-200' },
  5: { label: 'Excellent', color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
}

interface Props {
  feedback: FeedbackResult
  question: Question
  answer: Answer
  index: number
}

export default function FeedbackCard({ feedback, question, answer, index }: Props) {
  const scoreInfo = SCORE_LABELS[feedback.overallScore]
  const answerDisplay =
    answer.mode === 'text'
      ? answer.textAnswer
      : `Option ${answer.selectedChoice}: ${question.choices?.find((c) => c.id === answer.selectedChoice)?.text}`

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100 flex items-start justify-between gap-4">
        <div className="flex-1">
          <span className="text-xs font-medium text-slate-400 uppercase tracking-wide">
            Question {index + 1}
          </span>
          <p className="text-slate-800 font-medium mt-0.5">{question.text}</p>
        </div>
        <span className={`shrink-0 text-xs font-semibold px-3 py-1.5 rounded-full border ${scoreInfo.color}`}>
          {feedback.overallScore}/5 · {scoreInfo.label}
        </span>
      </div>

      {answerDisplay && (
        <div className="px-6 py-3 bg-slate-50 border-b border-slate-100">
          <p className="text-xs text-slate-400 mb-1">Your answer</p>
          <p className="text-sm text-slate-600 italic line-clamp-3">{answerDisplay}</p>
        </div>
      )}

      <div className="p-6 space-y-5">
        {feedback.strengths.length > 0 && (
          <div>
            <h4 className="flex items-center gap-1.5 text-sm font-semibold text-emerald-700 mb-2">
              <CheckCircle2 className="w-4 h-4" />
              Strengths
            </h4>
            <ul className="space-y-1">
              {feedback.strengths.map((s, i) => (
                <li key={i} className="text-sm text-slate-600 flex gap-2">
                  <span className="text-emerald-500 mt-0.5">·</span>
                  {s}
                </li>
              ))}
            </ul>
          </div>
        )}

        {feedback.improvements.length > 0 && (
          <div>
            <h4 className="flex items-center gap-1.5 text-sm font-semibold text-amber-700 mb-2">
              <AlertCircle className="w-4 h-4" />
              Areas for Improvement
            </h4>
            <ul className="space-y-1">
              {feedback.improvements.map((s, i) => (
                <li key={i} className="text-sm text-slate-600 flex gap-2">
                  <span className="text-amber-500 mt-0.5">·</span>
                  {s}
                </li>
              ))}
            </ul>
          </div>
        )}

        {feedback.starEvaluation && (
          <StarBreakdown star={feedback.starEvaluation} />
        )}

        {feedback.sampleAnswer && (
          <div className="pt-4 border-t border-slate-100">
            <h4 className="flex items-center gap-1.5 text-sm font-semibold text-slate-700 mb-2">
              <Star className="w-4 h-4 text-brand-500" />
              Sample Strong Answer
            </h4>
            <p className="text-sm text-slate-600 leading-relaxed bg-slate-50 rounded-lg p-3 border border-slate-200">
              {feedback.sampleAnswer}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
