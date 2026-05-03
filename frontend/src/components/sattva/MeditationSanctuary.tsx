"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, RotateCcw, Volume2, Wind, CloudRain, TreePine } from "lucide-react";
import { cn } from "@/lib/utils";
import { useApp } from "@/context/app-context";
import { BreathingGuide } from "./BreathingGuide";

export const MeditationSanctuary = () => {
  const [timeLeft, setTimeLeft] = useState(600); // Default 10 mins
  const [initialDuration, setInitialDuration] = useState(600);
  const [isActive, setIsActive] = useState(false);
  const [volumes, setVolumes] = useState({ chan1: 40, chan2: 30, chan3: 20 });
  const { completeSession } = useApp();
  
  // Audio Engine State
  const audioContextRef = useRef<AudioContext | null>(null);
  const nodesRef = useRef<{ [key: string]: { gain: GainNode } }>({});

  const initAudio = () => {
    if (audioContextRef.current) return;
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    audioContextRef.current = ctx;

    // Helper to create noise
    const createNoise = (type: 'white' | 'brown') => {
      const bufferSize = 2 * ctx.sampleRate;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      let lastOut = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        if (type === 'white') {
          output[i] = Math.random() * 2 - 1;
        } else {
          const white = Math.random() * 2 - 1;
          output[i] = (lastOut + (0.02 * white)) / 1.02;
          lastOut = output[i];
          output[i] *= 3.5; // brown noise is quieter
        }
      }
      const source = ctx.createBufferSource();
      source.buffer = noiseBuffer;
      source.loop = true;
      return source;
    };

    // Deep Om (Sine Drones)
    const omGain = ctx.createGain();
    omGain.gain.value = volumes.chan1 / 100;
    omGain.connect(ctx.destination);
    [55, 110, 165].forEach(freq => {
      const osc = ctx.createOscillator();
      osc.frequency.value = freq;
      const f = ctx.createBiquadFilter();
      f.type = 'lowpass';
      f.frequency.value = 200;
      osc.connect(f);
      f.connect(omGain);
      osc.start();
    });
    nodesRef.current.chan1 = { gain: omGain };

    // Rain (Filtered White Noise)
    const rainGain = ctx.createGain();
    rainGain.gain.value = volumes.chan2 / 100;
    rainGain.connect(ctx.destination);
    const rainNoise = createNoise('white');
    const rainFilter = ctx.createBiquadFilter();
    rainFilter.type = 'lowpass';
    rainFilter.frequency.value = 800;
    rainNoise.connect(rainFilter);
    rainFilter.connect(rainGain);
    rainNoise.start();
    nodesRef.current.chan2 = { gain: rainGain };

    // Forest (Brown Noise + Random Bells)
    const forestGain = ctx.createGain();
    forestGain.gain.value = volumes.chan3 / 100;
    forestGain.connect(ctx.destination);
    const forestNoise = createNoise('brown');
    const forestFilter = ctx.createBiquadFilter();
    forestFilter.type = 'lowpass';
    forestFilter.frequency.value = 400;
    forestNoise.connect(forestFilter);
    forestFilter.connect(forestGain);
    forestNoise.start();
    nodesRef.current.chan3 = { gain: forestGain };
  };

  useEffect(() => {
    if (isActive && !audioContextRef.current) initAudio();
    if (audioContextRef.current) {
      if (isActive) audioContextRef.current.resume();
      else audioContextRef.current.suspend();
    }
  }, [isActive]);

  useEffect(() => {
    Object.keys(volumes).forEach(key => {
      if (nodesRef.current[key]) {
        nodesRef.current[key].gain.gain.setTargetAtTime((volumes as any)[key] / 100, audioContextRef.current!.currentTime, 0.1);
      }
    });
  }, [volumes]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    } else if (timeLeft === 0 && isActive) {
      setIsActive(false);
      completeSession(Math.floor(initialDuration / 60));
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handlePreset = (mins: number) => {
    setIsActive(false);
    setTimeLeft(mins * 60);
    setInitialDuration(mins * 60);
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-12">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        
        {/* Timer UI */}
        <div className="flex flex-col items-center space-y-8">
          <div className="relative group">
            <motion.div 
              animate={{ scale: isActive ? [1, 1.05, 1] : 1 }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute inset-0 bg-gold/10 rounded-full blur-3xl opacity-50" 
            />
            <div className="relative w-80 h-80 rounded-full border border-white/10 flex flex-col items-center justify-center space-y-2 glass shadow-2xl">
              <span className="text-7xl font-black text-cream tracking-tighter tabular-nums">
                {formatTime(timeLeft)}
              </span>
              <span className="text-[10px] uppercase tracking-[0.4em] text-sage font-bold">
                Presence
              </span>
            </div>
          </div>

          {/* Presets */}
          <div className="flex gap-4">
            {[10, 30, 60].map((mins) => (
              <button
                key={mins}
                onClick={() => handlePreset(mins)}
                className={cn(
                  "px-6 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all",
                  timeLeft === mins * 60 ? "bg-gold text-charcoal shadow-lg shadow-gold/20" : "bg-white/5 text-cream/40 hover:bg-white/10"
                )}
              >
                {mins === 60 ? "1 Hour" : `${mins} Mins`}
              </button>
            ))}
          </div>

          <div className="flex gap-6">
            <button
              onClick={() => setIsActive(!isActive)}
              className={cn(
                "w-20 h-20 rounded-full flex items-center justify-center transition-all duration-500",
                isActive ? "bg-gold/20 text-gold border border-gold/30" : "bg-sage/20 text-sage border border-sage/30 hover:scale-105"
              )}
            >
              {isActive ? <Pause size={28} fill="currentColor" /> : <Play size={28} className="ml-1" fill="currentColor" />}
            </button>
            <button
              onClick={() => { setIsActive(false); setTimeLeft(600); }}
              className="w-20 h-20 rounded-full bg-white/5 text-cream/40 border border-white/10 flex items-center justify-center hover:bg-white/10"
            >
              <RotateCcw size={24} />
            </button>
          </div>
        </div>

        {/* Mixer UI */}
        <div className="glass p-12 rounded-[4rem] space-y-10 border border-white/5">
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-cream">Atmospheric Mixer</h3>
            <p className="text-xs text-sage tracking-widest uppercase">Procedural Zen Soundscape</p>
          </div>

          <div className="space-y-8">
            <MixerChannel icon={<Volume2 size={16} />} label="Deep Om" value={volumes.chan1} onChange={(v: number) => setVolumes(prev => ({ ...prev, chan1: v }))} />
            <MixerChannel icon={<CloudRain size={16} />} label="Rainfall" value={volumes.chan2} onChange={(v: number) => setVolumes(prev => ({ ...prev, chan2: v }))} />
            <MixerChannel icon={<TreePine size={16} />} label="Ancient Forest" value={volumes.chan3} onChange={(v: number) => setVolumes(prev => ({ ...prev, chan3: v }))} />
          </div>
        </div>
      </div>

      {/* Breathing Guide Section */}
      <div className="pt-12">
        <BreathingGuide />
      </div>
    </div>
  );
};

function MixerChannel({ label, value, onChange, icon }: any) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center text-[10px] uppercase tracking-widest font-bold">
        <div className="flex items-center gap-2 text-sage">
          {icon}
          <span>{label}</span>
        </div>
        <span className="text-gold">{value}%</span>
      </div>
      <div className="relative h-2 w-full bg-white/5 rounded-full group cursor-pointer">
        <input
          type="range"
          min="0"
          max="100"
          value={value}
          onChange={(e) => onChange(parseInt(e.target.value))}
          className="absolute inset-0 w-full h-full opacity-0 z-10 cursor-pointer"
        />
        <motion.div 
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-sage to-gold rounded-full"
          animate={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}
