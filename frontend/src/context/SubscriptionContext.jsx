"use client";
import { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

const SubscriptionContext = createContext({
  tier: "free",
  subscription: null,
  loading: true,
  subscribe: () => {},
  cancelSubscription: () => {}
});

const TIERS = {
  free: {
    id: "free",
    name: "Free",
    price: 0,
    priceId: null,
    features: [
      "Basic trade journaling",
      "Manual trade entry",
      "Basic dashboard",
    ],
    limits: { trades: 10, strategies: 1 }
  },
  pro: {
    id: "pro",
    name: "Pro",
    price: 1500,
    priceId: "pro_monthly",
    features: [
      "Unlimited trades",
      "Trade calendar with daily P&L",
      "PDF reports and exports",
    ],
    limits: { trades: -1, strategies: -1 }
  },
  elite: {
    id: "elite",
    name: "Elite",
    price: 3000,
    priceId: "elite_monthly",
    features: [
      "Everything in Pro",
      "Multi-account management",
      "Psychology tracking",
    ],
    limits: { trades: -1, strategies: -1 }
  }
};

export function SubscriptionProvider({ children }) {
  const [tier, setTier] = useState("free");
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTier = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const { data: { user } } = await supabase.auth.getUser(session.access_token);
          const serverTier = user?.user_metadata?.subscription_tier || "free";
          setTier(serverTier);
          localStorage.setItem("chronotrade_tier", serverTier);
        } else {
          setTier("free");
          localStorage.removeItem("chronotrade_tier");
        }
      } catch {
        setTier("free");
      } finally {
        setLoading(false);
      }
    };

    fetchTier();

    const { data: { subscription: authSub } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN") {
        fetchTier();
      } else if (event === "SIGNED_OUT") {
        setTier("free");
        setSubscription(null);
        localStorage.removeItem("chronotrade_tier");
        localStorage.removeItem("chronotrade_subscription");
        setLoading(false);
      }
    });

    return () => authSub.unsubscribe();
  }, []);

  const subscribe = async (tierId) => {
    const tierInfo = TIERS[tierId];
    if (!tierInfo || tierInfo.price === 0) {
      setTier(tierId);
      setSubscription(null);
      localStorage.setItem("chronotrade_tier", tierId);
      localStorage.removeItem("chronotrade_subscription");
      return { success: true, tier: tierId };
    }

    try {
      const mockSubscription = {
        tier: tierId,
        plan: tierInfo.name,
        price: tierInfo.price,
        startDate: new Date().toISOString(),
        nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        status: "active",
        paymentId: "pay_" + Date.now()
      };

      setTier(tierId);
      setSubscription(mockSubscription);
      localStorage.setItem("chronotrade_tier", tierId);
      localStorage.setItem("chronotrade_subscription", JSON.stringify(mockSubscription));

      return { success: true, subscription: mockSubscription };
    } catch (error) {
      console.error("Subscription error:", error);
      return { success: false, error: error.message };
    }
  };

  const refreshTier = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { data: { user } } = await supabase.auth.getUser(session.access_token);
        const serverTier = user?.user_metadata?.subscription_tier || "free";
        setTier(serverTier);
        localStorage.setItem("chronotrade_tier", serverTier);
      }
    } catch (err) {
      console.error("Failed to refresh tier:", err);
    }
  };

  const cancelSubscription = async () => {
    setTier("free");
    setSubscription(null);
    localStorage.setItem("chronotrade_tier", "free");
    localStorage.removeItem("chronotrade_subscription");
    return { success: true };
  };

  const getTierInfo = () => TIERS[tier] || TIERS.free;

  const canAccess = (feature) => {
    const eliteFeatures = ['psychology', 'multiaccount'];

    if (tier === 'elite') return true;
    if (tier === 'pro') return !eliteFeatures.includes(feature);
    return false;
  };

  return (
    <SubscriptionContext.Provider value={{
      tier,
      subscription,
      loading,
      subscribe,
      cancelSubscription,
      refreshTier,
      getTierInfo,
      canAccess,
      TIERS
    }}>
      {children}
    </SubscriptionContext.Provider>
  );
}

export const useSubscription = () => useContext(SubscriptionContext);
export { TIERS };
