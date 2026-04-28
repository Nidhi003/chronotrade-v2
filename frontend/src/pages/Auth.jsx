import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, Crown, ShieldCheck, Sparkles } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const sellingPoints = [
  "Log trades, notes, and setup context in one place.",
  "Track psychology before and after every session.",
  "Use review data to correct leaks and strengthen your edge.",
];

const trustSignals = ["Encrypted auth", "Supabase session handling", "Cloud-ready journaling"];
const authBenefits = [
  "Dashboard and analytics",
  "Rich trade journal",
  "Psychology and AI review",
];

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await register(email, password);
        if (name.trim()) {
          localStorage.setItem("chronotrade_user_name", name.trim());
        }
        setIsLogin(true);
        setError("Check your email to verify your account, then sign in.");
        setLoading(false);
        return;
      }

      if (name.trim()) {
        localStorage.setItem("chronotrade_user_name", name.trim());
      }
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#040404] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(250,204,21,0.14),transparent_24%),radial-gradient(circle_at_bottom_right,rgba(217,119,6,0.12),transparent_24%),linear-gradient(180deg,#040404_0%,#090909_100%)]" />
      <div className="absolute inset-0 opacity-40 [background-image:linear-gradient(to_right,rgba(250,204,21,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(250,204,21,0.04)_1px,transparent_1px)] [background-size:88px_88px]" />

      <div className="relative z-10 mx-auto flex min-h-screen max-w-7xl items-center px-6 py-10">
        <div className="grid w-full gap-10 lg:grid-cols-[1.02fr_0.98fr]">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col justify-between rounded-[2.4rem] border border-yellow-200/10 bg-white/[0.03] p-8 md:p-10"
          >
            <div>
              <button
                onClick={() => navigate("/")}
                className="inline-flex items-center gap-2 rounded-full border border-yellow-200/12 bg-black/30 px-4 py-2 text-xs uppercase tracking-[0.28em] text-yellow-100/80 transition hover:bg-black/45"
              >
                <ArrowLeft className="h-4 w-4" />
                Back home
              </button>

              <div className="mt-10 inline-flex items-center gap-2 rounded-full border border-yellow-200/14 bg-yellow-200/[0.06] px-4 py-2 text-xs uppercase tracking-[0.32em] text-yellow-100/80">
                <ShieldCheck className="h-4 w-4" />
                Trading journal access
              </div>

              <h1 className="mt-8 max-w-xl text-5xl font-black tracking-[-0.06em] text-white md:text-6xl">
                Enter your trading journal.
              </h1>
              <p className="mt-6 max-w-xl text-lg leading-8 text-zinc-400">
                Sign in to access your dashboard, trade history, journal entries, and performance review workflow.
              </p>

              <div className="mt-10 space-y-4">
                {sellingPoints.map((point) => (
                  <div
                    key={point}
                    className="flex items-start gap-4 rounded-[1.5rem] border border-white/8 bg-black/30 p-4"
                  >
                    <div className="mt-1 flex h-8 w-8 items-center justify-center rounded-full bg-yellow-300 text-black">
                      <Check className="h-4 w-4" />
                    </div>
                    <p className="text-base leading-7 text-zinc-300">{point}</p>
                  </div>
                ))}
              </div>
            </div>

              <div className="mt-10 rounded-[1.8rem] border border-yellow-200/10 bg-gradient-to-br from-yellow-300/[0.08] via-white/[0.03] to-transparent p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full border border-yellow-200/15 bg-black/25">
                  <Crown className="h-5 w-5 text-yellow-200" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-white">What you unlock</div>
                  <div className="text-sm text-zinc-500">Trades, journaling, analytics, and review in one account.</div>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-2">
                {trustSignals.map((signal) => (
                  <div
                    key={signal}
                    className="rounded-full border border-white/8 bg-black/25 px-3 py-2 text-[11px] uppercase tracking-[0.24em] text-zinc-300"
                  >
                    {signal}
                  </div>
                ))}
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                {authBenefits.map((item) => (
                  <div key={item} className="rounded-2xl border border-white/8 bg-black/25 p-4">
                    <div className="text-[10px] uppercase tracking-[0.24em] text-zinc-500">Access</div>
                    <div className="mt-2 text-sm font-semibold text-white">{item}</div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
            className="flex items-center"
          >
            <div className="w-full rounded-[2.4rem] border border-yellow-200/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))] p-8 shadow-[0_24px_120px_rgba(0,0,0,0.34)] backdrop-blur-2xl md:p-10">
              <div className="mb-8">
                <div className="inline-flex items-center gap-2 rounded-full border border-yellow-200/12 bg-yellow-200/[0.05] px-4 py-2 text-xs uppercase tracking-[0.32em] text-yellow-100/80">
                  <Sparkles className="h-4 w-4" />
                  {isLogin ? "Sign in" : "Create account"}
                </div>
                <h2 className="mt-6 text-3xl font-black tracking-[-0.04em] text-white">
                  {isLogin ? "Welcome back." : "Start your ChronoTradez workspace."}
                </h2>
                <p className="mt-3 text-base leading-7 text-zinc-400">
                  {isLogin
                    ? "Access your dashboard, journal, AI review, and trade analytics."
                    : "Create your account and start building your trading journal."}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {!isLogin && (
                  <div>
                    <label className="mb-2 block text-xs font-bold uppercase tracking-[0.28em] text-zinc-500">
                      Full name
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full rounded-2xl border border-white/10 bg-black/35 px-4 py-3 text-white outline-none transition focus:border-yellow-300/35"
                      placeholder="Your name"
                    />
                  </div>
                )}

                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-[0.28em] text-zinc-500">
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-black/35 px-4 py-3 text-white outline-none transition focus:border-yellow-300/35"
                    placeholder="trader@example.com"
                    required
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-[0.28em] text-zinc-500">
                    Password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-black/35 px-4 py-3 text-white outline-none transition focus:border-yellow-300/35"
                    placeholder="Enter your password"
                    required
                    minLength={6}
                  />
                </div>

                {error && (
                  <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 p-4 text-sm text-rose-300">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-yellow-200 via-yellow-300 to-amber-400 px-6 py-4 text-sm font-bold uppercase tracking-[0.24em] text-black transition hover:brightness-105 disabled:opacity-60"
                >
                  {loading ? "Processing..." : isLogin ? "Enter Platform" : "Create Account"}
                  {!loading && <ArrowRight className="h-4 w-4" />}
                </button>
              </form>

              <div className="mt-6 text-center text-sm text-zinc-400">
                <button onClick={() => setIsLogin(!isLogin)} className="transition hover:text-white">
                  {isLogin ? "Need an account? " : "Already have an account? "}
                  <span className="font-semibold text-yellow-100">
                    {isLogin ? "Create one" : "Sign in"}
                  </span>
                </button>
              </div>

              <div className="mt-6 text-center text-xs uppercase tracking-[0.28em] text-zinc-600">
                Built for traders who want evidence, not guesswork
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
