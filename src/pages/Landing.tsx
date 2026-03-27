import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import {
  Menu,
  X,
  Zap,
  Sun,
  BarChart3,
  Shield,
  Smartphone,
  Users,
  ArrowRight,
  Check,
  ChevronRight,
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

const Landing = () => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div
      className="min-h-screen bg-[#e2e3ea]"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      {/* ===== HEADER ===== */}
      <header className="fixed top-0 left-0 right-0 z-50 px-6 lg:px-12 py-5 bg-[#e2e3ea]/90 backdrop-blur-md border-b border-gray-200/50 shadow-sm">
        <div className="max-w-[1400px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-full bg-[#4CAF50] flex items-center justify-center shadow-md">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold text-gray-900">
              Solar Tracker
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-8">
            {headerLinks.map((item) => (
              <Link
                key={item.label}
                to={item.to}
                className="text-gray-600 hover:text-gray-900 text-sm font-medium transition"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="hidden md:block">
            <Button
              onClick={() => navigate("/login")}
              className="bg-[#4CAF50] hover:bg-[#388E3C] text-white font-semibold rounded-full px-6 h-10 text-sm shadow-md hover:shadow-lg transition-all"
            >
              Get Started
              <Zap className="w-3.5 h-3.5 ml-1.5" />
            </Button>
          </div>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 z-50"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6 text-gray-700" />
            ) : (
              <Menu className="w-6 h-6 text-gray-700" />
            )}
          </button>
        </div>

        {mobileMenuOpen && (
          <nav className="md:hidden mt-4 pb-4 space-y-3 border-t border-gray-300/40 pt-4 bg-[#e2e3ea]">
            {headerLinks.map((item) => (
              <Link
                key={item.label}
                to={item.to}
                className="block text-gray-700 hover:text-[#4CAF50] font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <Button
              onClick={() => navigate("/login")}
              className="w-full bg-[#4CAF50] hover:bg-[#388E3C] text-white font-semibold rounded-full mt-2"
            >
              Take Control
            </Button>
          </nav>
        )}
      </header>

      {/* ===== HERO SECTION ===== */}
      <section className="relative overflow-hidden bg-[#e2e3ea] pb-0 pt-20">
        {/* Green diagonal flowing ribbon — exact reference image style */}
        <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
          <svg
            className="absolute top-0 left-0 w-full h-full"
            viewBox="0 0 1400 700"
            fill="none"
            preserveAspectRatio="xMidYMid slice"
          >
            {/* Primary thick band */}
            <path
              d="M780 -20 Q700 60 630 160 Q540 290 450 420 Q370 530 300 630 Q265 680 245 720 L490 720 Q510 680 545 630 Q620 530 700 420 Q790 290 880 160 Q950 60 1030 -20 Z"
              fill="#4CAF50"
            />
            {/* Shadow band behind */}
            <path
              d="M960 -20 Q880 60 810 160 Q720 290 630 420 Q550 530 480 630 Q445 680 425 720 L540 720 Q560 680 595 630 Q665 530 750 420 Q840 290 930 160 Q1000 60 1080 -20 Z"
              fill="#388E3C"
              opacity="0.45"
            />
          </svg>
        </div>

        <div className="max-w-[1400px] mx-auto px-6 lg:px-12 pt-8 pb-0 relative z-20">
          {/* Two-column hero layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-end">
            {/* Left Column - Text */}
            <div className="relative z-30 pb-14">
              <h1 className="text-[clamp(3rem,6.5vw,6.2rem)] font-black leading-[0.88] tracking-tight text-[#2f3d35] uppercase">
                <span className="flex items-center flex-wrap gap-x-3">
                  TAKE
                  <span className="inline-flex items-center align-middle">
                    <span className="relative w-[52px] h-[28px] bg-[#4CAF50] rounded-full inline-block shadow-inner">
                      <span className="absolute right-[3px] top-[3px] w-[22px] h-[22px] bg-white rounded-full shadow-md transition-all"></span>
                    </span>
                  </span>
                  CONTROL
                </span>
                <span className="block">OF YOUR SOLAR</span>
                <span className="block">SYSTEM</span>
                {/* <span className="flex items-center flex-wrap gap-x-3">
                  FROM
                  <span className="inline-flex items-center gap-0.1 text-white align-middle">
                    {[0, 0.2, 0.4].map((delay, i) => (
                      <svg key={i} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="animate-pulse" style={{ animationDelay: `${delay}s` }}>
                        <path d="M5 12h14M12 5l7 7-7 7" />
                      </svg>
                    ))}
                  </span>
                  <span style={{ color: "black", WebkitTextStroke: "2.5px #ffffff" }}>PALM</span>
                </span> */}
              </h1>

              <p className="mt-6 max-w-[520px] text-base lg:text-lg text-[#4c5a4f] font-medium leading-relaxed">
                Track generation in real time, automate energy usage, and run
                your entire solar setup from one smart dashboard.
              </p>

              {/* Satisfied Users */}
              <div className="flex items-center gap-4 mt-10">
                <div className="flex -space-x-3">
                  {[
                    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face",
                    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&crop=face",
                    "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop&crop=face",
                  ].map((src, i) => (
                    <div
                      key={i}
                      className="w-10 h-10 rounded-full border-2 border-[#e2e3ea] overflow-hidden shadow-sm"
                    >
                      <img
                        src={src}
                        alt={`User ${i + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
                <div>
                  <span className="text-2xl font-black text-gray-900">
                    100k+
                  </span>
                  <span className="text-white ml-1.5 text-sm font-medium">
                    Active homeowners and teams
                  </span>
                </div>
              </div>
            </div>

            {/* Right Column - House Image card flush at bottom-right */}
            <div className="relative z-30 flex items-end justify-end pb-6 lg:pb-8">
              <div className="w-full max-w-[580px] bg-[#4CAF50] rounded-tl-3xl rounded-tr-3xl rounded-br-none rounded-bl-none p-[5px] pb-0 shadow-xl shadow-[#4CAF50]/25">
                <div className="relative rounded-tl-2xl rounded-tr-2xl overflow-hidden">
                  <img
                    src="/solar_house.png"
                    alt="Modern house with solar panels"
                    className="w-full h-auto min-h-[260px] lg:min-h-[320px] object-cover"
                    style={{
                      filter: "saturate(0.55) contrast(1.1) brightness(0.93)",
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== MOBILE APP SECTION ===== */}
      <section className="relative z-30 bg-[#2c3e2d] rounded-none">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12 relative">
          {/* Subtle glow */}
          <div className="absolute top-1/2 left-1/4 w-[300px] h-[300px] bg-[#4CAF50]/10 rounded-full blur-[100px] pointer-events-none"></div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center py-12 lg:py-16 relative z-10">
            {/* Phone Column */}
            <div className="lg:col-span-4 flex justify-center lg:justify-start">
              <div className="relative">
                {/* Glow behind phone */}
                <div className="absolute inset-0 bg-[#4CAF50]/20 rounded-[40px] blur-[40px] scale-90"></div>
                <img
                  src="/phone_mockup.png"
                  alt="Solar Tracker Mobile App"
                  className="relative w-[240px] lg:w-[280px] h-auto drop-shadow-[0_25px_60px_rgba(0,0,0,0.4)]"
                />
              </div>
            </div>

            {/* Content Column */}
            <div className="lg:col-span-5 text-center lg:text-left">
              <span className="inline-block bg-[#4CAF50]/15 text-[#81C784] text-xs font-semibold rounded-full px-4 py-1.5 mb-4 uppercase tracking-wider">
                📱 Mobile App
              </span>
              <h3 className="text-3xl lg:text-4xl font-black text-white mb-3 leading-tight">
                Solar Tracker
                <br />
                in your pocket
              </h3>
              <p className="text-[#a3b8a4] text-base mb-8 max-w-lg leading-relaxed">
                Monitor energy production, manage battery storage, get real-time
                alerts, and control your entire solar system from anywhere.
              </p>
              <div className="flex gap-4 justify-center lg:justify-start">
                <a
                  href="#"
                  className="flex items-center bg-white text-gray-900 rounded-2xl px-6 py-3.5 hover:bg-gray-50 transition shadow-lg hover:shadow-xl hover:-translate-y-0.5 transform"
                >
                  <svg
                    viewBox="0 0 24 24"
                    className="w-7 h-7 mr-3 fill-current flex-shrink-0"
                  >
                    <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.61 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.5,12.92 20.16,13.19L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z" />
                  </svg>
                  <div>
                    <div className="text-[9px] uppercase tracking-wider text-gray-400 font-medium">
                      GET IT ON
                    </div>
                    <div className="text-base font-bold -mt-0.5">
                      Google Play
                    </div>
                  </div>
                </a>
                <a
                  href="#"
                  className="flex items-center bg-white text-gray-900 rounded-2xl px-6 py-3.5 hover:bg-gray-50 transition shadow-lg hover:shadow-xl hover:-translate-y-0.5 transform"
                >
                  <svg
                    viewBox="0 0 24 24"
                    className="w-7 h-7 mr-3 fill-current flex-shrink-0"
                  >
                    <path d="M18.71,19.5C17.88,20.5 17,21.4 15.66,21.41C14.32,21.42 13.87,20.6 12.37,20.6C10.86,20.6 10.37,21.38 9.1,21.42C7.79,21.47 6.8,20.43 5.96,19.46C4.25,17.45 2.93,13.85 4.7,11.36C5.57,10.12 6.9,9.35 8.33,9.33C9.61,9.31 10.82,10.19 11.58,10.19C12.34,10.19 13.82,9.13 15.38,9.3C16.06,9.33 17.66,9.57 18.67,11C18.59,11.05 16.63,12.19 16.65,14.58C16.68,17.41 19.14,18.34 19.17,18.35C19.14,18.42 18.78,19.63 18.71,19.5M13,3.5C13.73,2.67 14.94,2.04 15.94,2C16.07,3.17 15.6,4.35 14.9,5.19C14.21,6.04 13.07,6.7 11.95,6.61C11.8,5.46 12.36,4.26 13,3.5Z" />
                  </svg>
                  <div>
                    <div className="text-[9px] uppercase tracking-wider text-gray-400 font-medium">
                      Download on the
                    </div>
                    <div className="text-base font-bold -mt-0.5">App Store</div>
                  </div>
                </a>
              </div>
            </div>

            {/* Stats Column */}
            <div className="lg:col-span-3 flex flex-row lg:flex-col items-center lg:items-end gap-6 lg:gap-8 justify-center">
              <div className="text-center lg:text-right">
                <div className="flex gap-0.5 justify-center lg:justify-end mb-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <svg
                      key={i}
                      className="w-5 h-5 text-[#81C784] fill-current"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-white text-2xl font-black">4.9</p>
                <p className="text-[#a3b8a4] text-xs">App Store Rating</p>
              </div>

              <div className="hidden lg:block w-16 h-px bg-[#4a6b4b]"></div>

              <div className="text-center lg:text-right">
                <p className="text-white text-2xl font-black">100K+</p>
                <p className="text-[#a3b8a4] text-xs">Active Downloads</p>
              </div>

              <div className="hidden lg:block w-16 h-px bg-[#4a6b4b]"></div>

              <div className="text-center lg:text-right">
                <div className="flex -space-x-2 justify-center lg:justify-end mb-1">
                  {[
                    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=60&h=60&fit=crop&crop=face",
                    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=60&h=60&fit=crop&crop=face",
                    "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=60&h=60&fit=crop&crop=face",
                    "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=60&h=60&fit=crop&crop=face",
                  ].map((src, i) => (
                    <div
                      key={i}
                      className="w-8 h-8 rounded-full border-2 border-[#2c3e2d] overflow-hidden"
                    >
                      <img
                        src={src}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
                <p className="text-[#a3b8a4] text-xs">Loved by thousands</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== FEATURES SECTION ===== */}
      <section id="features" className="bg-[#eaebf0] py-20 lg:py-28">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
          <div className="text-center mb-16">
            <span className="inline-block bg-[#E8F5E9] text-[#2E7D32] text-xs font-semibold rounded-full px-4 py-1.5 mb-4 uppercase tracking-wider">
              Features
            </span>
            <h2 className="text-4xl lg:text-5xl font-black text-gray-900 mb-4">
              Everything you need to manage
              <br className="hidden md:block" /> your solar panels
            </h2>
            <p className="text-gray-500 text-lg max-w-2xl mx-auto">
              From real-time monitoring to predictive maintenance, Solar Tracker
              gives you complete control over your renewable energy investment.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Gauge,
                title: "Real-Time Monitoring",
                desc: "Track energy production, consumption, and efficiency metrics with live dashboards updated every second.",
                color: "bg-emerald-50",
                iconColor: "text-emerald-600",
              },
              {
                icon: LineChart,
                title: "Advanced Analytics",
                desc: "AI-powered insights and predictive analytics help you maximize energy output and reduce waste.",
                color: "bg-blue-50",
                iconColor: "text-blue-600",
              },
              {
                icon: Battery,
                title: "Battery Management",
                desc: "Monitor battery health, charge cycles, and storage capacity. Smart scheduling for optimal energy usage.",
                color: "bg-green-50",
                iconColor: "text-green-600",
              },
              {
                icon: Bell,
                title: "Smart Alerts",
                desc: "Instant notifications for performance drops, maintenance needs, or weather-related adjustments.",
                color: "bg-red-50",
                iconColor: "text-red-600",
              },
              {
                icon: CloudSun,
                title: "Weather Integration",
                desc: "Forecast-based optimization automatically adjusts your system for maximum efficiency in any condition.",
                color: "bg-sky-50",
                iconColor: "text-sky-600",
              },
              {
                icon: Settings2,
                title: "Remote Control",
                desc: "Manage inverters, switch panels, and configure settings from anywhere through the mobile app.",
                color: "bg-purple-50",
                iconColor: "text-purple-600",
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="group bg-[#e2e3ea] border border-[#cfd0d8] rounded-2xl p-7 hover:shadow-xl hover:border-[#4CAF50]/30 transition-all duration-300 hover:-translate-y-1"
              >
                <div
                  className={`w-14 h-14 ${feature.color} rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}
                >
                  <feature.icon className={`w-7 h-7 ${feature.iconColor}`} />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section className="bg-[#233625] py-20 lg:py-28 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 h-full w-full bg-[radial-gradient(circle_at_20%_20%,rgba(129,199,132,0.16),transparent_34%),radial-gradient(circle_at_85%_70%,rgba(76,175,80,0.18),transparent_36%)]"></div>
        </div>

        <div className="max-w-[1400px] mx-auto px-6 lg:px-12 relative z-10">
          <div className="max-w-3xl mx-auto text-center mb-14">
            <span className="inline-flex items-center gap-2 bg-[#4CAF50]/15 text-[#9fe0a2] text-xs font-semibold rounded-full px-4 py-1.5 mb-4 uppercase tracking-wider">
              How It Works
              <span className="h-1.5 w-1.5 rounded-full bg-[#4CAF50]" />3 Steps
            </span>
            <h2 className="text-4xl lg:text-5xl font-black text-white mb-4 leading-tight">
              From installation to daily control
            </h2>
            <p className="text-[#b6c9b6] text-lg">
              A guided onboarding flow that connects hardware, unlocks insights,
              and starts saving from day one.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
            {[
              {
                step: "01",
                icon: Zap,
                title: "Connect Hardware",
                desc: "Link your solar panels, inverter, and battery in a guided setup that supports major manufacturers.",
                badge: "~5 min setup",
              },
              {
                step: "02",
                icon: Gauge,
                title: "Track and Optimize",
                desc: "Live telemetry reveals production patterns while optimization tips help increase output and reduce waste.",
                badge: "Real-time insights",
              },
              {
                step: "03",
                icon: Sun,
                title: "Automate Savings",
                desc: "Apply schedules and alerts to control loads, protect battery health, and maximize your monthly ROI.",
                badge: "Any device, anywhere",
              },
            ].map((item, i) => (
              <div key={i} className="relative group">
                <article className="h-full rounded-3xl border border-[#4f6851] bg-gradient-to-b from-[#2f4532] to-[#2a3f2d] p-6 lg:p-7 shadow-[0_20px_40px_rgba(0,0,0,0.18)] transition-all duration-300 group-hover:-translate-y-1 group-hover:border-[#78c67a]/60 group-hover:shadow-[0_26px_46px_rgba(0,0,0,0.24)]">
                  <div className="flex items-start justify-between gap-4 mb-6">
                    <div className="rounded-2xl bg-[#4CAF50]/15 border border-[#81C784]/35 px-3 py-1.5">
                      <p className="text-[#9fe0a2] text-xs font-semibold tracking-[0.12em] uppercase">
                        Step {item.step}
                      </p>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-[#4CAF50] flex items-center justify-center shadow-lg shadow-[#4CAF50]/25">
                      <item.icon className="w-5 h-5 text-white" />
                    </div>
                  </div>

                  <h3 className="text-xl font-bold text-white mb-2">
                    {item.title}
                  </h3>
                  <p className="text-[#b7c8b8] text-sm leading-relaxed mb-5">
                    {item.desc}
                  </p>

                  <div className="inline-flex items-center rounded-full border border-[#6ca96e]/40 bg-[#4CAF50]/12 px-3 py-1 text-xs font-medium text-[#bce9be]">
                    {item.badge}
                  </div>
                </article>

                {i < 2 && (
                  <div className="hidden md:flex absolute top-1/2 -right-4 lg:-right-5 -translate-y-1/2 z-20">
                    <div className="w-9 h-9 rounded-full border border-[#81C784]/40 bg-[#2b4230] flex items-center justify-center shadow-lg">
                      <ArrowRight className="w-4 h-4 text-[#9fe0a2]" />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== STATS / WHY US ===== */}
      <section id="about" className="bg-[#e2e3ea] py-20 lg:py-28">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <span className="inline-block bg-[#E8F5E9] text-[#2E7D32] text-xs font-semibold rounded-full px-4 py-1.5 mb-4 uppercase tracking-wider">
                Why Solar Tracker
              </span>
              <h2 className="text-4xl lg:text-5xl font-black text-gray-900 mb-6 leading-tight">
                Trusted by homeowners & businesses worldwide
              </h2>
              <p className="text-gray-500 text-lg mb-10 leading-relaxed">
                We've helped thousands of customers take control of their solar
                energy, reduce costs, and contribute to a sustainable future.
              </p>

              <div className="grid grid-cols-2 gap-6">
                {[
                  { number: "100K+", label: "Active Users" },
                  { number: "99.9%", label: "Uptime" },
                  { number: "30%", label: "Avg. Savings" },
                  { number: "50+", label: "Countries" },
                ].map((stat, i) => (
                  <div
                    key={i}
                    className="bg-[#eaebf0] rounded-2xl p-5 shadow-sm border border-[#cfd0d8]"
                  >
                    <div className="text-3xl font-black text-[#4CAF50] mb-1">
                      {stat.number}
                    </div>
                    <div className="text-gray-500 text-sm font-medium">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="bg-[#eaebf0] rounded-3xl p-8 shadow-xl border border-[#cfd0d8]">
                <div className="space-y-5">
                  {[
                    {
                      icon: Shield,
                      title: "Enterprise-Grade Security",
                      desc: "Bank-level encryption and SOC 2 compliance protect your data and control systems.",
                    },
                    {
                      icon: Smartphone,
                      title: "Control From Anywhere",
                      desc: "Full mobile app for iOS and Android. Manage your system on-the-go with real-time updates.",
                    },
                    {
                      icon: Users,
                      title: "Multi-User Access",
                      desc: "Add family members or team mates with custom permissions and role-based access.",
                    },
                    {
                      icon: Sun,
                      title: "Solar Panel Optimization",
                      desc: "AI-driven panel tilt and cleaning schedules to maximize energy capture year-round.",
                    },
                  ].map((item, i) => (
                    <div key={i} className="flex gap-4 group">
                      <div className="w-12 h-12 rounded-xl bg-[#E8F5E9] flex items-center justify-center flex-shrink-0 group-hover:bg-[#4CAF50] transition-colors">
                        <item.icon className="w-6 h-6 text-[#2E7D32] group-hover:text-white transition-colors" />
                      </div>
                      <div>
                        <h4 className="text-base font-bold text-gray-900 mb-1">
                          {item.title}
                        </h4>
                        <p className="text-gray-500 text-sm leading-relaxed">
                          {item.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              {/* Decorative dot pattern */}
              <div
                className="absolute -top-4 -right-4 w-24 h-24 opacity-20"
                style={{
                  backgroundImage:
                    "radial-gradient(#4CAF50 1.5px, transparent 1.5px)",
                  backgroundSize: "8px 8px",
                }}
              ></div>
              <div
                className="absolute -bottom-4 -left-4 w-24 h-24 opacity-20"
                style={{
                  backgroundImage:
                    "radial-gradient(#4CAF50 1.5px, transparent 1.5px)",
                  backgroundSize: "8px 8px",
                }}
              ></div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== TESTIMONIALS ===== */}
      <section className="bg-[#eaebf0] py-20 lg:py-28">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
          <div className="text-center mb-16">
            <span className="inline-block bg-[#E8F5E9] text-[#2E7D32] text-xs font-semibold rounded-full px-4 py-1.5 mb-4 uppercase tracking-wider">
              Testimonials
            </span>
            <h2 className="text-4xl lg:text-5xl font-black text-gray-900 mb-4">
              What our customers say
            </h2>
            <p className="text-gray-500 text-lg max-w-2xl mx-auto">
              Join thousands of satisfied users who've transformed their energy
              management.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: "Sarah Mitchell",
                role: "Homeowner, California",
                quote:
                  "Solar Tracker reduced our electricity bill by 40% in the first three months. The real-time monitoring gives us complete peace of mind.",
                avatar:
                  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&crop=face",
                rating: 5,
              },
              {
                name: "James Rodriguez",
                role: "Facility Manager, Texas",
                quote:
                  "Managing 200+ panels across three buildings used to be a nightmare. Now I do it all from my phone during my morning coffee.",
                avatar:
                  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face",
                rating: 5,
              },
              {
                name: "Priya Sharma",
                role: "Business Owner, Dubai",
                quote:
                  "The predictive maintenance alerts saved us from a potential system failure. The ROI tracking feature is incredibly detailed.",
                avatar:
                  "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop&crop=face",
                rating: 5,
              },
            ].map((testimonial, i) => (
              <div
                key={i}
                className="bg-[#e2e3ea] rounded-2xl p-7 border border-[#cfd0d8] hover:shadow-lg transition-shadow"
              >
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: testimonial.rating }).map((_, j) => (
                    <svg
                      key={j}
                      className="w-4 h-4 text-[#81C784] fill-current"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-gray-600 text-sm leading-relaxed mb-6 italic">
                  "{testimonial.quote}"
                </p>
                <div className="flex items-center gap-3">
                  <img
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <div className="text-sm font-bold text-gray-900">
                      {testimonial.name}
                    </div>
                    <div className="text-xs text-gray-500">
                      {testimonial.role}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA SECTION ===== */}
      <section className="bg-[#2c3e2d] py-20 lg:py-28 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/4 w-[400px] h-[400px] bg-[#4CAF50]/8 rounded-full blur-[120px]"></div>
          <div className="absolute top-1/3 right-1/4 w-[300px] h-[300px] bg-[#4CAF50]/5 rounded-full blur-[100px]"></div>
        </div>

        <div className="max-w-[900px] mx-auto px-6 lg:px-12 text-center relative z-10">
          <h2 className="text-4xl lg:text-6xl font-black text-white mb-6 leading-tight">
            Ready to take control of your solar energy?
          </h2>
          <p className="text-gray-400 text-lg mb-10 max-w-xl mx-auto">
            Join 100,000+ users who are already saving money and the planet with
            Solar Tracker.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => navigate("/signup")}
              className="bg-[#4CAF50] hover:bg-[#388E3C] text-white font-bold rounded-full px-8 h-13 text-base shadow-lg shadow-[#4CAF50]/20 hover:shadow-xl hover:shadow-[#4CAF50]/30 transition-all"
            >
              Get Started Free
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button
              variant="outline"
              className="border-gray-700 text-black hover:text-white hover:bg-gray-800 font-semibold rounded-full px-8 h-13 text-base"
            >
              Schedule a Demo
            </Button>
          </div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="bg-gradient-to-b from-gray-900 to-black text-gray-300 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-5 gap-8 mb-12">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#4CAF50] to-[#388E3C] flex items-center justify-center">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-bold text-white">
                  Solar Tracker
                </span>
              </div>
              <p className="text-sm text-gray-400 leading-relaxed">
                Intelligent solar panel management platform built for modern
                homes and businesses. Powering the renewable energy revolution.
              </p>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-6">Product</h4>
              <ul className="space-y-3 text-sm">
                <li>
                  <Link
                    to="/info/features"
                    className="hover:text-[#4CAF50] transition"
                  >
                    Features
                  </Link>
                </li>
                <li>
                  <Link
                    to="/info/integrations"
                    className="hover:text-[#4CAF50] transition"
                  >
                    Integrations
                  </Link>
                </li>
                <li>
                  <Link
                    to="/info/changelog"
                    className="hover:text-[#4CAF50] transition"
                  >
                    Changelog
                  </Link>
                </li>
                <li>
                  <Link
                    to="/info/faqs"
                    className="hover:text-[#4CAF50] transition"
                  >
                    FAQs
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-6">Company</h4>
              <ul className="space-y-3 text-sm">
                <li>
                  <Link
                    to="/info/about"
                    className="hover:text-[#4CAF50] transition"
                  >
                    About
                  </Link>
                </li>
                <li>
                  <Link
                    to="/info/blog"
                    className="hover:text-[#4CAF50] transition"
                  >
                    Blog
                  </Link>
                </li>
                <li>
                  <Link
                    to="/info/careers"
                    className="hover:text-[#4CAF50] transition"
                  >
                    Careers
                  </Link>
                </li>
                <li>
                  <Link
                    to="/info/contact"
                    className="hover:text-[#4CAF50] transition"
                  >
                    Contact
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-6">Legal</h4>
              <ul className="space-y-3 text-sm">
                <li>
                  <Link
                    to="/info/privacy"
                    className="hover:text-[#4CAF50] transition"
                  >
                    Privacy
                  </Link>
                </li>
                <li>
                  <Link
                    to="/info/terms"
                    className="hover:text-[#4CAF50] transition"
                  >
                    Terms
                  </Link>
                </li>
                <li>
                  <Link
                    to="/info/security"
                    className="hover:text-[#4CAF50] transition"
                  >
                    Security
                  </Link>
                </li>
                <li>
                  <Link
                    to="/info/compliance"
                    className="hover:text-[#4CAF50] transition"
                  >
                    Compliance
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <p className="text-sm text-gray-500">
                © 2026 Solar Tracker. All rights reserved.
              </p>
              <div className="flex gap-6">
                <Link
                  to="/info/support"
                  className="text-gray-400 hover:text-[#4CAF50] transition"
                >
                  <span className="sr-only">Twitter</span>
                  <svg
                    className="h-5 w-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M8.29 20c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </Link>
                <Link
                  to="/info/contact"
                  className="text-gray-400 hover:text-[#4CAF50] transition"
                >
                  <span className="sr-only">LinkedIn</span>
                  <svg
                    className="h-5 w-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
