import { describe, expect, it } from "vitest";
import { findFloatingCells } from "./floaters";
import { cellKey, type GridCell } from "./types";

function grid(cells: GridCell[]) {
  const map = new Map();
  for (const c of cells) {
    map.set(cellKey(c.row, c.col), c);
  }
  return map;
}

describe("floaters", () => {
  it("detects disconnected cluster", () => {
    const g = grid([
      { row: 0, col: 0, color: 0 },
      { row: 2, col: 2, color: 1 },
    ]);
    const floating = findFloatingCells(g);
    expect(floating).toHaveLength(1);
    expect(floating[0].row).toBe(2);
  });

  it("keeps bubbles connected to ceiling", () => {
    const g = grid([
      { row: 0, col: 0, color: 0 },
      { row: 1, col: 0, color: 0 },
    ]);
    expect(findFloatingCells(g)).toHaveLength(0);
  });
});
