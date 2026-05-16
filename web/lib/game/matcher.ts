import { type BubbleColor, type GridCell, type GridKey, cellKey } from "./types";
import { getNeighbors } from "./grid";

export function findMatchGroup(
  grid: Map<GridKey, GridCell>,
  startRow: number,
  startCol: number,
): GridCell[] {
  const start = grid.get(cellKey(startRow, startCol));
  if (!start) return [];

  const color = start.color;
  const visited = new Set<GridKey>();
  const group: GridCell[] = [];
  const stack: GridCell[] = [start];

  while (stack.length > 0) {
    const cell = stack.pop()!;
    const key = cellKey(cell.row, cell.col);
    if (visited.has(key)) continue;
    visited.add(key);

    const current = grid.get(key);
    if (!current || current.color !== color) continue;

    group.push(current);
    for (const n of getNeighbors(cell.row, cell.col)) {
      const nk = cellKey(n.row, n.col);
      if (!visited.has(nk) && grid.has(nk)) {
        const next = grid.get(nk)!;
        if (next.color === color) stack.push(next);
      }
    }
  }

  return group;
}

export function findMatchesToClear(
  grid: Map<GridKey, GridCell>,
  placedRow: number,
  placedCol: number,
): GridCell[] {
  const group = findMatchGroup(grid, placedRow, placedCol);
  return group.length >= 3 ? group : [];
}

export function scoreForMatches(count: number): number {
  return count * 10 + Math.max(0, count - 3) * 15;
}

export function randomColor(maxColors: number): BubbleColor {
  return Math.floor(Math.random() * maxColors) as BubbleColor;
}
