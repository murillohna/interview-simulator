'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Mic, Square, RotateCcw, Check, AlertCircle, Loader2 } from 'lucide-react'

type RecorderState =
  | 'idle'
  | 'requesting'
  | 'recording'
  | 'recorded'
  | 'transcribing'
  | 'permission-denied'
  | 'unsupported'

interface Props {
  onTranscript: (text: string) => void
  disabled?: boolean
}

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0')
  const s = (seconds % 60).toString().padStart(2, '0')
  return `${m}:${s}`
}

function getPreferredMimeType() {
  const types = ['audio/webm;codecs=opus', 'audio/webm', 'audio/ogg;codecs=opus', 'audio/ogg']
  return types.find((t) => MediaRecorder.isTypeSupported(t)) ?? ''
}

export default function VoiceRecorder({ onTranscript, disabled }: Props) {
  const [recorderState, setRecorderState] = useState<RecorderState>('idle')
  const [duration, setDuration] = useState(0)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [showTooltip, setShowTooltip] = useState(false)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const transcriptRef = useRef('')
  const startTimeRef = useRef(0)
  const audioUrlRef = useRef<string | null>(null)
  const mimeTypeRef = useRef('')

  const isSupported =
    typeof window !== 'undefined' &&
    typeof navigator !== 'undefined' &&
    'mediaDevices' in navigator &&
    typeof MediaRecorder !== 'undefined'

  const stopAll = useCallback((silent = false) => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
    if (recognitionRef.current) {
      try { recognitionRef.current.stop() } catch {}
      recognitionRef.current = null
    }
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== 'inactive' &&
      silent
    ) {
      mediaRecorderRef.current.stop()
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop())
      streamRef.current = null
    }
  }, [])

  // Cleanup on unmount and page unload
  useEffect(() => {
    const handleUnload = () => stopAll(true)
    window.addEventListener('beforeunload', handleUnload)
    return () => {
      handleUnload()
      window.removeEventListener('beforeunload', handleUnload)
      if (audioUrlRef.current) URL.revokeObjectURL(audioUrlRef.current)
    }
  }, [stopAll])

  async function handleStartRecording() {
    if (!isSupported) {
      setRecorderState('unsupported')
      return
    }

    setRecorderState('requesting')
    setError(null)
    transcriptRef.current = ''

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream

      const mimeType = getPreferredMimeType()
      mimeTypeRef.current = mimeType
      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined)
      mediaRecorderRef.current = recorder
      chunksRef.current = []

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mimeTypeRef.current || 'audio/webm' })
        const url = URL.createObjectURL(blob)
        audioUrlRef.current = url
        setAudioUrl(url)
      }

      recorder.start(100)

      // Web Speech API for real-time transcript
      const SR =
        (window as Window & { SpeechRecognition?: typeof SpeechRecognition; webkitSpeechRecognition?: typeof SpeechRecognition }).SpeechRecognition ||
        (window as Window & { SpeechRecognition?: typeof SpeechRecognition; webkitSpeechRecognition?: typeof SpeechRecognition }).webkitSpeechRecognition

      if (SR) {
        const recognition = new SR()
        recognition.continuous = true
        recognition.interimResults = true
        recognition.lang = 'en-US'
        recognitionRef.current = recognition

        recognition.onresult = (event) => {
          let final = ''
          for (let i = 0; i < event.results.length; i++) {
            if (event.results[i].isFinal) {
              final += event.results[i][0].transcript + ' '
            }
          }
          transcriptRef.current = final.trim()
        }

        try { recognition.start() } catch {}
      }

      startTimeRef.current = Date.now()
      setDuration(0)
      timerRef.current = setInterval(() => {
        setDuration(Math.floor((Date.now() - startTimeRef.current) / 1000))
      }, 1000)

      setRecorderState('recording')
    } catch (err) {
      const e = err as Error
      if (e.name === 'NotAllowedError' || e.name === 'PermissionDeniedError') {
        setRecorderState('permission-denied')
      } else {
        setError('Could not access microphone. Please check your device settings.')
        setRecorderState('idle')
      }
      stopAll(true)
    }
  }

  function handleStopRecording() {
    const elapsed = (Date.now() - startTimeRef.current) / 1000

    if (elapsed < 1) {
      stopAll(true)
      setError('Recording too short — hold for at least 1 second.')
      setRecorderState('idle')
      return
    }

    if (timerRef.current) clearInterval(timerRef.current)
    if (recognitionRef.current) {
      try { recognitionRef.current.stop() } catch {}
      recognitionRef.current = null
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop())
      streamRef.current = null
    }
    // onstop fires after this, setting audioUrl
    mediaRecorderRef.current?.stop()
    setRecorderState('recorded')
  }

  function handleReRecord() {
    stopAll(true)
    if (audioUrlRef.current) {
      URL.revokeObjectURL(audioUrlRef.current)
      audioUrlRef.current = null
    }
    setAudioUrl(null)
    transcriptRef.current = ''
    setDuration(0)
    setError(null)
    setRecorderState('idle')
  }

  async function handleUseRecording() {
    setRecorderState('transcribing')
    const raw = transcriptRef.current

    if (!raw.trim()) {
      // Speech API unavailable or captured nothing — hand back empty string
      onTranscript('')
      setRecorderState('idle')
      if (audioUrlRef.current) {
        URL.revokeObjectURL(audioUrlRef.current)
        audioUrlRef.current = null
      }
      setAudioUrl(null)
      setError(
        'No speech detected. Your browser may not support live transcription — try Chrome or Edge, or type your answer.'
      )
      return
    }

    try {
      const res = await fetch('/api/transcribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rawTranscript: raw }),
      })
      const data = await res.json()
      onTranscript(data.transcript || raw)
    } catch {
      onTranscript(raw)
    }

    setRecorderState('idle')
    if (audioUrlRef.current) {
      URL.revokeObjectURL(audioUrlRef.current)
      audioUrlRef.current = null
    }
    setAudioUrl(null)
  }

  // ── Render states ──────────────────────────────────────────────────────────

  if (recorderState === 'unsupported') {
    return (
      <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-50 rounded-lg px-3 py-2.5 border border-slate-200">
        <AlertCircle className="w-3.5 h-3.5 shrink-0 text-slate-400" />
        Voice input isn&apos;t supported in your browser. Try Chrome or Edge.
      </div>
    )
  }

  if (recorderState === 'permission-denied') {
    return (
      <div className="space-y-2">
        <div className="flex items-start gap-2 text-xs text-amber-800 bg-amber-50 rounded-xl px-3 py-3 border border-amber-200">
          <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0 text-amber-500" />
          <div>
            <p className="font-semibold">Microphone access denied</p>
            <p className="text-amber-700 mt-0.5 leading-relaxed">
              Click the lock icon in your browser&apos;s address bar, allow microphone access, then
              try again.
            </p>
          </div>
        </div>
        <button
          onClick={() => setRecorderState('idle')}
          className="text-xs text-slate-500 hover:text-slate-700 transition-colors"
        >
          ← Dismiss
        </button>
      </div>
    )
  }

  if (recorderState === 'recording') {
    return (
      <div className="flex items-center gap-3 bg-rose-50 border border-rose-200 rounded-xl px-4 py-3 min-h-[52px]">
        <span className="relative flex h-3 w-3 shrink-0">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500" />
        </span>
        <span className="text-sm font-medium text-rose-700">Recording</span>
        <span className="text-sm font-mono text-rose-600 tabular-nums">{formatTime(duration)}</span>
        <button
          onClick={handleStopRecording}
          className="ml-auto flex items-center gap-1.5 bg-rose-600 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-rose-700 active:bg-rose-800 transition-colors min-h-[40px]"
        >
          <Square className="w-3 h-3 fill-current" />
          Stop
        </button>
      </div>
    )
  }

  if (recorderState === 'recorded') {
    return (
      <div className="space-y-3 bg-slate-50 border border-slate-200 rounded-xl p-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-slate-700">Preview your recording</span>
          <span className="text-xs text-slate-400 font-mono">{formatTime(duration)}</span>
        </div>
        {audioUrl && (
          <audio controls src={audioUrl} className="w-full" style={{ height: '36px' }} />
        )}
        <div className="flex gap-2">
          <button
            onClick={handleReRecord}
            className="flex items-center gap-1.5 text-sm font-medium text-slate-600 border border-slate-200 bg-white px-4 py-2.5 rounded-lg hover:bg-slate-50 transition-colors min-h-[44px]"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Re-record
          </button>
          <button
            onClick={handleUseRecording}
            className="flex-1 flex items-center justify-center gap-1.5 text-sm font-semibold text-white bg-brand-600 px-4 py-2.5 rounded-lg hover:bg-brand-700 transition-colors min-h-[44px]"
          >
            <Check className="w-3.5 h-3.5" />
            Use this recording
          </button>
        </div>
      </div>
    )
  }

  if (recorderState === 'transcribing') {
    return (
      <div className="flex items-center gap-2.5 bg-brand-50 border border-brand-200 rounded-xl px-4 py-3 min-h-[52px]">
        <Loader2 className="w-4 h-4 text-brand-600 animate-spin shrink-0" />
        <span className="text-sm text-brand-700">Transcribing your answer...</span>
      </div>
    )
  }

  // idle / requesting
  return (
    <div className="space-y-1.5">
      <div
        className="relative inline-block"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        <button
          onClick={handleStartRecording}
          disabled={disabled || recorderState === 'requesting'}
          className={`flex items-center gap-2 text-sm font-medium px-3 py-2.5 rounded-lg border transition-colors min-h-[44px] ${
            recorderState === 'requesting'
              ? 'border-slate-200 text-slate-400 bg-slate-50 cursor-wait'
              : 'border-slate-200 text-slate-600 bg-white hover:border-brand-300 hover:text-brand-700 hover:bg-brand-50'
          } disabled:opacity-40 disabled:cursor-not-allowed`}
        >
          {recorderState === 'requesting' ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Mic className="w-4 h-4" />
          )}
          {recorderState === 'requesting' ? 'Requesting access...' : 'Answer by voice'}
        </button>

        {showTooltip && recorderState === 'idle' && (
          <div className="absolute bottom-full left-0 mb-2 bg-slate-800 text-white text-xs rounded-lg px-2.5 py-1.5 whitespace-nowrap pointer-events-none z-10 shadow-lg">
            Record your spoken answer — we&apos;ll transcribe it
            <div className="absolute top-full left-4 border-4 border-transparent border-t-slate-800" />
          </div>
        )}
      </div>

      {error && (
        <p className="text-xs text-rose-600 flex items-start gap-1 leading-relaxed max-w-sm">
          <AlertCircle className="w-3 h-3 mt-0.5 shrink-0" />
          {error}
        </p>
      )}
    </div>
  )
}
