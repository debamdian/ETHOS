"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  BookCheck,
  CheckCircle2,
  ClipboardList,
  FileSearch,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  ShieldCheck,
  TriangleAlert,
  Users,
} from "lucide-react";
import { LoadingState } from "@/components/ui/LoadingState";
import { Sidebar, SidebarBody, SidebarLink } from "@/components/ui/sidebar";
import { useAuth } from "@/components/auth/auth-context";
import {
  fetchHrQueue,
  fetchPatternInsights,
  type HrComplaintRecord,
  type PatternInsightsRecord,
} from "@/lib/auth-api";

function getDaysPending(isoDate: string) {
  const now = Date.now();
  const created = new Date(isoDate).getTime();
  return Math.floor(Math.max(0, now - created) / (1000 * 60 * 60 * 24));
}

function toPct(value: number) {
  return `${Math.max(0, Math.min(100, Math.round(value)))}%`;
}

function severityLevel(score: number) {
  if (score >= 70) return "High";
  if (score >= 40) return "Medium";
  return "Low";
}

function statusLabel(status: string) {
  if (status === "submitted") return "Submitted";
  if (status === "under_review") return "Under Review";
  if (status === "resolved") return "Resolved";
  if (status === "rejected") return "Rejected";
  return "Unknown";
}

function statusTone(status: string) {
  if (status === "submitted") return "border-blue-200 bg-blue-50 text-blue-700";
  if (status === "under_review") return "border-amber-200 bg-amber-50 text-amber-700";
  if (status === "resolved") return "border-emerald-200 bg-emerald-50 text-emerald-700";
  if (status === "rejected") return "border-rose-200 bg-rose-50 text-rose-700";
  return "border-slate-200 bg-slate-50 text-slate-700";
}

export default function HrCompliancePage() {
  const [open, setOpen] = useState(false);
  const { logout } = useAuth();

  const [queue, setQueue] = useState<HrComplaintRecord[]>([]);
  const [insights, setInsights] = useState<PatternInsightsRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const links = [
    {
      label: "HR Dashboard",
      href: "/hr/dashboard",
      icon: <LayoutDashboard className="h-5 w-5 flex-shrink-0 text-neutral-700 dark:text-neutral-200" />,
    },
    {
      label: "Queue",
      href: "/hr/dashboard/queue",
      icon: <ClipboardList className="h-5 w-5 flex-shrink-0 text-neutral-700 dark:text-neutral-200" />,
    },
    {
      label: "Evidence & Timeline",
      href: "/hr/dashboard/evidence-timeline",
      icon: <FileSearch className="h-5 w-5 flex-shrink-0 text-neutral-700 dark:text-neutral-200" />,
    },
    {
      label: "Pattern Detection",
      href: "/hr/dashboard/pattern-detection",
      icon: <Users className="h-5 w-5 flex-shrink-0 text-neutral-700 dark:text-neutral-200" />,
    },
    {
      label: "Messages",
      href: "/hr/dashboard/messages",
      icon: <MessageSquare className="h-5 w-5 flex-shrink-0 text-neutral-700 dark:text-neutral-200" />,
    },
    {
      label: "Compliance",
      href: "/hr/dashboard/compliance",
      icon: <BookCheck className="h-5 w-5 flex-shrink-0 text-neutral-700 dark:text-neutral-200" />,
    },
    {
      label: "Logout",
      href: "#",
      onClick: logout,
      icon: <LogOut className="h-5 w-5 flex-shrink-0 text-neutral-700 dark:text-neutral-200" />,
    },
  ];

  useEffect(() => {
    let active = true;

    (async () => {
      try {
        const [queueData, patternInsights] = await Promise.all([fetchHrQueue(), fetchPatternInsights()]);
        if (!active) return;

        setQueue(Array.isArray(queueData) ? queueData : []);
        setInsights(patternInsights || null);
      } catch (err) {
        if (!active) return;
        setError(err instanceof Error ? err.message : "Unable to load compliance overview.");
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  const metrics = useMemo(() => {
    const total = queue.length;
    const openCases = queue.filter((item) => item.status === "submitted" || item.status === "under_review").length;
    const closedCases = queue.filter((item) => item.status === "resolved" || item.status === "rejected").length;
    const staleCases = queue.filter(
      (item) => item.status !== "resolved" && item.status !== "rejected" && getDaysPending(item.created_at) > 7
    ).length;
    const highSeverityOpen = queue.filter(
      (item) => item.status !== "resolved" && item.status !== "rejected" && item.severity_score >= 70
    ).length;

    const slaWithin7Days = total === 0 ? 100 : ((total - staleCases) / total) * 100;
    const closureRate = total === 0 ? 0 : (closedCases / total) * 100;
    const underReviewRate = total === 0 ? 0 : (queue.filter((item) => item.status === "under_review").length / total) * 100;

    return {
      total,
      openCases,
      closedCases,
      staleCases,
      highSeverityOpen,
      slaWithin7Days,
      closureRate,
      underReviewRate,
    };
  }, [queue]);

  const complianceChecks = useMemo(() => {
    return [
      {
        title: "Identity Protection",
        detail: "No complainant identity fields shown in HR operational views.",
        status: "pass" as const,
      },
      {
        title: "Review SLA",
        detail: `${toPct(metrics.slaWithin7Days)} of complaints are within 7-day review window.`,
        status: metrics.slaWithin7Days >= 80 ? ("pass" as const) : ("warn" as const),
      },
      {
        title: "High-Severity Monitoring",
        detail: `${metrics.highSeverityOpen} high-severity open cases currently require monitoring.`,
        status: metrics.highSeverityOpen <= 5 ? ("pass" as const) : ("warn" as const),
      },
      {
        title: "Pattern Alert Feed",
        detail: `${insights?.alerts?.length || 0} active pattern alert types available for HR triage.`,
        status: "pass" as const,
      },
    ];
  }, [metrics, insights]);

  const severityMix = useMemo(() => {
    const high = queue.filter((item) => severityLevel(item.severity_score) === "High").length;
    const medium = queue.filter((item) => severityLevel(item.severity_score) === "Medium").length;
    const low = queue.filter((item) => severityLevel(item.severity_score) === "Low").length;
    const max = Math.max(high, medium, low, 1);
    return {
      max,
      rows: [
        { label: "High", value: high, tone: "bg-rose-500" },
        { label: "Medium", value: medium, tone: "bg-amber-500" },
        { label: "Low", value: low, tone: "bg-emerald-500" },
      ],
    };
  }, [queue]);

  const recentRisks = useMemo(() => {
    return [...queue]
      .filter((item) => item.status !== "resolved" && item.status !== "rejected")
      .sort((a, b) => b.severity_score - a.severity_score)
      .slice(0, 6);
  }, [queue]);

  return (
    <main className="hr-theme-page hr-theme-compliance h-screen w-screen overflow-hidden bg-linear-to-b from-slate-100 via-white to-blue-50/40">
      <div className="hr-theme-shell flex h-full w-full flex-col overflow-hidden border border-slate-200/70 bg-white/85 shadow-2xl shadow-slate-900/5 backdrop-blur-xl md:flex-row">
        <Sidebar open={open} setOpen={setOpen}>
          <SidebarBody className="justify-between gap-10">
            <div className="flex flex-1 flex-col overflow-y-auto overflow-x-hidden">
              {open ? <HrBrandLogo /> : <HrBrandIcon />}
              <div className="mt-8 flex flex-col gap-2">
                {links.map((link, idx) => (
                  <SidebarLink key={idx} link={link} />
                ))}
              </div>
            </div>
            <SidebarLink
              link={{
                label: "HR Manager",
                href: "/hr/dashboard",
                icon: (
                  <Image
                    src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80"
                    className="h-7 w-7 flex-shrink-0 rounded-full"
                    width={50}
                    height={50}
                    alt="HR manager avatar"
                  />
                ),
              }}
            />
          </SidebarBody>
        </Sidebar>

        <section className="flex-1 overflow-y-auto">
          <header className="sticky top-0 z-20 border-b border-slate-200/70 bg-white/90 px-5 py-4 backdrop-blur-xl md:px-8">
            <div>
              <h1 className="text-3xl font-black tracking-[0.12em] text-slate-900">Compliance Center</h1>
              <p className="mt-1 text-sm text-slate-600">
                Governance posture, SLA adherence, risk controls, and workflow compliance indicators for HR operations.
              </p>
            </div>
          </header>

          {error ? (
            <div className="mx-5 mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 md:mx-8">{error}</div>
          ) : null}

          {loading ? (
            <LoadingState
              fullScreen={false}
              className="min-h-[calc(100vh-16rem)] px-5 py-6 md:px-8"
              messages={[
                "Analyzing reports...",
                "Fetching case data...",
                "Scanning patterns...",
                "Preparing dashboard...",
              ]}
            />
          ) : (
          <section className="space-y-5 p-5 md:p-8">
            <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <MetricCard label="Total Cases" value={metrics.total} tone="slate" sub="All complaints" />
              <MetricCard label="Open Cases" value={metrics.openCases} tone="sky" sub="Submitted + under review" />
              <MetricCard label="Stale Cases" value={metrics.staleCases} tone="amber" sub="> 7 days pending" />
              <MetricCard label="High Severity Open" value={metrics.highSeverityOpen} tone="rose" sub="Priority monitoring" />
            </section>

            <section className="grid gap-4 xl:grid-cols-[1fr_1fr]">
              <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <h2 className="text-sm font-bold uppercase tracking-[0.14em] text-slate-500">Compliance Health</h2>
                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  <GaugeCard label="SLA Within 7 Days" value={toPct(metrics.slaWithin7Days)} tone="sky" />
                  <GaugeCard label="Case Closure Rate" value={toPct(metrics.closureRate)} tone="emerald" />
                  <GaugeCard label="Under Review Rate" value={toPct(metrics.underReviewRate)} tone="violet" />
                </div>
              </article>

              <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <h2 className="text-sm font-bold uppercase tracking-[0.14em] text-slate-500">Severity Mix</h2>
                <div className="mt-4 space-y-3">
                  {severityMix.rows.map((row) => {
                    const width = Math.max(6, Math.round((row.value / severityMix.max) * 100));
                    return (
                      <div key={row.label}>
                        <div className="mb-1 flex items-center justify-between text-xs font-semibold text-slate-600">
                          <span>{row.label}</span>
                          <span>{row.value}</span>
                        </div>
                        <div className="h-2 rounded-full bg-slate-100">
                          <div className={`h-2 rounded-full ${row.tone}`} style={{ width: `${width}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </article>
            </section>

            <section className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
              <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <h2 className="text-sm font-bold uppercase tracking-[0.14em] text-slate-500">Control Checklist</h2>
                <div className="mt-4 space-y-3">
                  {complianceChecks.map((check) => (
                    <div key={check.title} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-slate-900">{check.title}</p>
                          <p className="mt-1 text-xs text-slate-600">{check.detail}</p>
                        </div>
                        <span
                          className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 text-[11px] font-semibold ${
                            check.status === "pass"
                              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                              : "border-amber-200 bg-amber-50 text-amber-700"
                          }`}
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          {check.status === "pass" ? "Aligned" : "Review"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </article>

              <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <h2 className="text-sm font-bold uppercase tracking-[0.14em] text-slate-500">Risk Watchlist</h2>
                <div className="mt-4 space-y-2">
                  {recentRisks.map((item) => (
                    <div key={item.id} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-semibold text-slate-900">{item.complaint_code}</p>
                        <span className={`rounded-full border px-2 py-0.5 text-[11px] font-semibold ${statusTone(item.status)}`}>
                          {statusLabel(item.status)}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-slate-600">Severity: {item.severity_score} · Location: {item.location || "Unassigned"}</p>
                    </div>
                  ))}

                  {!loading && recentRisks.length === 0 ? (
                    <p className="text-sm text-slate-600">No active high-priority risk items.</p>
                  ) : null}
                </div>
              </article>
            </section>

            <p className="inline-flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
              <TriangleAlert className="mt-0.5 h-3.5 w-3.5" />
              Compliance indicators support governance review and prioritization. They do not replace formal HR adjudication.
            </p>
          </section>
          )}
        </section>
      </div>
    </main>
  );
}

function MetricCard({
  label,
  value,
  tone,
  sub,
}: {
  label: string;
  value: number;
  tone: "slate" | "sky" | "amber" | "rose";
  sub: string;
}) {
  const toneMap = {
    slate: "border-slate-200 bg-white",
    sky: "border-sky-200 bg-sky-50/70",
    amber: "border-amber-200 bg-amber-50/70",
    rose: "border-rose-200 bg-rose-50/70",
  };

  return (
    <article className={`rounded-2xl border p-4 shadow-sm ${toneMap[tone]}`}>
      <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-black text-slate-900">{value}</p>
      <p className="text-xs text-slate-600">{sub}</p>
    </article>
  );
}

function GaugeCard({ label, value, tone }: { label: string; value: string; tone: "sky" | "emerald" | "violet" }) {
  const toneMap = {
    sky: "border-sky-200 bg-sky-50 text-sky-700",
    emerald: "border-emerald-200 bg-emerald-50 text-emerald-700",
    violet: "border-violet-200 bg-violet-50 text-violet-700",
  };

  return (
    <div className={`rounded-xl border p-3 ${toneMap[tone]}`}>
      <p className="text-[11px] font-bold uppercase tracking-[0.08em]">{label}</p>
      <p className="mt-1 text-xl font-black">{value}</p>
    </div>
  );
}

const HrBrandLogo = () => {
  return (
    <Link href="/" className="flex items-center py-1 text-sm">
      <span className="font-semibold tracking-[0.14em] text-white">ETHOS</span>
    </Link>
  );
};

const HrBrandIcon = () => {
  return (
    <Link href="/" className="flex items-center py-1 text-sm">
      <ShieldCheck className="h-5 w-5 text-white" />
    </Link>
  );
};
