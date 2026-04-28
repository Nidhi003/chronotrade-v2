"use client";
import { createContext, useContext, useState, useEffect } from "react";

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
      "Local storage",
    ],
    limits: { trades: 10, strategies: 1 }
  },
  pro: {
    id: "pro",
    name: "Pro",
    price: 14,
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
    price: 29,
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
    // Load subscription from localStorage
    let savedTier = localStorage.getItem("chronotrade_tier");
    if (!savedTier) {
      savedTier = "free";
      localStorage.setItem("chronotrade_tier", "free");
    }
    const savedSub = localStorage.getItem("chronotrade_subscription");
    
    setTier(savedTier);
    if (savedSub) {
      setSubscription(JSON.parse(savedSub));
    }
    setLoading(false);
  }, []);

  const subscribe = async (tierId) => {
    const tierInfo = TIERS[tierId];
    if (!tierInfo || tierInfo.price === 0) {
      // Free tier
      setTier(tierId);
      setSubscription(null);
      localStorage.setItem("chronotrade_tier", tierId);
      localStorage.removeItem("chronotrade_subscription");
      return { success: true, tier: tierId };
    }

    // For paid tiers, integrate with payment provider
    try {
      // In production, this would call your backend to create a checkout session
      // For now, simulate a successful payment
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

  const cancelSubscription = async () => {
    setTier("free");
    setSubscription(null);
    localStorage.setItem("chronotrade_tier", "free");
    localStorage.removeItem("chronotrade_subscription");
    return { success: true };
  };

  const getTierInfo = () => TIERS[tier] || TIERS.free;

  // Feature to tier mapping - Only realtime working features
  const FEATURE_TIERS = {
    // Free features (everyone can access)
    free: ['journal', 'dashboard'],
    
    // Pro features ($14/mo)
    pro: [
      'calendar', 'analytics', 'pdfReports'
    ],
    
    // Elite features ($29/mo)
    elite: [
      'multiAccount', 'psychology'
    ]
  };

  const canAccess = (feature) => {
    const featureLower = feature.toLowerCase();
    
    // Free tier features
    if (FEATURE_TIERS.free.some(f => featureLower.includes(f))) {
      return true;
    }
    
    // Elite features require elite tier
    if (FEATURE_TIERS.elite.some(f => featureLower.includes(f))) {
      return tier === "elite";
    }
    
    // Pro features require pro or elite
    if (FEATURE_TIERS.pro.some(f => featureLower.includes(f))) {
      return tier === "pro" || tier === "elite";
    }
    
    // Default: check tier level
    if (tier === "elite") return true;
    if (tier === "pro") {
      return !FEATURE_TIERS.elite.some(f => featureLower.includes(f));
    }
    return false;
  };

  return (
    <SubscriptionContext.Provider value={{
      tier,
      subscription,
      loading,
      subscribe,
      cancelSubscription,
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
