import React, { useState, useEffect, useRef } from 'react';
import { Brain, Eye, TrendingUp, Shield, Award, Zap } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';

const featuresData = [
  {
    id: 1,
    title: 'AI Coach',
    icon: Brain,
    status: 'completed',
    energy: 100,
    content: 'Real-time behavioral analysis detects your emotional leaks and provides actionable fixes.',
  },
  {
    id: 2,
    title: 'Visual Playback',
    icon: Eye,
    status: 'completed',
    energy: 95,
    content: 'See exact chart screenshots at entry/exit. Review your decisions with perfect hindsight.',
  },
  {
    id: 3,
    title: 'Market Regime',
    icon: TrendingUp,
    status: 'in-progress',
    energy: 80,
    content: 'Auto-tags trades with market conditions. Know if you fail in trends or ranges.',
  },
  {
    id: 4,
    title: 'Compliance Guard',
    icon: Shield,
    status: 'in-progress',
    energy: 70,
    content: 'Real-time prop-firm rule tracking. Never breach daily loss or drawdown limits.',
  },
  {
    id: 5,
    title: 'Verified Leaderboard',
    icon: Award,
    status: 'pending',
    energy: 50,
    content: 'Compete with real traders. API-verified P&L prevents fake results.',
  },
  {
    id: 6,
    title: 'Shadow Simulator',
    icon: Zap,
    status: 'pending',
    energy: 40,
    content: 'What-if analysis: See what would happen if you held longer or cut losses sooner.',
  },
];

export default function Features() {
  const [expandedItems, setExpandedItems] = useState({});
  const [rotationAngle, setRotationAngle] = useState(0);
  const [autoRotate, setAutoRotate] = useState(true);
  const containerRef = useRef(null);

  const toggleItem = (id) => {
    setExpandedItems((prev) => ({
      ...Object.keys(prev).reduce((acc, key) => ({ ...acc, [key]: false }), {}),
      [id]: !prev[id],
    }));
    setAutoRotate(!expandedItems[id]);
  };

  useEffect(() => {
    let timer;
    if (autoRotate) {
      timer = setInterval(() => {
        setRotationAngle((prev) => (prev + 0.2) % 360);
      }, 50);
    }
    return () => clearInterval(timer);
  }, [autoRotate]);

  const calculatePosition = (index, total) => {
    const angle = ((index / total) * 360 + rotationAngle) * (Math.PI / 180);
    const radius = 220;
    return {
      x: radius * Math.cos(angle),
      y: radius * Math.sin(angle),
      opacity: 0.4 + 0.6 * ((1 + Math.sin(angle)) / 2),
    };
  };

  return (
    <section id="features" className="relative min-h-screen w-full bg-black overflow-hidden py-20">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/20 blur-[120px] rounded-full" />

      <div className="relative z-10 container mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            The Secret Weapons
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Six powerful features that turn your trading mistakes into a predictable edge.
          </p>
        </motion.div>

        {/* Orbital Timeline */}
        <div
          ref={containerRef}
          className="relative w-full max-w-4xl mx-auto h-[600px] flex items-center justify-center"
          onClick={() => {
            setExpandedItems({});
            setAutoRotate(true);
          }}
        >
          {/* Center Core */}
          <div className="absolute w-20 h-20 rounded-full bg-gradient-to-br from-blue-600 via-blue-500 to-cyan-500 animate-pulse flex items-center justify-center z-20">
            <div className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm" />
          </div>

          {/* Orbit Ring */}
          <div className="absolute w-[440px] h-[440px] rounded-full border border-white/10" />

          {/* Feature Nodes */}
          {featuresData.map((feature, index) => {
            const pos = calculatePosition(index, featuresData.length);
            const isExpanded = expandedItems[feature.id];
            const Icon = feature.icon;

            return (
              <motion.div
                key={feature.id}
                className="absolute cursor-pointer transition-all duration-500"
                style={{
                  transform: `translate(${pos.x}px, ${pos.y}px)`,
                  zIndex: isExpanded ? 50 : 10,
                  opacity: isExpanded ? 1 : pos.opacity,
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleItem(feature.id);
                }}
              >
                {/* Node Circle */}
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                    isExpanded
                      ? 'bg-white text-black border-white scale-125 shadow-lg shadow-white/30'
                      : 'bg-black/80 text-white border-white/40 hover:border-white/80'
                  }`}
                >
                  <Icon size={20} />
                </div>

                {/* Label */}
                <div
                  className={`absolute top-14 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs font-semibold transition-all duration-300 ${
                    isExpanded ? 'text-white scale-110' : 'text-white/70'
                  }`}
                >
                  {feature.title}
                </div>

                {/* Expanded Card */}
                {isExpanded && (
                  <Card className="absolute top-16 left-1/2 -translate-x-1/2 w-72 bg-black/95 backdrop-blur-lg border-white/20 shadow-2xl z-50">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-center">
                        <Badge variant="default">
                          {feature.status === 'completed' ? 'LIVE' : feature.status === 'in-progress' ? 'BETA' : 'SOON'}
                        </Badge>
                        <span className="text-xs font-mono text-white/50">{feature.energy}%</span>
                      </div>
                      <CardTitle className="text-white text-lg mt-2">{feature.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-gray-300">
                      <p>{feature.content}</p>
                      <div className="mt-4 pt-3 border-t border-white/10">
                        <div className="flex justify-between items-center text-xs mb-2">
                          <span>Development</span>
                          <span className="font-mono">{feature.energy}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-blue-500 to-cyan-500"
                            style={{ width: `${feature.energy}%` }}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Instructions */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-center text-gray-500 text-sm mt-12"
        >
          Click on any node to explore • Click background to rotate
        </motion.p>
      </div>
    </section>
  );
}
