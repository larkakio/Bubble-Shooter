import { BUBBLE_RADIUS, cellToWorld } from "./grid";
import { type GridCell, type GridKey, cellKey } from "./types";

export type Bounds = {
  left: number;
  right: number;
  top: number;
  bottom: number;
};

export type AimPreview = {
  segments: Array<{ x1: number; y1: number; x2: number; y2: number }>;
};

export function normalize(dx: number, dy: number): { x: number; y: number } {
  const len = Math.hypot(dx, dy) || 1;
  return { x: dx / len, y: dy / len };
}

export function buildAimPreview(
  originX: number,
  originY: number,
  targetX: number,
  targetY: number,
  bounds: Bounds,
  maxBounces = 2,
): AimPreview {
  const dir = normalize(targetX - originX, targetY - originY);
  if (dir.y >= -0.05) {
    dir.y = -0.35;
    const len = Math.hypot(dir.x, dir.y);
    dir.x /= len;
    dir.y /= len;
  }

  const segments: AimPreview["segments"] = [];
  let x = originX;
  let y = originY;
  let vx = dir.x;
  let vy = dir.y;
  let bounces = 0;
  const step = 8;
  const maxSteps = 400;

  for (let i = 0; i < maxSteps; i++) {
    const nx = x + vx * step;
    const ny = y + vy * step;

    if (nx - BUBBLE_RADIUS < bounds.left) {
      const t = (bounds.left + BUBBLE_RADIUS - x) / (nx - x);
      const hitY = y + (ny - y) * t;
      segments.push({ x1: x, y1: y, x2: bounds.left + BUBBLE_RADIUS, y2: hitY });
      x = bounds.left + BUBBLE_RADIUS;
      y = hitY;
      vx *= -1;
      bounces++;
      if (bounces > maxBounces) break;
      continue;
    }

    if (nx + BUBBLE_RADIUS > bounds.right) {
      const t = (bounds.right - BUBBLE_RADIUS - x) / (nx - x);
      const hitY = y + (ny - y) * t;
      segments.push({ x1: x, y1: y, x2: bounds.right - BUBBLE_RADIUS, y2: hitY });
      x = bounds.right - BUBBLE_RADIUS;
      y = hitY;
      vx *= -1;
      bounces++;
      if (bounces > maxBounces) break;
      continue;
    }

    if (ny - BUBBLE_RADIUS < bounds.top) {
      segments.push({ x1: x, y1: y, x2: nx, y2: bounds.top + BUBBLE_RADIUS });
      break;
    }

    x = nx;
    y = ny;
  }

  if (segments.length === 0) {
    segments.push({
      x1: originX,
      y1: originY,
      x2: originX + dir.x * 120,
      y2: originY + dir.y * 120,
    });
  }

  return { segments };
}

export function findGridCollision(
  x: number,
  y: number,
  grid: Map<GridKey, GridCell>,
  originX: number,
  originY: number,
): { row: number; col: number; dist: number } | null {
  let best: { row: number; col: number; dist: number } | null = null;
  const threshold = BUBBLE_RADIUS * 1.85;

  for (const cell of grid.values()) {
    const pos = cellToWorld(cell.row, cell.col, originX, originY);
    const dist = Math.hypot(x - pos.x, y - pos.y);
    if (dist < threshold && (!best || dist < best.dist)) {
      best = { row: cell.row, col: cell.col, dist };
    }
  }
  return best;
}

export const BUBBLE_SPEED = 14;
