"use client";

import { motion } from "framer-motion";
import { useApp } from "@/context/app-context";
import { Zap, Shield } from "lucide-react";

export const GlobalHeader = () => {
  const { state } = useApp();
  const { level, experience } = state.stats;
  const progress = (experience % 100);

  return (
    <div className="fixed top-0 left-0 w-full z-[100] px-6 py-4 pointer-events-none">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        {/* Logo / Title Area */}
        <div className="pointer-events-auto">
          <h2 className="text-xl font-black text-cream tracking-tighter">Sattva</h2>
        </div>

        {/* Stats Pills */}
        <div className="flex items-center gap-3 pointer-events-auto">
          <div className="glass px-4 py-2 rounded-full flex items-center gap-3 border border-white/5">
            <div className="w-6 h-6 rounded-lg bg-gold/10 flex items-center justify-center text-gold">
              <Shield size={14} />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-cream leading-none">Level {level}</span>
              <div className="w-16 h-1 bg-white/5 rounded-full mt-1 overflow-hidden">
                <motion.div 
                  className="h-full bg-gold"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>

          <div className="glass px-4 py-2 rounded-full flex items-center gap-3 border border-white/5">
            <div className="w-6 h-6 rounded-lg bg-sage/10 flex items-center justify-center text-sage">
              <Zap size={14} fill="currentColor" />
            </div>
            <span className="text-[10px] font-black text-cream leading-none">{state.streak.count} Day Streak</span>
          </div>
        </div>
      </div>
    </div>
  );
};
