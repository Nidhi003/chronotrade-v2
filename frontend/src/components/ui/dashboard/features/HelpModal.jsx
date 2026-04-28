"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BookOpen,
  Brain,
  Check,
  ChevronDown,
  ChevronUp,
  FileText,
  Loader2,
  Mail,
  MessageCircle,
  ShieldCheck,
  Target,
  X,
} from "lucide-react";

const faqItems = [
  {
    question: "What should I write after a losing trade?",
    answer:
      "Capture the setup, the original plan, what invalidated it, your emotional state, and whether the loss came from process or market randomness. That makes the review useful instead of emotional.",
  },
  {
    question: "How should I use AI Oracle without overtrusting it?",
    answer:
      "Use it as a review assistant, not as a signal provider. Let it surface behavior clusters, recurring leaks, and discipline issues, then confirm those findings in your own journal sample.",
  },
  {
    question: "What should I tag on every trade?",
    answer:
      "At minimum tag setup, session, direction, market condition, and execution quality. Those tags make your analytics and replay sections materially more useful.",
  },
  {
    question: "How do I review a bad trading day inside ChronoTradez?",
    answer:
      "Start with the journal entry, compare trade frequency against your normal rhythm, inspect session results, then use analytics and AI insights to isolate whether the leak was timing, sizing, or emotional drift.",
  },
  {
    question: "What does the free plan limit mean in practice?",
    answer:
      "Free accounts are suited for testing the workflow. Pro and Elite are intended for traders building a full history with AI review, richer analytics, and deeper session analysis.",
  },
  {
    question: "Can I use ChronoTradez for forex, futures, and prop challenges?",
    answer:
      "Yes. The journal is structured around execution review, risk discipline, and session analysis rather than a single market type, so it translates well across forex, indices, futures, and funded-account workflows.",
  },
];

const playbookCards = [
  {
    icon: FileText,
    title: "Post-trade review",
    description: "Write what you saw, what you expected, how you managed risk, and where execution drifted.",
  },
  {
    icon: Target,
    title: "Leak diagnosis",
    description: "Use analytics, AI insights, and session patterns together. One card alone rarely explains performance.",
  },
  {
    icon: Brain,
    title: "Psychology loop",
    description: "Track mood and behavior after losses. Most traders underestimate how quickly frustration changes trade quality.",
  },
];

export default function HelpModal({ isOpen, onClose, theme = "dark" }) {
  const [openFaq, setOpenFaq] = useState(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [activeTab, setActiveTab] = useState("playbook");

  const isDark = theme === "dark";
  const shellClass = isDark
    ? "border-yellow-200/10 bg-[#070707] text-white"
    : "border-slate-200 bg-white text-slate-900";
  const panelClass = isDark
    ? "border-white/8 bg-white/[0.03]"
    : "border-slate-200 bg-slate-50";
  const inputClass = isDark
    ? "border-white/10 bg-black/30 text-white placeholder:text-zinc-500 focus:border-yellow-200/30 focus:ring-yellow-200/20"
    : "border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:border-amber-400/40 focus:ring-amber-400/20";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);

    await new Promise((resolve) => setTimeout(resolve, 1200));

    const body = [
      `Name: ${name}`,
      `Email: ${email}`,
      `Subject: ${subject}`,
      "",
      message,
    ].join("\n");

    const mailtoLink = `mailto:support@chronotrade.io?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(mailtoLink, "_blank");

    setSent(true);
    setSending(false);
    setTimeout(() => {
      setSent(false);
      setName("");
      setEmail("");
      setSubject("");
      setMessage("");
    }, 3000);
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/75 p-4 backdrop-blur-md overflow-y-auto"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.96, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.96, opacity: 0, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className={`w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-[2rem] border shadow-[0_40px_120px_rgba(0,0,0,0.55)] ${shellClass} my-auto`}
      >
        <div className="relative overflow-hidden border-b border-white/8 px-6 py-5">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(250,204,21,0.16),transparent_40%),radial-gradient(circle_at_top_right,rgba(245,158,11,0.12),transparent_35%)]" />
          <div className="relative flex items-start justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-yellow-200/15 bg-yellow-200/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.28em] text-yellow-100">
                <MessageCircle className="h-3.5 w-3.5" />
                Trader Support
              </div>
              <h2 className="mt-4 text-2xl font-black tracking-tight">Help built around review quality</h2>
              <p className="mt-2 max-w-3xl text-sm leading-7 text-zinc-400">
                The fastest way to improve is to know what to record, how to review it, and where to look when performance slips.
              </p>
            </div>
            <button
              onClick={onClose}
              className="rounded-2xl border border-white/10 bg-white/[0.03] p-3 transition hover:bg-white/[0.06]"
            >
              <X className="h-5 w-5 text-zinc-400" />
            </button>
          </div>
        </div>

        <div className="grid flex-1 overflow-hidden lg:grid-cols-[0.92fr_1.35fr]">
          <aside className="border-b border-white/8 p-6 lg:border-b-0 lg:border-r">
            <div className={`rounded-[1.6rem] border p-5 ${panelClass}`}>
              <div className="text-xs uppercase tracking-[0.26em] text-zinc-500">Playbook</div>
              <div className="mt-4 space-y-4">
                {playbookCards.map((card) => {
                  const Icon = card.icon;
                  return (
                    <div key={card.title} className="rounded-[1.25rem] border border-white/8 bg-black/20 p-4">
                      <div className="flex items-center gap-3">
                        <div className="rounded-2xl bg-yellow-200/10 p-3">
                          <Icon className="h-4 w-4 text-yellow-200" />
                        </div>
                        <div className="font-semibold text-white">{card.title}</div>
                      </div>
                      <p className="mt-3 text-sm leading-7 text-zinc-300">{card.description}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="mt-5 space-y-3">
              {[
                { id: "playbook", label: "Review playbook", icon: BookOpen, hint: "Use the product more effectively" },
                { id: "contact", label: "Contact support", icon: Mail, hint: "Escalate account or workflow issues" },
              ].map((tab) => {
                const Icon = tab.icon;
                const active = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex w-full items-start gap-4 rounded-[1.4rem] border px-4 py-4 text-left transition ${
                      active
                        ? "border-yellow-200/20 bg-yellow-200/10 text-white"
                        : isDark
                          ? "border-white/8 bg-white/[0.02] text-zinc-400 hover:bg-white/[0.04]"
                          : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    <div className={`rounded-2xl p-3 ${active ? "bg-yellow-200/12 text-yellow-100" : "bg-black/20 text-zinc-400"}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold">{tab.label}</div>
                      <div className={`mt-1 text-xs leading-6 ${active ? "text-yellow-50/75" : "text-zinc-500"}`}>{tab.hint}</div>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className={`mt-5 rounded-[1.6rem] border p-5 ${panelClass}`}>
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-yellow-200/10 p-3">
                  <ShieldCheck className="h-4 w-4 text-yellow-200" />
                </div>
                <div>
                  <div className="text-xs uppercase tracking-[0.22em] text-zinc-500">Response expectation</div>
                  <div className="mt-1 text-sm font-semibold text-white">Support replies are structured around workflow fixes</div>
                </div>
              </div>
              <p className="mt-4 text-sm leading-7 text-zinc-300">
                When you write in, include the market, setup, and the step where the workflow broke down. That cuts the back-and-forth.
              </p>
            </div>
          </aside>

          <section className="flex-1 overflow-y-auto p-6">
            {activeTab === "playbook" && (
              <div className="space-y-4">
                <div className={`rounded-[1.6rem] border p-5 ${panelClass}`}>
                  <div className="text-xs uppercase tracking-[0.26em] text-zinc-500">Frequently asked by traders</div>
                  <div className="mt-5 space-y-3">
                    {faqItems.map((item, index) => {
                      const open = openFaq === index;
                      return (
                        <div key={item.question} className="overflow-hidden rounded-[1.3rem] border border-white/8 bg-black/20">
                          <button
                            onClick={() => setOpenFaq(open ? null : index)}
                            className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                          >
                            <span className="text-sm font-semibold text-white">{item.question}</span>
                            {open ? (
                              <ChevronUp className="h-4 w-4 shrink-0 text-zinc-500" />
                            ) : (
                              <ChevronDown className="h-4 w-4 shrink-0 text-zinc-500" />
                            )}
                          </button>
                          {open && <div className="px-5 pb-5 text-sm leading-7 text-zinc-300">{item.answer}</div>}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "contact" && (
              <div className="space-y-5">
                <div className={`rounded-[1.6rem] border p-5 ${panelClass}`}>
                  <div className="flex items-start gap-4">
                    <div className="rounded-2xl bg-yellow-200/10 p-3">
                      <Mail className="h-5 w-5 text-yellow-200" />
                    </div>
                    <div>
                      <div className="text-xs uppercase tracking-[0.26em] text-zinc-500">Support channel</div>
                      <h3 className="mt-2 text-xl font-black text-white">Email support</h3>
                      <p className="mt-2 text-sm leading-7 text-zinc-400">
                        Describe the issue in trading terms: what you were trying to log, review, or analyze when the workflow broke.
                      </p>
                    </div>
                  </div>
                </div>

                {sent ? (
                  <div className="flex min-h-[320px] flex-col items-center justify-center rounded-[1.8rem] border border-emerald-500/15 bg-emerald-500/8 p-8 text-center">
                    <div className="rounded-full bg-emerald-500/15 p-4">
                      <Check className="h-8 w-8 text-emerald-300" />
                    </div>
                    <h4 className="mt-5 text-xl font-bold text-white">Support message prepared</h4>
                    <p className="mt-2 max-w-md text-sm leading-7 text-zinc-300">
                      Your email client should open with the details prefilled so you can send the request directly.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid gap-5 md:grid-cols-2">
                      <div>
                        <label className="mb-2 block text-sm font-medium text-zinc-300">Your name</label>
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          required
                          placeholder="Trader name"
                          className={`w-full rounded-2xl border px-4 py-3 outline-none transition focus:ring-4 ${inputClass}`}
                        />
                      </div>
                      <div>
                        <label className="mb-2 block text-sm font-medium text-zinc-300">Email</label>
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          placeholder="name@example.com"
                          className={`w-full rounded-2xl border px-4 py-3 outline-none transition focus:ring-4 ${inputClass}`}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-zinc-300">Subject</label>
                      <select
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        required
                        className={`w-full rounded-2xl border px-4 py-3 outline-none transition focus:ring-4 ${inputClass}`}
                      >
                        <option value="">Select a topic</option>
                        <option value="Trade logging issue">Trade logging issue</option>
                        <option value="Journal workflow question">Journal workflow question</option>
                        <option value="Analytics or AI review issue">Analytics or AI review issue</option>
                        <option value="Billing or subscription">Billing or subscription</option>
                        <option value="Account access">Account access</option>
                      </select>
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-zinc-300">Message</label>
                      <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        required
                        rows={6}
                        placeholder="Describe what you were doing, what you expected to happen, and what happened instead."
                        className={`w-full resize-none rounded-2xl border px-4 py-3 outline-none transition focus:ring-4 ${inputClass}`}
                      />
                    </div>

                    <div className={`rounded-[1.4rem] border p-4 ${panelClass}`}>
                      <div className="flex items-start gap-3">
                        <ArrowRight className="mt-1 h-4 w-4 text-yellow-200" />
                        <p className="text-sm leading-7 text-zinc-300">
                          Include the instrument, setup, session, and whether the issue appeared during logging, journaling, analytics, or AI review.
                        </p>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={sending}
                      className="inline-flex items-center gap-2 rounded-2xl bg-[linear-gradient(135deg,#facc15,#f59e0b)] px-5 py-3 text-sm font-bold text-black transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      {sending ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Preparing message
                        </>
                      ) : (
                        <>
                          <Mail className="h-4 w-4" />
                          Open email client
                        </>
                      )}
                    </button>
                  </form>
                )}
              </div>
            )}
          </section>
        </div>
      </motion.div>
    </motion.div>
  );
}
