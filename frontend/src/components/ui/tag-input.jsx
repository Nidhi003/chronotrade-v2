import React, { useState } from "react";
import { X, Plus } from "lucide-react";

export default function TagInput({ value, onChange, placeholder, suggestions }) {
  const [inputValue, setInputValue] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);

  const tags = value || [];

  const addTag = (tag) => {
    const trimmed = tag.trim();
    if (trimmed && !tags.includes(trimmed)) {
      onChange?.([...tags, trimmed]);
      setInputValue("");
      setShowSuggestions(false);
    }
  };

  const removeTag = (tagToRemove) => {
    onChange?.(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(inputValue);
    } else if (e.key === "Backspace" && !inputValue && tags.length > 0) {
      removeTag(tags[tags.length - 1]);
    }
  };

  const filteredSuggestions = suggestions
    ? suggestions.filter((s) => s.toLowerCase().includes(inputValue.toLowerCase()) && !tags.includes(s))
    : [];

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2 p-3 rounded-lg border border-white/10 bg-[#0f141f]">
        {tags.map((tag) => (
          <span key={tag} className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-600/20 text-blue-400 text-xs border border-blue-500/30">
            {tag}
            <button type="button" onClick={() => removeTag(tag)} className="hover:text-white transition-colors">
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
        <input
          type="text"
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            setShowSuggestions(true);
          }}
          onKeyDown={handleKeyDown}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          placeholder={tags.length === 0 ? placeholder : ""}
          className="flex-1 min-w-[120px] bg-transparent outline-none text-sm text-white placeholder:text-gray-500"
        />
      </div>

      {showSuggestions && filteredSuggestions.length > 0 && (
        <div className="relative">
          <div className="absolute top-0 left-0 right-0 z-10 mt-1 py-2 bg-[#1a1f2e] border border-white/10 rounded-lg shadow-lg max-h-48 overflow-y-auto">
            {filteredSuggestions.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => addTag(suggestion)}
                className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-blue-600/20 hover:text-blue-400 transition-colors flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
