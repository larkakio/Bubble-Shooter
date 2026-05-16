import { type GridCell, type GridKey, cellKey } from "./types";
import { getNeighbors } from "./grid";

export function findFloatingCells(grid: Map<GridKey, GridCell>): GridCell[] {
  const connected = new Set<GridKey>();
  const queue: GridCell[] = [];

  for (const cell of grid.values()) {
    if (cell.row === 0) {
      queue.push(cell);
    }
  }

  while (queue.length > 0) {
    const cell = queue.shift()!;
    const key = cellKey(cell.row, cell.col);
    if (connected.has(key)) continue;
    connected.add(key);

    for (const n of getNeighbors(cell.row, cell.col)) {
      const nk = cellKey(n.row, n.col);
      const next = grid.get(nk);
      if (next && !connected.has(nk)) {
        queue.push(next);
      }
    }
  }

  const floating: GridCell[] = [];
  for (const cell of grid.values()) {
    if (!connected.has(cellKey(cell.row, cell.col))) {
      floating.push(cell);
    }
  }
  return floating;
}

export function scoreForFloaters(count: number): number {
  return count * 20;
}
