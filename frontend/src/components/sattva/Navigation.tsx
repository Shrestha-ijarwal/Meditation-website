"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Home, Wind, BookOpen, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { name: "Home", href: "/", icon: Home },
  { name: "Meditation", href: "/meditation", icon: Wind },
  { name: "Journal", href: "/journal", icon: BookOpen },
  { name: "Wisdom", href: "/wisdom", icon: Sparkles },
];

export const Navigation = () => {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100]">
      <div className="bg-charcoal/40 backdrop-blur-xl border border-white/10 px-4 py-3 rounded-full flex items-center gap-2 shadow-2xl shadow-black/40">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link key={item.name} href={item.href}>
              <div className={cn(
                "relative px-4 py-2 rounded-full transition-all duration-300 group flex items-center gap-2",
                isActive ? "text-cream" : "text-cream/40 hover:text-cream/70"
              )}>
                {isActive && (
                  <motion.div
                    layoutId="nav-bg"
                    className="absolute inset-0 bg-white/5 rounded-full"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <item.icon className="w-4 h-4" />
                <span className="text-sm font-medium tracking-wide">{item.name}</span>
              </div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
