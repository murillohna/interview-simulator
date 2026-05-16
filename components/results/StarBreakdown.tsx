import { StarEvaluation } from '@/types'

const LABELS = ['Situation', 'Task', 'Action', 'Result'] as const
const KEYS: (keyof StarEvaluation)[] = ['situation', 'task', 'action', 'result']

interface Props {
  star: StarEvaluation
}

export default function StarBreakdown({ star }: Props) {
  return (
    <div>
      <h4 className="text-sm font-semibold text-slate-700 mb-3">STAR Framework Breakdown</h4>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {LABELS.map((label, i) => (
          <div key={label} className="rounded-lg border border-slate-200 p-3 bg-slate-50">
            <span className="inline-block text-xs font-bold text-brand-700 bg-brand-100 px-1.5 py-0.5 rounded mb-1.5">
              {label.charAt(0)}
            </span>
            <p className="text-xs font-medium text-slate-700 mb-0.5">{label}</p>
            <p className="text-xs text-slate-500 leading-relaxed">{star[KEYS[i]]}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
