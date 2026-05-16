"use client";

import { BubbleCanvas } from "./BubbleCanvas";
import { CheckInPanel } from "./CheckInPanel";
import { WalletBar } from "./WalletBar";
import { loadProgress } from "@/lib/game/levels";
import { useEffect, useState } from "react";

export function GameShell() {
  const [progress, setProgress] = useState({ level: 1, highest: 1, score: 0 });

  useEffect(() => {
    setProgress(loadProgress());
  }, []);

  return (
    <div className="flex h-dvh max-h-dvh flex-col overflow-x-hidden">
      <header className="relative z-10 flex shrink-0 items-start justify-between gap-2 border-b border-cyan-500/20 bg-black/40 px-3 py-2 backdrop-blur-md">
        <div>
          <h1 className="font-display text-sm tracking-[0.35em] text-cyan-300">
            NEON BUBBLE
          </h1>
          <p className="font-mono text-[9px] uppercase tracking-widest text-white/40">
            Shooter Protocol
          </p>
        </div>
        <WalletBar />
      </header>

      <div className="flex shrink-0 gap-2 px-3 py-2">
        <Stat label="LVL" value={String(progress.level).padStart(2, "0")} />
        <Stat label="BEST" value={String(progress.highest).padStart(2, "0")} />
        <Stat label="SYNC" value={String(progress.score)} accent="lime" />
      </div>

      <main className="relative min-h-0 flex-1">
        <BubbleCanvas />
      </main>

      <footer className="shrink-0 space-y-2 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2">
        <CheckInPanel />
        <p className="text-center font-mono text-[9px] text-white/30">
          Swipe on the field to aim · Release to fire
        </p>
      </footer>
    </div>
  );
}

function Stat({
  label,
  value,
  accent = "cyan",
}: {
  label: string;
  value: string;
  accent?: "cyan" | "lime";
}) {
  const color = accent === "lime" ? "text-lime-300" : "text-cyan-300";
  return (
    <div className="hex-panel flex-1 px-2 py-1.5">
      <p className="font-mono text-[8px] tracking-widest text-white/40">{label}</p>
      <p className={`font-mono text-sm ${color}`}>{value}</p>
    </div>
  );
}
