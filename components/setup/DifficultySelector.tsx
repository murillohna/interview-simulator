import { Difficulty } from '@/types'

const LEVELS: { value: Difficulty; label: string; sublabel: string; color: string }[] = [
  { value: 'easy', label: 'Easy', sublabel: 'Analyst / Grad', color: 'emerald' },
  { value: 'medium', label: 'Medium', sublabel: 'Associate / MBA', color: 'amber' },
  { value: 'hard', label: 'Hard', sublabel: 'Manager / Principal', color: 'rose' },
]

const SELECTED: Record<string, string> = {
  emerald: 'border-emerald-500 bg-emerald-50 text-emerald-700',
  amber: 'border-amber-500 bg-amber-50 text-amber-700',
  rose: 'border-rose-500 bg-rose-50 text-rose-700',
}

interface Props {
  value: Difficulty
  onChange: (v: Difficulty) => void
}

export default function DifficultySelector({ value, onChange }: Props) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-2">Difficulty</label>
      <div className="grid grid-cols-3 gap-2">
        {LEVELS.map((l) => (
          <button
            key={l.value}
            type="button"
            onClick={() => onChange(l.value)}
            className={`flex flex-col items-center gap-0.5 py-2.5 px-3 rounded-lg border-2 transition-all ${
              value === l.value
                ? SELECTED[l.color]
                : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
            }`}
          >
            <span className="font-semibold text-sm">{l.label}</span>
            <span className="text-xs text-slate-400">{l.sublabel}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
