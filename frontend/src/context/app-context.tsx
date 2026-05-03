"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

interface AppState {
  timer: {
    timeLeft: number;
    isActive: boolean;
    duration: number;
    mode: "Mindfulness" | "Loving-Kindness" | "NSDR";
  };
  audio: {
    solfeggio: number; // frequency volume 0-1
    bowls: number;
    rain: number;
    isPlaying: boolean;
  };
  streak: {
    count: number;
    lastDate: string | null;
    badge: string;
  };
  stats: {
    totalMinutes: number;
    experience: number;
    level: number;
  };
}

interface AppContextType {
  state: AppState;
  setTimerActive: (active: boolean) => void;
  setTimerDuration: (seconds: number) => void;
  setTimerMode: (mode: AppState["timer"]["mode"]) => void;
  updateAudio: (key: keyof AppState["audio"], value: number | boolean) => void;
  incrementStreak: () => void;
  completeSession: (minutes: number) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AppState>({
    timer: {
      timeLeft: 600,
      isActive: false,
      duration: 600,
      mode: "Mindfulness",
    },
    audio: {
      solfeggio: 0.5,
      bowls: 0.3,
      rain: 0.4,
      isPlaying: false,
    },
    streak: {
      count: 0,
      lastDate: null,
      badge: "The Seeker",
    },
    stats: {
      totalMinutes: 0,
      experience: 0,
      level: 1,
    },
  });

  // Persist streak
  useEffect(() => {
    const saved = localStorage.getItem("sattva-streak");
    if (saved) {
      setState(prev => ({ ...prev, streak: JSON.parse(saved) }));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("sattva-streak", JSON.stringify(state.streak));
  }, [state.streak]);

  // Timer logic
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (state.timer.isActive && state.timer.timeLeft > 0) {
      interval = setInterval(() => {
        setState(prev => ({
          ...prev,
          timer: { ...prev.timer, timeLeft: prev.timer.timeLeft - 1 }
        }));
      }, 1000);
    } else if (state.timer.timeLeft === 0) {
      setState(prev => ({ ...prev, timer: { ...prev.timer, isActive: false } }));
      // Could trigger completion sound or badge unlock here
    }
    return () => clearInterval(interval);
  }, [state.timer.isActive, state.timer.timeLeft]);

  const setTimerActive = (active: boolean) => {
    setState(prev => ({ ...prev, timer: { ...prev.timer, isActive: active } }));
  };

  const setTimerDuration = (seconds: number) => {
    setState(prev => ({ 
      ...prev, 
      timer: { ...prev.timer, duration: seconds, timeLeft: seconds, isActive: false } 
    }));
  };

  const setTimerMode = (mode: AppState["timer"]["mode"]) => {
    setState(prev => ({ ...prev, timer: { ...prev.timer, mode } }));
  };

  const updateAudio = (key: keyof AppState["audio"], value: number | boolean) => {
    setState(prev => ({
      ...prev,
      audio: { ...prev.audio, [key]: value }
    }));
  };

  const incrementStreak = () => {
    const today = new Date().toISOString().split('T')[0];
    if (state.streak.lastDate !== today) {
      const newCount = state.streak.count + 1;
      let newBadge = state.streak.badge;
      
      if (newCount >= 7) newBadge = "The Stream-Enterer";
      if (newCount >= 30) newBadge = "The Once-Returner";
      
      setState(prev => ({
        ...prev,
        streak: { count: newCount, lastDate: today, badge: newBadge }
      }));
    }
  };

  const completeSession = (minutes: number) => {
    setState(prev => {
      const newExperience = prev.stats.experience + (minutes * 10);
      const newLevel = Math.floor(newExperience / 100) + 1;
      const newTotalMinutes = prev.stats.totalMinutes + minutes;
      
      return {
        ...prev,
        stats: {
          ...prev.stats,
          experience: newExperience,
          level: newLevel,
          totalMinutes: newTotalMinutes
        }
      };
    });
    incrementStreak();
  };

  return (
    <AppContext.Provider value={{
      state,
      setTimerActive,
      setTimerDuration,
      setTimerMode,
      updateAudio,
      incrementStreak,
      completeSession
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within AppProvider");
  return context;
};
