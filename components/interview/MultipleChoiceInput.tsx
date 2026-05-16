import { Choice } from '@/types'

interface Props {
  choices: Choice[]
  selected: 'A' | 'B' | 'C' | 'D' | null
  onChange: (id: 'A' | 'B' | 'C' | 'D') => void
  disabled?: boolean
}

export default function MultipleChoiceInput({ choices, selected, onChange, disabled }: Props) {
  return (
    <div className="space-y-2">
      {choices.map((choice) => (
        <button
          key={choice.id}
          type="button"
          onClick={() => !disabled && onChange(choice.id)}
          disabled={disabled}
          className={`w-full flex items-start gap-3 p-4 rounded-xl border-2 text-left transition-all ${
            selected === choice.id
              ? 'border-brand-500 bg-brand-50'
              : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
          } ${disabled ? 'cursor-default' : 'cursor-pointer'}`}
        >
          <span
            className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 ${
              selected === choice.id
                ? 'border-brand-500 bg-brand-500 text-white'
                : 'border-slate-300 text-slate-500'
            }`}
          >
            {choice.id}
          </span>
          <span className="text-sm text-slate-700 leading-relaxed pt-0.5">{choice.text}</span>
        </button>
      ))}
    </div>
  )
}
