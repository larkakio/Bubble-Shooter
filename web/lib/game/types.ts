export const COLS = 9;
export const MAX_ROWS = 14;

export type BubbleColor = 0 | 1 | 2 | 3 | 4 | 5;

export type GridCell = {
  row: number;
  col: number;
  color: BubbleColor;
};

export type GridKey = string;

export function cellKey(row: number, col: number): GridKey {
  return `${row},${col}`;
}

export type LevelDefinition = {
  id: number;
  name: string;
  rows: number;
  colors: number;
  shots: number;
  pressureEvery?: number;
  pattern: number[][];
};

export type GamePhase =
  | "idle"
  | "aiming"
  | "flying"
  | "resolving"
  | "levelComplete"
  | "gameOver"
  | "sectorCleared";

export type PopAnimation = {
  row: number;
  col: number;
  color: BubbleColor;
  startedAt: number;
};

export type FallingBubble = {
  row: number;
  col: number;
  color: BubbleColor;
  x: number;
  y: number;
  vy: number;
};

export type FlyingBubble = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: BubbleColor;
};

export const COLOR_PALETTE = [
  { core: "#00F5FF", glow: "#00F5FF", label: "cyan" },
  { core: "#FF00AA", glow: "#FF00AA", label: "magenta" },
  { core: "#B8FF00", glow: "#B8FF00", label: "lime" },
  { core: "#7B2FFF", glow: "#9D5CFF", label: "violet" },
  { core: "#FFB800", glow: "#FFD54F", label: "amber" },
  { core: "#FF3366", glow: "#FF6688", label: "crimson" },
] as const;
