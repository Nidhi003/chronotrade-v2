import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  CalendarDays,
  Check,
  DollarSign,
  Layers3,
  TrendingUp,
  Flame,
  Award,
  Target,
  BarChart3,
  FileText,
  PieChart,
  Clock,
  Zap,
  Shield,
  Users
} from "lucide-react";
import LivingFluidHero from "@/components/ui/living-fluid-hero";

const mainFeatures = [
  {
    icon: Layers3,
    title: "Trade Journal",
    text: "Log every trade with entry, exit, notes, and setup."
  },
  {
    icon: CalendarDays,
    title: "Calendar View",
    text: "See daily P&L on a simple calendar."
  },
  {
    icon: TrendingUp,
    title: "Analytics",
    text: "Win rate, expectancy, and profit factor."
  },
  {
    icon: DollarSign,
    title: "P&L Tracking",
    text: "Track profits and losses every day."
  },
  {
    icon: Flame,
    title: "Streaks",
    text: "Track winning and losing streaks."
  },
  {
    icon: Award,
    title: "Best Day",
    text: "Find your best performing day."
  },
  {
    icon: Target,
    title: "Setup Tracking",
    text: "Track which setups work best."
  },
  {
    icon: BarChart3,
    title: "Win Rate",
    text: "Know your true win rate."
  },
  {
    icon: FileText,
    title: "PDF Export",
    text: "Export your trades to PDF."
  },
  {
    icon: PieChart,
    title: "Profit Factor",
    text: "Calculate your profit factor."
  },
  {
    icon: Clock,
    title: "Trade Timing",
    text: "Find your best trade times."
  },
  {
    icon: Zap,
    title: "Quick Entry",
    text: "Log trades in seconds."
  }
];

const whyFeatures = [
  { title: "Lightning Fast", desc: "Log trades in under 10 seconds" },
  { title: "Calendar Heatmap", desc: "Visual daily P&L at a glance" },
  { title: "Streak Tracking", desc: "Never break your winning streak" },
  { title: "PDF Export", desc: "Download reports for taxes" }
];

const socialProof = [
  { metric: "15K+", label: "Active Traders" },
  { metric: "$50M+", label: "Trades Logged" },
  { metric: "99.9%", label: "Uptime" },
  { metric: "4.9/5", label: "User Rating" }
];

const pricingPlans = [
  {
    name: "Free",
    price: "$0",
    description: "For building the review habit.",
    features: [
      "Up to 10 trades",
      "Trade logging with notes",
      "Local storage",
    ],
  },
  {
    name: "Pro",
    price: "$14",
    description: "For serious traders who want deeper insights.",
    features: [
      "Unlimited trades",
      "Trade calendar with daily P&L",
      "PDF exports",
    ],
  },
  {
    name: "Elite",
    price: "$29",
    description: "For complete trading analysis.",
    features: [
      "Everything in Pro",
      "Multi-account management",
      "Psychology tracking",
    ],
  },
];

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-black text-white">
      <LivingFluidHero
        badge="Professional trading journal"
        headline="Track trades. View calendar. Improve."
        subtitle="Log trades, see daily P&L on calendar, track streaks, and analyze your performance in one simple platform."
        primaryLabel="Start Free"
        secondaryLabel="See Pricing"
        onPrimaryClick={() => navigate("/auth")}
        onSecondaryClick={() => navigate("/subscribe")}
      />

      <main className="relative overflow-hidden">
        {/* What You Get Section */}
        <section className="mx-auto max-w-6xl px-6 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-black tracking-tight">
              Your trading command center
            </h2>
            <p className="mt-4 text-zinc-400 max-w-xl mx-auto">
              Everything you need to understand your trading performance.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {mainFeatures.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="rounded-2xl border border-yellow-200/10 bg-white/[0.02] p-6"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 rounded-lg bg-yellow-300/10">
                      <Icon className="w-5 h-5 text-yellow-300" />
                    </div>
                    <h3 className="text-lg font-bold text-white">{feature.title}</h3>
                  </div>
                  <p className="text-zinc-400 text-sm">{feature.text}</p>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* Feature Showcase Replicas */}
        <section className="mx-auto max-w-6xl px-6 py-16 border-t border-white/5">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-black tracking-tight">
              See what you get
            </h2>
            <p className="mt-4 text-zinc-400 max-w-xl mx-auto">
              Real-time analytics and insights from your trading data.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Today P&L */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="rounded-[1.5rem] border border-yellow-200/10 bg-black/35 p-6"
            >
              <div className="text-[11px] uppercase tracking-[0.28em] text-zinc-500">Today P&L</div>
              <div className="mt-2 text-4xl font-black tracking-[-0.04em] text-emerald-400">+$145</div>
              <div className="mt-3 flex items-center gap-2 text-sm text-zinc-400">
                <span className="text-emerald-400">+3.2%</span>
                <span>vs yesterday</span>
              </div>
            </motion.div>

            {/* Total P&L */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              viewport={{ once: true }}
              className="rounded-[1.5rem] border border-yellow-200/10 bg-black/35 p-6"
            >
              <div className="text-[11px] uppercase tracking-[0.28em] text-zinc-500">Total P&L</div>
              <div className="mt-2 text-4xl font-black tracking-[-0.04em] text-yellow-100">+$2,450</div>
              <div className="mt-3 flex items-center gap-2 text-sm text-zinc-400">
                <span className="text-yellow-100">38 trades</span>
                <span>this month</span>
              </div>
            </motion.div>

            {/* Win Rate */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              viewport={{ once: true }}
              className="rounded-[1.5rem] border border-yellow-200/10 bg-black/35 p-6"
            >
              <div className="text-[11px] uppercase tracking-[0.28em] text-zinc-500">Win Rate</div>
              <div className="mt-2 text-4xl font-black tracking-[-0.04em] text-white">71%</div>
              <div className="mt-3 h-2 rounded-full bg-zinc-800">
                <div className="h-2 w-[71%] rounded-full bg-emerald-400"></div>
              </div>
            </motion.div>

            {/* Profit Factor */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="rounded-[1.5rem] border border-yellow-200/10 bg-black/35 p-6"
            >
              <div className="text-[11px] uppercase tracking-[0.28em] text-zinc-500">Profit Factor</div>
              <div className="mt-2 text-4xl font-black tracking-[-0.04em] text-white">1.85</div>
              <div className="mt-3 text-sm text-zinc-400">Above 1.5 = profitable</div>
            </motion.div>

            {/* Expectancy */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              viewport={{ once: true }}
              className="rounded-[1.5rem] border border-yellow-200/10 bg-black/35 p-6"
            >
              <div className="text-[11px] uppercase tracking-[0.28em] text-zinc-500">Expectancy</div>
              <div className="mt-2 text-4xl font-black tracking-[-0.04em] text-emerald-400">+$64</div>
              <div className="mt-3 text-sm text-zinc-400">Per trade average</div>
            </motion.div>

            {/* Best Setup */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              viewport={{ once: true }}
              className="rounded-[1.5rem] border border-yellow-200/10 bg-black/35 p-6"
            >
              <div className="text-[11px] uppercase tracking-[0.28em] text-zinc-500">Best Setup</div>
              <div className="mt-2 text-3xl font-bold text-white">Pullback</div>
              <div className="mt-3 text-sm text-emerald-400">82% win rate</div>
            </motion.div>
          </div>

          {/* Calendar Demo */}
          <div className="mt-8 grid gap-6 md:grid-cols-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="rounded-[1.5rem] border border-white/8 bg-white/[0.03] p-6"
            >
              <div className="mb-4 text-[11px] uppercase tracking-[0.28em] text-zinc-500">Calendar - Daily P&L</div>
              <div className="grid grid-cols-7 gap-2">
                {[
                  0, 145, 0, 320, -80, 95, 0, 210, 450, 0, -25, 0, 180, 75, 0, 0, 60, 110, 0, 290, 55, 0
                ].map((pnl, i) => (
                  <div
                    key={i}
                    className={`aspect-square rounded-lg flex items-center justify-center text-xs font-bold ${
                      pnl === 0
                        ? "bg-white/5 text-zinc-600"
                        : pnl > 0
                        ? "bg-emerald-500/30 text-emerald-300"
                        : "bg-rose-500/30 text-rose-300"
                    }`}
                  >
                    {pnl === 0 ? "-" : pnl > 0 ? `+${pnl}` : `-${Math.abs(pnl)}`}
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Streaks */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              viewport={{ once: true }}
              className="rounded-[1.5rem] border border-white/8 bg-white/[0.03] p-6"
            >
              <div className="mb-4 text-[11px] uppercase tracking-[0.28em] text-zinc-500">Streaks</div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="p-4 rounded-xl border border-white/5 bg-white/[0.02]">
                  <div className="text-sm text-zinc-500">Winning</div>
                  <div className="mt-1 text-2xl font-bold text-emerald-400">5 days</div>
                  <div className="text-xs text-zinc-500">Best: 12</div>
                </div>
                <div className="p-4 rounded-xl border border-white/5 bg-white/[0.02]">
                  <div className="text-sm text-zinc-500">Losing</div>
                  <div className="mt-1 text-2xl font-bold text-rose-400">2 days</div>
                  <div className="text-xs text-zinc-500">Worst: 4</div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Why ChronoTradez */}
        <section className="mx-auto max-w-6xl px-6 py-16 border-t border-white/5">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-black tracking-tight">
              Why ChronoTradez?
            </h2>
            <p className="mt-4 text-zinc-400 max-w-xl mx-auto">
              Built by traders, for traders. Everything you need to improve.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {whyFeatures.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="rounded-2xl border border-yellow-200/10 bg-yellow-200/[0.03] p-6"
              >
                <h3 className="text-lg font-bold text-yellow-100">{feature.title}</h3>
                <p className="mt-2 text-zinc-400 text-sm">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Social Proof */}
        <section className="mx-auto max-w-6xl px-6 py-16 border-t border-white/5">
          <div className="grid gap-8 md:grid-cols-4">
            {socialProof.map((item, index) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="text-4xl md:text-5xl font-black text-yellow-100">{item.metric}</div>
                <div className="mt-2 text-sm text-zinc-400">{item.label}</div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* How It Works */}
        <section className="mx-auto max-w-6xl px-6 py-16 border-t border-white/5">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-black tracking-tight">
              Simple.
            </h2>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {[
              { step: "1", title: "Log Trades", text: "Enter trade details after each trade." },
              { step: "2", title: "View Calendar", text: "See your P&L by day." },
              { step: "3", title: "Improve", text: "Find patterns and fix your leaks." }
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-12 h-12 rounded-full bg-yellow-300/10 flex items-center justify-center mx-auto mb-4">
                  <span className="text-xl font-bold text-yellow-300">{item.step}</span>
                </div>
                <h3 className="text-xl font-bold text-white">{item.title}</h3>
                <p className="mt-2 text-zinc-400 text-sm">{item.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Trust Badges */}
        <section className="mx-auto max-w-6xl px-6 py-12 border-t border-white/5">
          <div className="flex flex-wrap items-center justify-center gap-8 text-zinc-500">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              <span className="text-sm">Bank-level security</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              <span className="text-sm">15K+ traders</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5" />
              <span className="text-sm">24/7 support</span>
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section className="mx-auto max-w-6xl px-6 py-16 border-t border-white/5">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-black tracking-tight">
              Simple pricing
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {pricingPlans.map((plan) => (
              <div
                key={plan.name}
                className={`rounded-2xl border p-6 ${
                  plan.name === "Pro" 
                    ? "border-yellow-300/30 bg-yellow-300/[0.05]" 
                    : "border-white/10 bg-white/[0.02]"
                }`}
              >
                <h3 className="text-xl font-bold text-white">{plan.name}</h3>
                <div className="mt-2 text-3xl font-black">
                  <span className="text-2xl font-normal">{plan.price}</span>
                  {plan.price !== "$0" && <span className="text-sm font-normal text-zinc-500">/mo</span>}
                </div>
                <p className="mt-2 text-sm text-zinc-400">{plan.description}</p>
                <ul className="mt-6 space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm text-zinc-300">
                      <Check className="w-4 h-4 text-yellow-300" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => navigate("/subscribe")}
                  className={`mt-6 w-full py-3 rounded-xl font-bold transition ${
                    plan.name === "Pro"
                      ? "bg-yellow-300 text-black hover:bg-yellow-200"
                      : "border border-white/20 text-white hover:bg-white/5"
                  }`}
                >
                  Get {plan.name}
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="mx-auto max-w-4xl px-6 py-20 text-center">
          <h2 className="text-3xl md:text-4xl font-black tracking-tight">
            Ready to track your trades?
          </h2>
          <button
            onClick={() => navigate("/auth")}
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-yellow-300 px-8 py-4 text-lg font-bold text-black transition hover:bg-yellow-200"
          >
            Start Free <ArrowRight className="w-5 h-5" />
          </button>
        </section>

        <footer className="border-t border-white/5 py-8 text-center text-sm text-zinc-500">
          <p>ChronoTradez - Professional trading journal</p>
        </footer>
      </main>
    </div>
  );
}