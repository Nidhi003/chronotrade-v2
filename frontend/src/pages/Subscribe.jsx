import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Check, CreditCard, Crown, Rocket, Shield, Zap } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useSubscription } from "@/context/SubscriptionContext";

const PLANS = [
  {
    id: "free",
    name: "Free",
    monthlyPrice: 0,
    yearlyPrice: 0,
    icon: Zap,
    description: "Perfect for beginners starting their journaling journey.",
    features: [
      "Up to 20 trades/month",
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
      "Advanced analytics",
    ],
    popular: true,
    razorpayKey: "rzp_live_YOUR_PRO_MONTHLY_KEY", // Replace with real Razorpay plan ID
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
      "AI insights & session analysis",
    ],
    popular: false,
    razorpayKey: "rzp_live_YOUR_ELITE_MONTHLY_KEY", // Replace with real Razorpay plan ID
  },
];

export default function Subscribe() {
  const { user } = useAuth();
  const { subscribe, tier } = useSubscription();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [billing, setBilling] = useState("monthly");

  const handleSubscribe = async (planId) => {
    if (planId === "free") {
      await subscribe("free");
      navigate("/dashboard");
      return;
    }

    const plan = PLANS.find(p => p.id === planId);
    if (!plan) return;

    const SUBSCRIPTION_LINKS = {
      "pro-monthly": "https://rzp.io/rzp/q5ZORjE",
      "elite-monthly": "https://rzp.io/rzp/tPkGexc",
      "pro-yearly": "https://rzp.io/rzp/JI8G17wV",
      "elite-yearly": "https://rzp.io/rzp/Gu6BimP5",
    };

    if (planId !== "free") {
      const linkKey = `${planId}-${billing}`;
      const link = SUBSCRIPTION_LINKS[linkKey];
      if (link) {
        await subscribe(planId);
        window.open(link, "_blank");
        navigate("/dashboard");
        return;
      }
    }

    setLoading(true);
    
    try {
      const amountInDollars = billing === "yearly" ? plan.yearlyPrice : plan.monthlyPrice;
      const amountInCents = Math.round(amountInDollars * 100);

      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      
      const orderResponse = await fetch(`${API_URL}/api/create-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: amountInCents, currency: 'USD' }),
      });

      if (!orderResponse.ok) {
        const error = await orderResponse.json();
        throw new Error(error.error || 'Failed to create order');
      }

      const { order_id } = await orderResponse.json();

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_test_SkbD1c5YkSnmcG",
        amount: amountInCents,
        currency: "USD",
        name: "ChronoTradez",
        description: `${plan.name} Plan - ${billing}`,
        image: "/favicon.svg",
        order_id,
        handler: async function (response) {
          try {
            const verifyResponse = await fetch(`${API_URL}/api/verify-payment`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });

            const verifyResult = await verifyResponse.json();

            if (!verifyResponse.ok || !verifyResult.success) {
              throw new Error(verifyResult.error || 'Payment verification failed');
            }

            await subscribe(planId);
            navigate("/dashboard");
          } catch (err) {
            console.error("Payment verification error:", err);
            alert("Payment verification failed: " + err.message);
          }
        },
        prefill: {
          email: user?.email || "",
        },
        notes: {
          plan: planId,
          billing: billing,
        },
        theme: {
          color: "#facc15",
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', (response) => {
        console.error("Payment failed:", response.error);
        alert("Payment failed: " + response.error.description);
      });
      rzp.open();
    } catch (e) {
      console.error("Payment error:", e);
      alert("Payment error: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#040404] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(250,204,21,0.16),transparent_24%),radial-gradient(circle_at_bottom_right,rgba(217,119,6,0.12),transparent_24%),linear-gradient(180deg,#040404_0%,#090909_100%)]" />
      
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
          <h1 className="text-5xl font-black tracking-[-0.06em] text-white md:text-6xl">
            Choose your trading journal tier
          </h1>
          <p className="mx-auto mt-5 max-w-3xl text-lg leading-8 text-zinc-400">
            Unlock advanced analytics, AI insights, and professional trading tools
          </p>

          <div className="mt-8 flex items-center justify-center gap-4">
            <button
              onClick={() => setBilling("monthly")}
              className={`rounded-full px-6 py-2 text-sm font-bold uppercase tracking-[0.15em] transition ${
                billing === "monthly"
                  ? "bg-yellow-200 text-black"
                  : "text-zinc-500 hover:text-white"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBilling("yearly")}
              className={`relative rounded-full px-6 py-2 text-sm font-bold uppercase tracking-[0.15em] transition ${
                billing === "yearly"
                  ? "bg-yellow-200 text-black"
                  : "text-zinc-500 hover:text-white"
              }`}
            >
              Yearly
              {billing === "yearly" && (
                <span className="ml-2 text-xs font-normal text-green-600">Save ~30%</span>
              )}
            </button>
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
                    ${billing === "yearly" ? plan.yearlyPrice : plan.monthlyPrice}
                    <span className="ml-2 text-base font-medium text-zinc-500">/{billing}</span>
                  </div>
                </div>
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-yellow-200/12 bg-yellow-200/[0.06]">
                  <plan.icon className="h-6 w-6 text-yellow-200" />
                </div>
              </div>

              <p className="mt-5 text-base leading-8 text-zinc-400">{plan.description}</p>

              <div className="mt-8 space-y-3">
                {plan.features.map((feature) => (
                  <div key={feature} className="flex items-start gap-3 text-sm text-zinc-300">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-yellow-300" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => handleSubscribe(plan.id)}
                disabled={loading || tier === plan.id}
                className={`mt-8 inline-flex w-full items-center justify-center gap-2 rounded-full px-6 py-4 text-sm font-bold uppercase tracking-[0.24em] transition ${
                  plan.popular
                    ? "bg-yellow-200 text-black hover:bg-yellow-100"
                    : "border border-yellow-200/18 bg-black/35 text-yellow-100 hover:bg-black/50"
                } disabled:opacity-60`}
              >
                {plan.monthlyPrice === 0 ? (
                  <>
                    <Zap className="h-4 w-4" />
                    {tier === "free" ? "Current Plan" : "Get Started Free"}
                  </>
                ) : (
                  <>
                    <CreditCard className="h-4 w-4" />
                    {tier === plan.id ? "Current Plan" : `Subscribe ${billing}`}
                  </>
                )}
              </button>
            </motion.div>
          ))}
        </div>

        <div className="mt-12 flex flex-wrap items-center justify-center gap-8 text-sm text-zinc-500">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-yellow-200" />
            <span>Secure Razorpay payment</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="h-5 w-5 text-yellow-200" />
            <span>Cancel anytime</span>
          </div>
        </div>
      </div>
    </div>
  );
}
