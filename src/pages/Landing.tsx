import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import {
  Menu,
  X,
  Zap,
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

const testimonials = [
  {
    name: "Sarah Mitchell",
    role: "Homeowner, California",
    quote:
      "Solar Tracker reduced our monthly electricity spend fast. We finally have clear control over usage.",
  },
  {
    name: "James Rodriguez",
    role: "Facility Manager, Texas",
    quote:
      "Managing multiple sites used to be chaotic. Now every decision is based on one reliable dashboard.",
  },
  {
    name: "Priya Sharma",
    role: "Business Owner, Dubai",
    quote:
      "Maintenance alerts helped us avoid downtime. The ROI visibility is exactly what we needed.",
  },
];

const Landing = () => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div
      className="min-h-screen bg-[#f5f2e8] text-[#201a10]"
      style={{ fontFamily: "'Poppins', 'Segoe UI', sans-serif" }}
    >
      <div className="fixed inset-x-0 top-0 z-50 border-b border-[#e9ddc4] bg-[#f5f2e8]/85 backdrop-blur-xl">
        <header className="mx-auto flex h-20 w-full max-w-[1220px] items-center justify-between px-5 lg:px-8">
          <Link to="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#d4a017] shadow-[0_8px_20px_rgba(212,160,23,0.35)]">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-xl font-extrabold leading-none tracking-tight">
                SPD Nexus
              </p>
              <p className="text-xs font-medium uppercase tracking-[0.16em] text-[#7f704e]">
                Solar Command Platform
              </p>
            </div>
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            {headerLinks.map((item) => (
              <Link
                key={item.label}
                to={item.to}
                className="text-sm font-medium text-[#62563d] transition hover:text-[#241d11]"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="hidden md:flex">
            <Button
              onClick={() => navigate("/login")}
              className="h-11 rounded-full bg-[#d4a017] px-6 font-semibold text-white shadow-[0_10px_24px_rgba(212,160,23,0.35)] transition hover:bg-[#b8860b]"
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
              <X className="h-6 w-6 text-[#3a311f]" />
            ) : (
              <Menu className="h-6 w-6 text-[#3a311f]" />
            )}
          </button>
        </header>

        {mobileMenuOpen ? (
          <nav className="mx-auto grid w-full max-w-[1220px] gap-3 border-t border-[#e9ddc4] bg-[#f5f2e8] px-5 py-4 md:hidden">
            {headerLinks.map((item) => (
              <Link
                key={item.label}
                to={item.to}
                className="text-sm font-medium text-[#4e432c]"
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <Button
              onClick={() => navigate("/login")}
              className="mt-1 h-11 rounded-full bg-[#d4a017] font-semibold text-white hover:bg-[#b8860b]"
            >
              Start Now
            </Button>
          </nav>
        ) : null}
      </div>

      <main>
        <section className="relative overflow-hidden pt-28">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_10%_20%,rgba(212,160,23,0.18),transparent_36%),radial-gradient(circle_at_95%_10%,rgba(184,134,11,0.16),transparent_38%)]" />
          <div className="mx-auto grid w-full max-w-[1220px] gap-10 px-5 pb-14 pt-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:px-8">
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#ead6a8] bg-[#fff4dc] px-4 py-2 text-xs font-semibold uppercase tracking-[0.15em] text-[#8a6a00]">
                <Sun className="h-4 w-4" />
                Solar Performance Command
              </div>
              <h1 className="mt-5 text-[clamp(2.4rem,6.2vw,5.4rem)] font-extrabold leading-[0.93] tracking-tight text-[#221b11]">
                Control Your Solar
                <br />
                With Total Clarity.
              </h1>
              <p className="mt-6 max-w-xl text-base leading-relaxed text-[#5f5236] lg:text-lg">
                A clean operations platform for production, battery health,
                project workflows, and field execution. One place to monitor,
                optimize, and move faster.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button
                  onClick={() => navigate("/signup")}
                  className="h-12 rounded-full bg-[#d4a017] px-7 text-base font-semibold text-white shadow-[0_10px_24px_rgba(212,160,23,0.35)] transition hover:bg-[#b8860b]"
                >
                  Get Started Free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigate("/login")}
                  className="h-12 rounded-full border-[#cab180] bg-[#f8f1e1] px-7 text-base font-semibold text-[#2f2615] hover:bg-[#f2e5c7]"
                >
                  Open Dashboard
                </Button>
              </div>

              <div className="mt-8 grid max-w-xl grid-cols-3 gap-3">
                {[
                  { value: "100K+", label: "Active Users" },
                  { value: "99.9%", label: "Platform Uptime" },
                  { value: "30%", label: "Avg Savings" },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-2xl border border-[#e8dbbf] bg-[#fbf6ec] px-4 py-3"
                  >
                    <p className="text-xl font-extrabold text-[#2d2212]">
                      {stat.value}
                    </p>
                    <p className="text-xs font-medium text-[#7a6b48]">
                      {stat.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative z-10">
              <div className="absolute -right-6 -top-6 h-40 w-40 rounded-full bg-[#d4a017]/25 blur-3xl" />
              <div className="rounded-[30px] border border-[#d8c59b] bg-gradient-to-b from-[#fff4dc] to-[#f6ecd9] p-3 shadow-[0_22px_45px_rgba(86,64,18,0.2)]">
                <div className="overflow-hidden rounded-3xl">
                  <img
                    src="/image.png"
                    alt="Solar installation"
                    className="h-[420px] w-full object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="py-18 lg:py-24">
          <div className="mx-auto w-full max-w-[1220px] px-5 lg:px-8">
            <div className="mb-10 flex items-end justify-between gap-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#8a6a00]">
                  Core Capabilities
                </p>
                <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-[#231b10] lg:text-4xl">
                  Built for Real Solar Operations
                </h2>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((feature) => (
                <article
                  key={feature.title}
                  className="group rounded-3xl border border-[#e7dbc4] bg-[#faf4e8] p-6 transition hover:-translate-y-1 hover:border-[#d6bc87] hover:shadow-[0_14px_30px_rgba(80,61,18,0.16)]"
                >
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#ffe8b3] text-[#8a6a00]">
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-bold text-[#211a10]">
                    {feature.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-[#66593d]">
                    {feature.desc}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-[#2a2214] py-18 text-white lg:py-24">
          <div className="mx-auto w-full max-w-[1220px] px-5 lg:px-8">
            <div className="mb-10 text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#f0ca72]">
                Workflow
              </p>
              <h2 className="mt-2 text-3xl font-extrabold tracking-tight lg:text-4xl">
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
                  className="rounded-3xl border border-[#4f4021] bg-[#342a18] p-6"
                >
                  <div className="mb-4 inline-flex rounded-xl bg-[#d4a017] px-3 py-1 text-xs font-bold tracking-[0.12em] text-white">
                    {item.step}
                  </div>
                  <h3 className="text-xl font-bold">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-[#cdbf9f]">
                    {item.desc}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="about" className="py-18 lg:py-24">
          <div className="mx-auto grid w-full max-w-[1220px] gap-8 px-5 lg:grid-cols-2 lg:px-8">
            <div className="rounded-3xl border border-[#e4d6bb] bg-[#faf3e6] p-7 lg:p-8">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#8a6a00]">
                Trust & Reliability
              </p>
              <h3 className="mt-2 text-3xl font-extrabold tracking-tight text-[#231b10]">
                Designed for teams that run real projects
              </h3>
              <div className="mt-6 space-y-4">
                {[
                  "Role-based access and secure audit trails",
                  "Mobile-first execution for field teams",
                  "Actionable alerts, not dashboard noise",
                ].map((item) => (
                  <div key={item} className="flex items-start gap-3">
                    <div className="mt-0.5 rounded-full bg-[#d4a017] p-1">
                      <Check className="h-3.5 w-3.5 text-white" />
                    </div>
                    <p className="text-sm text-[#5f5237]">{item}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-[#e4d6bb] bg-[#fff8ea] p-7 lg:p-8">
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
                    <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-[#ffe8b3]">
                      <item.icon className="h-5 w-5 text-[#8a6a00]" />
                    </div>
                    <div>
                      <p className="font-bold text-[#221b10]">{item.title}</p>
                      <p className="text-sm text-[#65593e]">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="pb-18 lg:pb-24">
          <div className="mx-auto w-full max-w-[1220px] px-5 lg:px-8">
            <div className="grid gap-4 md:grid-cols-3">
              {testimonials.map((item) => (
                <article
                  key={item.name}
                  className="rounded-3xl border border-[#e4d6bb] bg-[#fdf7eb] p-6"
                >
                  <p className="text-sm leading-relaxed text-[#5f5238]">
                    "{item.quote}"
                  </p>
                  <div className="mt-5 border-t border-[#eadfc9] pt-4">
                    <p className="font-bold text-[#231c11]">{item.name}</p>
                    <p className="text-xs text-[#7a6b48]">{item.role}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-[#2a2214] py-18 text-center text-white lg:py-24">
          <div className="mx-auto w-full max-w-[900px] px-5 lg:px-8">
            <h2 className="text-3xl font-extrabold tracking-tight lg:text-5xl">
              Clean solar operations start here.
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-[#cdbf9f]">
              Launch quickly, align your team, and optimize system performance
              with a platform designed for clarity.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button
                onClick={() => navigate("/signup")}
                className="h-12 rounded-full bg-[#d4a017] px-8 text-base font-semibold text-white hover:bg-[#b8860b]"
              >
                Create Account
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate("/login")}
                className="h-12 rounded-full border-[#5a4a2b] bg-[#352b17] px-8 text-base text-white hover:bg-[#42331b]"
              >
                Sign In
              </Button>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-[#e5d8be] bg-[#f5f2e8] py-10">
        <div className="mx-auto flex w-full max-w-[1220px] flex-col items-start justify-between gap-6 px-5 md:flex-row md:items-center lg:px-8">
          <div>
            <p className="text-base font-bold text-[#271f12]">SPD Nexus</p>
            <p className="text-sm text-[#766847]">
              Solar command for modern teams.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-5 text-sm font-medium text-[#66593d]">
            <Link to="/info/features" className="hover:text-[#2a2214]">
              Features
            </Link>
            <Link to="/info/about" className="hover:text-[#2a2214]">
              About
            </Link>
            <Link to="/info/faqs" className="hover:text-[#2a2214]">
              FAQs
            </Link>
            <Link to="/info/contact" className="hover:text-[#2a2214]">
              Contact
            </Link>
          </div>
          <p className="text-sm text-[#7a6b48]">© 2026 SPD Nexus</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
