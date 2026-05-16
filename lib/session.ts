import { InterviewSession, SessionConfig } from '@/types'

const SESSION_KEY = 'interview_session'

export function getSession(): InterviewSession | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    return raw ? (JSON.parse(raw) as InterviewSession) : null
  } catch {
    return null
  }
}

export function saveSession(session: InterviewSession): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(SESSION_KEY, JSON.stringify(session))
}

export function clearSession(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(SESSION_KEY)
}

export function createSession(config: SessionConfig): InterviewSession {
  return {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    config,
    questions: [],
    answers: [],
    feedback: [],
    currentQuestionIndex: 0,
    phase: 'interview',
  }
}

export function updateSession(
  session: InterviewSession,
  patch: Partial<InterviewSession>
): InterviewSession {
  const updated = { ...session, ...patch }
  saveSession(updated)
  return updated
}
