'use client'

import { useState, useRef, DragEvent } from 'react'
import { Upload, FileText, X, AlertCircle, CheckCircle2 } from 'lucide-react'

interface Props {
  resumeText: string | null
  resumeFileName: string | null
  onResumeChange: (text: string | null, fileName: string | null) => void
}

type Tab = 'upload' | 'paste'

export default function ResumeUploader({ resumeText, resumeFileName, onResumeChange }: Props) {
  const [tab, setTab] = useState<Tab>('upload')
  const [loading, setLoading] = useState(false)
  const [warning, setWarning] = useState<string | null>(null)
  const [pasteText, setPasteText] = useState(resumeText || '')
  const [dragging, setDragging] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  async function handleFile(file: File) {
    setLoading(true)
    setWarning(null)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await fetch('/api/parse-resume', { method: 'POST', body: formData })
      const data = await res.json()
      if (data.success) {
        onResumeChange(data.extractedText, data.fileName)
        if (data.warning) setWarning(data.warning)
      } else {
        setWarning('Failed to parse PDF. Try pasting your resume text instead.')
      }
    } catch {
      setWarning('Upload failed. Try pasting your resume text instead.')
    } finally {
      setLoading(false)
    }
  }

  async function handlePasteSave() {
    if (!pasteText.trim()) return
    setLoading(true)
    setWarning(null)
    try {
      const res = await fetch('/api/parse-resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: pasteText }),
      })
      const data = await res.json()
      if (data.success) {
        onResumeChange(data.extractedText, null)
        if (data.warning) setWarning(data.warning)
      }
    } finally {
      setLoading(false)
    }
  }

  function handleDrop(e: DragEvent) {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file?.type === 'application/pdf') handleFile(file)
  }

  return (
    <div className="border border-slate-200 rounded-lg overflow-hidden">
      <div className="flex border-b border-slate-200 bg-slate-50">
        {(['upload', 'paste'] as Tab[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
              tab === t
                ? 'bg-white text-brand-700 border-b-2 border-brand-500'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {t === 'upload' ? 'Upload PDF' : 'Paste Text'}
          </button>
        ))}
      </div>

      <div className="p-4 bg-white">
        {resumeText && (
          <div className="flex items-center justify-between mb-3 p-2 bg-emerald-50 rounded-md border border-emerald-200">
            <span className="flex items-center gap-1.5 text-xs text-emerald-700">
              <CheckCircle2 className="w-3.5 h-3.5" />
              {resumeFileName ? resumeFileName : 'Resume added'} · {resumeText.length} chars
            </span>
            <button
              type="button"
              onClick={() => { onResumeChange(null, null); setPasteText('') }}
              className="text-emerald-600 hover:text-emerald-800"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {tab === 'upload' ? (
          <div
            onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileRef.current?.click()}
            className={`flex flex-col items-center justify-center gap-2 py-8 rounded-lg border-2 border-dashed cursor-pointer transition-colors ${
              dragging ? 'border-brand-400 bg-brand-50' : 'border-slate-200 hover:border-slate-300 bg-slate-50'
            }`}
          >
            {loading ? (
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-brand-500 border-t-transparent" />
            ) : (
              <>
                <Upload className="w-6 h-6 text-slate-400" />
                <p className="text-sm text-slate-500">
                  Drag & drop your PDF resume, or <span className="text-brand-600">browse</span>
                </p>
                <p className="text-xs text-slate-400">PDF only · max 5MB</p>
              </>
            )}
            <input
              ref={fileRef}
              type="file"
              accept=".pdf"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) handleFile(file)
              }}
            />
          </div>
        ) : (
          <div>
            <textarea
              value={pasteText}
              onChange={(e) => setPasteText(e.target.value)}
              placeholder="Paste your resume text here..."
              rows={6}
              className="w-full text-sm border border-slate-200 rounded-md px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-brand-500 placeholder:text-slate-300"
            />
            <button
              type="button"
              onClick={handlePasteSave}
              disabled={!pasteText.trim() || loading}
              className="mt-2 w-full py-2 text-sm font-medium bg-brand-600 text-white rounded-md hover:bg-brand-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Processing...' : 'Use This Resume'}
            </button>
          </div>
        )}

        {warning && (
          <div className="mt-2 flex items-start gap-1.5 text-xs text-amber-700 bg-amber-50 p-2 rounded-md">
            <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
            {warning}
          </div>
        )}

        <p className="mt-2 text-xs text-slate-400 flex items-center gap-1">
          <FileText className="w-3 h-3" />
          We use the top portion of your resume for personalization.
        </p>
      </div>
    </div>
  )
}
