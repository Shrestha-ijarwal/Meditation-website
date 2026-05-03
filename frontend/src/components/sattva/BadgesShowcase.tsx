"use client";

import { motion } from "framer-motion";
import { Award, Zap, Heart, Shield, Star, Crown } from "lucide-react";
import { cn } from "@/lib/utils";

const badges = [
  { id: 1, name: "First Step", description: "Completed your first 10-minute meditation.", icon: Heart, color: "text-red-400", bg: "bg-red-400/10", unlocked: true },
  { id: 2, name: "3-Day Streak", description: "Consistently mindful for three days.", icon: Zap, color: "text-gold", bg: "bg-gold/10", unlocked: true },
  { id: 3, name: "Deep Thinker", description: "Released 10 reflections in the journal.", icon: Star, color: "text-purple-400", bg: "bg-purple-400/10", unlocked: false },
  { id: 4, name: "Ancient Guard", description: "Explored 50 Dhammapada verses.", icon: Shield, color: "text-blue-400", bg: "bg-blue-400/10", unlocked: false },
  { id: 5, name: "Zen Master", description: "Completed a 1-hour session.", icon: Crown, color: "text-gold", bg: "bg-gold/10", unlocked: false },
  { id: 6, name: "Silent Soul", description: "Total meditation time over 5 hours.", icon: Award, color: "text-sage", bg: "bg-sage/10", unlocked: false },
];

export const BadgesShowcase = () => {
  return (
    <section className="space-y-10">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-3xl font-bold text-cream tracking-tight">Your Achievements</h2>
          <p className="text-sm text-sage tracking-widest uppercase">Consistency is the path to peace</p>
        </div>
        <div className="text-right">
          <span className="text-4xl font-black text-gold">2/6</span>
          <p className="text-[10px] uppercase tracking-widest text-cream/30">Badges Earned</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {badges.map((badge, i) => (
          <motion.div
            key={badge.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className={cn(
              "group relative glass p-8 rounded-[2.5rem] border transition-all duration-500",
              badge.unlocked 
                ? "border-white/10 hover:bg-white/5" 
                : "border-white/5 opacity-40 grayscale"
            )}
          >
            <div className="flex items-start gap-6">
              <div className={cn(
                "w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 transition-transform duration-500 group-hover:scale-110",
                badge.bg,
                badge.color
              )}>
                <badge.icon size={32} />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-cream">{badge.name}</h3>
                <p className="text-xs text-cream/40 leading-relaxed">
                  {badge.description}
                </p>
                {!badge.unlocked && (
                  <div className="pt-2">
                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-sage">Locked</span>
                  </div>
                )}
              </div>
            </div>
            {badge.unlocked && (
              <div className="absolute top-4 right-4">
                <div className="w-2 h-2 rounded-full bg-gold animate-pulse" />
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </section>
  );
};
