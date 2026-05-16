import { COLS, type BubbleColor, type GridCell, type GridKey, cellKey } from "./types";

export const BUBBLE_DIAMETER = 36;
export const BUBBLE_RADIUS = BUBBLE_DIAMETER / 2;
export const ROW_STEP = BUBBLE_RADIUS * Math.sqrt(3);

export function isValidCell(row: number, col: number): boolean {
  if (row < 0 || col < 0) return false;
  const maxCol = row % 2 === 0 ? COLS - 1 : COLS - 2;
  return col <= maxCol;
}

export function getNeighbors(row: number, col: number): Array<{ row: number; col: number }> {
  const odd = row % 2 === 1;
  const deltas = odd
    ? [
        [-1, 0],
        [-1, 1],
        [0, -1],
        [0, 1],
        [1, 0],
        [1, 1],
      ]
    : [
        [-1, -1],
        [-1, 0],
        [0, -1],
        [0, 1],
        [1, -1],
        [1, 0],
      ];

  return deltas
    .map(([dr, dc]) => ({ row: row + dr, col: col + dc }))
    .filter(({ row: r, col: c }) => isValidCell(r, c));
}

export function cellToWorld(
  row: number,
  col: number,
  originX: number,
  originY: number,
): { x: number; y: number } {
  const offset = row % 2 === 1 ? BUBBLE_RADIUS : 0;
  return {
    x: originX + col * BUBBLE_DIAMETER + offset + BUBBLE_RADIUS,
    y: originY + row * ROW_STEP + BUBBLE_RADIUS,
  };
}

export function worldToNearestCell(
  x: number,
  y: number,
  originX: number,
  originY: number,
): { row: number; col: number } | null {
  const relY = y - originY - BUBBLE_RADIUS;
  const row = Math.max(0, Math.round(relY / ROW_STEP));
  const offset = row % 2 === 1 ? BUBBLE_RADIUS : 0;
  const relX = x - originX - offset - BUBBLE_RADIUS;
  const col = Math.max(0, Math.round(relX / BUBBLE_DIAMETER));

  if (!isValidCell(row, col)) return null;
  return { row, col };
}

export function gridFromPattern(pattern: number[][]): Map<GridKey, GridCell> {
  const grid = new Map<GridKey, GridCell>();
  pattern.forEach((row, rowIndex) => {
    row.forEach((color, colIndex) => {
      if (color < 0) return;
      if (!isValidCell(rowIndex, colIndex)) return;
      grid.set(cellKey(rowIndex, colIndex), {
        row: rowIndex,
        col: colIndex,
        color: color as BubbleColor,
      });
    });
  });
  return grid;
}

export function findSnapCell(
  grid: Map<GridKey, GridCell>,
  hitRow: number,
  hitCol: number,
  incomingColor: BubbleColor,
  impactX: number,
  impactY: number,
  originX: number,
  originY: number,
): { row: number; col: number } | null {
  const candidates: Array<{ row: number; col: number; dist: number }> = [];

  const seedNeighbors = getNeighbors(hitRow, hitCol);
  const seeds =
    grid.has(cellKey(hitRow, hitCol)) || !isValidCell(hitRow, hitCol)
      ? seedNeighbors
      : [{ row: hitRow, col: hitCol }, ...seedNeighbors];

  for (const { row, col } of seeds) {
    if (!isValidCell(row, col)) continue;
    if (grid.has(cellKey(row, col))) continue;
    const pos = cellToWorld(row, col, originX, originY);
    const dist = (pos.x - impactX) ** 2 + (pos.y - impactY) ** 2;
    candidates.push({ row, col, dist });
  }

  if (candidates.length === 0) {
    const fallback = worldToNearestCell(impactX, impactY, originX, originY);
    if (fallback && !grid.has(cellKey(fallback.row, fallback.col))) {
      return fallback;
    }
    return null;
  }

  candidates.sort((a, b) => a.dist - b.dist);
  return { row: candidates[0].row, col: candidates[0].col };
}

export function lowestRow(grid: Map<GridKey, GridCell>): number {
  let max = -1;
  for (const cell of grid.values()) {
    if (cell.row > max) max = cell.row;
  }
  return max;
}
