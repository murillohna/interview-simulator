import Link from 'next/link'
import { BrainCircuit, Star, MessageSquare, Scale, Zap, Target, ArrowRight } from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-brand-50">
      {/* Nav */}
      <nav className="border-b border-slate-200/60 bg-white/70 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center">
          <span className="flex items-center gap-2 text-brand-700 font-semibold">
            <BrainCircuit className="w-5 h-5" />
            InterviewIQ
          </span>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-3xl mx-auto px-4 pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-1.5 text-xs font-medium text-brand-700 bg-brand-50 border border-brand-200 rounded-full px-3 py-1 mb-6">
          <Zap className="w-3 h-3" />
          Powered by Claude AI
        </div>

        <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 tracking-tight leading-tight mb-4">
          Ace your next<br />
          <span className="text-brand-600">consulting interview</span>
        </h1>

        <p className="text-lg text-slate-500 mb-10 max-w-xl mx-auto leading-relaxed">
          Practice behavioral, case, and situational questions with AI feedback calibrated to
          top-tier consulting firm standards. Upload your resume for a personalized experience.
        </p>

        <Link
          href="/setup"
          className="inline-flex items-center gap-2 bg-brand-600 text-white font-semibold px-8 py-3.5 rounded-xl hover:bg-brand-700 transition-colors shadow-md hover:shadow-lg"
        >
          Start Practice Session
          <ArrowRight className="w-4 h-4" />
        </Link>

        <p className="mt-4 text-xs text-slate-400">No account needed · Free to use</p>
      </section>

      {/* Feature cards */}
      <section className="max-w-4xl mx-auto px-4 pb-20">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <FeatureCard
            icon={<Star className="w-5 h-5 text-blue-600" />}
            bg="bg-blue-50 border-blue-200"
            title="Behavioral (STAR)"
            desc="Master the Situation–Task–Action–Result framework with targeted questions and per-component feedback."
          />
          <FeatureCard
            icon={<MessageSquare className="w-5 h-5 text-purple-600" />}
            bg="bg-purple-50 border-purple-200"
            title="Case & Open-ended"
            desc="Sharpen your structured thinking with business analysis and strategy questions tailored to your target role."
          />
          <FeatureCard
            icon={<Scale className="w-5 h-5 text-teal-600" />}
            bg="bg-teal-50 border-teal-200"
            title="Situational Judgment"
            desc="Navigate complex hypothetical scenarios and demonstrate leadership and decision-making skills."
          />
        </div>

        {/* How it works */}
        <div className="mt-12 bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
          <h2 className="text-xl font-semibold text-slate-800 mb-6 text-center">How it works</h2>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
            {[
              { step: '1', title: 'Configure', desc: 'Choose question type, difficulty, and optionally add your resume and target job description.' },
              { step: '2', title: 'Practice', desc: 'Answer in free-form text or choose from AI-generated multiple choice options.' },
              { step: '3', title: 'Get Feedback', desc: 'Receive streaming AI feedback with strengths, gaps, and a STAR breakdown.' },
              { step: '4', title: 'Review', desc: 'See your full session summary with scores, model answers, and improvement tips.' },
            ].map((item) => (
              <div key={item.step} className="flex flex-col items-center text-center gap-2">
                <div className="w-8 h-8 rounded-full bg-brand-600 text-white text-sm font-bold flex items-center justify-center">
                  {item.step}
                </div>
                <h3 className="font-semibold text-slate-800 text-sm">{item.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA bottom */}
        <div className="mt-10 text-center">
          <Link
            href="/setup"
            className="inline-flex items-center gap-2 text-brand-600 font-semibold hover:text-brand-800 transition-colors"
          >
            <Target className="w-4 h-4" />
            Start now — it takes 30 seconds to set up
          </Link>
        </div>
      </section>
    </div>
  )
}

function FeatureCard({
  icon,
  bg,
  title,
  desc,
}: {
  icon: React.ReactNode
  bg: string
  title: string
  desc: string
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
      <div className={`w-9 h-9 rounded-xl border flex items-center justify-center mb-3 ${bg}`}>
        {icon}
      </div>
      <h3 className="font-semibold text-slate-800 mb-1.5 text-sm">{title}</h3>
      <p className="text-xs text-slate-500 leading-relaxed">{desc}</p>
    </div>
  )
}
