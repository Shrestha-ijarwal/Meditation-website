import type { Metadata } from "next";
import { Inter, Outfit, Alex_Brush } from "next/font/google";
import "./globals.css";
import { AppProvider } from "@/context/app-context";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });
const cursive = Alex_Brush({ weight: "400", subsets: ["latin"], variable: "--font-cursive" });

export const metadata: Metadata = {
  title: "Sattva — Peace Begins Within",
  description: "A digital sanctuary for mindfulness and reflection.",
};

import { Navigation } from "@/components/sattva/Navigation";
import { ShaderBackground } from "@/components/ui/shader-background";
import { SattvaAI } from "@/components/sattva/SattvaAI";
import { GlobalHeader } from "@/components/sattva/GlobalHeader";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${outfit.variable} ${cursive.variable}`}>
      <body className="bg-charcoal text-cream overflow-x-hidden antialiased">
        <AppProvider>
          <ShaderBackground />
          <GlobalHeader />
          <div className="relative z-10">
            {children}
          </div>
          <SattvaAI />
          <Navigation />
        </AppProvider>
      </body>
    </html>
  );
}
