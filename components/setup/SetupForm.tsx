'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { QuestionType, Difficulty, SessionConfig } from '@/types'
import { createSession, saveSession } from '@/lib/session'
import QuestionTypeSelector from './QuestionTypeSelector'
import DifficultySelector from './DifficultySelector'
import JobDescriptionInput from './JobDescriptionInput'
import ResumeUploader from './ResumeUploader'
import { ArrowRight } from 'lucide-react'

export default function SetupForm() {
  const router = useRouter()
  const [questionType, setQuestionType] = useState<QuestionType>('behavioral')
  const [difficulty, setDifficulty] = useState<Difficulty>('medium')
  const [jobDescription, setJobDescription] = useState('')
  const [resumeText, setResumeText] = useState<string | null>(null)
  const [resumeFileName, setResumeFileName] = useState<string | null>(null)

  function handleResumeChange(text: string | null, fileName: string | null) {
    setResumeText(text)
    setResumeFileName(fileName)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const config: SessionConfig = {
      questionType,
      difficulty,
      jobDescription: jobDescription.trim() || null,
      resumeText,
      resumeFileName,
    }
    const session = createSession(config)
    saveSession(session)
    router.push('/interview')
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <QuestionTypeSelector value={questionType} onChange={setQuestionType} />
      <DifficultySelector value={difficulty} onChange={setDifficulty} />

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Resume <span className="text-slate-400 font-normal">(optional — for personalization)</span>
        </label>
        <ResumeUploader
          resumeText={resumeText}
          resumeFileName={resumeFileName}
          onResumeChange={handleResumeChange}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Job Description{' '}
          <span className="text-slate-400 font-normal">(optional — for role-specific questions)</span>
        </label>
        <JobDescriptionInput value={jobDescription} onChange={setJobDescription} />
      </div>

      <button
        type="submit"
        className="w-full py-3 px-6 bg-brand-600 text-white font-semibold rounded-xl hover:bg-brand-700 active:bg-brand-800 transition-colors flex items-center justify-center gap-2 shadow-sm"
      >
        Begin Interview
        <ArrowRight className="w-4 h-4" />
      </button>
    </form>
  )
}
