"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Wind } from "lucide-react";
import { cn } from "@/lib/utils";

const patterns = [
  { name: "Box Breathing", inhale: 4, hold1: 4, exhale: 4, hold2: 4, description: "Square breathing for instant focus." },
  { name: "Relaxing 4-7-8", inhale: 4, hold1: 7, exhale: 8, hold2: 0, description: "Deeply calming for better sleep." },
  { name: "Equal Breath", inhale: 5, hold1: 0, exhale: 5, hold2: 0, description: "Balance and equilibrium." },
];

export const BreathingGuide = () => {
  const [selected, setSelected] = useState(patterns[0]);
  const [phase, setPhase] = useState<"Inhale" | "Hold" | "Exhale" | "Pause">("Inhale");
  const [count, setCount] = useState(selected.inhale);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    if (!isActive) return;

    const timer = setInterval(() => {
      setCount((prev) => {
        if (prev > 1) return prev - 1;

        // Transition logic
        if (phase === "Inhale") {
          if (selected.hold1 > 0) {
            setPhase("Hold");
            return selected.hold1;
          } else {
            setPhase("Exhale");
            return selected.exhale;
          }
        } else if (phase === "Hold") {
          setPhase("Exhale");
          return selected.exhale;
        } else if (phase === "Exhale") {
          if (selected.hold2 > 0) {
            setPhase("Pause");
            return selected.hold2;
          } else {
            setPhase("Inhale");
            return selected.inhale;
          }
        } else {
          setPhase("Inhale");
          return selected.inhale;
        }
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isActive, phase, selected]);

  return (
    <div className="glass p-12 rounded-[4rem] border border-white/5 space-y-12">
      <div className="flex flex-col md:flex-row justify-between items-start gap-8">
        <div className="space-y-2">
          <h3 className="text-xl font-bold text-cream">Breathing Rhythms</h3>
          <p className="text-xs text-sage tracking-widest uppercase">Synchronize your soul</p>
        </div>

        <div className="flex flex-wrap gap-3">
          {patterns.map((p) => (
            <button
              key={p.name}
              onClick={() => { setSelected(p); setIsActive(false); setPhase("Inhale"); setCount(p.inhale); }}
              className={cn(
                "px-5 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all",
                selected.name === p.name ? "bg-sage text-charcoal" : "bg-white/5 text-cream/30 hover:bg-white/10"
              )}
            >
              {p.name}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col items-center space-y-10">
        <div className="relative flex items-center justify-center">
          {/* Breathing Circle */}
          <motion.div
            animate={{
              scale: phase === "Inhale" ? 1.5 : phase === "Exhale" ? 1 : phase === "Hold" ? 1.5 : 1,
              opacity: isActive ? 1 : 0.2
            }}
            transition={{ 
              duration: phase === "Hold" || phase === "Pause" ? 0 : (phase === "Inhale" ? selected.inhale : selected.exhale),
              ease: "easeInOut"
            }}
            className="w-48 h-48 rounded-full bg-gradient-to-tr from-sage/20 to-gold/20 border border-white/10 blur-xl"
          />
          
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={phase}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-1"
              >
                <span className="text-4xl font-black text-cream tracking-tighter tabular-nums">{count}</span>
                <p className="text-[10px] uppercase tracking-[0.3em] text-sage font-bold">{phase}</p>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        <div className="max-w-xs text-center space-y-6">
          <p className="text-xs text-cream/40 leading-relaxed italic">
            {selected.description}
          </p>
          
          <button
            onClick={() => setIsActive(!isActive)}
            className={cn(
              "px-10 py-3 rounded-full font-bold uppercase tracking-widest text-[10px] transition-all",
              isActive ? "bg-gold/10 text-gold border border-gold/20" : "bg-sage/20 text-sage border border-sage/20"
            )}
          >
            {isActive ? "Pause Rhythm" : "Start Breathing"}
          </button>
        </div>
      </div>
    </div>
  );
};
