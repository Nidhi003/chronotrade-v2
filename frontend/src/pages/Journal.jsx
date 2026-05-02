import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  BookOpen,
  Brain,
  CalendarDays,
  Clock3,
  Plus,
  Search,
  Sparkles,
  Tag,
  Trash2,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { loadJournalWithFallback, saveJournalToCloud, deleteJournalFromCloud } from "@/lib/storage";
import { useToast } from "@/components/ui/Toast";

const emotionLabels = [
  { value: 1, label: "Frustrated", tone: "text-rose-300", chip: "bg-rose-500/12 border-rose-500/20" },
  { value: 2, label: "Neutral", tone: "text-amber-200", chip: "bg-amber-500/12 border-amber-500/20" },
  { value: 3, label: "Calm", tone: "text-emerald-300", chip: "bg-emerald-500/12 border-emerald-500/20" },
  { value: 4, label: "Confident", tone: "text-sky-300", chip: "bg-sky-500/12 border-sky-500/20" },
  { value: 5, label: "Locked In", tone: "text-yellow-200", chip: "bg-yellow-300/12 border-yellow-300/20" },
];

const quickPrompts = [
  "What setup did I take and why was it valid?",
  "Did I follow risk and management rules exactly?",
  "What emotion influenced the trade most?",
  "What should I repeat or avoid tomorrow?",
];

export default function JournalPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [showNewEntry, setShowNewEntry] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [journalEntries, setJournalEntries] = useState([]);
  const [newEntry, setNewEntry] = useState({
    title: "",
    emotion: null,
    tags: [],
    content: "",
  });

  useEffect(() => {
    async function loadJournal() {
      const entries = await loadJournalWithFallback();
      setJournalEntries(entries);
      setLoading(false);
    }
    loadJournal();
  }, []);

  const filteredEntries = useMemo(() => {
    return journalEntries.filter((entry) => {
      const query = searchQuery.toLowerCase();
      return (
        entry.title?.toLowerCase().includes(query) ||
        entry.content?.toLowerCase().includes(query) ||
        entry.tags?.some((tag) => tag.toLowerCase().includes(query))
      );
    });
  }, [journalEntries, searchQuery]);

  const avgMood = useMemo(() => {
    if (!journalEntries.length) return "0.0";
    const total = journalEntries.reduce((sum, entry) => sum + (entry.mood_before || 0), 0);
    return (total / journalEntries.length).toFixed(1);
  }, [journalEntries]);

  const thisWeek = useMemo(() => {
    return journalEntries.filter((entry) => {
      if (!entry.created_at) return false;
      return new Date(entry.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    }).length;
  }, [journalEntries]);

  const handleSaveEntry = async () => {
    if (!newEntry.title || !newEntry.emotion || !newEntry.content.trim()) {
      showToast("Please fill in title, emotion, and notes", "error");
      return;
    }

    const saved = await saveJournalToCloud({
        title: newEntry.title,
        content: newEntry.content,
        mood_before: newEntry.emotion,
        mood_after: newEntry.emotion,
        tags: newEntry.tags,
      });
      setJournalEntries((prev) => [saved, ...prev]);

      setShowNewEntry(false);
      setNewEntry({ title: "", emotion: null, tags: [], content: "" });
    }

    const handleDeleteEntry = async (id) => {
      if (!confirm("Delete this entry?")) return;
      await deleteJournalFromCloud(id);
      setJournalEntries((prev) => prev.filter((entry) => entry.id !== id));
    };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#050505]">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-yellow-300 border-t-transparent" />
          <p className="mt-4 text-sm uppercase tracking-[0.28em] text-zinc-500">Loading journal</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#facc1514,transparent_20%),linear-gradient(180deg,#050505_0%,#090909_100%)] text-white">
      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-8 flex items-start justify-between gap-6">
          <div>
            <button
              onClick={() => navigate("/dashboard")}
              className="inline-flex items-center gap-2 rounded-full border border-yellow-200/12 bg-black/30 px-4 py-2 text-xs uppercase tracking-[0.28em] text-yellow-100/80 transition hover:bg-black/45"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to desk
            </button>

            <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-yellow-200/14 bg-yellow-200/[0.06] px-4 py-2 text-xs uppercase tracking-[0.32em] text-yellow-100/80">
              <Sparkles className="h-4 w-4" />
              Trading Journal
            </div>
            <h1 className="mt-6 text-4xl font-black tracking-[-0.05em] md:text-6xl">
              Record the trade behind the result.
            </h1>
            <p className="mt-4 max-w-3xl text-lg leading-8 text-zinc-400">
              Use your journal to capture setup quality, psychology, mistakes, discipline, and lessons while they are still fresh enough to improve your next session.
            </p>
          </div>

          <button
            onClick={() => setShowNewEntry(true)}
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-yellow-200 via-yellow-300 to-amber-400 px-6 py-3.5 text-sm font-bold uppercase tracking-[0.24em] text-black shadow-[0_18px_50px_rgba(250,204,21,0.18)]"
          >
            <Plus className="h-4 w-4" />
            New Entry
          </button>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="grid gap-6 md:grid-cols-3">
            {[
              { label: "Total entries", value: journalEntries.length, icon: BookOpen },
              { label: "Average mood", value: avgMood, icon: Brain },
              { label: "This week", value: thisWeek, icon: CalendarDays },
            ].map((stat) => (
              <div
                key={stat.label}
                className="rounded-[1.8rem] border border-yellow-200/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] p-6"
              >
                <div className="flex items-center justify-between">
                  <div className="text-xs uppercase tracking-[0.3em] text-zinc-500">{stat.label}</div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-yellow-300/10">
                    <stat.icon className="h-5 w-5 text-yellow-200" />
                  </div>
                </div>
                <div className="mt-4 text-4xl font-black tracking-[-0.04em] text-white">{stat.value}</div>
              </div>
            ))}
          </div>

          <div className="rounded-[1.8rem] border border-yellow-200/10 bg-gradient-to-br from-yellow-300/[0.08] via-white/[0.03] to-transparent p-6">
            <div className="text-xs uppercase tracking-[0.3em] text-zinc-500">Helpful prompts</div>
            <div className="mt-5 space-y-3">
              {quickPrompts.map((prompt) => (
                <div key={prompt} className="rounded-2xl border border-white/8 bg-black/25 p-4 text-sm leading-7 text-zinc-300">
                  {prompt}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-5 rounded-[1.9rem] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] p-6 md:flex-row md:items-center md:justify-between">
          <div className="relative max-w-md flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
            <input
              type="text"
              placeholder="Search title, notes, or tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-black/35 py-3 pl-12 pr-4 text-white outline-none transition focus:border-yellow-300/35"
            />
          </div>
          <div className="text-sm text-zinc-500">
            {filteredEntries.length} {filteredEntries.length === 1 ? "entry" : "entries"} visible
          </div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          {filteredEntries.length === 0 ? (
            <div className="col-span-full rounded-[2rem] border border-white/8 bg-black/25 p-16 text-center">
              <BookOpen className="mx-auto h-14 w-14 text-zinc-600" />
              <h3 className="mt-5 text-2xl font-bold text-white">No journal entries found</h3>
              <p className="mt-3 text-zinc-500">
                Start tracking your setups, emotions, and lessons while the session is still fresh.
              </p>
              <button
                onClick={() => setShowNewEntry(true)}
                className="mt-8 rounded-full bg-yellow-200 px-6 py-3 text-sm font-bold uppercase tracking-[0.22em] text-black"
              >
                Create first entry
              </button>
            </div>
          ) : (
            filteredEntries.map((entry) => {
              const emotion = emotionLabels.find((item) => item.value === entry.mood_before);
              return (
                <motion.article
                  key={entry.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-[2rem] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] p-6"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold tracking-[-0.03em] text-white">{entry.title}</h3>
                      <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-zinc-500">
                        <span className="inline-flex items-center gap-2">
                          <Clock3 className="h-4 w-4" />
                          {entry.created_at ? new Date(entry.created_at).toLocaleDateString() : "Recently"}
                        </span>
                        {emotion && (
                          <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 ${emotion.chip}`}>
                            <Brain className={`h-4 w-4 ${emotion.tone}`} />
                            <span className={emotion.tone}>{emotion.label}</span>
                          </span>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => handleDeleteEntry(entry.id)}
                      className="rounded-2xl border border-white/8 bg-black/25 p-3 text-zinc-500 transition hover:border-rose-500/20 hover:text-rose-300"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="mt-6 rounded-[1.4rem] border border-white/8 bg-black/20 p-5 text-sm leading-7 text-zinc-300">
                    {entry.content}
                  </div>

                  {entry.tags?.length > 0 && (
                    <div className="mt-5 flex flex-wrap gap-2">
                      {entry.tags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center gap-2 rounded-full border border-yellow-200/12 bg-yellow-300/[0.06] px-3 py-1 text-xs uppercase tracking-[0.18em] text-yellow-100/80"
                        >
                          <Tag className="h-3 w-3" />
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </motion.article>
              );
            })
          )}
        </div>
      </div>

      <AnimatePresence>
        {showNewEntry && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
          >
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.97 }}
              className="w-full max-w-3xl rounded-[2rem] border border-yellow-200/10 bg-[#0a0a0a] shadow-[0_30px_120px_rgba(0,0,0,0.55)]"
            >
              <div className="flex items-center justify-between border-b border-white/8 p-6">
                <div>
                  <div className="text-xs uppercase tracking-[0.28em] text-zinc-500">New entry</div>
                  <h2 className="mt-2 text-2xl font-bold text-white">Capture the session while it is fresh.</h2>
                </div>
                <button
                  onClick={() => setShowNewEntry(false)}
                  className="rounded-2xl border border-white/8 bg-white/[0.03] p-3 text-zinc-400 transition hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-6 p-6">
                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-[0.28em] text-zinc-500">
                    Entry title
                  </label>
                  <input
                    type="text"
                    value={newEntry.title}
                    onChange={(e) => setNewEntry({ ...newEntry, title: e.target.value })}
                    placeholder="e.g. Clean London breakout with strong discipline"
                    className="w-full rounded-2xl border border-white/10 bg-black/35 px-4 py-3 text-white outline-none transition focus:border-yellow-300/35"
                  />
                </div>

                <div>
                  <div className="mb-3 text-xs font-bold uppercase tracking-[0.28em] text-zinc-500">
                    How did you feel?
                  </div>
                  <div className="grid gap-3 sm:grid-cols-5">
                    {emotionLabels.map((item) => (
                      <button
                        key={item.value}
                        onClick={() => setNewEntry({ ...newEntry, emotion: item.value })}
                        className={`rounded-2xl border px-4 py-4 text-center transition ${
                          newEntry.emotion === item.value
                            ? "border-yellow-300/35 bg-yellow-300/10 text-yellow-100"
                            : "border-white/8 bg-white/[0.03] text-zinc-400 hover:text-white"
                        }`}
                      >
                        <div className="text-sm font-semibold">{item.label}</div>
                        <div className="mt-1 text-xs uppercase tracking-[0.2em]">Level {item.value}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-[0.28em] text-zinc-500">
                    Notes
                  </label>
                  <textarea
                    value={newEntry.content}
                    onChange={(e) => setNewEntry({ ...newEntry, content: e.target.value })}
                    placeholder="What was the setup? What did you do well? What emotion influenced the trade? What should you repeat or avoid next session?"
                    className="h-40 w-full rounded-2xl border border-white/10 bg-black/35 px-4 py-3 text-white outline-none transition focus:border-yellow-300/35"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-[0.28em] text-zinc-500">
                    Tags
                  </label>
                  <input
                    type="text"
                    value={newEntry.tags.join(", ")}
                    onChange={(e) =>
                      setNewEntry({
                        ...newEntry,
                        tags: e.target.value
                          .split(",")
                          .map((tag) => tag.trim())
                          .filter(Boolean),
                      })
                    }
                    placeholder="Discipline, FOMO, Patience, Risk Management"
                    className="w-full rounded-2xl border border-white/10 bg-black/35 px-4 py-3 text-white outline-none transition focus:border-yellow-300/35"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 border-t border-white/8 p-6">
                <button
                  onClick={() => setShowNewEntry(false)}
                  className="rounded-full border border-white/10 bg-white/[0.03] px-5 py-3 text-sm font-semibold text-zinc-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEntry}
                  className="rounded-full bg-gradient-to-r from-yellow-200 via-yellow-300 to-amber-400 px-6 py-3 text-sm font-bold uppercase tracking-[0.22em] text-black"
                >
                  Save Entry
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
