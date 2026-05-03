"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import verses from "@/data/dhammapada.json";
import { Quote, RotateCcw } from "lucide-react";

export const DhammapadaDaily = () => {
  const [verse, setVerse] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchWisdom = async () => {
    setLoading(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL && process.env.NEXT_PUBLIC_API_URL !== '' ? process.env.NEXT_PUBLIC_API_URL : 'https://sattva-backend-910457570224.us-central1.run.app';
      const res = await fetch(`${apiUrl}/api/wisdom`);
      const data = await res.json();
      setVerse(data);
    } catch (err) {
      console.error("Wisdom fetch failed:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWisdom();
  }, []);

  if (loading || !verse) return <div className="text-center py-12 text-sage animate-pulse">Seeking wisdom...</div>;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="max-w-xl mx-auto"
    >
      <div className="glass p-10 rounded-[3rem] space-y-8 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-8 text-sage/10 group-hover:text-sage/20 transition-colors">
          <Quote size={80} />
        </div>
        
        <div className="space-y-6 relative z-10">
          <div className="flex items-center gap-4">
            <div className="inline-block px-3 py-1 rounded-full bg-gold/10 text-gold text-[10px] uppercase tracking-[0.3em] font-bold">
              Daily Verse
            </div>
            {verse.verseNumber && (
              <span className="text-[10px] uppercase tracking-widest text-cream/30">Verse {verse.verseNumber}</span>
            )}
          </div>
          
          <h2 className="text-2xl font-light leading-relaxed text-cream/90 italic">
            "{verse.verse}"
          </h2>
          
          <div className="h-px w-12 bg-sage/30" />
          
          <div className="pt-4 flex justify-between items-center">
            <div className="space-y-2">
              <span className="text-[10px] uppercase tracking-widest text-sage font-medium">Modern Translation</span>
              <p className="text-sm text-cream/50 leading-relaxed font-light">
                {verse.interpretation}
              </p>
            </div>
            <button 
              onClick={fetchWisdom}
              className="p-3 rounded-full bg-white/5 text-sage hover:bg-white/10 transition-all hover:rotate-180 duration-500"
              title="Seek New Wisdom"
            >
              <RotateCcw size={16} />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
