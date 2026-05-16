interface Props {
  value: string
  onChange: (v: string) => void
  disabled?: boolean
}

export default function TextAnswerInput({ value, onChange, disabled }: Props) {
  const wordCount = value.trim() ? value.trim().split(/\s+/).length : 0
  const isShort = wordCount > 0 && wordCount < 50

  return (
    <div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        placeholder="Type your answer here. Use the STAR framework: describe the Situation, your Task, the Actions you took, and the Results you achieved..."
        rows={7}
        className="w-full text-sm border border-slate-200 rounded-xl px-4 py-3 resize-none focus:outline-none focus:ring-2 focus:ring-brand-500 placeholder:text-slate-300 disabled:bg-slate-50 disabled:text-slate-400 leading-relaxed"
      />
      <div className="flex justify-between items-center mt-1.5 px-1">
        <span className={`text-xs ${isShort ? 'text-amber-600' : 'text-slate-400'}`}>
          {wordCount > 0 ? `${wordCount} word${wordCount !== 1 ? 's' : ''}` : ''}
          {isShort ? ' — aim for 50+ words for detailed feedback' : ''}
        </span>
      </div>
    </div>
  )
}
