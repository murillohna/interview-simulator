import { QuestionType } from '@/types'
import { Star, MessageSquare, Scale } from 'lucide-react'

const TYPES: { value: QuestionType; label: string; description: string; icon: React.ReactNode }[] =
  [
    {
      value: 'behavioral',
      label: 'Behavioral',
      description: 'STAR method — past experiences',
      icon: <Star className="w-4 h-4" />,
    },
    {
      value: 'open-ended',
      label: 'Case / Open-ended',
      description: 'Business analysis & strategy',
      icon: <MessageSquare className="w-4 h-4" />,
    },
    {
      value: 'situational',
      label: 'Situational',
      description: 'Hypothetical decision-making',
      icon: <Scale className="w-4 h-4" />,
    },
  ]

interface Props {
  value: QuestionType
  onChange: (v: QuestionType) => void
}

export default function QuestionTypeSelector({ value, onChange }: Props) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-2">Question Type</label>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        {TYPES.map((t) => (
          <button
            key={t.value}
            type="button"
            onClick={() => onChange(t.value)}
            className={`flex flex-col gap-1 p-3 rounded-lg border-2 text-left transition-all ${
              value === t.value
                ? 'border-brand-500 bg-brand-50 text-brand-700'
                : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
            }`}
          >
            <span className="flex items-center gap-1.5 font-medium text-sm">
              {t.icon}
              {t.label}
            </span>
            <span className="text-xs text-slate-500">{t.description}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
