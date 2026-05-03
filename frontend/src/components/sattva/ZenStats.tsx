"use client";

import { motion } from "framer-motion";
import { useApp } from "@/context/app-context";
import { Zap, Clock, ShieldCheck } from "lucide-react";

export const ZenStats = () => {
  const { state } = useApp();
  const { level, experience, totalMinutes } = state.stats;
  
  // Progress to next level
  const expInCurrentLevel = experience % 100;
  const progress = (expInCurrentLevel / 100) * 100;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Level Card */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass p-8 rounded-[2.5rem] relative overflow-hidden"
      >
        <div className="relative z-10 flex flex-col justify-between h-full space-y-6">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-[10px] uppercase tracking-[0.3em] text-sage font-bold">Current State</span>
              <h3 className="text-2xl font-black text-cream tracking-tighter">Zen Level {level}</h3>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-gold/10 flex items-center justify-center text-gold">
              <ShieldCheck size={24} />
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-[10px] uppercase tracking-widest font-bold">
              <span className="text-cream/30">Progression</span>
              <span className="text-gold">{expInCurrentLevel}/100 XP</span>
            </div>
            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-gold shadow-[0_0_15px_rgba(212,175,55,0.5)]"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Total Time Card */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass p-8 rounded-[2.5rem]"
      >
        <div className="flex flex-col justify-between h-full space-y-6">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-[10px] uppercase tracking-[0.3em] text-sage font-bold">Total Focus</span>
              <h3 className="text-2xl font-black text-cream tracking-tighter">{totalMinutes} Minutes</h3>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-sage/10 flex items-center justify-center text-sage">
              <Clock size={24} />
            </div>
          </div>
          <p className="text-xs text-cream/30 leading-relaxed">
            Every minute of presence is a stitch in the fabric of peace.
          </p>
        </div>
      </motion.div>

      {/* Streak Card */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass p-8 rounded-[2.5rem]"
      >
        <div className="flex flex-col justify-between h-full space-y-6">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-[10px] uppercase tracking-[0.3em] text-sage font-bold">Continuity</span>
              <h3 className="text-2xl font-black text-cream tracking-tighter">{state.streak.count} Day Streak</h3>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-gold/10 flex items-center justify-center text-gold">
              <Zap size={24} fill="currentColor" />
            </div>
          </div>
          <div className="inline-block px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] uppercase tracking-widest text-sage font-bold self-start">
            Rank: {state.streak.badge}
          </div>
        </div>
      </motion.div>
    </div>
  );
};
