'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Plus } from 'lucide-react';

interface TagSelectorProps {
  tags: string[];
  onChange: (tags: string[]) => void;
  maxTags?: number;
}

const PRESET_TAGS = [
  'Breakout', 'Reversal', 'Support/Resistance', 'Momentum', 'News Trading',
  'Channel', 'Pullback', 'Consolidation', 'Volatility Spike', 'Pattern',
];

export function TagSelector({ tags, onChange, maxTags = 5 }: TagSelectorProps) {
  const [inputValue, setInputValue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  const addTag = (tag: string) => {
    const trimmed = tag.trim();
    if (trimmed && !tags.includes(trimmed) && tags.length < maxTags) {
      onChange([...tags, trimmed]);
      setInputValue('');
      setShowSuggestions(false);
    }
  };

  const removeTag = (index: number) => {
    onChange(tags.filter((_, i) => i !== index));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag(inputValue);
    }
  };

  const suggestions = PRESET_TAGS.filter(
    (tag) => !tags.includes(tag) && tag.toLowerCase().includes(inputValue.toLowerCase())
  );

  return (
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-foreground">Tags (Max {maxTags})</label>
      
      {/* Selected Tags */}
      <div className="flex flex-wrap gap-2 p-3 bg-input border border-border rounded-lg min-h-10">
        {tags.map((tag, index) => (
          <motion.div
            key={index}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="flex items-center gap-2 bg-primary/20 px-3 py-1 rounded-full text-primary text-sm font-medium"
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(index)}
              className="hover:bg-primary/30 p-0.5 rounded transition-colors"
            >
              <X size={14} />
            </button>
          </motion.div>
        ))}
        
        {tags.length < maxTags && (
          <div className="relative flex-grow">
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
              placeholder="Add tag..."
              className="w-full bg-transparent text-foreground placeholder-muted-foreground outline-none text-sm"
            />
            
            {/* Suggestions Dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-lg shadow-lg z-10"
              >
                {suggestions.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => addTag(suggestion)}
                    className="w-full text-left px-3 py-2 hover:bg-primary/10 transition-colors text-sm text-foreground"
                  >
                    <Plus size={14} className="inline mr-2" />
                    {suggestion}
                  </button>
                ))}
              </motion.div>
            )}
          </div>
        )}
      </div>
      
      <p className="text-xs text-muted-foreground">{tags.length} / {maxTags} tags selected</p>
    </div>
  );
}
