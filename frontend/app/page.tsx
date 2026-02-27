"use client";

import * as React from "react";
import Link from "next/link";
import { Shield, Lock, EyeOff, Scale, ChevronRight, CheckCircle2, MessageSquare, Zap, Fingerprint } from "lucide-react";
import { ModernBackground } from "@/components/modern-background";
import { Grainient } from "@/components/grainient";
import { useAuth } from "@/components/auth/auth-context";

export default function LandingPage() {
  const { user, isAuthenticated } = useAuth();
  const [hasMounted, setHasMounted] = React.useState(false);

  React.useEffect(() => {
    setHasMounted(true);
  }, []);

  const isHrUser = hasMounted && user?.userType === "hr";
  const portalHref = hasMounted && isAuthenticated ? (isHrUser ? "/hr/dashboard" : "/dashboard") : "/auth/login";
  const portalLabel =
    hasMounted && isAuthenticated ? (isHrUser ? "Go to HR Dashboard" : "Go to User Dashboard") : "Enter Portal";
  const hrHref = hasMounted && isHrUser ? "/hr/dashboard" : "/hr/login";

  return (
    <div className="relative min-h-screen text-foreground transition-colors duration-500">
      <ModernBackground />

      {/* Navigation Header */}
      <header className="fixed top-0 w-full border-b border-foreground/[0.03] bg-background/60 backdrop-blur-2xl z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 group cursor-pointer">
            <span className="font-extrabold text-2xl tracking-tighter text-foreground/90 font-logo">ETHOS</span>
          </div>
          <div className="flex items-center gap-10">
            <nav className="hidden lg:flex items-center gap-10 text-[13px] font-bold uppercase tracking-widest text-muted-foreground/80">
              <Link href="/safety-guide" className="hover:text-primary transition-colors">Safety Guide</Link>
              <Link href="/legal-framework" className="hover:text-primary transition-colors">Legal Framework</Link>
              <Link href={hrHref} className="hover:text-primary transition-colors">For HR</Link>
            </nav>
            <div className="h-6 w-px bg-foreground/[0.08] hidden lg:block" />
            <div className="flex items-center gap-5">
              <Link
                href={portalHref}
                className="hidden sm:block bg-foreground text-background px-7 py-2.5 rounded-full font-bold text-xs uppercase tracking-widest hover:translate-y-[-2px] hover:shadow-xl transition-all active:scale-95"
              >
                {portalLabel}
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="pb-40">
        <section className="w-full relative pt-20 overflow-hidden bg-background min-h-[calc(100svh-5rem)] flex items-center">
          <Grainient
            color1="#9ea1ff"
            color2="#5227FF"
            color3="#B19EEF"
            timeSpeed={0.25}
            colorBalance={0}
            warpStrength={1}
            warpFrequency={5}
            warpSpeed={2}
            warpAmplitude={50}
            blendAngle={0}
            blendSoftness={0.05}
            rotationAmount={500}
            noiseScale={2}
            grainAmount={0.1}
            grainScale={2}
            grainAnimated={false}
            contrast={1.5}
            gamma={1}
            saturation={1}
            centerX={0}
            centerY={0}
            zoom={0.9}
            className="opacity-50"
          />
          <div className="max-w-7xl mx-auto px-6 text-center relative z-10 py-16 md:py-20">
            <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-primary/[0.03] border border-primary/10 text-primary text-[11px] font-bold uppercase tracking-[0.2em] mb-12 animate-in fade-in slide-in-from-bottom-4 duration-1000">
              <Fingerprint className="w-3.5 h-3.5" />
              <span>Institutional Trust Framework</span>
            </div>

            <h1 className="text-5xl md:text-8xl font-extrabold tracking-[-0.04em] mb-10 leading-[1.1] text-balance max-w-5xl mx-auto">
              Integrity by design. <br />
              <span className="text-gradient">Technical certainty.</span>
            </h1>

            <p className="text-lg md:text-2xl text-muted-foreground max-w-2xl mx-auto mb-16 leading-relaxed font-medium tracking-tight opacity-90">
              The secure infrastructure for anonymous institutional disclosure.
              Protecting identity through cryptographic isolation.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <button className="group w-full sm:w-auto bg-primary hover:bg-primary/95 text-white px-10 py-5 rounded-2xl font-bold text-sm uppercase tracking-widest flex items-center justify-center gap-3 transition-all hover:translate-y-[-2px] shadow-2xl shadow-primary/20">
                Submit Secure Report <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="w-full sm:w-auto glass bg-card/10 hover:bg-card/30 px-10 py-5 rounded-2xl font-bold text-sm uppercase tracking-widest transition-all border border-foreground/[0.03]">
                Privacy Protocol
              </button>
            </div>
          </div>
        </section>

        {/* Section 2: Architecture & Analysis Section */}
        <section className="w-full relative py-32 md:py-48 bg-foreground/[0.01] border-y border-foreground/[0.02]">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-1 px-1 rounded-[40px] glass bg-white/[0.02] overflow-hidden">
              <div className="p-12 text-left hover:bg-white/[0.03] transition-colors group cursor-default">
                <div className="w-14 h-14 rounded-2xl bg-primary/5 border border-primary/10 flex items-center justify-center mb-10 group-hover:bg-primary group-hover:text-white transition-all duration-300">
                  <Lock className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold uppercase tracking-widest mb-4">Post-Metadata Architecture</h3>
                <p className="text-muted-foreground leading-relaxed text-[15px] font-medium opacity-80">
                  Our servers physically cannot store IP addresses, device IDs, or behavioral metadata.
                </p>
              </div>

              <div className="p-12 text-left border-y md:border-y-0 md:border-x border-foreground/[0.03] hover:bg-white/[0.03] transition-colors group cursor-default">
                <div className="w-14 h-14 rounded-2xl bg-accent/5 border border-accent/10 flex items-center justify-center mb-10 group-hover:bg-accent group-hover:text-white transition-all duration-300">
                  <EyeOff className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold uppercase tracking-widest mb-4">Zero-Trace Analysis</h3>
                <p className="text-muted-foreground leading-relaxed text-[15px] font-medium opacity-80">
                  Reports are processed in volatile memory environments and destroyed immediately after encryption.
                </p>
              </div>

              <div className="p-12 text-left hover:bg-white/[0.03] transition-colors group cursor-default">
                <div className="w-14 h-14 rounded-2xl bg-success/5 border border-success/10 flex items-center justify-center mb-10 group-hover:bg-success group-hover:text-white transition-all duration-300">
                  <Scale className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold uppercase tracking-widest mb-4">Regulatory Compliance</h3>
                <p className="text-muted-foreground leading-relaxed text-[15px] font-medium opacity-80">
                  Compliant with global whistleblower protections including EU 2019/1937 and US Sarbanes-Oxley.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Professional Guarantee Section */}
        <section className="px-6 mb-48">
          <div className="max-w-6xl mx-auto glass p-10 md:p-20 rounded-[4rem] bg-linear-to-br from-primary/[0.02] to-accent/[0.02] border border-foreground/[0.03] relative overflow-hidden group">
            <div className="relative z-10 flex flex-col md:flex-row items-center gap-16 md:gap-24">
              <div className="text-center md:text-left flex-1">
                <div className="inline-flex items-center gap-3 text-success font-black text-[11px] uppercase tracking-[0.3em] mb-8">
                  <CheckCircle2 className="w-5 h-5" />
                  Legal Audit Certified
                </div>
                <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-8">The Professional Guarantee.</h2>
                <p className="text-muted-foreground text-lg md:text-xl font-medium leading-relaxed max-w-xl italic">
                  &ldquo;ETHOS is the only platform we&apos;ve audited that provides true technical isolation of identity rather than just policy-based promises.&rdquo;
                </p>
                <div className="mt-8 flex items-center gap-4">
                  <div className="w-12 h-12 bg-zinc-200 dark:bg-zinc-800 rounded-full" />
                  <div>
                    <p className="font-bold text-sm">Dr. Marcus Vance</p>
                    <p className="text-xs text-muted-foreground uppercase font-black tracking-widest">Privacy Compliance Lead</p>
                  </div>
                </div>
              </div>
              <div className="hidden lg:block w-px h-64 bg-foreground/[0.05]" />
              <div className="flex flex-col gap-10">
                <div className="flex items-center gap-6">
                  <Zap className="text-primary w-8 h-8" />
                  <div>
                    <p className="text-2xl font-black">2.4ms</p>
                    <p className="text-xs font-bold uppercase tracking-widest opacity-60">Avg. Encryption Time</p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <Shield className="text-accent w-8 h-8" />
                  <div>
                    <p className="text-2xl font-black">256-Bit</p>
                    <p className="text-xs font-bold uppercase tracking-widest opacity-60">RSA Neural Hashing</p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <MessageSquare className="text-success w-8 h-8" />
                  <div>
                    <p className="text-2xl font-black">100%</p>
                    <p className="text-xs font-bold uppercase tracking-widest opacity-60">Anonymous Uptime</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Restructured Steps Section */}
        <section className="max-w-6xl mx-auto px-6 mb-48">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-24 relative">
            <div className="group flex flex-col items-start">
              <span className="text-6xl font-black text-foreground/5 mb-8 group-hover:text-primary/10 transition-colors">01</span>
              <h3 className="text-2xl font-extrabold mb-4 uppercase tracking-tight">Disclosure</h3>
              <p className="text-muted-foreground font-medium text-[15px] leading-relaxed">Capture findings in our secure workspace. All evidence is automatically sanitized and encrypted.</p>
            </div>

            <div className="group flex flex-col items-start">
              <span className="text-6xl font-black text-foreground/5 mb-8 group-hover:text-accent/10 transition-colors">02</span>
              <h3 className="text-2xl font-extrabold mb-4 uppercase tracking-tight">Shielding</h3>
              <p className="text-muted-foreground font-medium text-[15px] leading-relaxed">Our Neutrality Core processes the report, stripping all identifiers and creating a unique access key.</p>
            </div>

            <div className="group flex flex-col items-start">
              <span className="text-6xl font-black text-foreground/5 mb-8 group-hover:text-success/10 transition-colors">03</span>
              <h3 className="text-2xl font-extrabold mb-4 uppercase tracking-tight">Resolution</h3>
              <p className="text-muted-foreground font-medium text-[15px] leading-relaxed">Engage with investigators via protected channels. Your safety is maintained throughout the case lifecycle.</p>
            </div>
          </div>
        </section>

        {/* Global CTA Section */}
        <section className="max-w-7xl mx-auto px-6">
          <div className="bg-zinc-950 text-white rounded-[5rem] p-16 md:p-32 relative overflow-hidden text-center group">
            <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
              <div className="absolute inset-x-[-100%] inset-y-[-100%] bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.2),transparent_70%)] group-hover:scale-110 transition-transform duration-1000" />
            </div>

            <div className="relative z-10">
              <h2 className="text-5xl md:text-8xl font-black mb-12 tracking-tighter italic">
                INTEGRITY WITHOUT <br />
                <span className="text-primary italic">EXTINGUISHMENT.</span>
              </h2>
              <button className="bg-white text-black px-16 py-7 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:scale-105 active:scale-95 transition-all shadow-xl shadow-white/5">
                Join the Network
              </button>
              <div className="mt-16 text-[9px] uppercase font-bold tracking-[0.6em] opacity-30">
                End-to-End Encryption [ACTIVE] | Identity Cloaking [ACTIVE]
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-foreground/[0.03] py-24 bg-background/50 relative overflow-hidden mt-40">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-24 mb-24">
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-8">
                <span className="font-extrabold text-2xl tracking-tighter font-logo">ETHOS</span>
              </div>
              <p className="text-muted-foreground max-w-sm text-lg font-medium leading-relaxed mb-12 italic opacity-80">
                The global infrastructure for anonymous institutional reporting. Built for safety, defined by integrity.
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-8 text-[11px] uppercase tracking-[0.2em] text-foreground/40">Infrastructure</h4>
              <ul className="space-y-5 font-bold text-sm tracking-tight text-muted-foreground uppercase opacity-70">
                <li><a href="#" className="hover:text-primary transition-colors">Neural Security</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Privacy Shield</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Audit V2.4</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-8 text-[11px] uppercase tracking-[0.2em] text-foreground/40">Compliance</h4>
              <ul className="space-y-5 font-bold text-sm tracking-tight text-muted-foreground uppercase opacity-70">
                <li><a href="#" className="hover:text-primary transition-colors">EU Protection</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Legal Framework</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Safety Matrix</a></li>
              </ul>
            </div>
          </div>
          <div className="pt-12 border-t border-foreground/[0.03] flex justify-between items-center text-[10px] font-bold uppercase tracking-[0.3em] opacity-30">
            <span>© 2026 ETHOS PLATFORMS — ALL RIGHTS RESERVED.</span>
            <div className="flex gap-10">
              <span>SECURED BY RSA-512</span>
              <span className="text-success">NODE: ONLINE</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
