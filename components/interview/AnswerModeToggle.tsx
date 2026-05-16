import { AnswerMode } from '@/types'
import { AlignLeft, List } from 'lucide-react'

interface Props {
  value: AnswerMode
  onChange: (v: AnswerMode) => void
  disabled?: boolean
  hasChoices: boolean
}

export default function AnswerModeToggle({ value, onChange, disabled, hasChoices }: Props) {
  if (!hasChoices) return null

  return (
    <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg w-fit">
      <button
        type="button"
        onClick={() => !disabled && onChange('text')}
        disabled={disabled}
        title={disabled ? 'Answer mode locks after the question is generated' : undefined}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
          value === 'text'
            ? 'bg-white text-slate-800 shadow-sm'
            : 'text-slate-500 hover:text-slate-700'
        } ${disabled ? 'cursor-not-allowed opacity-60' : ''}`}
      >
        <AlignLeft className="w-3.5 h-3.5" />
        Written
      </button>
      <button
        type="button"
        onClick={() => !disabled && onChange('multiple-choice')}
        disabled={disabled}
        title={disabled ? 'Answer mode locks after the question is generated' : undefined}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
          value === 'multiple-choice'
            ? 'bg-white text-slate-800 shadow-sm'
            : 'text-slate-500 hover:text-slate-700'
        } ${disabled ? 'cursor-not-allowed opacity-60' : ''}`}
      >
        <List className="w-3.5 h-3.5" />
        Multiple Choice
      </button>
    </div>
  )
}
