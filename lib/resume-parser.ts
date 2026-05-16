export function truncateResumeText(text: string, maxChars = 1500): string {
  const cleaned = text.replace(/\s+/g, ' ').trim()
  return cleaned.slice(0, maxChars)
}

export function assessResumeQuality(text: string): {
  ok: boolean
  warning: string | null
} {
  const words = text.trim().split(/\s+/).filter(Boolean)
  if (words.length < 80) {
    return {
      ok: false,
      warning:
        'Very little text was extracted from your PDF. Try pasting your resume text directly instead.',
    }
  }

  const nonAscii = (text.match(/[^\x00-\x7F]/g) || []).length
  const ratio = nonAscii / text.length
  if (ratio > 0.2) {
    return {
      ok: false,
      warning:
        'Your PDF may have encoding issues. Try pasting your resume text directly for best results.',
    }
  }

  return { ok: true, warning: null }
}
