import Link from "next/link";
import { cookies } from "next/headers";
import {
  AlertTriangle,
  Bell,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  HeartHandshake,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import { ModernBackground } from "@/components/modern-background";

const safetyPillars = [
  {
    title: "Immediate Safety First",
    description:
      "If you are in immediate physical danger, contact emergency services first and move to a secure location.",
    icon: AlertTriangle,
  },
  {
    title: "Preserve Evidence Carefully",
    description:
      "Keep records, screenshots, dates, and related messages. Do not alter original files or delete relevant context.",
    icon: BookOpen,
  },
  {
    title: "Use Protected Channels",
    description:
      "Submit reports only through trusted and authorized ETHOS workflows to maintain confidentiality and integrity.",
    icon: ShieldCheck,
  },
  {
    title: "Seek Trusted Support",
    description:
      "Reach out to a trusted colleague, advocate, or HR liaison for emotional and procedural support.",
    icon: HeartHandshake,
  },
];

const safeActions = [
  "Document what happened with date, time, and location.",
  "Record who was present and any direct witnesses.",
  "Store files in a private and protected folder.",
  "Use neutral language and factual wording in your report.",
  "Keep your access key in a private location.",
  "Avoid sharing case details on public channels.",
];

const trustSignals = [
  { label: "Identity metadata", value: "Minimized by design" },
  { label: "Report integrity", value: "Encrypted in transit" },
  { label: "Access model", value: "Key-based retrieval" },
];

const reportingJourney = [
  {
    step: "01",
    title: "Prepare Safely",
    description: "Capture facts first, prioritize immediate safety, and collect evidence without modifying originals.",
  },
  {
    step: "02",
    title: "Submit Securely",
    description: "Use ETHOS secure channels to file your complaint with objective details and clear chronology.",
  },
  {
    step: "03",
    title: "Track Privately",
    description: "Continue communication through protected workflows and keep your access key confidential.",
  },
];

export default async function SafetyGuidePage() {
  const cookieStore = await cookies();
  const authCookie = cookieStore.get("authUser")?.value;
  let isHrUser = false;

  if (authCookie) {
    try {
      const parsed = JSON.parse(authCookie) as { userType?: string };
      isHrUser = parsed.userType === "hr";
    } catch {
      isHrUser = false;
    }
  }

  const isAuthenticated = Boolean(authCookie);
  const portalHref = isAuthenticated ? (isHrUser ? "/hr/dashboard" : "/dashboard") : "/auth/login";
  const portalLabel = isAuthenticated ? (isHrUser ? "Go to HR Dashboard" : "Go to User Dashboard") : "Enter Portal";
  const hrHref = isHrUser ? "/hr/dashboard" : "/hr/login";

  return (
    <div className="relative min-h-screen text-foreground transition-colors duration-500">
      <ModernBackground />

      <header className="fixed top-0 w-full border-b border-foreground/[0.03] bg-background/60 backdrop-blur-2xl z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <span className="font-extrabold text-2xl tracking-tighter text-foreground/90 font-logo">ETHOS</span>
          </Link>

          <div className="flex items-center gap-10">
            <nav className="hidden lg:flex items-center gap-10 text-[13px] font-bold uppercase tracking-widest text-muted-foreground/80">
              <Link href="/safety-guide" className="text-primary transition-colors">Safety Guide</Link>
              <Link href="/legal-framework" className="hover:text-primary transition-colors">Legal Framework</Link>
              <Link href={hrHref} className="hover:text-primary transition-colors">For HR</Link>
            </nav>

            <div className="h-6 w-px bg-foreground/[0.08] hidden lg:block" />

            <Link
              href={portalHref}
              className="hidden sm:block bg-foreground text-background px-7 py-2.5 rounded-full font-bold text-xs uppercase tracking-widest hover:translate-y-[-2px] hover:shadow-xl transition-all active:scale-95"
            >
              {portalLabel}
            </Link>
          </div>
        </div>
      </header>

      <main className="pt-28 pb-24">
        <section className="max-w-7xl mx-auto px-6 py-14 md:py-20">
          <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-primary/[0.05] border border-primary/15 text-primary text-[11px] font-bold uppercase tracking-[0.2em] mb-8">
            <Bell className="w-3.5 h-3.5" />
            <span>Safety & Reporting Protocol</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            <article className="lg:col-span-3 rounded-[2rem] p-8 md:p-12 border border-foreground/[0.04] glass bg-background/40">
              <h1 className="text-4xl md:text-7xl font-extrabold tracking-[-0.04em] leading-[1.05] max-w-4xl text-balance">
                Safety Guide for
                <span className="text-gradient"> secure disclosure.</span>
              </h1>

              <p className="mt-8 text-lg md:text-xl text-muted-foreground max-w-3xl leading-relaxed font-medium">
                This guide helps you report safely, protect your identity, and preserve evidence quality. Follow these
                steps before and during complaint submission.
              </p>

              <div className="mt-10 flex flex-col sm:flex-row gap-4">
                <Link
                  href="/dashboard/file-complaint"
                  className="group w-full sm:w-auto bg-primary hover:bg-primary/95 text-white px-8 py-4 rounded-2xl font-bold text-sm uppercase tracking-widest flex items-center justify-center gap-2.5 transition-all hover:translate-y-[-2px] shadow-xl shadow-primary/20"
                >
                  File Complaint
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </Link>
                <Link
                  href="/auth/login"
                  className="w-full sm:w-auto glass bg-card/30 hover:bg-card/50 px-8 py-4 rounded-2xl font-bold text-sm uppercase tracking-widest transition-all border border-foreground/[0.06]"
                >
                  Access Dashboard
                </Link>
              </div>
            </article>

            <aside className="lg:col-span-2 rounded-[2rem] p-8 md:p-10 border border-foreground/[0.04] bg-linear-to-br from-primary/[0.08] to-accent/[0.04]">
              <div className="inline-flex items-center gap-2 text-primary font-black text-[11px] uppercase tracking-[0.22em] mb-6">
                <Sparkles className="w-4 h-4" />
                Trust signals
              </div>

              <ul className="space-y-4">
                {trustSignals.map((signal) => (
                  <li key={signal.label} className="rounded-xl border border-foreground/[0.06] bg-background/40 p-4">
                    <p className="text-[11px] uppercase tracking-[0.18em] font-black text-muted-foreground">{signal.label}</p>
                    <p className="mt-1.5 text-base font-bold tracking-tight">{signal.value}</p>
                  </li>
                ))}
              </ul>
            </aside>
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-6 pb-14">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 rounded-[2rem] p-2 glass bg-white/[0.02] border border-foreground/[0.04]">
            {safetyPillars.map((item) => {
              const Icon = item.icon;
              return (
                <article
                  key={item.title}
                  className="p-8 md:p-10 rounded-[1.5rem] bg-background/40 border border-foreground/[0.04] hover:bg-background/60 transition-colors"
                >
                  <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/15 flex items-center justify-center mb-6 text-primary">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h2 className="text-xl font-extrabold tracking-tight mb-3">{item.title}</h2>
                  <p className="text-muted-foreground text-[15px] leading-relaxed font-medium">{item.description}</p>
                </article>
              );
            })}
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            <article className="lg:col-span-3 rounded-[2rem] p-8 md:p-10 border border-foreground/[0.04] bg-linear-to-br from-primary/[0.06] to-accent/[0.03]">
              <div className="inline-flex items-center gap-2 text-primary font-black text-[11px] uppercase tracking-[0.22em] mb-6">
                <Users className="w-4 h-4" />
                Step-by-step checklist
              </div>

              <ul className="space-y-4">
                {safeActions.map((action) => (
                  <li key={action} className="flex items-start gap-3 text-[15px] md:text-base font-medium leading-relaxed">
                    <CheckCircle2 className="w-5 h-5 text-success mt-0.5 shrink-0" />
                    <span>{action}</span>
                  </li>
                ))}
              </ul>
            </article>

            <article className="lg:col-span-2 rounded-[2rem] p-8 md:p-10 border border-foreground/[0.04] glass bg-card/40">
              <h3 className="text-2xl font-black tracking-tight mb-4">Important note</h3>
              <p className="text-muted-foreground font-medium leading-relaxed mb-8">
                ETHOS helps protect confidentiality, but legal pathways and emergency obligations can vary by
                jurisdiction. When needed, consult authorized legal or safeguarding professionals.
              </p>

              <Link
                href="/auth/login"
                className="inline-flex items-center gap-2.5 px-6 py-3 rounded-xl bg-foreground text-background font-bold text-xs uppercase tracking-widest hover:opacity-90 transition-opacity"
              >
                Continue to secure access
                <ChevronRight className="w-4 h-4" />
              </Link>
            </article>
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-6 pt-14">
          <div className="rounded-[2rem] border border-foreground/[0.04] bg-background/40 glass p-8 md:p-10">
            <div className="inline-flex items-center gap-2 text-primary font-black text-[11px] uppercase tracking-[0.22em] mb-8">
              <Users className="w-4 h-4" />
              Reporting journey
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {reportingJourney.map((item) => (
                <article key={item.step} className="rounded-2xl border border-foreground/[0.05] bg-card/30 p-6">
                  <p className="text-4xl font-black text-foreground/10 mb-4">{item.step}</p>
                  <h3 className="text-xl font-extrabold tracking-tight mb-2.5">{item.title}</h3>
                  <p className="text-muted-foreground text-[15px] leading-relaxed font-medium">{item.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-6 pt-14">
          <div className="rounded-[2rem] border border-foreground/[0.04] bg-zinc-950 text-white p-8 md:p-12 text-center">
            <h3 className="text-3xl md:text-5xl font-black tracking-tight">Report with confidence, not exposure.</h3>
            <p className="mt-5 text-white/75 max-w-2xl mx-auto text-sm md:text-base font-medium leading-relaxed">
              Start your disclosure in a controlled workflow designed for confidentiality, traceability, and safe case
              progression.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
              <Link
                href="/dashboard/file-complaint"
                className="inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-xl bg-white text-black font-black text-xs uppercase tracking-widest hover:opacity-90 transition-opacity"
              >
                Start secure report
                <ChevronRight className="w-4 h-4" />
              </Link>
              <Link
                href="/"
                className="inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-xl border border-white/15 text-white font-black text-xs uppercase tracking-widest hover:bg-white/5 transition-colors"
              >
                Back to home
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
