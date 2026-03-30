import { SignUp } from "@clerk/nextjs";
import Link from "next/link";

export default function SignUpPage() {
  return (
    <div className="min-h-screen lg:grid lg:grid-cols-2">
      {/* Left panel (dark, hidden on mobile) */}
      <div className="hidden lg:flex flex-col justify-between bg-surface p-12 border-r border-border relative overflow-hidden">
        {/* Decorative background element */}
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-accent-glow rounded-full blur-3xl pointer-events-none" />

        <div className="z-10">
          <Link href="/" className="font-display font-bold text-2xl flex items-center gap-2 mb-16">
            FinScribe <span className="w-2 h-2 rounded-full bg-accent inline-block" /> AI
          </Link>
          <h1 className="font-display text-4xl font-bold leading-tight mb-6 max-w-md">
            "Financial clarity starts with a single step."
          </h1>
          <p className="text-muted text-lg max-w-md">
            Join thousands of users who have taken control of their financial future with FinScribe AI.
          </p>
        </div>

        <div className="z-10 space-y-4 mb-12">
          {[
            { name: "Sarah J.", role: "Freelancer", quote: "The AI insights saved me ₹15k last month alone.", rating: "5" },
            { name: "Rahul M.", role: "Software Engineer", quote: "Finally, a dashboard that actually makes sense.", rating: "5" },
            { name: "Priya K.", role: "Small Business Owner", quote: "Categorization is pure magic. So much time saved.", rating: "4.9" }
          ].map((t, i) => (
            <div key={i} className="bg-background/50 border border-border p-4 rounded-xl max-w-md backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center font-bold text-accent text-sm">
                  {t.name.charAt(0)}
                </div>
                <div>
                  <div className="font-medium text-sm">{t.name}</div>
                  <div className="text-xs text-muted">{t.role}</div>
                </div>
                <div className="ml-auto text-accent text-xs flex items-center gap-1">
                  {t.rating}&#9733;
                </div>
              </div>
              <p className="text-sm italic text-muted">"{t.quote}"</p>
            </div>
          ))}
        </div>

        <div className="z-10 flex items-center gap-2 text-sm text-muted">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-accent"></span>
          </span>
          256-bit encrypted & secure
        </div>
      </div>

      {/* Right panel */}
      <div className="flex flex-col items-center justify-center p-8 bg-background relative z-10">
        <div className="lg:hidden mb-8">
          <Link href="/" className="font-display font-bold text-2xl flex items-center gap-2">
            FinScribe <span className="w-2 h-2 rounded-full bg-accent inline-block" /> AI
          </Link>
        </div>
        <SignUp fallbackRedirectUrl="/onboarding/quiz" appearance={{
            variables: {
              colorBackground: '#18181b',
              colorText: '#fafafa',
              colorTextSecondary: '#a1a1aa',
              colorPrimary: '#22c55e',
              colorInputBackground: '#27272a',
              colorInputText: '#fafafa',
              colorNeutral: '#fafafa',
              borderRadius: '0.75rem',
            },
            elements: {
              socialButtonsBlockButton:
                'bg-zinc-800 border border-zinc-600 text-white hover:bg-zinc-700',
              socialButtonsBlockButtonText: 'text-white font-medium',
              dividerLine: 'bg-zinc-700',
              dividerText: 'text-zinc-400',
              formFieldLabel: 'text-zinc-300',
              identityPreviewText: 'text-white',
              identityPreviewEditButton: 'text-green-400',
            }
          }}
        />
      </div>
    </div>
  );
}
