import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { z } from 'zod'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const RequestSchema = z.object({
  rawTranscript: z.string(),
})

export async function POST(req: NextRequest) {
  let rawTranscript = ''
  try {
    const body = await req.json()
    const parsed = RequestSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }

    rawTranscript = parsed.data.rawTranscript

    if (!rawTranscript.trim()) {
      return NextResponse.json({ transcript: '' })
    }

    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 600,
      messages: [
        {
          role: 'user',
          content: `Clean up this speech-to-text transcript of a behavioral interview answer. Fix grammar and punctuation, remove filler words (um, uh, like, you know, sort of), and fix run-on sentences. Preserve the original meaning, structure, and content exactly — do not add, remove, or rephrase ideas. Return only the cleaned transcript with no commentary or preamble.

Transcript:
${rawTranscript}`,
        },
      ],
    })

    const transcript =
      message.content[0].type === 'text' ? message.content[0].text.trim() : rawTranscript

    return NextResponse.json({ transcript })
  } catch (err) {
    console.error('transcribe error:', err)
    return NextResponse.json({ transcript: rawTranscript })
  }
}
