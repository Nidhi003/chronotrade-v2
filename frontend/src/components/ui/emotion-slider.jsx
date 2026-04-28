import React, { useState } from "react";
import { Frown, Meh, Smile, Laugh, Zap } from "lucide-react";

const emotions = [
  { value: 1, icon: Frown, label: "Frustrated", color: "text-red-500", bg: "bg-red-500/20", border: "border-red-500/50" },
  { value: 2, icon: Meh, label: "Neutral", color: "text-yellow-500", bg: "bg-yellow-500/20", border: "border-yellow-500/50" },
  { value: 3, icon: Smile, label: "Calm", color: "text-green-500", bg: "bg-green-500/20", border: "border-green-500/50" },
  { value: 4, icon: Laugh, label: "Confident", color: "text-blue-500", bg: "bg-blue-500/20", border: "border-blue-500/50" },
  { value: 5, icon: Zap, label: "Euphoric", color: "text-purple-500", bg: "bg-purple-500/20", border: "border-purple-500/50" },
];

export default function EmotionSlider({ value, onChange, label }) {
  const [hovered, setHovered] = useState(null);

  return (
    <div className="space-y-4">
      {label && (
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-300">{label}</label>
          <span className="text-sm text-gray-400">
            {hovered ? emotions[hovered - 1].label : value ? emotions[value - 1].label : "Select emotion"}
          </span>
        </div>
      )}

      <div className="relative">
        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-red-500 via-green-500 to-purple-500 transition-all duration-300"
            style={{ width: `${((value || 0) / 5) * 100}%` }}
          />
        </div>

        <div className="flex justify-between mt-4">
          {emotions.map((emotion) => {
            const Icon = emotion.icon;
            const isActive = value === emotion.value;
            const isHovered = hovered === emotion.value;

            return (
              <button
                key={emotion.value}
                type="button"
                onMouseEnter={() => setHovered(emotion.value)}
                onMouseLeave={() => setHovered(null)}
                onClick={() => onChange?.(emotion.value)}
                className={`flex flex-col items-center gap-2 transition-all duration-200 ${
                  isActive || isHovered ? "scale-110" : "scale-100 opacity-50 hover:opacity-100"
                }`}
              >
                <div className={`p-2.5 rounded-full border-2 transition-colors ${
                  isActive || isHovered 
                    ? `${emotion.bg} ${emotion.color} ${emotion.border}` 
                    : "bg-white/5 text-gray-400 border-white/10"
                }`}>
                  <Icon className="h-5 w-5" />
                </div>
                <span className={`text-xs font-medium ${emotion.color}`}>{emotion.label}</span>
              </button>
            );
          })}
        </div>

        <input
          type="range"
          min="1"
          max="5"
          step="1"
          value={value || 0}
          onChange={(e) => onChange?.(parseInt(e.target.value))}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
      </div>
    </div>
  );
}
