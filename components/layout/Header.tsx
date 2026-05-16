'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { BrainCircuit, X } from 'lucide-react'
import { clearSession } from '@/lib/session'

interface HeaderProps {
  showExit?: boolean
}

export default function Header({ showExit = false }: HeaderProps) {
  const router = useRouter()

  function handleExit() {
    clearSession()
    router.push('/')
  }

  return (
    <header className="border-b border-slate-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-brand-700 font-semibold">
          <BrainCircuit className="w-5 h-5" />
          <span>InterviewIQ</span>
        </Link>

        {showExit && (
          <button
            onClick={handleExit}
            className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
            Exit
          </button>
        )}
      </div>
    </header>
  )
}
