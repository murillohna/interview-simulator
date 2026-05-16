import { Send } from 'lucide-react'

interface Props {
  onClick: () => void
  disabled: boolean
  loading: boolean
}

export default function SubmitButton({ onClick, disabled, loading }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || loading}
      className="w-full py-3 px-6 bg-brand-600 text-white font-semibold rounded-xl hover:bg-brand-700 active:bg-brand-800 transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
    >
      {loading ? (
        <>
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
          Analyzing your answer...
        </>
      ) : (
        <>
          <Send className="w-4 h-4" />
          Submit Answer
        </>
      )}
    </button>
  )
}
