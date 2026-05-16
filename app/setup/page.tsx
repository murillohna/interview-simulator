import Header from '@/components/layout/Header'
import SetupForm from '@/components/setup/SetupForm'

export default function SetupPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <main className="max-w-xl mx-auto px-4 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900 mb-1">Configure your session</h1>
          <p className="text-sm text-slate-500">
            Customize the interview to match your target role and experience level.
          </p>
        </div>
        <SetupForm />
      </main>
    </div>
  )
}
