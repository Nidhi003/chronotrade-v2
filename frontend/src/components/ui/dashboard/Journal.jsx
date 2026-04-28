import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Plus, Search, Trash2, X, Loader2 } from "lucide-react";
import { fetchJournal, addJournalEntry, deleteJournalEntry } from '@/lib/supabase';

export default function JournalPage() {
  const navigate = useNavigate();
  const [showNewEntry, setShowNewEntry] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [journalEntries, setJournalEntries] = useState([]);
  const [newEntry, setNewEntry] = useState({
    title: "", emotion: null, tags: [], content: "", linkedTrades: []
  });

  useEffect(() => {
    async function loadJournal() {
      try {
        const data = await fetchJournal();
        setJournalEntries(data || []);
      } catch (e) {
        console.error('Failed to load journal:', e);
        setJournalEntries([]);
      } finally {
        setLoading(false);
      }
    }
    loadJournal();
  }, []);

  const handleSaveEntry = async () => {
    if (!newEntry.title || !newEntry.emotion) {
      alert("Please fill in title and emotion");
      return;
    }
    try {
      const saved = await addJournalEntry({
        title: newEntry.title,
        content: newEntry.content,
        mood_before: newEntry.emotion,
        mood_after: newEntry.emotion,
        tags: newEntry.tags,
      });
      setJournalEntries([saved, ...journalEntries]);
    } catch (e) {
      console.error('Failed to save:', e);
      setJournalEntries([{ ...newEntry, id: Date.now() }, ...journalEntries]);
    }
    setShowNewEntry(false);
    setNewEntry({ title: "", emotion: null, tags: [], content: "", linkedTrades: [] });
  };

  const handleDeleteEntry = async (id) => {
    if (!confirm("Delete this entry?")) return;
    try {
      await deleteJournalEntry(id);
    } catch (e) {
      console.error('Failed to delete:', e);
    }
    setJournalEntries(journalEntries.filter(e => e.id !== id));
  };

  const filteredEntries = journalEntries.filter(entry =>
    entry.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const emotionLabels = [
    { value: 1, label: "Frustrated", color: "text-red-500" },
    { value: 2, label: "Neutral", color: "text-yellow-500" },
    { value: 3, label: "Calm", color: "text-green-500" },
    { value: 4, label: "Confident", color: "text-blue-500" },
    { value: 5, label: "Euphoric", color: "text-purple-500" },
  ];

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#020617]">
        <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-black text-white">Journal</h2>
            <p className="text-slate-400">Track your trading psychology</p>
          </div>
          <button 
            onClick={() => setShowNewEntry(true)} 
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 rounded-xl font-bold text-white hover:bg-blue-500"
          >
            <Plus className="h-4 w-4" /> New Entry
          </button>
        </div>

        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <input
            type="text" 
            placeholder="Search entries..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-xl bg-slate-900 border border-white/10 text-white"
          />
        </div>

        <div className="space-y-4">
          {filteredEntries.length === 0 ? (
            <div className="text-center py-12 text-slate-500 glass rounded-xl p-8">
              No journal entries yet. Create your first entry!
            </div>
          ) : (
            filteredEntries.map(entry => (
              <motion.div 
                key={entry.id} 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass rounded-xl p-6"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-white">{entry.title}</h3>
                    <p className="text-sm text-slate-400 mt-1">{entry.content}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className={`text-xs font-bold ${
                        emotionLabels.find(e => e.value === entry.mood_before)?.color
                      }`}>
                        {emotionLabels.find(e => e.value === entry.mood_before)?.label}
                      </span>
                      <span className="text-xs text-slate-500">
                        {entry.created_at ? new Date(entry.created_at).toLocaleDateString() : 'Recently'}
                      </span>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleDeleteEntry(entry.id)} 
                    className="p-2 text-slate-500 hover:text-rose-400"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>

      {showNewEntry && (
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/60 flex items-center justify-center p-4"
        >
          <motion.div 
            initial={{ scale: 0.95 }} 
            animate={{ scale: 1 }} 
            className="glass rounded-2xl p-6 max-w-lg w-full"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white">New Journal Entry</h3>
              <button onClick={() => setShowNewEntry(false)}><X className="h-5 w-5 text-slate-400" /></button>
            </div>
            <input
              type="text" 
              placeholder="Title"
              value={newEntry.title}
              onChange={e => setNewEntry({ ...newEntry, title: e.target.value })}
              className="w-full mb-4 px-4 py-2 rounded-xl bg-slate-900 border border-white/10 text-white"
            />
            <p className="text-sm text-slate-400 mb-2">How do you feel? (1-5)</p>
            <div className="flex gap-2 mb-4">
              {[1,2,3,4,5].map(num => (
                <button
                  key={num}
                  onClick={() => setNewEntry({ ...newEntry, emotion: num })}
                  className={`w-10 h-10 rounded-full font-bold ${
                    newEntry.emotion === num 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>
            <div className="mt-4">
              <p className="text-sm text-slate-400 mb-2">Notes</p>
              <textarea
                value={newEntry.content}
                onChange={e => setNewEntry({ ...newEntry, content: e.target.value })}
                className="w-full h-32 px-4 py-2 rounded-xl bg-slate-900 border border-white/10 text-white resize-none"
              />
            </div>
            <button 
              onClick={handleSaveEntry} 
              className="w-full mt-4 py-3 bg-blue-600 rounded-xl font-bold text-white hover:bg-blue-500"
            >
              Save Entry
            </button>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}