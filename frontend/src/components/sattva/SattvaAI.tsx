"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Sparkles, Send, Volume2, VolumeX } from "lucide-react";
import { cn } from "@/lib/utils";

export const SattvaAI = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<{ role: string; text: string }[]>([
    { role: "buddha", text: "Welcome, seeker. I am Sattva. How does the river of your mind flow today?" }
  ]);
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  const speak = (text: string) => {
    if (!isVoiceEnabled || typeof window === 'undefined') return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.8;
    utterance.pitch = 0.7;
    window.speechSynthesis.speak(utterance);
  };

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const userText = input;
    const newMessages = [...messages, { role: "user", text: userText }];
    setMessages(newMessages);
    setInput("");
    setIsTyping(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL && process.env.NEXT_PUBLIC_API_URL !== '' ? process.env.NEXT_PUBLIC_API_URL : 'https://sattva-backend-910457570224.us-central1.run.app';
      const response = await fetch(`${apiUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: userText,
          history: messages.filter((m, i) => i > 0).map(m => ({
            role: m.role === "user" ? "user" : "model",
            parts: [{ text: m.text }]
          }))
        })
      });
      
      setIsTyping(false);

      if (!response.body) throw new Error("No readable stream");

      // Add empty message for AI
      setMessages(prev => [...prev, { role: "buddha", text: "" }]);

      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let done = false;
      let fullText = "";

      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        if (value) {
           const chunkValue = decoder.decode(value, { stream: true });
           fullText += chunkValue;
           setMessages(prev => {
             const newMsgs = [...prev];
             // The last message is the current AI message we are streaming
             newMsgs[newMsgs.length - 1].text = fullText;
             return newMsgs;
           });
        }
      }
      
      if (!fullText) {
          fullText = "The river is silent.";
          setMessages(prev => {
            const newMsgs = [...prev];
            newMsgs[newMsgs.length - 1].text = fullText;
            return newMsgs;
          });
      }
      speak(fullText);
    } catch (err) {
      console.error("AI chat failed:", err);
      setIsTyping(false);
      setMessages(prev => [...prev, { role: "buddha", text: "The clouds of the network are thick. I cannot hear you clearly." }]);
    }
  };

  return (
    <div className="fixed bottom-8 right-8 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="mb-4 w-80 md:w-96 glass-dark rounded-[2rem] overflow-hidden flex flex-col shadow-2xl border border-white/5"
          >
            {/* Header */}
            <div className="p-6 bg-sage/10 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-sage/20 flex items-center justify-center text-sage">
                  <Sparkles size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-cream">Sattva AI</h3>
                  <p className="text-[10px] text-sage/70 uppercase tracking-widest">Peace Guide</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button 
                  onClick={() => setIsVoiceEnabled(!isVoiceEnabled)} 
                  className={cn("p-2 rounded-lg transition-colors", isVoiceEnabled ? "bg-gold/20 text-gold" : "text-cream/30 hover:text-cream/50")}
                >
                  {isVoiceEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
                </button>
                <button onClick={() => setIsOpen(false)} className="text-cream/30 hover:text-cream p-2">
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 h-80 overflow-y-auto p-6 space-y-4">
              {messages.map((m, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: m.role === "user" ? 10 : -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div className={`max-w-[80%] p-4 rounded-2xl text-xs leading-relaxed ${
                    m.role === "user" 
                      ? "bg-sage/20 text-cream rounded-tr-none" 
                      : "bg-white/5 text-cream/70 rounded-tl-none border border-white/5"
                  }`}>
                    {m.text}
                  </div>
                </motion.div>
              ))}
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start"
                >
                  <div className="bg-white/5 text-cream/30 p-4 rounded-2xl rounded-tl-none border border-white/5 text-[10px] italic">
                    Sattva is breathing...
                  </div>
                </motion.div>
              )}
            </div>

            {/* Input */}
            <div className="p-4 border-t border-white/5">
              <div className="flex items-center space-x-2 glass rounded-full px-4 py-2">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  placeholder="Ask for guidance..."
                  className="flex-1 bg-transparent border-none focus:outline-none text-xs text-cream/80 placeholder:text-cream/20"
                />
                <button onClick={handleSend} className="text-sage hover:scale-110 transition-transform">
                  <Send size={14} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 rounded-full bg-sage flex items-center justify-center text-charcoal shadow-xl"
      >
        <MessageCircle size={24} />
      </motion.button>
    </div>
  );
};
