"use client";

import { motion } from "framer-motion";
import { DhammapadaDaily } from "@/components/sattva/DhammapadaDaily";

export default function WisdomPage() {
  return (
    <div className="container mx-auto px-6 pt-32 pb-48">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto space-y-12"
      >
        <div className="text-center space-y-4">
          <h1 className="text-6xl font-black text-cream tracking-tighter">Daily Wisdom</h1>
          <p className="text-sage tracking-[0.4em] uppercase text-xs">Timeless verses from the Dhammapada</p>
        </div>

        <DhammapadaDaily />
      </motion.div>
    </div>
  );
}
