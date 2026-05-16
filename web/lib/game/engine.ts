import { findFloatingCells, scoreForFloaters } from "./floaters";
import {
  BUBBLE_RADIUS,
  ROW_STEP,
  cellToWorld,
  findSnapCell,
  gridFromPattern,
  isValidCell,
  lowestRow,
} from "./grid";
import {
  findMatchesToClear,
  randomColor,
  scoreForMatches,
} from "./matcher";
import {
  BUBBLE_SPEED,
  buildAimPreview,
  findGridCollision,
  normalize,
  type Bounds,
} from "./physics";
import { getLevel } from "./levels";
import {
  type BubbleColor,
  type FallingBubble,
  type FlyingBubble,
  type GamePhase,
  type GridCell,
  type GridKey,
  type PopAnimation,
  cellKey,
} from "./types";

const MIN_AIM_DIST = 24;
const POP_DURATION_MS = 320;

export type EngineLayout = {
  width: number;
  height: number;
  originX: number;
  originY: number;
  launcherX: number;
  launcherY: number;
  dangerY: number;
  bounds: Bounds;
};

export function computeLayout(width: number, height: number): EngineLayout {
  const originX = (width - 9 * 36) / 2 + 4;
  const originY = 56;
  const launcherX = width / 2;
  const launcherY = height - 72;
  const dangerY = launcherY - 100;

  return {
    width,
    height,
    originX,
    originY,
    launcherX,
    launcherY,
    dangerY,
    bounds: {
      left: originX,
      right: originX + 9 * 36,
      top: originY - BUBBLE_RADIUS,
      bottom: height,
    },
  };
}

export class BubbleEngine {
  levelId = 1;
  phase: GamePhase = "idle";
  grid = new Map<GridKey, GridCell>();
  score = 0;
  shotsLeft = 30;
  shotsWithoutMatch = 0;
  currentColor: BubbleColor = 0;
  nextColor: BubbleColor = 1;
  flying: FlyingBubble | null = null;
  pops: PopAnimation[] = [];
  falling: FallingBubble[] = [];
  aimTarget: { x: number; y: number } | null = null;
  layout: EngineLayout;
  maxColors = 3;
  pressureEvery?: number;
  showBounceHint = false;
  private resolveTimer = 0;

  constructor(layout: EngineLayout, levelId = 1) {
    this.layout = layout;
    this.loadLevel(levelId);
  }

  loadLevel(levelId: number) {
    const level = getLevel(levelId);
    this.levelId = level.id;
    this.maxColors = level.colors;
    this.shotsLeft = level.shots;
    this.pressureEvery = level.pressureEvery;
    this.grid = gridFromPattern(level.pattern);
    this.phase = "idle";
    this.flying = null;
    this.pops = [];
    this.falling = [];
    this.shotsWithoutMatch = 0;
    this.currentColor = randomColor(level.colors);
    this.nextColor = randomColor(level.colors);
    this.showBounceHint = level.id === 2;
    this.resolveTimer = 0;
  }

  beginAim(x: number, y: number) {
    if (this.phase !== "idle" && this.phase !== "aiming") return;
    this.phase = "aiming";
    this.aimTarget = { x, y };
  }

  updateAim(x: number, y: number) {
    if (this.phase !== "aiming") return;
    this.aimTarget = { x, y };
  }

  getAimPreview() {
    if (!this.aimTarget) return null;
    const { launcherX, launcherY, bounds } = this.layout;
    return buildAimPreview(
      launcherX,
      launcherY,
      this.aimTarget.x,
      this.aimTarget.y,
      bounds,
    );
  }

  fire() {
    if (this.phase !== "aiming" || !this.aimTarget) return;
    const { launcherX, launcherY } = this.layout;
    const dx = this.aimTarget.x - launcherX;
    const dy = this.aimTarget.y - launcherY;
    if (Math.hypot(dx, dy) < MIN_AIM_DIST) {
      this.phase = "idle";
      this.aimTarget = null;
      return;
    }

    const dir = normalize(dx, dy);
    if (dir.y >= -0.05) {
      dir.y = -0.35;
      const len = Math.hypot(dir.x, dir.y);
      dir.x /= len;
      dir.y /= len;
    }

    this.flying = {
      x: launcherX,
      y: launcherY,
      vx: dir.x * BUBBLE_SPEED,
      vy: dir.y * BUBBLE_SPEED,
      color: this.currentColor,
    };
    this.phase = "flying";
    this.aimTarget = null;
    this.shotsLeft -= 1;
  }

  cancelAim() {
    if (this.phase === "aiming") {
      this.phase = "idle";
      this.aimTarget = null;
    }
  }

  tick(now: number, dt: number) {
    if (this.phase === "flying" && this.flying) {
      this.stepFlying();
    }

    if (this.phase === "resolving") {
      this.pops = this.pops.filter((p) => now - p.startedAt < POP_DURATION_MS);
      this.falling.forEach((b) => {
        b.vy += 0.6;
        b.y += b.vy;
      });
      this.falling = this.falling.filter(
        (b) => b.y < this.layout.height + 40,
      );

      if (this.pops.length === 0 && this.falling.length === 0) {
        this.resolveTimer += dt;
        if (this.resolveTimer > 120) {
          this.resolveTimer = 0;
          this.finishResolution();
        }
      }
    }
  }

  private stepFlying() {
    const f = this.flying!;
    const { bounds, originX, originY } = this.layout;

    for (let i = 0; i < 3; i++) {
      f.x += f.vx;
      f.y += f.vy;

      if (f.x - BUBBLE_RADIUS < bounds.left) {
        f.x = bounds.left + BUBBLE_RADIUS;
        f.vx *= -1;
      }
      if (f.x + BUBBLE_RADIUS > bounds.right) {
        f.x = bounds.right - BUBBLE_RADIUS;
        f.vx *= -1;
      }

      if (f.y - BUBBLE_RADIUS < bounds.top) {
        this.snapFlying(f.x, bounds.top + BUBBLE_RADIUS);
        return;
      }

      const hit = findGridCollision(f.x, f.y, this.grid, originX, originY);
      if (hit) {
        this.snapFlying(f.x, f.y);
        return;
      }
    }
  }

  private snapFlying(impactX: number, impactY: number) {
    const f = this.flying!;
    const { originX, originY } = this.layout;

    const hit = findGridCollision(impactX, impactY, this.grid, originX, originY);
    let snapRow = 0;
    let snapCol = 0;

    if (hit) {
      snapRow = hit.row;
      snapCol = hit.col;
    } else {
      const row = Math.max(
        0,
        Math.round((impactY - originY - BUBBLE_RADIUS) / ROW_STEP),
      );
      snapRow = row;
      snapCol = 4;
    }

    const snap = findSnapCell(
      this.grid,
      snapRow,
      snapCol,
      f.color,
      impactX,
      impactY,
      originX,
      originY,
    );

    if (!snap) {
      this.flying = null;
      this.phase = "idle";
      this.checkLose();
      return;
    }

    this.grid.set(cellKey(snap.row, snap.col), {
      row: snap.row,
      col: snap.col,
      color: f.color,
    });
    this.flying = null;

    const matches = findMatchesToClear(this.grid, snap.row, snap.col);
    const now = performance.now();

    if (matches.length > 0) {
      this.shotsWithoutMatch = 0;
      this.score += scoreForMatches(matches.length);
      for (const m of matches) {
        this.grid.delete(cellKey(m.row, m.col));
        this.pops.push({
          row: m.row,
          col: m.col,
          color: m.color,
          startedAt: now,
        });
      }
    } else {
      this.shotsWithoutMatch += 1;
      if (
        this.pressureEvery &&
        this.shotsWithoutMatch >= this.pressureEvery
      ) {
        this.pushGridDown();
        this.shotsWithoutMatch = 0;
      }
    }

    const floaters = findFloatingCells(this.grid);
    if (floaters.length > 0) {
      this.score += scoreForFloaters(floaters.length);
      for (const cell of floaters) {
        const pos = cellToWorld(cell.row, cell.col, originX, originY);
        this.grid.delete(cellKey(cell.row, cell.col));
        this.falling.push({
          ...cell,
          x: pos.x,
          y: pos.y,
          vy: 2,
        });
      }
    }

    this.currentColor = this.nextColor;
    this.nextColor = randomColor(this.maxColors);

    if (this.grid.size === 0) {
      this.phase = this.levelId >= 10 ? "sectorCleared" : "levelComplete";
      return;
    }

    if (this.pops.length > 0 || this.falling.length > 0) {
      this.phase = "resolving";
      return;
    }

    this.checkLose();
    if (this.phase === "idle" || this.phase === "resolving") {
      this.phase = "idle";
    }
  }

  private pushGridDown() {
    const cells = [...this.grid.values()].sort((a, b) => b.row - a.row);
    this.grid.clear();
    for (const cell of cells) {
      const newRow = cell.row + 1;
      if (isValidCell(newRow, cell.col)) {
        this.grid.set(cellKey(newRow, cell.col), { ...cell, row: newRow });
      }
    }
  }

  private finishResolution() {
    if (this.grid.size === 0) {
      this.phase = this.levelId >= 10 ? "sectorCleared" : "levelComplete";
      return;
    }
    this.checkLose();
    if (this.phase !== "gameOver") {
      this.phase = "idle";
    }
  }

  private checkLose() {
    const { dangerY, originX, originY } = this.layout;
    for (const cell of this.grid.values()) {
      const pos = cellToWorld(cell.row, cell.col, originX, originY);
      if (pos.y >= dangerY) {
        this.phase = "gameOver";
        return;
      }
    }
    if (this.shotsLeft <= 0 && this.grid.size > 0) {
      this.phase = "gameOver";
    }
  }

  advanceLevel(): boolean {
    if (this.levelId >= 10) return false;
    this.loadLevel(this.levelId + 1);
    return true;
  }

  isDangerClose(): boolean {
    const { dangerY, originX, originY } = this.layout;
    const low = lowestRow(this.grid);
    if (low < 0) return false;
    const pos = cellToWorld(low, 4, originX, originY);
    return pos.y >= dangerY - ROW_STEP * 1.5;
  }
}
