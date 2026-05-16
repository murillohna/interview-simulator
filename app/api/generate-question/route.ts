import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { z } from 'zod'
import { v4 as uuidv4 } from 'uuid'
import { buildSystemContext } from '@/lib/context-builder'
import { buildQuestionPrompt } from '@/lib/prompts'
import { Question } from '@/types'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const RequestSchema = z.object({
  questionType: z.enum(['behavioral', 'open-ended', 'situational']),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  jobDescription: z.string().nullable(),
  resumeText: z.string().nullable(),
  previousQuestions: z.array(z.string()).default([]),
  answerMode: z.enum(['text', 'multiple-choice']),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = RequestSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }

    const { questionType, difficulty, jobDescription, resumeText, previousQuestions, answerMode } =
      parsed.data

    const systemContext = buildSystemContext({
      resumeText,
      jobDescription,
      questionType,
      difficulty,
    })

    const userPrompt = buildQuestionPrompt({
      questionType,
      difficulty,
      previousQuestions,
      answerMode,
      hasResume: !!resumeText,
      hasJobDescription: !!jobDescription,
    })

    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 600,
      system: systemContext,
      messages: [{ role: 'user', content: userPrompt }],
    })

    const text = message.content[0].type === 'text' ? message.content[0].text : ''

    // Strip markdown code fences if the model wrapped the JSON
    const jsonText = text.replace(/```(?:json)?\n?/g, '').trim()
    const data = JSON.parse(jsonText)

    const question: Question = {
      id: uuidv4(),
      text: data.questionText,
      type: questionType,
      difficulty,
      choices: data.choices || null,
      followUp: data.followUp || null,
    }

    return NextResponse.json({ question })
  } catch (err) {
    console.error('generate-question error:', err)
    return NextResponse.json({ error: 'Failed to generate question' }, { status: 500 })
  }
}
