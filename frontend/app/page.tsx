"use client";

import * as React from "react";
import Link from "next/link";
import { ModernBackground } from "@/components/modern-background";
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
      </div>
  );
}