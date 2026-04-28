"use client";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  Check,
  Crown,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  ShieldCheck,
  Target,
  User,
  X,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useSubscription } from "@/context/SubscriptionContext";

const traderProfileNotes = [
  "Keep your display name consistent across exports and review reports.",
  "Use a separate login from broker credentials for cleaner operational security.",
  "Elite access is best suited for traders who review sessions and psychology daily.",
];

export default function SettingsModal({ isOpen, onClose, theme = "dark", onNameChange }) {
  const { user, updateProfile, updatePassword } = useAuth();
  const { tier, subscription, TIERS } = useSubscription();
  const [activeTab, setActiveTab] = useState("profile");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

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

  const tierInfo = useMemo(() => TIERS?.[tier] || TIERS?.free, [TIERS, tier]);

  useEffect(() => {
    const storedName = localStorage.getItem("chronotrade_user_name");
    setName(storedName || user?.user_metadata?.full_name || user?.email?.split("@")[0] || "");
    setEmail(user?.email || "");
  }, [user]);

  const resetMessages = () => {
    setError("");
    setSuccess("");
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    resetMessages();

    try {
      await updateProfile({ full_name: name });
      localStorage.setItem("chronotrade_user_name", name);
      onNameChange?.(name);
      window.dispatchEvent(new Event("name-updated"));
      setSuccess("Profile updated successfully.");
    } catch (err) {
      localStorage.setItem("chronotrade_user_name", name);
      onNameChange?.(name);
      window.dispatchEvent(new Event("name-updated"));
      setSuccess("Profile saved locally.");
    } finally {
      setLoading(false);
      setTimeout(() => setSuccess(""), 3000);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    resetMessages();

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match.");
      setLoading(false);
      return;
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters.");
      setLoading(false);
      return;
    }

    try {
      await updatePassword(newPassword);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setSuccess("Password updated successfully.");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.message || "Failed to update password.");
    } finally {
      setLoading(false);
    }
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
        className={`w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-[2rem] border shadow-[0_40px_120px_rgba(0,0,0,0.55)] ${shellClass} my-auto`}
      >
        <div className="relative overflow-hidden border-b border-white/8 px-6 py-5">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(250,204,21,0.16),transparent_40%),radial-gradient(circle_at_top_right,rgba(245,158,11,0.12),transparent_35%)]" />
          <div className="relative flex items-start justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-yellow-200/15 bg-yellow-200/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.28em] text-yellow-100">
                <ShieldCheck className="h-3.5 w-3.5" />
                Account Desk
              </div>
              <h2 className="mt-4 text-2xl font-black tracking-tight">Trading account settings</h2>
              <p className="mt-2 max-w-2xl text-sm leading-7 text-zinc-400">
                Keep your identity, security, and review workflow clean. A disciplined desk includes disciplined account management.
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

        <div className="grid gap-0 lg:grid-cols-[1.05fr_1.4fr]">
          <aside className="border-b border-white/8 p-6 lg:border-b-0 lg:border-r">
            <div className={`rounded-[1.6rem] border p-5 ${panelClass}`}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-xs uppercase tracking-[0.26em] text-zinc-500">Current plan</div>
                  <div className="mt-2 text-2xl font-black capitalize text-white">{tierInfo?.name || "Free"}</div>
                </div>
                <div className="rounded-2xl bg-yellow-200/10 p-3">
                  <Crown className="h-5 w-5 text-yellow-200" />
                </div>
              </div>
              <div className="mt-6 grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
                <div className="rounded-2xl border border-white/8 bg-black/25 p-4">
                  <div className="text-xs uppercase tracking-[0.22em] text-zinc-500">Journal capacity</div>
                  <div className="mt-2 text-sm font-semibold text-white">
                    {tierInfo?.limits?.trades === -1 ? "Unlimited trades" : `${tierInfo?.limits?.trades || 0} trades / 30d`}
                  </div>
                </div>
                <div className="rounded-2xl border border-white/8 bg-black/25 p-4">
                  <div className="text-xs uppercase tracking-[0.22em] text-zinc-500">Cloud status</div>
                  <div className="mt-2 text-sm font-semibold text-white">
                    {subscription?.status === "active" ? "Active subscription" : "Local-first account"}
                  </div>
                </div>
                <div className="rounded-2xl border border-white/8 bg-black/25 p-4">
                  <div className="text-xs uppercase tracking-[0.22em] text-zinc-500">Review posture</div>
                  <div className="mt-2 text-sm font-semibold text-white">
                    {tier === "elite" ? "Full review stack" : tier === "pro" ? "Advanced review tools" : "Core journaling"}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-5 space-y-3">
              {[
                { id: "profile", label: "Profile", icon: User, hint: "Display identity and export consistency" },
                { id: "security", label: "Security", icon: Lock, hint: "Password hygiene and account protection" },
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
              <div className="text-xs uppercase tracking-[0.26em] text-zinc-500">Desk notes</div>
              <div className="mt-4 space-y-3">
                {traderProfileNotes.map((note) => (
                  <div key={note} className="rounded-2xl border border-white/8 bg-black/20 p-4 text-sm leading-7 text-zinc-300">
                    {note}
                  </div>
                ))}
              </div>
            </div>
          </aside>

          <section className="p-6">
            {success && (
              <div className="mb-4 flex items-center gap-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
                <Check className="h-4 w-4" />
                {success}
              </div>
            )}

            {error && (
              <div className="mb-4 flex items-center gap-3 rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
                <AlertTriangle className="h-4 w-4" />
                {error}
              </div>
            )}

            {activeTab === "profile" && (
              <form onSubmit={handleUpdateProfile} className="space-y-5">
                <div className={`rounded-[1.6rem] border p-5 ${panelClass}`}>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="text-xs uppercase tracking-[0.26em] text-zinc-500">Identity</div>
                      <h3 className="mt-2 text-xl font-black text-white">Trader profile</h3>
                      <p className="mt-2 text-sm leading-7 text-zinc-400">
                        This name appears across the desk, journal entries, and exported review artifacts.
                      </p>
                    </div>
                    <div className="rounded-2xl bg-yellow-200/10 p-3">
                      <Target className="h-5 w-5 text-yellow-200" />
                    </div>
                  </div>

                  <div className="mt-6 grid gap-5 md:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-zinc-300">Display name</label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Your trading identity"
                        className={`w-full rounded-2xl border px-4 py-3 outline-none transition focus:ring-4 ${inputClass}`}
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-zinc-300">Email address</label>
                      <div className="relative">
                        <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                        <input
                          type="email"
                          value={email}
                          disabled
                          className={`w-full cursor-not-allowed rounded-2xl border px-4 py-3 pl-11 outline-none ${isDark ? "border-white/10 bg-black/20 text-zinc-500" : "border-slate-200 bg-slate-100 text-slate-400"}`}
                        />
                      </div>
                      <p className="mt-2 text-xs uppercase tracking-[0.2em] text-zinc-500">Managed by account auth</p>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center gap-2 rounded-2xl bg-[linear-gradient(135deg,#facc15,#f59e0b)] px-5 py-3 text-sm font-bold text-black transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                  Save profile
                </button>
              </form>
            )}

            {activeTab === "security" && (
              <form onSubmit={handleUpdatePassword} className="space-y-5">
                <div className={`rounded-[1.6rem] border p-5 ${panelClass}`}>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="text-xs uppercase tracking-[0.26em] text-zinc-500">Security</div>
                      <h3 className="mt-2 text-xl font-black text-white">Protect your review account</h3>
                      <p className="mt-2 text-sm leading-7 text-zinc-400">
                        Your journal often contains size, discipline notes, and account history. Treat it like sensitive trading data.
                      </p>
                    </div>
                    <div className="rounded-2xl bg-yellow-200/10 p-3">
                      <ShieldCheck className="h-5 w-5 text-yellow-200" />
                    </div>
                  </div>

                  <div className="mt-6 space-y-5">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-zinc-300">Current password</label>
                      <div className="relative">
                        <input
                          type={showCurrentPassword ? "text" : "password"}
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          placeholder="Enter current password"
                          className={`w-full rounded-2xl border px-4 py-3 pr-12 outline-none transition focus:ring-4 ${inputClass}`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowCurrentPassword((value) => !value)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-xl p-2 text-zinc-500 transition hover:bg-white/[0.04]"
                        >
                          {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="grid gap-5 md:grid-cols-2">
                      <div>
                        <label className="mb-2 block text-sm font-medium text-zinc-300">New password</label>
                        <div className="relative">
                          <input
                            type={showNewPassword ? "text" : "password"}
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="Minimum 6 characters"
                            className={`w-full rounded-2xl border px-4 py-3 pr-12 outline-none transition focus:ring-4 ${inputClass}`}
                          />
                          <button
                            type="button"
                            onClick={() => setShowNewPassword((value) => !value)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-xl p-2 text-zinc-500 transition hover:bg-white/[0.04]"
                          >
                            {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-medium text-zinc-300">Confirm password</label>
                        <input
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Repeat the new password"
                          className={`w-full rounded-2xl border px-4 py-3 outline-none transition focus:ring-4 ${inputClass}`}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className={`rounded-[1.6rem] border p-5 ${panelClass}`}>
                  <div className="text-xs uppercase tracking-[0.26em] text-zinc-500">Security reminder</div>
                  <div className="mt-4 space-y-3 text-sm leading-7 text-zinc-300">
                    <p>Do not reuse broker passwords on your journal account.</p>
                    <p>Use a password you would trust with your trade history, account size, and psychological notes.</p>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center gap-2 rounded-2xl bg-[linear-gradient(135deg,#facc15,#f59e0b)] px-5 py-3 text-sm font-bold text-black transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
                  Update password
                </button>
              </form>
            )}
          </section>
        </div>
      </motion.div>
    </motion.div>
  );
}
