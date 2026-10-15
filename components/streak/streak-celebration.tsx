"use client";

import confetti from "canvas-confetti";

export function triggerStreakCelebration() {
  const count = 200;
  const defaults = {
    origin: { y: 0.7 },
    zIndex: 9999,
  };

  function fire(particleRatio: number, opts: confetti.Options) {
    confetti({
      ...defaults,
      ...opts,
      particleCount: Math.floor(count * particleRatio),
    });
  }

  // Rajadas comemorativas com paleta de fogo e ouro
  fire(0.25, {
    spread: 26,
    startVelocity: 55,
    colors: ["#f97316", "#f59e0b", "#fbbf24"],
  });
  fire(0.2, {
    spread: 60,
    colors: ["#ea580c", "#38bdf8", "#ffffff"],
  });
  fire(0.35, {
    spread: 100,
    decay: 0.91,
    scalar: 0.8,
    colors: ["#fb923c", "#fde047", "#38bdf8"],
  });
  fire(0.1, {
    spread: 120,
    startVelocity: 25,
    decay: 0.92,
    scalar: 1.2,
    colors: ["#f97316", "#ef4444"],
  });
  fire(0.1, {
    spread: 120,
    startVelocity: 45,
    colors: ["#fbbf24", "#38bdf8"],
  });
}
