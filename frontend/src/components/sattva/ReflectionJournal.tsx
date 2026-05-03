"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Typewriter } from "@/components/ui/typewriter";
import { VapourText } from "@/components/ui/vapour-text-effect";
import { Feather, Send } from "lucide-react";

export const ReflectionJournal = () => {
  const [text, setText] = useState("");
  const [isReleasing, setIsReleasing] = useState(false);
  const [releasedText, setReleasedText] = useState("");

  const handleRelease = async () => {
    const finalContent = text.trim() || "Emptying the mind...";
    
    // Save to backend
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL && process.env.NEXT_PUBLIC_API_URL !== '' ? process.env.NEXT_PUBLIC_API_URL : 'https://sattva-backend-910457570224.us-central1.run.app';
      await fetch(`${apiUrl}/api/journal`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: finalContent, emotion: 'neutral' })
      });
    } catch (err) {
      console.error("Failed to save journal:", err);
    }

    setReleasedText(finalContent);
    setIsReleasing(true);
    setText("");
    
    // Reset after effect
    setTimeout(() => {
      setIsReleasing(false);
      setReleasedText("");
    }, 12000);
  };

  const affirmations = [
    "You can do it",
    "You will achieve everything",
    "Peace begins within"
  ];

  return (
    <div className="w-full max-w-2xl mx-auto space-y-8 py-12">
      <div className="text-center space-y-2">
        <Typewriter 
          phrases={affirmations} 
          className="text-2xl font-light text-sage italic"
        />
      </div>

      <div className="relative">
        <AnimatePresence mode="wait">
          {!isReleasing ? (
            <motion.div
              key="input"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              <div className="relative">
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Your space to rant everything and release them in the void... write it all down and let it go."
                  className="w-full h-64 glass p-8 rounded-3xl resize-none focus:outline-none focus:ring-1 focus:ring-sage/30 text-cream/80 placeholder:text-cream/20 leading-relaxed transition-all"
                />
                <div className="absolute top-6 left-6 text-sage/20">
                  <Feather size={24} />
                </div>
              </div>

              <div className="flex justify-center">
                <button
                  onClick={handleRelease}
                  className="group flex items-center space-x-3 px-10 py-4 rounded-full bg-sage/10 border border-sage/20 text-sage hover:bg-sage/20 transition-all"
                >
                  <span className="font-medium tracking-widest uppercase text-xs">Release to the Void</span>
                  <Send size={14} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="vapour"
              className="h-64 flex items-center justify-center text-center p-8"
            >
              <VapourText 
                text={releasedText} 
                duration={5}
                font={{
                  fontFamily: "var(--font-outfit), sans-serif",
                  fontSize: "48px",
                  fontWeight: 300
                }}
                color="rgba(245, 245, 220, 0.4)"
                className="w-full h-full flex items-center justify-center"
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
