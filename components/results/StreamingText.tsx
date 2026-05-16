'use client'

import { useEffect, useRef } from 'react'

interface Props {
  text: string
  isStreaming: boolean
}

export default function StreamingText({ text, isStreaming }: Props) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isStreaming && ref.current) {
      ref.current.scrollIntoView({ behavior: 'smooth', block: 'end' })
    }
  }, [text, isStreaming])

  return (
    <div ref={ref} className="prose prose-sm prose-slate max-w-none">
      {text.split('\n').map((line, i) => {
        if (line.startsWith('## ')) {
          return (
            <h3 key={i} className="text-sm font-semibold text-slate-700 mt-4 mb-1 first:mt-0">
              {line.slice(3)}
            </h3>
          )
        }
        if (line.startsWith('**') && line.endsWith('**')) {
          return (
            <p key={i} className="font-semibold text-slate-700 text-sm mb-0.5">
              {line.slice(2, -2)}
            </p>
          )
        }
        if (line.startsWith('- ')) {
          return (
            <li key={i} className="text-sm text-slate-600 ml-4 list-disc">
              {line.slice(2)}
            </li>
          )
        }
        if (line.match(/^\*\*[A-Za-z]+:\*\* /)) {
          const colonIdx = line.indexOf(':** ')
          const label = line.slice(2, colonIdx)
          const content = line.slice(colonIdx + 4)
          return (
            <p key={i} className="text-sm text-slate-600 mb-1">
              <span className="font-semibold text-slate-700">{label}: </span>
              {content}
            </p>
          )
        }
        if (line.trim() === '') return <div key={i} className="h-1" />
        return (
          <p key={i} className="text-sm text-slate-600 mb-1">
            {line}
          </p>
        )
      })}
      {isStreaming && (
        <span className="inline-block w-1.5 h-4 bg-brand-500 ml-0.5 animate-pulse rounded-sm" />
      )}
    </div>
  )
}
