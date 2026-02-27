import Link from "next/link";
import { cookies } from "next/headers";
import {
  Bell,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  FileText,
  Gavel,
  Scale,
  ShieldCheck,
} from "lucide-react";
import { ModernBackground } from "@/components/modern-background";

const legalPillars = [
  {
    title: "Due Process",
    description:
      "Every complaint should be reviewed with procedural fairness, clear chronology, and documented case handling.",
    icon: Scale,
  },
  {
    title: "Confidential Handling",
    description:
      "Case information should be shared strictly on a need-to-know basis with role-based access and secure storage.",
    icon: ShieldCheck,
  },
  {
    title: "Non-retaliation Principle",
    description:
      "Reporters must be protected against retaliation and adverse action during and after case investigation.",
    icon: Gavel,
  },
  {
    title: "Record Integrity",
    description:
      "Preserve evidence and communication records in original form to support auditable and lawful outcomes.",
    icon: FileText,
  },
];

const frameworkChecklist = [
  "Capture objective facts, dates, and scope of incident.",
  "Separate allegation statements from assumptions.",
  "Preserve source records in tamper-resistant storage.",
  "Limit access by investigator and policy role.",
  "Maintain timeline of all case interactions.",
  "Close cases with documented rationale and action.",
];

export default async function LegalFrameworkPage() {
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
              <Link href="/safety-guide" className="hover:text-primary transition-colors">Safety Guide</Link>
              <Link href="/legal-framework" className="text-primary transition-colors">Legal Framework</Link>
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
            <span>Legal & Compliance Foundations</span>
          </div>

          <h1 className="text-4xl md:text-7xl font-extrabold tracking-[-0.04em] leading-[1.05] max-w-5xl text-balance">
            Legal Framework for
            <span className="text-gradient"> protected reporting.</span>
          </h1>

          <p className="mt-8 text-lg md:text-xl text-muted-foreground max-w-3xl leading-relaxed font-medium">
            A practical baseline for lawful, fair, and confidential handling of reports. Use this framework to keep
            each case review structured, defensible, and policy-aligned.
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
              href="/safety-guide"
              className="w-full sm:w-auto glass bg-card/30 hover:bg-card/50 px-8 py-4 rounded-2xl font-bold text-sm uppercase tracking-widest transition-all border border-foreground/[0.06]"
            >
              Open Safety Guide
            </Link>
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-6 pb-14">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 rounded-[2rem] p-2 glass bg-white/[0.02] border border-foreground/[0.04]">
            {legalPillars.map((item) => {
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
                <BookOpen className="w-4 h-4" />
                Case handling checklist
              </div>

              <ul className="space-y-4">
                {frameworkChecklist.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-[15px] md:text-base font-medium leading-relaxed">
                    <CheckCircle2 className="w-5 h-5 text-success mt-0.5 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </article>

            <article className="lg:col-span-2 rounded-[2rem] p-8 md:p-10 border border-foreground/[0.04] glass bg-card/40">
              <h3 className="text-2xl font-black tracking-tight mb-4">Jurisdiction note</h3>
              <p className="text-muted-foreground font-medium leading-relaxed mb-8">
                This page provides a general operational framework, not legal advice. Organization policies and local
                law may impose additional requirements.
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
      </main>
    </div>
  );
}
