"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Check, CreditCard, Crown, Loader2, Shield, Sparkles, X, Zap } from "lucide-react";
import { TIERS, useSubscription } from "@/context/SubscriptionContext";

const PRICING = {
  pro: { monthly: 14, yearly: 134, savings: 34 },
  elite: { monthly: 29, yearly: 279, savings: 69 },
};

export default function PricingModal({ onClose }) {
  const { tier: currentTier, subscribe } = useSubscription();
  const [processing, setProcessing] = useState(null);
  const [billing, setBilling] = useState("monthly");
  const [error, setError] = useState(null);

  async function handleSubscribe(tierId) {
    setProcessing(tierId);
    setError(null);
    try {
      await subscribe(tierId);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setProcessing(null);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 12 }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-5xl rounded-[2rem] border border-yellow-200/10 bg-[#0b0b0b] p-8 shadow-[0_30px_120px_rgba(0,0,0,0.55)]"
      >
        <button
          onClick={onClose}
          className="absolute right-5 top-5 rounded-2xl border border-white/8 bg-white/[0.03] p-3 text-zinc-400 transition hover:text-white"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-yellow-200/12 bg-yellow-200/[0.05] px-4 py-2 text-xs uppercase tracking-[0.3em] text-yellow-100/80">
            <Sparkles className="h-4 w-4" />
            Upgrade your journal
          </div>
          <h2 className="mt-6 text-4xl font-black tracking-[-0.04em] text-white">Unlock deeper review tools</h2>
          <p className="mx-auto mt-3 max-w-2xl text-zinc-400">
            Move from basic journaling to AI review, replay, advanced analytics, and higher-performance trading workflows.
          </p>

          <div className="mt-8 inline-flex items-center gap-4 rounded-full border border-yellow-200/10 bg-white/[0.03] px-4 py-3">
            <span className={`text-sm font-semibold ${billing === "monthly" ? "text-white" : "text-zinc-500"}`}>Monthly</span>
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
            <span className={`text-sm font-semibold ${billing === "yearly" ? "text-white" : "text-zinc-500"}`}>Yearly</span>
            {billing === "yearly" && (
              <span className="rounded-full bg-yellow-200 px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-black">
                Save 20%
              </span>
            )}
          </div>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          <TierCard
            tierId="free"
            title={TIERS.free.name}
            description="Core trade logging and journal habits."
            icon={Zap}
            price="$0"
            currentTier={currentTier}
            processing={processing}
            onSubscribe={handleSubscribe}
            features={TIERS.free.features}
          />
          <TierCard
            tierId="pro"
            title={TIERS.pro.name}
            description="AI review, replay, and deeper analytics."
            icon={Sparkles}
            price={`$${billing === "yearly" ? Math.round(PRICING.pro.yearly / 12) : PRICING.pro.monthly}/mo`}
            subline={billing === "yearly" ? `$${PRICING.pro.yearly}/year · save $${PRICING.pro.savings}` : null}
            featured
            currentTier={currentTier}
            processing={processing}
            onSubscribe={handleSubscribe}
            features={TIERS.pro.features}
          />
          <TierCard
            tierId="elite"
            title={TIERS.elite.name}
            description="The full review stack for serious operators."
            icon={Crown}
            price={`$${billing === "yearly" ? Math.round(PRICING.elite.yearly / 12) : PRICING.elite.monthly}/mo`}
            subline={billing === "yearly" ? `$${PRICING.elite.yearly}/year · save $${PRICING.elite.savings}` : null}
            currentTier={currentTier}
            processing={processing}
            onSubscribe={handleSubscribe}
            features={TIERS.elite.features}
          />
        </div>

        {error && (
          <div className="mt-6 rounded-[1.5rem] border border-rose-500/20 bg-rose-500/10 p-4 text-sm text-rose-300">
            {error}
          </div>
        )}

        <div className="mt-6 inline-flex items-center gap-2 text-sm text-zinc-500">
          <Shield className="h-4 w-4 text-yellow-200" />
          Subscription state is stored in-app for this build. Replace with your production billing flow when ready.
        </div>
      </motion.div>
    </motion.div>
  );
}

function TierCard({
  tierId,
  title,
  description,
  icon: Icon,
  price,
  subline,
  features,
  currentTier,
  processing,
  onSubscribe,
  featured = false,
}) {
  const isCurrent = currentTier === tierId;

  return (
    <div
      className={`relative rounded-[1.8rem] border p-6 ${
        featured
          ? "border-yellow-300/35 bg-gradient-to-b from-yellow-300/[0.12] to-black shadow-[0_24px_90px_rgba(250,204,21,0.12)]"
          : "border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))]"
      }`}
    >
      {featured && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-yellow-200 px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] text-black">
          Most popular
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="text-xs uppercase tracking-[0.3em] text-zinc-500">{title}</div>
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-yellow-300/10">
          <Icon className="h-6 w-6 text-yellow-200" />
        </div>
      </div>

      <div className="mt-5 text-4xl font-black tracking-[-0.04em] text-white">{price}</div>
      {subline && <div className="mt-2 text-sm text-yellow-100/80">{subline}</div>}
      <p className="mt-4 text-sm leading-7 text-zinc-400">{description}</p>

      <div className="mt-6 space-y-3">
        {features.map((feature) => (
          <div key={feature} className="flex items-start gap-3 text-sm text-zinc-300">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-yellow-200" />
            <span>{feature}</span>
          </div>
        ))}
      </div>

      <button
        onClick={() => onSubscribe(tierId)}
        disabled={processing || isCurrent}
        className={`mt-8 inline-flex w-full items-center justify-center gap-2 rounded-full px-6 py-4 text-sm font-bold uppercase tracking-[0.22em] transition ${
          isCurrent
            ? "bg-zinc-800 text-zinc-500"
            : featured
              ? "bg-yellow-200 text-black hover:bg-yellow-100"
              : "border border-yellow-200/18 bg-black/35 text-yellow-100 hover:bg-black/50"
        }`}
      >
        {processing === tierId ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Processing
          </>
        ) : isCurrent ? (
          "Current Plan"
        ) : tierId === "free" ? (
          "Switch to Free"
        ) : (
          <>
            <CreditCard className="h-4 w-4" />
            Choose Plan
          </>
        )}
      </button>
    </div>
  );
}
