# InterviewIQ — Behavioral Interview Simulator

AI-powered interview practice tailored to business and consulting roles. Built with Next.js 14 and the Anthropic API.

## Setup

```bash
# 1. Install dependencies
npm install

# 2. Add your API key
# Edit .env.local and replace `your_key_here` with your actual key:
# ANTHROPIC_API_KEY=sk-ant-...

# 3. Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Features

- **3 question types**: Behavioral (STAR), Case/Open-ended, Situational Judgment
- **3 difficulty levels**: Easy (analyst), Medium (associate/MBA), Hard (manager/principal)
- **Resume personalization**: Upload PDF or paste text to tailor questions and feedback
- **Job description mode**: Paste any JD for role-specific questions
- **Two answer modes**: Free-form text or AI-generated multiple choice
- **Streaming AI feedback**: Real-time STAR breakdown, strengths, and improvement tips
- **Session summary**: Score history, model answers, and downloadable summary

## Deploy to Vercel

1. Push to GitHub
2. Import repo in [vercel.com](https://vercel.com)
3. Add `ANTHROPIC_API_KEY` as an environment variable in Vercel dashboard
4. Deploy

## Tech Stack

- Next.js 14 (App Router)
- Anthropic SDK (`claude-sonnet-4-6`)
- Tailwind CSS
- `pdf-parse` for server-side PDF extraction
- `localStorage` for session state (no database needed)
