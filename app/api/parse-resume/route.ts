import { NextRequest, NextResponse } from 'next/server'
import { truncateResumeText, assessResumeQuality } from '@/lib/resume-parser'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get('content-type') || ''

    if (contentType.includes('application/json')) {
      const body = await req.json()
      const text: string = body.text || ''
      const truncated = truncateResumeText(text)
      const { ok, warning } = assessResumeQuality(truncated)
      return NextResponse.json({
        success: true,
        extractedText: truncated,
        charCount: truncated.length,
        fileName: null,
        warning: ok ? null : warning,
      })
    }

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData()
      const file = formData.get('file') as File | null
      if (!file) {
        return NextResponse.json({ success: false, error: 'No file provided' }, { status: 400 })
      }

      const buffer = Buffer.from(await file.arrayBuffer())
      // Dynamic import so pdf-parse doesn't break edge builds
      const pdfParse = (await import('pdf-parse')).default
      const parsed = await pdfParse(buffer)
      const truncated = truncateResumeText(parsed.text)
      const { ok, warning } = assessResumeQuality(truncated)

      return NextResponse.json({
        success: true,
        extractedText: truncated,
        charCount: truncated.length,
        fileName: file.name,
        warning: ok ? null : warning,
      })
    }

    return NextResponse.json({ success: false, error: 'Unsupported content type' }, { status: 415 })
  } catch (err) {
    console.error('parse-resume error:', err)
    return NextResponse.json({ success: false, error: 'Failed to parse resume' }, { status: 500 })
  }
}
