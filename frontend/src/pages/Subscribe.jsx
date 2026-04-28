import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Check, CreditCard, Crown, Rocket, Shield, Zap } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const PLANS = [
  {
    id: "free",
    name: "Free",
    monthlyPrice: 0,
    yearlyPrice: 0,
    icon: Zap,
    description: "Perfect for beginners starting their journaling journey.",
    features: [
      "Up to 10 trades",
      "Manual trade entry",
      "Local storage",
    ],
    popular: false,
  },
  {
    id: "pro",
    name: "Pro",
    monthlyPrice: 14,
    yearlyPrice: 134,
    savings: 34,
    icon: Crown,
    description: "For serious traders wanting deeper analytics.",
    features: [
      "Unlimited trades",
      "Trade calendar with daily P&L",
      "PDF reports and exports",
    ],
    popular: true,
  },
  {
    id: "elite",
    name: "Elite",
    monthlyPrice: 29,
    yearlyPrice: 279,
    savings: 69,
    icon: Rocket,
    description: "For prop firm traders and teams.",
    features: [
      "Everything in Pro",
      "Multi-account management",
      "Psychology tracking",
    ],
    popular: false,
  },
];

const valuePillars = [
  "Black/yellow command interface",
  "Trade journal, analytics, and calendar in one desk",
  "Session analysis and psychology tracking",
];

const planGuidance = [
  {
    title: "Starter is for building the habit",
    text: "Use it if you need a structured place to log trades, write notes, and begin reviewing consistently.",
  },
  {
    title: "Pro is for deeper analysis",
    text: "Use it if you want calendar view, replay workflows, and advanced analytics to understand your performance.",
  },
  {
    title: "Elite is for complete tracking",
    text: "Use it if you want session analysis, psychology scoring, and daily/weekly/monthly P&L tracking.",
  },
];

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001/api";

export default function Subscribe() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [billing, setBilling] = useState("monthly");

  const getPrice = (plan) => (billing === "yearly" ? plan.yearlyPrice : plan.monthlyPrice);

  const handleSubscribe = async (planId) => {
    if (planId === "free") {
      navigate("/dashboard");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/stripe/checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          priceId:
            planId === "pro"
              ? billing === "yearly"
                ? "price_pro_yearly"
                : "price_pro_monthly"
              : billing === "yearly"
                ? "price_elite_yearly"
                : "price_elite_monthly",
          userId: user?.id,
          billing,
        }),
      });
      const { url } = await res.json();
      window.location.href = url;
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#040404] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(250,204,21,0.16),transparent_24%),radial-gradient(circle_at_bottom_right,rgba(217,119,6,0.12),transparent_24%),linear-gradient(180deg,#040404_0%,#090909_100%)]" />
      <div className="absolute inset-0 opacity-40 [background-image:linear-gradient(to_right,rgba(250,204,21,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(250,204,21,0.04)_1px,transparent_1px)] [background-size:88px_88px]" />

      <div className="relative z-10 mx-auto max-w-7xl px-6 py-10">
        <div className="mb-8 flex justify-between">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 rounded-full border border-yellow-200/12 bg-black/35 px-4 py-2 text-xs uppercase tracking-[0.28em] text-yellow-100/80 transition hover:bg-black/45"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-14 text-center"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-yellow-200/12 bg-yellow-200/[0.05] px-4 py-2 text-xs uppercase tracking-[0.32em] text-yellow-100/80">
            <Shield className="h-4 w-4" />
            Subscription plans
          </div>
          <h1 className="mt-6 text-5xl font-black tracking-[-0.06em] text-white md:text-6xl">
            Choose your trading journal tier.
          </h1>
          <p className="mx-auto mt-5 max-w-3xl text-lg leading-8 text-zinc-400">
            Start with trade logging and journaling, then unlock AI analysis, replay tools, sync, and deeper performance review as your process evolves.
          </p>

          <div className="mt-8 inline-flex items-center gap-4 rounded-full border border-yellow-200/10 bg-white/[0.03] px-4 py-3 backdrop-blur-xl">
            <span className={`text-sm font-semibold ${billing === "monthly" ? "text-white" : "text-zinc-500"}`}>
              Monthly
            </span>
            <button
              onClick={() => setBilling(billing === "monthly" ? "yearly" : "monthly")}
              className="relative h-7 w-14 rounded-full bg-zinc-900"
            >
              <motion.div
                className="absolute top-1 h-5 w-5 rounded-full bg-gradient-to-r from-yellow-200 to-amber-400"
                animate={{ x: billing === "yearly" ? 30 : 4 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            </button>
            <span className={`text-sm font-semibold ${billing === "yearly" ? "text-white" : "text-zinc-500"}`}>
              Yearly
            </span>
            {billing === "yearly" && (
              <span className="rounded-full bg-yellow-200 px-3 py-1 text-xs font-bold uppercase tracking-[0.22em] text-black">
                Save 20%
              </span>
            )}
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
            {valuePillars.map((pillar) => (
              <div
                key={pillar}
                className="rounded-full border border-white/8 bg-black/25 px-4 py-2 text-[11px] uppercase tracking-[0.24em] text-zinc-300"
              >
                {pillar}
              </div>
            ))}
          </div>
        </motion.div>

        <div className="grid gap-6 lg:grid-cols-3">
          {PLANS.map((plan, index) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08 }}
              className={`relative rounded-[2.2rem] border p-8 ${
                plan.popular
                  ? "border-yellow-300/35 bg-gradient-to-b from-yellow-300/[0.12] to-black shadow-[0_24px_90px_rgba(250,204,21,0.12)]"
                  : "border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))]"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-yellow-200 px-4 py-1 text-xs font-bold uppercase tracking-[0.22em] text-black">
                  Most popular
                </div>
              )}

              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs uppercase tracking-[0.34em] text-zinc-500">{plan.name}</div>
                  <div className="mt-4 text-5xl font-black tracking-[-0.05em] text-white">
                    ${getPrice(plan)}
                    <span className="ml-2 text-base font-medium text-zinc-500">
                      /{billing === "yearly" ? "year" : "month"}
                    </span>
                  </div>
                </div>
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-yellow-200/12 bg-yellow-200/[0.06]">
                  <plan.icon className="h-6 w-6 text-yellow-200" />
                </div>
              </div>

              <p className="mt-5 text-base leading-8 text-zinc-400">{plan.description}</p>

              {billing === "yearly" && plan.savings && (
                <p className="mt-3 text-sm text-yellow-100/85">Save ${plan.savings}/year</p>
              )}

              <div className="mt-8 space-y-3">
                {plan.features.map((feature) => (
                  <div key={feature} className="flex items-start gap-3 text-sm text-zinc-300">
                    <Check className="mt-0.5 h-4 w-4 text-yellow-300" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => handleSubscribe(plan.id)}
                disabled={loading}
                className={`mt-8 inline-flex w-full items-center justify-center gap-2 rounded-full px-6 py-4 text-sm font-bold uppercase tracking-[0.24em] transition ${
                  plan.popular
                    ? "bg-yellow-200 text-black hover:bg-yellow-100"
                    : "border border-yellow-200/18 bg-black/35 text-yellow-100 hover:bg-black/50"
                } disabled:opacity-60`}
              >
                {plan.monthlyPrice === 0 ? (
                  <>
                    <Zap className="h-4 w-4" />
                    Get started free
                  </>
                ) : (
                  <>
                    <CreditCard className="h-4 w-4" />
                    {billing === "yearly" ? "Subscribe yearly" : "Subscribe monthly"}
                  </>
                )}
              </button>
            </motion.div>
          ))}
        </div>

        <div className="mt-8 rounded-[2rem] border border-yellow-200/10 bg-gradient-to-br from-yellow-300/[0.08] via-white/[0.03] to-transparent p-8">
          <div className="grid gap-6 md:grid-cols-3">
            {[
              { label: "Best for", value: "Traders building consistency" },
              { label: "Upgrade reason", value: "More journal depth and smarter review" },
              { label: "Positioning", value: "A trading journal that grows with your process" },
            ].map((item) => (
              <div key={item.label}>
                <div className="text-xs uppercase tracking-[0.32em] text-zinc-500">{item.label}</div>
                <div className="mt-3 text-lg font-semibold leading-7 text-white">{item.value}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          {planGuidance.map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.12 + index * 0.08 }}
              className="rounded-[2rem] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] p-8"
            >
              <div className="text-xs uppercase tracking-[0.32em] text-zinc-500">Guidance</div>
              <h3 className="mt-4 text-2xl font-black tracking-[-0.03em] text-white">{item.title}</h3>
              <p className="mt-4 text-base leading-8 text-zinc-400">{item.text}</p>
            </motion.div>
          ))}
        </div>

        <div className="mt-12 flex flex-wrap items-center justify-center gap-8 text-sm text-zinc-500">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-yellow-200" />
            <span>Secure payment flow</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="h-5 w-5 text-yellow-200" />
            <span>Cancel anytime</span>
          </div>
          <div className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-yellow-200" />
            <span>Premium tiers unlock premium review depth</span>
          </div>
        </div>
      </div>
    </div>
  );
}
