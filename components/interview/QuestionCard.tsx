import { Question } from '@/types'
import { Star, MessageSquare, Scale } from 'lucide-react'

const TYPE_META = {
  behavioral: { label: 'Behavioral', icon: Star, color: 'bg-blue-100 text-blue-700' },
  'open-ended': { label: 'Case / Open-ended', icon: MessageSquare, color: 'bg-purple-100 text-purple-700' },
  situational: { label: 'Situational', icon: Scale, color: 'bg-teal-100 text-teal-700' },
}

const DIFF_COLORS = {
  easy: 'bg-emerald-100 text-emerald-700',
  medium: 'bg-amber-100 text-amber-700',
  hard: 'bg-rose-100 text-rose-700',
}

interface Props {
  question: Question
}

export default function QuestionCard({ question }: Props) {
  const meta = TYPE_META[question.type]
  const Icon = meta.icon

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
      <div className="flex flex-wrap gap-2 mb-4">
        <span className={`flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full ${meta.color}`}>
          <Icon className="w-3 h-3" />
          {meta.label}
        </span>
        <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${DIFF_COLORS[question.difficulty]}`}>
          {question.difficulty.charAt(0).toUpperCase() + question.difficulty.slice(1)}
        </span>
      </div>

      <p className="text-slate-800 text-lg font-medium leading-relaxed">{question.text}</p>

      {question.followUp && (
        <div className="mt-4 pt-4 border-t border-slate-100">
          <p className="text-xs text-slate-400 mb-1">Follow-up question</p>
          <p className="text-sm text-slate-600 italic">{question.followUp}</p>
        </div>
      )}
    </div>
  )
}
