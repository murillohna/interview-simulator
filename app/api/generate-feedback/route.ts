import { NextRequest } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { z } from 'zod'
import { buildSystemContext } from '@/lib/context-builder'
import { buildFeedbackPrompt } from '@/lib/prompts'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const RequestSchema = z.object({
  question: z.object({
    id: z.string(),
    text: z.string(),
    type: z.enum(['behavioral', 'open-ended', 'situational']),
    difficulty: z.enum(['easy', 'medium', 'hard']),
    choices: z
      .array(z.object({ id: z.enum(['A', 'B', 'C', 'D']), text: z.string() }))
      .nullable(),
    followUp: z.string().nullable(),
  }),
  answer: z.object({
    questionId: z.string(),
    mode: z.enum(['text', 'multiple-choice']),
    textAnswer: z.string().nullable(),
    selectedChoice: z.enum(['A', 'B', 'C', 'D']).nullable(),
  }),
  jobDescription: z.string().nullable(),
  resumeText: z.string().nullable(),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = RequestSchema.safeParse(body)
    if (!parsed.success) {
      return new Response('Invalid request', { status: 400 })
    }

    const { question, answer, jobDescription, resumeText } = parsed.data

    const systemContext = buildSystemContext({
      resumeText,
      jobDescription,
      questionType: question.type,
      difficulty: question.difficulty,
    })

    const userPrompt = buildFeedbackPrompt({
      question,
      answer,
      questionType: question.type,
    })

    const stream = await client.messages.stream({
      model: 'claude-sonnet-4-6',
      max_tokens: 1000,
      system: systemContext,
      messages: [{ role: 'user', content: userPrompt }],
    })

    const readable = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder()
        try {
          for await (const chunk of stream) {
            if (
              chunk.type === 'content_block_delta' &&
              chunk.delta.type === 'text_delta'
            ) {
              controller.enqueue(encoder.encode(chunk.delta.text))
            }
          }
        } finally {
          controller.close()
        }
      },
    })

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
        'Cache-Control': 'no-cache',
      },
    })
  } catch (err) {
    console.error('generate-feedback error:', err)
    return new Response('Failed to generate feedback', { status: 500 })
  }
}
