"use client";

import React, { useEffect } from "react";
import { motion, useAnimation } from "framer-motion";
import {
  ArrowRight,
  ChevronRight,
  Crown,
  Play,
  ShieldCheck,
  Sparkles,
  TrendingUp,
} from "lucide-react";

type LivingFluidHeroProps = {
  badge?: string;
  headline?: string;
  subtitle?: string;
  primaryLabel?: string;
  secondaryLabel?: string;
  onPrimaryClick?: () => void;
  onSecondaryClick?: () => void;
};

const HeroNav = () => {
  return (
    <motion.nav
      initial={{ opacity: 0, y: -18 }}
      animate={{ opacity: 1, y: 0, transition: { delay: 0.2, duration: 0.8 } }}
      className="absolute left-0 right-0 top-0 z-30 p-6"
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        <div className="flex items-center gap-3 rounded-full border border-yellow-200/12 bg-black/35 px-4 py-2 backdrop-blur-2xl">
          <div className="flex h-10 w-10 items-center justify-center rounded-full border border-yellow-200/18 bg-gradient-to-br from-yellow-200/18 to-amber-500/10">
            <Crown className="h-4 w-4 text-yellow-200" />
          </div>
          <div>
            <div className="text-[11px] uppercase tracking-[0.38em] text-yellow-100/70">
              ChronoTradez
            </div>
            <div className="text-sm font-medium text-white">
              The high-performance trading journal
            </div>
          </div>
        </div>

        <div className="hidden rounded-full border border-yellow-200/10 bg-white/[0.03] px-4 py-2 text-[11px] uppercase tracking-[0.34em] text-zinc-300 backdrop-blur-xl md:block">
          Track trades. View calendar. Improve.
        </div>
      </div>
    </motion.nav>
  );
};

const FloatingOrb = ({ className, delay = 0, duration = 14 }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{
        opacity: [0.45, 0.7, 0.45],
        y: [0, -16, 0],
        x: [0, 10, 0],
        scale: [1, 1.06, 1],
      }}
      transition={{
        duration,
        repeat: Infinity,
        ease: "easeInOut",
        delay,
      }}
      className={className}
    />
  );
};

export const LivingFluidHero = ({
  badge = "Professional trading journal",
  headline = "Track trades. View calendar. Improve.",
  subtitle = "Log trades, see daily P&L on calendar, track streaks, and analyze your performance in one simple platform.",
  primaryLabel = "Start Free",
  secondaryLabel = "See Pricing",
  onPrimaryClick,
  onSecondaryClick,
}: LivingFluidHeroProps) => {
  const textControls = useAnimation();
  const contentControls = useAnimation();

  useEffect(() => {
    textControls.start((index) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: 0.55 + index * 0.045,
        duration: 0.85,
        ease: [0.2, 0.65, 0.3, 0.9],
      },
    }));

    contentControls.start({
      opacity: 1,
      y: 0,
      transition: {
        delay: 1.2,
        duration: 0.85,
      },
    });
  }, [contentControls, textControls]);

  return (
    <section className="relative flex min-h-screen w-full items-center overflow-hidden bg-[#030303]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_18%,rgba(250,204,21,0.18),transparent_20%),radial-gradient(circle_at_78%_22%,rgba(217,119,6,0.14),transparent_22%),radial-gradient(circle_at_50%_48%,rgba(250,204,21,0.08),transparent_38%),linear-gradient(180deg,#040404_0%,#070707_52%,#020202_100%)]" />
      <div className="absolute inset-0 opacity-55 [background-image:linear-gradient(to_right,rgba(250,204,21,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(250,204,21,0.04)_1px,transparent_1px)] [background-size:92px_92px]" />
      <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-yellow-200/8 to-transparent" />

      <FloatingOrb className="absolute left-[8%] top-[16%] h-64 w-64 rounded-full bg-yellow-200/10 blur-[110px]" delay={0.2} duration={12} />
      <FloatingOrb className="absolute right-[9%] top-[18%] h-80 w-80 rounded-full bg-amber-500/10 blur-[120px]" delay={0.8} duration={16} />
      <FloatingOrb className="absolute bottom-[12%] left-[28%] h-72 w-72 rounded-full bg-yellow-300/8 blur-[120px]" delay={1.1} duration={18} />

      <div className="absolute left-1/2 top-1/2 h-[34rem] w-[34rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-yellow-200/10 opacity-50" />
      <div className="absolute left-1/2 top-1/2 h-[27rem] w-[27rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-yellow-200/8 opacity-50" />
      <div className="absolute left-1/2 top-1/2 h-[20rem] w-[20rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-yellow-200/6 opacity-50" />

      <HeroNav />

      <div className="relative z-20 mx-auto grid min-h-screen w-full max-w-7xl items-center gap-16 px-6 pb-20 pt-32 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0, transition: { delay: 0.35, duration: 0.7 } }}
            className="mb-8 inline-flex items-center gap-3 rounded-full border border-yellow-200/14 bg-yellow-200/[0.06] px-4 py-2 text-sm text-yellow-100/90 backdrop-blur-xl"
          >
            <ShieldCheck className="h-4 w-4 text-yellow-200" />
            <span>{badge}</span>
          </motion.div>

          <h1 className="max-w-5xl text-5xl font-black leading-[0.9] tracking-[-0.065em] text-white sm:text-6xl md:text-7xl lg:text-[5.8rem]">
            {headline.split(" ").map((word, index) => (
              <motion.span
                key={`${word}-${index}`}
                custom={index}
                initial={{ opacity: 0, y: 44 }}
                animate={textControls}
                className="mr-[0.24em] inline-block"
              >
                {word}
              </motion.span>
            ))}
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={contentControls}
            className="mt-8 max-w-2xl text-lg leading-8 text-zinc-300 sm:text-xl"
          >
            {subtitle}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={contentControls}
            className="mt-10 flex flex-col gap-4 sm:flex-row"
          >
            <button
              onClick={onPrimaryClick}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-yellow-200 via-yellow-300 to-amber-400 px-7 py-3.5 text-sm font-bold uppercase tracking-[0.22em] text-black shadow-[0_24px_80px_rgba(250,204,21,0.22)] transition-transform hover:-translate-y-0.5"
            >
              {primaryLabel}
              <ArrowRight className="h-4 w-4" />
            </button>
            <button
              onClick={onSecondaryClick}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-yellow-200/14 bg-white/[0.04] px-7 py-3.5 text-sm font-semibold uppercase tracking-[0.22em] text-yellow-50 backdrop-blur-xl transition-colors hover:bg-white/[0.07]"
            >
              <Play className="h-4 w-4" />
              {secondaryLabel}
            </button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={contentControls}
            className="mt-14 grid gap-4 sm:grid-cols-3"
          >
            {[
              { label: "Journal", value: "Trades + notes" },
              { label: "Calendar", value: "Daily P&L" },
              { label: "Analytics", value: "Performance" },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-[1.75rem] border border-yellow-200/10 bg-black/30 p-5 backdrop-blur-2xl"
              >
                <div className="text-[11px] uppercase tracking-[0.32em] text-zinc-500">{item.label}</div>
                <div className="mt-2 text-2xl font-semibold text-yellow-100">{item.value}</div>
              </div>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={contentControls}
            className="mt-8 flex flex-wrap items-center gap-3"
          >
            {["Trade journal", "Calendar view", "Streak tracking"].map((item) => (
              <div
                key={item}
                className="rounded-full border border-white/8 bg-white/[0.03] px-4 py-2 text-xs uppercase tracking-[0.26em] text-zinc-300"
              >
                {item}
              </div>
            ))}
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, x: 36 }}
          animate={{ opacity: 1, x: 0, transition: { delay: 0.9, duration: 1 } }}
          className="relative mx-auto w-full max-w-[34rem]"
        >
          <div className="absolute inset-0 rounded-[2.4rem] bg-gradient-to-b from-yellow-200/14 via-yellow-300/8 to-transparent blur-3xl" />
          <div className="relative overflow-hidden rounded-[2.4rem] border border-yellow-200/12 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))] p-6 shadow-[0_30px_120px_rgba(0,0,0,0.45)] backdrop-blur-3xl">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(250,204,21,0.1),transparent_32%)]" />
            <div className="relative">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <div className="text-[11px] uppercase tracking-[0.34em] text-zinc-500">
                    Trading dashboard
                  </div>
                  <div className="mt-2 text-2xl font-semibold text-white">Performance overview</div>
                </div>
                <div className="rounded-full border border-yellow-200/14 bg-yellow-200/[0.08] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.28em] text-yellow-100">
                  Live
                </div>
              </div>

              <div className="rounded-[2rem] border border-yellow-200/10 bg-black/35 p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-[11px] uppercase tracking-[0.34em] text-zinc-500">
                      Total P&L
                    </div>
                    <div className="mt-3 text-5xl font-black tracking-[-0.04em] text-yellow-100">
                      +$2,450
                    </div>
                  </div>
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-yellow-200/12 bg-yellow-200/[0.06]">
                    <TrendingUp className="h-7 w-7 text-yellow-200" />
                  </div>
                </div>

                <div className="mt-8 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-[1.5rem] border border-white/8 bg-white/[0.03] p-5">
                    <div className="text-[11px] uppercase tracking-[0.28em] text-zinc-500">
                      Today's P&L
                    </div>
                    <div className="mt-3 text-3xl font-semibold text-white">+$145</div>
                    <div className="mt-3 text-sm text-zinc-400">4 trades</div>
                  </div>
                  <div className="rounded-[1.5rem] border border-white/8 bg-white/[0.03] p-5">
                    <div className="text-[11px] uppercase tracking-[0.28em] text-zinc-500">
                      Win rate
                    </div>
                    <div className="mt-3 text-3xl font-semibold text-white">71%</div>
                    <div className="mt-3 text-sm text-zinc-400">27 wins / 38 trades</div>
                  </div>
                </div>

                <div className="mt-5 rounded-[1.5rem] border border-white/8 bg-white/[0.03] p-5">
                  <div className="mb-4 flex items-center justify-between">
                    <div className="text-[11px] uppercase tracking-[0.28em] text-zinc-500">
                      Calendar - Daily P&L
                    </div>
                    <Sparkles className="h-4 w-4 text-yellow-200" />
                  </div>
                  <div className="grid grid-cols-7 gap-2">
                    {[
                      0, 145, 0, 320, -80, 95, 0, 210, 450, 0, -25, 0, 180, 75, 0, 0, 60, 110, 0, 290, 55, 0, 125, 0, 0, 40, 85, 175
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
                        {pnl === 0 ? "-" : pnl > 0 ? `+$${pnl}` : `-$${Math.abs(pnl)}`}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
                    <div className="text-[10px] uppercase tracking-[0.28em] text-zinc-500">
                      Winning streak
                    </div>
                    <div className="mt-2 flex items-center justify-between text-sm font-semibold text-white">
                      <span>5 days</span>
                      <ChevronRight className="h-4 w-4 text-yellow-200" />
                    </div>
                  </div>
                  <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
                    <div className="text-[10px] uppercase tracking-[0.28em] text-zinc-500">
                      Losing streak
                    </div>
                    <div className="mt-2 flex items-center justify-between text-sm font-semibold text-white">
                      <span>2 days</span>
                      <ChevronRight className="h-4 w-4 text-yellow-200" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default LivingFluidHero;
