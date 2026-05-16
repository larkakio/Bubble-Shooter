import { describe, expect, it } from "vitest";
import { findMatchGroup, findMatchesToClear } from "./matcher";
import { cellKey, type GridCell } from "./types";

function grid(cells: GridCell[]) {
  const map = new Map();
  for (const c of cells) {
    map.set(cellKey(c.row, c.col), c);
  }
  return map;
}

describe("matcher", () => {
  it("finds groups of 3+", () => {
    const g = grid([
      { row: 0, col: 0, color: 0 },
      { row: 0, col: 1, color: 0 },
      { row: 0, col: 2, color: 0 },
    ]);
    const matches = findMatchesToClear(g, 0, 1);
    expect(matches).toHaveLength(3);
  });

  it("returns empty for pair only", () => {
    const g = grid([
      { row: 0, col: 0, color: 1 },
      { row: 0, col: 1, color: 1 },
    ]);
    expect(findMatchesToClear(g, 0, 0)).toHaveLength(0);
  });

  it("findMatchGroup uses flood fill", () => {
    const g = grid([
      { row: 0, col: 0, color: 2 },
      { row: 0, col: 1, color: 2 },
      { row: 1, col: 0, color: 2 },
    ]);
    expect(findMatchGroup(g, 0, 0)).toHaveLength(3);
  });
});
