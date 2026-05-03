"use client";

import React, { useRef, useEffect, useState, createElement, useMemo, useCallback, memo } from "react";

export enum Tag {
  H1 = "h1",
  H2 = "h2",
  H3 = "h3",
  P = "p",
}

type VaporizeTextCycleProps = {
  texts?: string[];
  phrases?: string[]; // Alias for backward compatibility
  onAllComplete?: () => void;
  font?: {
    fontFamily?: string;
    fontSize?: string;
    fontWeight?: number;
  } | ((text: string, index: number) => {
    fontFamily?: string;
    fontSize?: string;
    fontWeight?: number;
  });
  color?: string;
  spread?: number;
  density?: number;
  animation?: {
    vaporizeDuration?: number;
    fadeInDuration?: number;
    waitDuration?: number;
  };
  direction?: "left-to-right" | "right-to-left";
  alignment?: "left" | "center" | "right";
  tag?: Tag;
  className?: string; // Added for styling
};

type Particle = {
  x: number;
  y: number;
  originalX: number;
  originalY: number;
  color: string;
  opacity: number;
  originalAlpha: number;
  velocityX: number;
  velocityY: number;
  angle: number;
  speed: number;
  shouldFadeQuickly?: boolean;
};

type TextBoundaries = {
  left: number;
  right: number;
  width: number;
};

declare global {
  interface HTMLCanvasElement {
    textBoundaries?: TextBoundaries;
  }
}

export function VaporizeTextCycle({
  texts,
  phrases,
  onAllComplete,
  font = {
    fontFamily: "Inter, sans-serif",
    fontSize: "50px",
    fontWeight: 400,
  },
  color = "rgb(255, 255, 255)",
  spread = 5,
  density = 5,
  animation = {
    vaporizeDuration: 2,
    fadeInDuration: 1,
    waitDuration: 0.5,
  },
  direction = "left-to-right",
  alignment = "center",
  tag = Tag.P,
  className = "",
}: VaporizeTextCycleProps) {
  const activeTexts = texts || phrases || ["Next.js", "React"];
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const isInView = useIsInView(wrapperRef as React.RefObject<HTMLElement>);
  const lastFontRef = useRef<string | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationFrameRef = useRef<number | null>(null);
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [animationState, setAnimationState] = useState<"static" | "vaporizing" | "fadingIn" | "waiting">("static");
  const vaporizeProgressRef = useRef(0);
  const fadeOpacityRef = useRef(0);
  const [wrapperSize, setWrapperSize] = useState({ width: 0, height: 0 });
  const transformedDensity = transformValue(density, [0, 10], [0.3, 1], true);

  // Calculate device pixel ratio
  const globalDpr = useMemo(() => {
    if (typeof window !== "undefined") {
      return window.devicePixelRatio * 1.5 || 1;
    }
    return 1;
  }, []);

  // Memoize static styles
  const wrapperStyle = useMemo(() => ({
    width: "100%",
    height: "100%",
    pointerEvents: "none" as const,
  }), []);

  const canvasStyle = useMemo(() => ({
    minWidth: "30px",
    minHeight: "20px",
    pointerEvents: "none" as const,
  }), []);

  // Memoize animation durations
  const animationDurations = useMemo(() => ({
    VAPORIZE_DURATION: (animation.vaporizeDuration ?? 2) * 1000,
    FADE_IN_DURATION: (animation.fadeInDuration ?? 1) * 1000,
    WAIT_DURATION: (animation.waitDuration ?? 0.5) * 1000,
  }), [animation.vaporizeDuration, animation.fadeInDuration, animation.waitDuration]);

  const getFontForIndex = useCallback((index: number) => {
    const text = activeTexts[index] || "";
    const baseFont = typeof font === "function" 
      ? font(text, index) 
      : (font || {});
    
    const fontSizeNum = parseInt(baseFont.fontSize?.toString().replace("px", "") || "50");
    const fontStr = `${baseFont.fontWeight ?? 400} ${fontSizeNum * globalDpr}px ${baseFont.fontFamily ?? "Inter, sans-serif"}`;
    const VAPORIZE_SPREAD = calculateVaporizeSpread(fontSizeNum);
    const MULTIPLIED_VAPORIZE_SPREAD = VAPORIZE_SPREAD * spread;
    
    return { fontStr, fontSize: fontSizeNum, multipliedSpread: MULTIPLIED_VAPORIZE_SPREAD };
  }, [activeTexts, font, globalDpr, spread]);

  const currentFontMetrics = useMemo(() => getFontForIndex(currentTextIndex), [getFontForIndex, currentTextIndex]);

  // Memoize particle update function
  const memoizedUpdateParticles = useCallback((particles: Particle[], vaporizeX: number, deltaTime: number) => {
    return updateParticles(
      particles,
      vaporizeX,
      deltaTime,
      currentFontMetrics.multipliedSpread,
      animationDurations.VAPORIZE_DURATION,
      direction,
      transformedDensity
    );
  }, [currentFontMetrics.multipliedSpread, animationDurations.VAPORIZE_DURATION, direction, transformedDensity]);

  // Memoize render function
  const memoizedRenderParticles = useCallback((ctx: CanvasRenderingContext2D, particles: Particle[]) => {
    renderParticles(ctx, particles, globalDpr);
  }, [globalDpr]);

  // Start animation cycle when in view
  useEffect(() => {
    if (isInView) {
      const startAnimationTimeout = setTimeout(() => {
        setAnimationState("vaporizing");
      }, 0);
      return () => clearTimeout(startAnimationTimeout);
    } else {
      setAnimationState("static");
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    }
  }, [isInView]);

  // Animation loop
  useEffect(() => {
    if (!isInView) return;

    let lastTime = performance.now();
    let frameId: number;

    const animate = (currentTime: number) => {
      const deltaTime = (currentTime - lastTime) / 1000;
      lastTime = currentTime;

      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");

      if (!canvas || !ctx || !particlesRef.current.length) {
        frameId = requestAnimationFrame(animate);
        return;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      switch (animationState) {
        case "static": {
          memoizedRenderParticles(ctx, particlesRef.current);
          break;
        }
        case "vaporizing": {
          vaporizeProgressRef.current += deltaTime * 100 / (animationDurations.VAPORIZE_DURATION / 1000);
          const textBoundaries = canvas.textBoundaries;
          if (!textBoundaries) break;

          const progress = Math.min(100, vaporizeProgressRef.current);
          const vaporizeX = direction === "left-to-right"
            ? textBoundaries.left + textBoundaries.width * progress / 100
            : textBoundaries.right - textBoundaries.width * progress / 100;

          const allVaporized = memoizedUpdateParticles(particlesRef.current, vaporizeX, deltaTime);
          memoizedRenderParticles(ctx, particlesRef.current);

          if (vaporizeProgressRef.current >= 100 && allVaporized) {
            // Check if we reached the end of texts
            if (currentTextIndex === activeTexts.length - 1 && onAllComplete) {
              onAllComplete();
              return; // Stop animation loop
            }
            
            setCurrentTextIndex(prevIndex => (prevIndex + 1) % activeTexts.length);
            setAnimationState("fadingIn");
            fadeOpacityRef.current = 0;
          }
          break;
        }
        case "fadingIn": {
          fadeOpacityRef.current += deltaTime * 1000 / animationDurations.FADE_IN_DURATION;
          ctx.save();
          ctx.scale(globalDpr, globalDpr);
          particlesRef.current.forEach(particle => {
            particle.x = particle.originalX;
            particle.y = particle.originalY;
            const opacity = Math.min(fadeOpacityRef.current, 1) * particle.originalAlpha;
            const color = particle.color.replace(/[\d.]+\)$/, `${opacity})`);
            ctx.fillStyle = color;
            ctx.fillRect(particle.x / globalDpr, particle.y / globalDpr, 1, 1);
          });
          ctx.restore();

          if (fadeOpacityRef.current >= 1) {
            setAnimationState("waiting");
            setTimeout(() => {
              setAnimationState("vaporizing");
              vaporizeProgressRef.current = 0;
              resetParticles(particlesRef.current);
            }, animationDurations.WAIT_DURATION);
          }
          break;
        }
        case "waiting": {
          memoizedRenderParticles(ctx, particlesRef.current);
          break;
        }
      }

      frameId = requestAnimationFrame(animate);
    };

    frameId = requestAnimationFrame(animate);
    return () => { if (frameId) cancelAnimationFrame(frameId); };
  }, [
    animationState, isInView, activeTexts.length, direction, globalDpr, memoizedUpdateParticles, 
    memoizedRenderParticles, animationDurations, currentTextIndex, onAllComplete
  ]);

  useEffect(() => {
    renderCanvas({
      framerProps: { texts: activeTexts, font, color, alignment },
      canvasRef: canvasRef as React.RefObject<HTMLCanvasElement>,
      wrapperSize,
      particlesRef,
      globalDpr,
      currentTextIndex,
      transformedDensity,
    });

    const metrics = getFontForIndex(currentTextIndex);
    const currentFontStr = metrics.fontStr;
    
    if (currentFontStr !== lastFontRef.current) {
      lastFontRef.current = currentFontStr;
      const timeoutId = setTimeout(() => {
        cleanup({ canvasRef, particlesRef });
        renderCanvas({
          framerProps: { texts: activeTexts, font, color, alignment },
          canvasRef: canvasRef as React.RefObject<HTMLCanvasElement>,
          wrapperSize,
          particlesRef,
          globalDpr,
          currentTextIndex,
          transformedDensity,
        });
      }, 500);
      return () => clearTimeout(timeoutId);
    }
  }, [activeTexts, font, color, alignment, wrapperSize, currentTextIndex, globalDpr, transformedDensity, getFontForIndex]);

  useEffect(() => {
    const container = wrapperRef.current;
    if (!container) return;

    const resizeObserver = new ResizeObserver(entries => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        setWrapperSize({ width, height });
      }
    });

    resizeObserver.observe(container);
    return () => resizeObserver.disconnect();
  }, []);

  useEffect(() => {
    if (wrapperRef.current) {
      const rect = wrapperRef.current.getBoundingClientRect();
      setWrapperSize({ width: rect.width, height: rect.height });
    }
  }, []);

  return (
    <div ref={wrapperRef} style={wrapperStyle} className={className}>
      <canvas ref={canvasRef} style={canvasStyle} />
      <SeoElement tag={tag} texts={activeTexts} />
    </div>
  );
}

export const VapourText = ({ 
  text, 
  className, 
  duration = 2, 
  font, 
  color 
}: { 
  text: string, 
  className?: string, 
  duration?: number,
  font?: VaporizeTextCycleProps["font"],
  color?: string
}) => {
  return (
    <VaporizeTextCycle 
      texts={[text]} 
      className={className} 
      animation={{ vaporizeDuration: duration }}
      font={font}
      color={color}
    />
  );
};

const SeoElement = memo(({ tag = Tag.P, texts }: { tag: Tag, texts: string[] }) => {
  const style = useMemo(() => ({
    position: "absolute" as const,
    width: "0", height: "0", overflow: "hidden", userSelect: "none" as const, pointerEvents: "none" as const,
  }), []);
  const safeTag = Object.values(Tag).includes(tag) ? tag : "p";
  return createElement(safeTag, { style }, texts?.join(" ") ?? "");
});

const handleFontChange = ({
  currentFont, lastFontRef, canvasRef, wrapperSize, particlesRef, globalDpr, currentTextIndex, transformedDensity, framerProps,
}: any) => {
  if (currentFont !== lastFontRef.current) {
    lastFontRef.current = currentFont;
    const timeoutId = setTimeout(() => {
      cleanup({ canvasRef, particlesRef });
      renderCanvas({ framerProps, canvasRef, wrapperSize, particlesRef, globalDpr, currentTextIndex, transformedDensity });
    }, 1000);
    return () => { clearTimeout(timeoutId); cleanup({ canvasRef, particlesRef }); };
  }
  return undefined;
};

const cleanup = ({ canvasRef, particlesRef }: any) => {
  const canvas = canvasRef.current;
  const ctx = canvas?.getContext("2d");
  if (canvas && ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (particlesRef.current) particlesRef.current = [];
};

const renderCanvas = ({
  framerProps, canvasRef, wrapperSize, particlesRef, globalDpr, currentTextIndex, transformedDensity,
}: any) => {
  const canvas = canvasRef.current;
  if (!canvas || !wrapperSize.width || !wrapperSize.height) return;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const { width, height } = wrapperSize;
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  canvas.width = Math.floor(width * globalDpr);
  canvas.height = Math.floor(height * globalDpr);
  
  const getFontForIndexLocal = (index: number) => {
    const text = framerProps.texts[index] || "";
    const baseFont = typeof framerProps.font === "function" 
      ? framerProps.font(text, index) 
      : (framerProps.font || {});
    
    const fontSizeNum = parseInt(baseFont.fontSize?.toString().replace("px", "") || "50");
    const fontStr = `${baseFont.fontWeight ?? 400} ${fontSizeNum * globalDpr}px ${baseFont.fontFamily ?? "Inter, sans-serif"}`;
    return { fontStr, fontSize: fontSizeNum };
  };

  const { fontStr, fontSize } = getFontForIndexLocal(currentTextIndex);
  const color = parseColor(framerProps.color ?? "rgb(255, 255, 255)");
  let textX;
  const textY = canvas.height / 2;
  const currentText = framerProps.texts[currentTextIndex] || "";
  if (framerProps.alignment === "center") textX = canvas.width / 2;
  else if (framerProps.alignment === "left") textX = 0;
  else textX = canvas.width;
  const { particles, textBoundaries } = createParticles(ctx, canvas, currentText, textX, textY, fontStr, color, framerProps.alignment || "center");
  particlesRef.current = particles;
  canvas.textBoundaries = textBoundaries;
};

const createParticles = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, text: string, textX: number, textY: number, font: string, color: string, alignment: "left" | "center" | "right") => {
  const particles: Particle[] = [];
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = color;
  ctx.font = font;
  ctx.textAlign = alignment;
  ctx.textBaseline = "middle";
  ctx.fillText(text, textX, textY);
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  const currentDPR = canvas.width / parseInt(canvas.style.width);
  const sampleRate = Math.max(1, Math.round(currentDPR / 1.5));
  for (let y = 0; y < canvas.height; y += sampleRate) {
    for (let x = 0; x < canvas.width; x += sampleRate) {
      const index = (y * canvas.width + x) * 4;
      const alpha = data[index + 3];
      if (alpha > 0) {
        const originalAlpha = alpha / 255;
        particles.push({
          x, y, originalX: x, originalY: y,
          color: `rgba(${data[index]}, ${data[index + 1]}, ${data[index + 2]}, ${originalAlpha})`,
          opacity: originalAlpha, originalAlpha,
          velocityX: 0, velocityY: 0, angle: 0, speed: 0,
        });
      }
    }
  }
  const metrics = ctx.measureText(text);
  const textWidth = metrics.width;
  let textLeft = alignment === "center" ? textX - textWidth / 2 : alignment === "left" ? textX : textX - textWidth;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  return { particles, textBoundaries: { left: textLeft, right: textLeft + textWidth, width: textWidth } };
};

const updateParticles = (particles: Particle[], vaporizeX: number, deltaTime: number, spread: number, duration: number, direction: string, density: number) => {
  let allParticlesVaporized = true;
  particles.forEach(particle => {
    const shouldVaporize = direction === "left-to-right" ? particle.originalX <= vaporizeX : particle.originalX >= vaporizeX;
    if (shouldVaporize) {
      if (particle.speed === 0) {
        particle.angle = Math.random() * Math.PI * 2;
        particle.speed = (Math.random() * 1 + 0.5) * spread;
        particle.velocityX = Math.cos(particle.angle) * particle.speed;
        particle.velocityY = Math.sin(particle.angle) * particle.speed;
        particle.shouldFadeQuickly = Math.random() > density;
      }
      if (particle.shouldFadeQuickly) {
        particle.opacity = Math.max(0, particle.opacity - deltaTime * 2);
      } else {
        particle.x += particle.velocityX * deltaTime * 20;
        particle.y += particle.velocityY * deltaTime * 10;
        particle.opacity = Math.max(0, particle.opacity - deltaTime * 0.5);
      }
      if (particle.opacity > 0.01) allParticlesVaporized = false;
    } else {
      allParticlesVaporized = false;
    }
  });
  return allParticlesVaporized;
};

const renderParticles = (ctx: CanvasRenderingContext2D, particles: Particle[], globalDpr: number) => {
  ctx.save();
  ctx.scale(globalDpr, globalDpr);
  particles.forEach(particle => {
    if (particle.opacity > 0) {
      const color = particle.color.replace(/[\d.]+\)$/, `${particle.opacity})`);
      ctx.fillStyle = color;
      ctx.fillRect(particle.x / globalDpr, particle.y / globalDpr, 1.2, 1.2);
    }
  });
  ctx.restore();
};

const resetParticles = (particles: Particle[]) => {
  particles.forEach(particle => {
    particle.x = particle.originalX; particle.y = particle.originalY;
    particle.opacity = particle.originalAlpha; particle.speed = 0;
  });
};

const calculateVaporizeSpread = (fontSize: number) => {
  if (fontSize <= 20) return 0.2;
  if (fontSize >= 100) return 1.5;
  return 0.2 + (fontSize - 20) * (1.5 - 0.2) / (100 - 20);
};

const parseColor = (color: string) => {
  const match = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/) || color.match(/rgba\((\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\)/);
  if (match) return `rgba(${match[1]}, ${match[2]}, ${match[3]}, ${match[4] || 1})`;
  return "rgba(255, 255, 255, 1)";
};

function transformValue(input: number, inputRange: number[], outputRange: number[], clamp = false): number {
  const progress = (input - inputRange[0]) / (inputRange[1] - inputRange[0]);
  let result = outputRange[0] + progress * (outputRange[1] - outputRange[0]);
  if (clamp) result = Math.min(Math.max(result, Math.min(...outputRange)), Math.max(...outputRange));
  return result;
}

function useIsInView(ref: React.RefObject<HTMLElement>) {
  const [isInView, setIsInView] = useState(false);
  useEffect(() => {
    if (!ref.current) return;
    const observer = new IntersectionObserver(([entry]) => setIsInView(entry.isIntersecting), { threshold: 0, rootMargin: '50px' });
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [ref]);
  return isInView;
}
