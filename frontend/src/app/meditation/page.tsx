"use client";

import { motion } from "framer-motion";
import { MeditationSanctuary } from "@/components/sattva/MeditationSanctuary";

export default function MeditationPage() {
  return (
    <div className="container mx-auto px-6 pt-24 pb-32">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto"
      >
        <div className="mb-12 text-center">
          <h1 className="text-5xl font-bold text-cream mb-4">Meditation Sanctuary</h1>
          <p className="text-sage tracking-widest uppercase text-sm">Quiet the mind, find the center</p>
        </div>
        <MeditationSanctuary />
      </motion.div>
    </div>
  );
}
