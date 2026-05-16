"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { BubbleEngine, computeLayout } from "@/lib/game/engine";
import { BUBBLE_RADIUS, cellToWorld } from "@/lib/game/grid";
import { getLevel, loadProgress, saveProgress } from "@/lib/game/levels";
import { COLOR_PALETTE } from "@/lib/game/types";

type Overlay =
  | null
  | "levelComplete"
  | "gameOver"
  | "sectorCleared";

function drawBubble(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  colorIndex: number,
  glow: number,
  scale = 1,
  alpha = 1,
) {
  const palette = COLOR_PALETTE[colorIndex] ?? COLOR_PALETTE[0];
  const r = BUBBLE_RADIUS * scale;
  ctx.save();
  ctx.globalAlpha = alpha;

  const grad = ctx.createRadialGradient(x - r * 0.3, y - r * 0.3, r * 0.1, x, y, r);
  grad.addColorStop(0, "#ffffff");
  grad.addColorStop(0.35, palette.core);
  grad.addColorStop(1, "#050508");

  ctx.shadowColor = palette.glow;
  ctx.shadowBlur = 12 + glow * 8;
  ctx.beginPath();
  ctx.arc(x, y, r - 1, 0, Math.PI * 2);
  ctx.fillStyle = grad;
  ctx.fill();

  ctx.strokeStyle = palette.glow;
  ctx.lineWidth = 1.5;
  ctx.globalAlpha = alpha * (0.6 + glow * 0.3);
  ctx.stroke();
  ctx.restore();
}

export function BubbleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<BubbleEngine | null>(null);
  const rafRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const [overlay, setOverlay] = useState<Overlay>(null);
  const overlayRef = useRef<Overlay>(null);
  const [hud, setHud] = useState({
    level: 1,
    score: 0,
    shots: 30,
    name: "Boot Sector",
  });
  const [bounceHint, setBounceHint] = useState(false);

  const syncHud = useCallback((engine: BubbleEngine) => {
    const level = getLevel(engine.levelId);
    setHud({
      level: engine.levelId,
      score: engine.score,
      shots: engine.shotsLeft,
      name: level.name,
    });
    setBounceHint(engine.showBounceHint);
  }, []);

  const initEngine = useCallback((width: number, height: number) => {
    const progress = loadProgress();
    const layout = computeLayout(width, height);
    const engine = new BubbleEngine(layout, progress.level);
    engine.score = progress.score;
    engineRef.current = engine;
    syncHud(engine);
    return engine;
  }, [syncHud]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const engine = initEngine(rect.width, rect.height);
      engineRef.current = engine;
    };

    resize();
    window.addEventListener("resize", resize);

    const loop = (now: number) => {
      const engine = engineRef.current;
      const ctx = canvas.getContext("2d");
      if (!engine || !ctx) {
        rafRef.current = requestAnimationFrame(loop);
        return;
      }

      const dt = lastTimeRef.current ? now - lastTimeRef.current : 16;
      lastTimeRef.current = now;
      engine.tick(now, dt);

      const rect = canvas.getBoundingClientRect();
      drawFrame(ctx, engine, now, rect.width, rect.height);

      if (engine.phase === "levelComplete" && overlayRef.current !== "levelComplete") {
        overlayRef.current = "levelComplete";
        setOverlay("levelComplete");
        const progress = loadProgress();
        const nextLevel = engine.levelId + 1;
        saveProgress(
          nextLevel,
          Math.max(progress.highest, nextLevel),
          engine.score,
        );
        window.setTimeout(() => {
          if (engineRef.current?.phase === "levelComplete") {
            engineRef.current.advanceLevel();
            setOverlay(null);
            syncHud(engineRef.current);
          }
        }, 1400);
      } else if (engine.phase === "sectorCleared" && overlayRef.current !== "sectorCleared") {
        overlayRef.current = "sectorCleared";
        setOverlay("sectorCleared");
        saveProgress(10, 10, engine.score);
      } else if (engine.phase === "gameOver" && overlayRef.current !== "gameOver") {
        overlayRef.current = "gameOver";
        setOverlay("gameOver");
        saveProgress(engine.levelId, loadProgress().highest, engine.score);
      }

      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(rafRef.current);
    };
  }, [initEngine, syncHud]);

  function drawFrame(
    ctx: CanvasRenderingContext2D,
    engine: BubbleEngine,
    now: number,
    width: number,
    height: number,
  ) {
    const { originX, originY, launcherX, launcherY, dangerY } = engine.layout;
    const glow = 0.5 + 0.5 * Math.sin(now / 400);

    ctx.clearRect(0, 0, width, height);

    ctx.strokeStyle = "rgba(255, 51, 102, 0.35)";
    ctx.setLineDash([6, 8]);
    ctx.beginPath();
    ctx.moveTo(originX, dangerY);
    ctx.lineTo(originX + 9 * 36, dangerY);
    ctx.stroke();
    ctx.setLineDash([]);

    for (const cell of engine.grid.values()) {
      const pos = cellToWorld(cell.row, cell.col, originX, originY);
      drawBubble(ctx, pos.x, pos.y, cell.color, glow);
    }

    for (const pop of engine.pops) {
      const pos = cellToWorld(pop.row, pop.col, originX, originY);
      const t = (now - pop.startedAt) / 320;
      drawBubble(ctx, pos.x, pos.y, pop.color, glow, 1 + t * 0.5, 1 - t);
    }

    for (const b of engine.falling) {
      drawBubble(ctx, b.x, b.y, b.color, glow);
    }

    if (engine.flying) {
      drawBubble(ctx, engine.flying.x, engine.flying.y, engine.flying.color, glow);
    } else {
      drawBubble(ctx, launcherX, launcherY, engine.currentColor, glow);
    }

    const nextX = launcherX + 44;
    drawBubble(ctx, nextX, launcherY + 8, engine.nextColor, glow * 0.7, 0.65);

    const preview = engine.getAimPreview();
    if (preview && engine.phase === "aiming") {
      ctx.strokeStyle = "rgba(0, 245, 255, 0.75)";
      ctx.lineWidth = 2;
      ctx.shadowColor = "#00F5FF";
      ctx.shadowBlur = 10;
      for (const seg of preview.segments) {
        ctx.beginPath();
        ctx.moveTo(seg.x1, seg.y1);
        ctx.lineTo(seg.x2, seg.y2);
        ctx.stroke();
      }
      ctx.shadowBlur = 0;
    }
  }

  function pointerPos(e: React.PointerEvent) {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }

  function onPointerDown(e: React.PointerEvent) {
    const engine = engineRef.current;
    if (!engine || engine.phase !== "idle") return;
    canvasRef.current?.setPointerCapture(e.pointerId);
    const p = pointerPos(e);
    engine.beginAim(p.x, p.y);
  }

  function onPointerMove(e: React.PointerEvent) {
    const engine = engineRef.current;
    if (!engine || engine.phase !== "aiming") return;
    const p = pointerPos(e);
    engine.updateAim(p.x, p.y);
  }

  function onPointerUp(e: React.PointerEvent) {
    const engine = engineRef.current;
    if (!engine) return;
    if (engine.phase === "aiming") {
      engine.fire();
      syncHud(engine);
    }
    canvasRef.current?.releasePointerCapture(e.pointerId);
  }

  function advanceLevel() {
    const engine = engineRef.current;
    if (!engine) return;
    engine.advanceLevel();
    overlayRef.current = null;
    setOverlay(null);
    syncHud(engine);
  }

  function restartLevel() {
    const engine = engineRef.current;
    if (!engine) return;
    engine.loadLevel(engine.levelId);
    overlayRef.current = null;
    setOverlay(null);
    syncHud(engine);
  }

  function restartCampaign() {
    const engine = engineRef.current;
    if (!engine) return;
    saveProgress(1, loadProgress().highest, 0);
    engine.loadLevel(1);
    engine.score = 0;
    overlayRef.current = null;
    setOverlay(null);
    syncHud(engine);
  }

  return (
    <div className="relative flex h-full min-h-0 flex-1 flex-col">
      <canvas
        ref={canvasRef}
        className="h-full w-full touch-none"
        style={{ touchAction: "none" }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={() => engineRef.current?.cancelAim()}
      />

      {bounceHint && (
        <div className="pointer-events-none absolute left-1/2 top-20 -translate-x-1/2 rounded border border-cyan-500/30 bg-black/60 px-3 py-1 font-mono text-[10px] text-cyan-200">
          Swipe to aim — bounce off walls
        </div>
      )}

      {overlay === "levelComplete" && (
        <OverlayCard
          title="Level Complete"
          subtitle={`Sector ${hud.level} cleared`}
          primaryLabel="Next Level"
          onPrimary={() => {
            setTimeout(advanceLevel, 50);
          }}
        />
      )}

      {overlay === "gameOver" && (
        <OverlayCard
          title="Grid Breach"
          subtitle="The neon field collapsed"
          primaryLabel="Retry Level"
          onPrimary={restartLevel}
        />
      )}

      {overlay === "sectorCleared" && (
        <OverlayCard
          title="Sector Cleared"
          subtitle="All 10 sectors synchronized"
          primaryLabel="Restart Campaign"
          onPrimary={restartCampaign}
        />
      )}
    </div>
  );
}

function OverlayCard({
  title,
  subtitle,
  primaryLabel,
  onPrimary,
}: {
  title: string;
  subtitle: string;
  primaryLabel: string;
  onPrimary: () => void;
}) {
  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/75 backdrop-blur-sm">
      <div className="hex-panel mx-4 max-w-sm p-6 text-center">
        <h2 className="font-display text-xl tracking-widest text-cyan-300">{title}</h2>
        <p className="mt-2 font-mono text-xs text-white/60">{subtitle}</p>
        <button
          type="button"
          onClick={onPrimary}
          className="mt-6 w-full rounded border border-magenta-400/50 bg-magenta-500/15 py-3 font-mono text-xs uppercase tracking-[0.25em] text-magenta-100 shadow-[0_0_20px_rgba(255,0,170,0.3)]"
        >
          {primaryLabel}
        </button>
      </div>
    </div>
  );
}
