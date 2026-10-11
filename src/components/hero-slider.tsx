import { useCallback, useEffect, useRef, useState } from "react";

import { ChevronLeft, ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";

import slide1 from "@/assets/slide-1.jpg";
import slide2 from "@/assets/slide-2.jpg";
import slide3 from "@/assets/slide-3.jpg";
import slide4 from "@/assets/slide-4.jpg";
import slide5 from "@/assets/slide-5.jpg";

const slides = [
  {
    image: slide1,
    title: "Know your medicine is real before you take it",
    body: "Point your camera at the QR code on any registered pack and get an instant authenticity result.",
  },
  {
    image: slide2,
    title: "One serialised QR code for every product record",
    body: "Manufacturers register a drug once; the system mints a unique identifier that cannot be guessed.",
  },
  {
    image: slide3,
    title: "Authentication that starts at the factory",
    body: "Batch numbers, NAFDAC registration and expiry dates are captured at source and locked to the code.",
  },
  {
    image: slide4,
    title: "Genuine, expired, recalled or counterfeit",
    body: "A clear verdict in under a second, with the full product record shown alongside it.",
  },
  {
    image: slide5,
    title: "Anomalies surfaced to regulators in real time",
    body: "Abnormal scan frequency on a single pack is flagged automatically for administrator review.",
  },
];

const INTERVAL = 5200;

export function HeroSlider() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const go = useCallback((next: number) => {
    setIndex((next + slides.length) % slides.length);
  }, []);

  useEffect(() => {
    if (paused) return;

    timer.current = setInterval(() => {
      setIndex((i) => (i + 1) % slides.length);
    }, INTERVAL);

    return () => {
      if (timer.current) {
        clearInterval(timer.current);
      }
    };
  }, [paused]);

  return (
    <section
      className="relative h-[92svh] min-h-[560px] w-full overflow-hidden bg-ink"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-roledescription="carousel"
    >
      {/* SLIDES */}
      {slides.map((slide, i) => (
        <div
          key={slide.image}
          className={cn(
            "absolute inset-0 transition-opacity duration-[1200ms] ease-out",
            i === index
              ? "opacity-100"
              : "pointer-events-none opacity-0"
          )}
          aria-hidden={i !== index}
        >
          <img
            src={slide.image}
            alt={slide.title}
            width={1920}
            height={1080}
            {...(i === 0 ? {} : { loading: "lazy" as const })}
            className={cn(
              "size-full object-cover",
              i === index && "animate-ken"
            )}
          />

          {/* Dark overlay for better text visibility */}
          <div className="absolute inset-0 bg-gradient-to-r from-ink/80 via-ink/60 to-ink/70" />

          <div className="absolute inset-0 bg-gradient-to-t from-ink via-transparent to-ink/40" />
        </div>
      ))}

      {/* ANIMATED SCAN LINE */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="animate-scanline absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-primary to-transparent opacity-70" />
      </div>

      {/* CENTERED HERO CONTENT */}
      <div className="relative z-10 mx-auto flex h-full max-w-7xl items-center justify-center px-5 pt-20 text-center">
        <div
          key={index}
          className="mx-auto flex max-w-4xl flex-col items-center"
        >
          {/* TITLE */}
          <h1
            className="animate-slide-up text-4xl leading-[1.05] font-bold text-ink-foreground sm:text-5xl lg:text-6xl xl:text-7xl"
          >
            {slides[index]!.title}
          </h1>

          {/* DESCRIPTION */}
          <p
            className="animate-slide-up mt-6 max-w-2xl text-base leading-relaxed text-ink-foreground/80 sm:text-lg lg:text-xl"
            style={{ animationDelay: "180ms" }}
          >
            {slides[index]!.body}
          </p>
        </div>
      </div>

      {/* SLIDER CONTROLS */}
      <div className="absolute inset-x-0 bottom-8 z-20 mx-auto flex max-w-7xl items-center justify-between px-5">
        {/* SLIDE INDICATORS */}
        <div className="flex items-center gap-2">
          {slides.map((slide, i) => (
            <button
              key={slide.image}
              onClick={() => go(i)}
              aria-label={`Go to slide ${i + 1}`}
              className={cn(
                "h-1.5 rounded-full transition-all duration-500",
                i === index
                  ? "w-12 bg-primary"
                  : "w-5 bg-white/30 hover:bg-white/60"
              )}
            />
          ))}
        </div>

        {/* PREVIOUS / NEXT */}
        <div className="flex gap-2">
          <button
            onClick={() => go(index - 1)}
            aria-label="Previous slide"
            className="grid size-10 place-items-center rounded-full border border-white/20 bg-white/5 text-ink-foreground backdrop-blur transition hover:bg-white/15"
          >
            <ChevronLeft className="size-5" />
          </button>

          <button
            onClick={() => go(index + 1)}
            aria-label="Next slide"
            className="grid size-10 place-items-center rounded-full border border-white/20 bg-white/5 text-ink-foreground backdrop-blur transition hover:bg-white/15"
          >
            <ChevronRight className="size-5" />
          </button>
        </div>
      </div>
    </section>
  );
} 