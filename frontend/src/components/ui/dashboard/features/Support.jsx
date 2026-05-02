"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { MessageCircle, Send, Check, AlertCircle, X, ChevronDown } from "lucide-react";
import { useSubscription } from "@/context/SubscriptionContext";

const SUPPORT_CATEGORIES = [
  { id: "bug", label: "Bug / Error", description: "Something isn't working correctly" },
  { id: "feature", label: "Feature Request", description: "I'd like a new feature" },
  { id: "account", label: "Account Issue", description: "Billing or subscription problem" },
  { id: "data", label: "Data Issue", description: "Missing or incorrect data" },
  { id: "other", label: "Other", description: "Something else" },
];

export default function Support() {
  const { tier } = useSubscription();
  const [category, setCategory] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState(null);
  const [expanded, setExpanded] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!category || !subject || !message || !email) {
      setError("Please fill in all fields");
      return;
    }

    setSending(true);
    setError(null);

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      await fetch(`${API_URL}/api/support`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category,
          subject,
          message,
          email,
          tier,
          priority,
        }),
      });

      setSent(true);
    } catch (err) {
      setError("Failed to send message. Please try again.");
    }

    setSending(false);
  };

  const priority = tier === "elite" ? "high" : tier === "pro" ? "medium" : "low";

  return (
    <div className="space-y-6 overflow-y-auto max-h-[calc(100vh-200px)] pr-2">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-black text-white flex items-center gap-2">
          <MessageCircle className="h-6 w-6 text-indigo-500" />
          Support
        </h2>
        {tier !== "free" && (
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20">
            <span className="text-xs text-indigo-400 font-bold uppercase">{tier} Priority</span>
          </div>
        )}
      </div>

      {sent ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass rounded-2xl p-8 text-center"
        >
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-4">
            <Check className="h-8 w-8 text-emerald-400" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Message Sent!</h3>
          <p className="text-slate-400 mb-6">
            We'll get back to you within {tier === "elite" ? "1 hour" : tier === "pro" ? "4 hours" : "24 hours"}
          </p>
          <button
            onClick={() => { setSent(false); setCategory(""); setSubject(""); setMessage(""); }}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-white font-bold transition"
          >
            Send Another Message
          </button>
        </motion.div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="flex items-center gap-2 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30">
              <AlertCircle className="h-5 w-5 text-rose-400" />
              <span className="text-rose-400">{error}</span>
            </div>
          )}

          <div className="glass rounded-xl p-5">
            <h3 className="text-lg font-bold text-white mb-4">How can we help?</h3>
            
            <div className="space-y-3">
              {SUPPORT_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategory(cat.id)}
                  className={`w-full flex items-center justify-between p-4 rounded-xl transition ${
                    category === cat.id
                      ? "bg-indigo-600/20 border border-indigo-500/50"
                      : "bg-slate-800/50 border border-transparent hover:border-slate-700"
                  }`}
                >
                  <div className="text-left">
                    <p className="text-white font-bold">{cat.label}</p>
                    <p className="text-xs text-slate-400">{cat.description}</p>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    category === cat.id ? "border-indigo-500 bg-indigo-500" : "border-slate-600"
                  }`}>
                    {category === cat.id && <Check className="h-3 w-3 text-white" />}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="glass rounded-xl p-5 space-y-4">
            <div>
              <label className="block text-sm font-bold text-slate-300 mb-2">Your Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-300 mb-2">Subject</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Brief description of your issue"
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-300 mb-2">Describe Your Issue</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Please describe what happened, what you expected, and any steps to reproduce..."
                rows={6}
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 resize-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={sending || !category || !subject || !message || !email}
            className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-600/50 disabled:cursor-not-allowed rounded-xl text-white font-bold transition flex items-center justify-center gap-2"
          >
            {sending ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1 }}
                  className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                />
                Sending...
              </>
            ) : (
              <>
                <Send className="h-5 w-5" />
                Submit Request
              </>
            )}
          </button>

          <p className="text-center text-xs text-slate-500">
            Priority: {tier === "elite" ? "Elite (1hr)" : tier === "pro" ? "Pro (4hrs)" : "Standard (24hrs)"}
          </p>
        </form>
      )}
    </div>
  );
}