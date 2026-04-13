import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import {
  Menu,
  X,
  Sun,
  Shield,
  Smartphone,
  Users,
  ArrowRight,
  Check,
  Battery,
  Gauge,
  CloudSun,
  Settings2,
  LineChart,
  Bell,
  Sparkles,
  Workflow,
  Activity,
} from "lucide-react";
import { useState } from "react";

const headerLinks = [
  { label: "About", to: "/info/about" },
  { label: "Features", to: "/info/features" },
  { label: "Changelog", to: "/info/changelog" },
  { label: "FAQs", to: "/info/faqs" },
];

const features = [
  {
    icon: Gauge,
    title: "Real-Time Monitoring",
    desc: "Track production and consumption with live telemetry and clear performance trends.",
  },
  {
    icon: LineChart,
    title: "Smart Analytics",
    desc: "Get practical insights on usage patterns, peak loads, and optimization opportunities.",
  },
  {
    icon: Battery,
    title: "Battery Intelligence",
    desc: "Protect battery health with charge-cycle visibility and schedule-aware automation.",
  },
  {
    icon: Bell,
    title: "Action Alerts",
    desc: "Receive timely alerts for anomalies, weather impact, and maintenance priorities.",
  },
  {
    icon: CloudSun,
    title: "Weather-Aware Planning",
    desc: "Forecast-based recommendations keep your system efficient through changing conditions.",
  },
  {
    icon: Settings2,
    title: "Remote Control",
    desc: "Adjust settings, schedules, and operational modes from web or mobile in seconds.",
  },
];

const trustMetrics = [
  {
    value: "31%",
    label: "Average Cost Reduction",
    detail: "within first 90 days",
  },
  {
    value: "99.95%",
    label: "Platform Availability",
    detail: "across distributed sites",
  },
  {
    value: "4.7x",
    label: "Faster Issue Resolution",
    detail: "with guided workflows",
  },
];

const trustedTeams = [
  "EPC Operations",
  "O&M Providers",
  "Commercial Assets",
  "Industrial Plants",
];

const Landing = () => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="fixed inset-x-0 top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-xl">
        <header className="mx-auto flex h-[112px] w-full max-w-[1220px] items-center justify-between px-5 lg:px-8">
          <Link
            to="/"
            className="flex min-w-[320px] flex-col items-start justify-center lg:min-w-[390px]"
          >
            <div className="h-[52px] w-[220px] overflow-hidden sm:h-[58px] sm:w-[240px] lg:h-[72px] lg:w-[320px]">
              <img
                src="/transparent%20logo.png"
                alt="SPD Nexus"
                className="h-full w-full origin-left object-contain object-left scale-[1.95]"
              />
            </div>
            <p className="mt-1 pl-0.5 text-[10px] font-semibold uppercase leading-none tracking-[0.2em] text-muted-foreground sm:text-[11px]">
              Solar Project Intelligence Platform
            </p>
          </Link>

          <nav className="hidden items-center gap-9 md:flex">
            {headerLinks.map((item) => (
              <Link
                key={item.label}
                to={item.to}
                className="text-[16px] font-medium text-foreground/70 transition-colors hover:text-foreground"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="hidden items-center gap-5 md:flex">
            <Link
              to="/info/contact"
              className="text-sm font-semibold text-foreground/70 transition-colors hover:text-foreground"
            >
              Book Demo
            </Link>
            <Button
              onClick={() => navigate("/login")}
              className="h-12 rounded-full bg-solar px-7 text-base font-semibold text-solar-foreground shadow-[0_12px_28px_hsl(var(--solar)/0.36)] transition hover:bg-solar/90"
            >
              Start Now
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="z-50 rounded-xl p-2 md:hidden"
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6 text-foreground" />
            ) : (
              <Menu className="h-6 w-6 text-foreground" />
            )}
          </button>
        </header>

        {mobileMenuOpen ? (
          <nav className="mx-auto grid w-full max-w-[1220px] gap-3 border-t border-border bg-background px-5 py-4 md:hidden">
            {headerLinks.map((item) => (
              <Link
                key={item.label}
                to={item.to}
                className="text-sm font-medium text-foreground/80"
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <Button
              onClick={() => navigate("/login")}
              className="mt-1 h-11 rounded-full bg-solar font-semibold text-solar-foreground hover:bg-solar/90"
            >
              Start Now
            </Button>
          </nav>
        ) : null}
      </div>

      <main>
        <section className="relative overflow-hidden pt-28">
          <div className="hero-grid-overlay pointer-events-none absolute inset-0" />
          <div className="pointer-events-none absolute -left-24 top-8 h-[360px] w-[360px] rounded-full bg-[#f0c464]/25 blur-3xl float-slow" />
          <div className="pointer-events-none absolute -right-16 top-32 h-[320px] w-[320px] rounded-full bg-[#18345b]/20 blur-3xl" />
          <div className="mx-auto grid w-full max-w-[1220px] gap-11 px-5 pb-8 pt-3 lg:grid-cols-[1.12fr_0.88fr] lg:items-center lg:px-8">
            <div className="relative z-10 fade-in-up">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-solar-dim">
                Enterprise Solar Operations Platform
              </p>
              <h1 className="mt-3 font-display text-[clamp(2.5rem,6vw,5.3rem)] font-extrabold leading-[0.9] tracking-[-0.03em] text-[#14120d]">
                Control Every Solar
                <br />
                Decision With Clarity.
              </h1>
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-foreground/75 lg:text-[1.32rem] lg:leading-[1.7]">
                Unify production telemetry, battery intelligence, field tasks,
                and project governance in one command center built for serious
                teams.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button
                  onClick={() => navigate("/signup")}
                  className="h-12 rounded-full bg-solar px-8 text-base font-semibold text-solar-foreground shadow-[0_14px_30px_hsl(var(--solar)/0.32)] transition hover:-translate-y-0.5 hover:bg-solar/90"
                >
                  Start Free Trial
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigate("/login")}
                  className="h-12 rounded-full border-border bg-card/70 px-8 text-base font-semibold text-foreground hover:bg-card"
                >
                  Open Workspace
                </Button>
              </div>

              <div className="mt-8 flex flex-wrap items-center gap-3 text-sm text-foreground/75">
                <div className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-card/80 px-4 py-2 font-medium">
                  <Sun className="h-4 w-4 text-solar-dim" />
                  Trusted by high-output solar teams
                </div>
                <p className="text-sm font-medium text-foreground/65">
                  Across 6+ regions
                </p>
              </div>
            </div>

            <div className="relative z-10 mx-auto w-full max-w-[560px] fade-in-up [animation-delay:160ms]">
              <div className="relative overflow-hidden rounded-[36px] border border-[#152338] bg-[#0f1b2b] p-2 shadow-[0_26px_56px_rgba(8,15,27,0.42)]">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_14%_12%,rgba(240,196,100,0.2),transparent_36%),radial-gradient(circle_at_86%_90%,rgba(67,122,180,0.24),transparent_40%)]" />
                <div className="relative overflow-hidden rounded-[28px] border border-white/10">
                  <img
                    src="/image.png"
                    alt="Solar installation"
                    className="h-[390px] w-full object-cover object-center saturate-[0.9] sm:h-[450px]"
                  />
                  <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,rgba(9,17,29,0.06),rgba(9,17,29,0.58))]" />
                </div>

                <div className="absolute left-5 top-5 rounded-2xl border border-white/20 bg-[#101e30]/78 px-4 py-3 text-white shadow-[0_12px_24px_rgba(2,8,18,0.45)] backdrop-blur-md sm:left-6 sm:top-6">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/70">
                    Live Output
                  </p>
                  <p className="mt-1 text-[1.95rem] font-extrabold leading-none text-white sm:text-[2.15rem]">
                    2.34 MW
                  </p>
                </div>

                <div className="absolute bottom-5 right-5 rounded-2xl border border-white/20 bg-[#101e30]/78 px-4 py-3 text-white shadow-[0_12px_24px_rgba(2,8,18,0.45)] backdrop-blur-md sm:bottom-6 sm:right-6">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/70">
                    Tasks Closed
                  </p>
                  <p className="mt-1 text-[1.95rem] font-extrabold leading-none text-white sm:text-[2.15rem]">
                    1,248
                  </p>
                </div>

                <div className="absolute inset-x-10 bottom-2 h-10 rounded-full bg-[#081221]/55 blur-2xl" />
              </div>
            </div>
          </div>

          <div className="mx-auto w-full max-w-[1220px] px-5 pb-16 lg:px-8">
            <div className="surface-card grid gap-4 rounded-[30px] p-5 md:grid-cols-[1.2fr_1fr] lg:p-6">
              <div className="grid gap-3 sm:grid-cols-3 stagger-animate">
                {trustMetrics.map((metric) => (
                  <div
                    key={metric.label}
                    className="rounded-2xl border border-border/80 bg-card/90 px-4 py-4"
                  >
                    <p className="text-2xl font-extrabold text-foreground">
                      {metric.value}
                    </p>
                    <p className="mt-1 text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                      {metric.label}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground/90">
                      {metric.detail}
                    </p>
                  </div>
                ))}
              </div>

              <div className="rounded-2xl border border-border/80 bg-card/90 px-4 py-4">
                <p className="text-xs font-semibold uppercase tracking-[0.13em] text-muted-foreground">
                  Trusted Across Teams
                </p>
                <div className="mt-3 flex flex-wrap gap-2 text-sm font-medium text-foreground/85">
                  {trustedTeams.map((team) => (
                    <span
                      key={team}
                      className="rounded-full border border-border/70 bg-background px-3 py-1"
                    >
                      {team}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="py-18 lg:py-24">
          <div className="mx-auto w-full max-w-[1220px] px-5 lg:px-8">
            <div className="mb-10 flex items-end justify-between gap-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-solar-dim">
                  Core Capabilities
                </p>
                <h2 className="mt-2 font-display text-3xl font-extrabold tracking-tight text-foreground lg:text-4xl">
                  Built for Real Solar Operations
                </h2>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 stagger-animate">
              {features.map((feature) => (
                <article
                  key={feature.title}
                  className="group surface-card rounded-3xl p-6 transition hover:-translate-y-1"
                >
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-solar/20 text-solar-dim">
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground">
                    {feature.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-foreground/70">
                    {feature.desc}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="relative overflow-hidden bg-navy py-18 text-white lg:py-24">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_8%_16%,rgba(240,196,100,0.24),transparent_30%),radial-gradient(circle_at_90%_84%,rgba(63,114,165,0.4),transparent_34%)]" />
          <div className="mx-auto w-full max-w-[1220px] px-5 lg:px-8">
            <div className="mb-10 text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#f4cc75]">
                Workflow
              </p>
              <h2 className="mt-2 font-display text-3xl font-extrabold tracking-tight lg:text-4xl">
                Three Steps To Full Control
              </h2>
            </div>

            <div className="grid gap-5 md:grid-cols-3">
              {[
                {
                  step: "01",
                  title: "Connect",
                  desc: "Onboard inverter, battery, and panel data in minutes.",
                },
                {
                  step: "02",
                  title: "Monitor",
                  desc: "Track live performance, deals, tasks, and handoffs.",
                },
                {
                  step: "03",
                  title: "Optimize",
                  desc: "Use alerts and automation to increase yield and reliability.",
                },
              ].map((item) => (
                <article
                  key={item.step}
                  className="rounded-3xl border border-white/15 bg-white/5 p-6 backdrop-blur-sm"
                >
                  <div className="mb-4 inline-flex rounded-xl bg-solar px-3 py-1 text-xs font-bold tracking-[0.12em] text-solar-foreground">
                    {item.step}
                  </div>
                  <h3 className="text-xl font-bold">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-white/70">
                    {item.desc}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="about" className="py-18 lg:py-24">
          <div className="mx-auto grid w-full max-w-[1220px] gap-8 px-5 lg:grid-cols-2 lg:px-8">
            <div className="surface-card rounded-3xl p-7 lg:p-8">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-solar-dim">
                Trust & Reliability
              </p>
              <h3 className="mt-2 font-display text-3xl font-extrabold tracking-tight text-foreground">
                Designed for teams that run real projects
              </h3>
              <div className="mt-6 space-y-4">
                {[
                  "Role-based access and secure audit trails",
                  "Mobile-first execution for field teams",
                  "Actionable alerts, not dashboard noise",
                ].map((item) => (
                  <div key={item} className="flex items-start gap-3">
                    <div className="mt-0.5 rounded-full bg-solar p-1">
                      <Check className="h-3.5 w-3.5 text-solar-foreground" />
                    </div>
                    <p className="text-sm text-foreground/75">{item}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="surface-card rounded-3xl p-7 lg:p-8">
              <div className="space-y-5">
                {[
                  {
                    icon: Shield,
                    title: "Enterprise Security",
                    desc: "Protected workflows with robust access controls.",
                  },
                  {
                    icon: Smartphone,
                    title: "Any Device Access",
                    desc: "Desktop and mobile coverage for office and field.",
                  },
                  {
                    icon: Users,
                    title: "Team Collaboration",
                    desc: "Shared visibility across sales, ops, and execution.",
                  },
                ].map((item) => (
                  <div key={item.title} className="flex gap-4">
                    <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-solar/20">
                      <item.icon className="h-5 w-5 text-solar-dim" />
                    </div>
                    <div>
                      <p className="font-bold text-foreground">{item.title}</p>
                      <p className="text-sm text-foreground/70">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="pb-8">
          <div className="mx-auto w-full max-w-[1220px] px-5 lg:px-8">
            <div className="grid gap-4 md:grid-cols-3">
              {[
                {
                  icon: Workflow,
                  title: "Role Aware Workflows",
                  desc: "Admin, field, procurement, and client views all stay in sync without email loops.",
                },
                {
                  icon: Sparkles,
                  title: "Action-First UI",
                  desc: "Clear hierarchy keeps teams focused on what to do next instead of where to click.",
                },
                {
                  icon: Activity,
                  title: "Live Operational Signals",
                  desc: "Track progress, blockers, and quality checks in one source of truth.",
                },
              ].map((item) => (
                <article
                  key={item.title}
                  className="surface-card rounded-3xl p-6"
                >
                  <item.icon className="h-8 w-8 text-solar-dim" />
                  <h3 className="mt-4 text-lg font-bold text-foreground">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-foreground/70">
                    {item.desc}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-navy py-18 text-center text-white lg:py-24">
          <div className="mx-auto w-full max-w-[900px] px-5 lg:px-8">
            <h2 className="font-display text-3xl font-extrabold tracking-tight lg:text-5xl">
              Clean solar operations start here.
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-white/70">
              Launch quickly, align your team, and optimize system performance
              with a platform designed for clarity.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button
                onClick={() => navigate("/signup")}
                className="h-12 rounded-full bg-solar px-8 text-base font-semibold text-solar-foreground hover:bg-solar/90"
              >
                Create Account
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate("/login")}
                className="h-12 rounded-full border-white/25 bg-white/5 px-8 text-base text-white hover:bg-white/10"
              >
                Sign In
              </Button>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border/70 bg-background py-10">
        <div className="mx-auto flex w-full max-w-[1220px] flex-col items-start justify-between gap-6 px-5 md:flex-row md:items-center lg:px-8">
          <div>
            <p className="text-base font-bold text-foreground">SPD Nexus</p>
            <p className="text-sm text-muted-foreground">
              Solar command for modern teams.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-5 text-sm font-medium text-foreground/70">
            <Link to="/info/features" className="hover:text-foreground">
              Features
            </Link>
            <Link to="/info/about" className="hover:text-foreground">
              About
            </Link>
            <Link to="/info/faqs" className="hover:text-foreground">
              FAQs
            </Link>
            <Link to="/info/contact" className="hover:text-foreground">
              Contact
            </Link>
          </div>
          <p className="text-sm text-muted-foreground">© 2026 SPD Nexus</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
