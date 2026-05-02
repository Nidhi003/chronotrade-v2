"use client";
import React from "react";
import { useSubscription } from "@/context/SubscriptionContext";
import { motion } from "framer-motion";
import { Lock, Sparkles, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const TIER_LABELS = {
  pro: { name: "Pro", price: "₹1500/mo", color: "from-yellow-200 via-yellow-300 to-amber-400" },
  elite: { name: "Elite", price: "₹3000/mo", color: "from-amber-300 via-orange-400 to-rose-400" },
};

export default function TierGate({ children, feature, tierRequired = "pro" }) {
  const { canAccess, tier } = useSubscription();
  const navigate = useNavigate();

  // If user can access this feature, render children
  if (canAccess(feature)) {
    return children;
  }

  const requiredTier = TIER_LABELS[tierRequired] || TIER_LABELS.pro;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center min-h-[60vh]"
    >
      <div className="max-w-lg w-full rounded-[2rem] border border-yellow-200/10 bg-[radial-gradient(circle_at_top,rgba(250,204,21,0.10),transparent_40%),linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.01))] p-10 text-center">
        {/* Lock icon */}
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-yellow-300/10 border border-yellow-200/15">
          <Lock className="h-9 w-9 text-yellow-200" />
        </div>

        {/* Tier badge */}
        <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-yellow-200/15 bg-yellow-200/[0.06] px-4 py-2 text-xs uppercase tracking-[0.3em] text-yellow-100/80">
          <Sparkles className="h-4 w-4" />
          {requiredTier.name} Feature
        </div>

        <h3 className="mt-5 text-2xl font-black tracking-[-0.03em] text-white">
          Upgrade to {requiredTier.name} to unlock
        </h3>
        <p className="mt-3 text-sm leading-7 text-zinc-400 max-w-sm mx-auto">
          This feature requires a {requiredTier.name} subscription ({requiredTier.price}).
          Upgrade to access advanced trading tools built for serious traders.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => navigate("/subscribe")}
            className={`inline-flex items-center gap-2 rounded-full bg-gradient-to-r ${requiredTier.color} px-7 py-3.5 text-sm font-bold uppercase tracking-[0.22em] text-black shadow-[0_18px_50px_rgba(250,204,21,0.18)] transition-all hover:shadow-[0_24px_60px_rgba(250,204,21,0.25)] active:scale-95`}
          >
            Upgrade Now
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        {/* Current tier indicator */}
        <div className="mt-6 text-xs uppercase tracking-[0.24em] text-zinc-600">
          Current plan: <span className="text-zinc-400 font-bold">{tier}</span>
        </div>
      </div>
    </motion.div>
  );
}
