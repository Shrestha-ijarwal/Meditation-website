"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { VaporizeTextCycle } from "@/components/ui/vapour-text-effect";
import { BadgesShowcase } from "@/components/sattva/BadgesShowcase";
import { ZenStats } from "@/components/sattva/ZenStats";
import { Wind, BookOpen, Sparkles, ArrowRight } from "lucide-react";

export default function Home() {
  const [stage, setStage] = useState<"intro" | "dashboard">("intro");

  const introFontConfig = React.useMemo(() => (text: string) => ({
    fontFamily: text === "Sattva" ? "Outfit, Inter, sans-serif" : "Alex Brush, cursive",
    fontSize: text === "Sattva" ? "120px" : "90px",
    fontWeight: text === "Sattva" ? 800 : 400
  }), []);

  return (
    <main className="min-h-screen relative font-sans selection:bg-sage/30">
      <AnimatePresence mode="wait">
        {stage === "intro" ? (
          <motion.div
            key="intro"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal"
          >
            <VaporizeTextCycle 
              phrases={["Sattva", "Peace Begins Within"]} 
              onAllComplete={() => setStage("dashboard")}
              font={introFontConfig}
              color="rgb(245, 245, 220)"
              density={6}
              className="w-full h-full"
            />
            <button 
              onClick={() => setStage("dashboard")}
              className="absolute bottom-12 left-1/2 -translate-x-1/2 text-[10px] uppercase tracking-[0.5em] text-cream/20 hover:text-gold transition-colors duration-500 z-[60]"
            >
              Skip Entrance
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.5 }}
            className="container mx-auto px-6 pt-32 pb-48"
          >
            <div className="max-w-6xl mx-auto space-y-24">
              {/* Branding Header */}
              <div className="text-center md:text-left space-y-4">
                <motion.h1 
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  className="text-8xl md:text-9xl font-black tracking-tighter text-cream"
                >
                  Sattva
                </motion.h1>
                <p className="text-sage tracking-[0.8em] uppercase text-sm ml-2">Peace begins within</p>
              </div>

              {/* Player Stats Bar */}
              <ZenStats />

              {/* Gateway Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <GatewayCard 
                  title="Meditate" 
                  description="Find stillness in the flow of existence."
                  href="/meditation"
                  icon={<Wind className="w-8 h-8 text-gold" />}
                  delay={0.2}
                />
                <GatewayCard 
                  title="Reflect" 
                  description="Release your burdens to the digital void."
                  href="/journal"
                  icon={<BookOpen className="w-8 h-8 text-sage" />}
                  delay={0.4}
                />
                <GatewayCard 
                  title="Wisdom" 
                  description="Daily insights from ancient masters."
                  href="/wisdom"
                  icon={<Sparkles className="w-8 h-8 text-gold" />}
                  delay={0.6}
                />
              </div>

              {/* Achievements Section */}
              <BadgesShowcase />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}

function GatewayCard({ title, description, href, icon, delay }: { title: string, description: string, href: string, icon: React.ReactNode, delay: number }) {
  return (
    <Link href={href}>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay, duration: 0.8 }}
        className="group relative glass p-10 rounded-[3rem] border border-white/5 hover:bg-white/5 transition-all cursor-pointer h-full flex flex-col justify-between"
      >
        <div className="space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
            {icon}
          </div>
          <div className="space-y-2">
            <h3 className="text-3xl font-bold text-cream">{title}</h3>
            <p className="text-cream/40 leading-relaxed text-sm">
              {description}
            </p>
          </div>
        </div>
        
        <div className="mt-8 flex items-center gap-2 text-gold opacity-0 group-hover:opacity-100 transition-opacity translate-x-[-10px] group-hover:translate-x-0">
          <span className="text-xs font-bold uppercase tracking-widest">Enter Sanctuary</span>
          <ArrowRight className="w-4 h-4" />
        </div>
      </motion.div>
    </Link>
  );
}
