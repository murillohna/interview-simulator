'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'

const MAX_CHARS = 2000

interface Props {
  value: string
  onChange: (v: string) => void
}

export default function JobDescriptionInput({ value, onChange }: Props) {
  const [open, setOpen] = useState(false)

  return (
    <div className="border border-slate-200 rounded-lg overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 hover:bg-slate-100 transition-colors text-left"
      >
        <div>
          <span className="text-sm font-medium text-slate-700">Job Description</span>
          <span className="ml-2 text-xs text-slate-400">(optional)</span>
          {value && !open && (
            <span className="ml-2 text-xs text-brand-600">● Added</span>
          )}
        </div>
        {open ? (
          <ChevronUp className="w-4 h-4 text-slate-400" />
        ) : (
          <ChevronDown className="w-4 h-4 text-slate-400" />
        )}
      </button>

      {open && (
        <div className="p-4 bg-white">
          <p className="text-xs text-slate-500 mb-2">
            Paste the job description to get role-specific questions.
          </p>
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value.slice(0, MAX_CHARS))}
            placeholder="e.g. We are looking for a strategy consultant with 3+ years of experience..."
            rows={5}
            className="w-full text-sm border border-slate-200 rounded-md px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-brand-500 placeholder:text-slate-300"
          />
          <div className="text-right text-xs text-slate-400 mt-1">
            {value.length}/{MAX_CHARS}
          </div>
        </div>
      )}
    </div>
  )
}
