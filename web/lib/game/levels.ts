import type { LevelDefinition } from "./types";

export const LEVELS: LevelDefinition[] = [
  {
    id: 1,
    name: "Boot Sector",
    rows: 4,
    colors: 3,
    shots: 30,
    pattern: [
      [-1, 0, 0, 0, 0, 0, 0, 0, -1],
      [-1, 1, 1, 1, 1, 1, 1, -1, -1],
      [-1, 0, 0, 1, 0, 0, 1, -1, -1],
      [-1, 1, 0, 1, 0, 1, 0, -1, -1],
    ],
  },
  {
    id: 2,
    name: "Mirror Lane",
    rows: 5,
    colors: 3,
    shots: 28,
    pattern: [
      [-1, 0, 1, 0, 1, 0, 1, 0, -1],
      [-1, 1, 0, 1, 0, 1, 0, -1, -1],
      [-1, 0, 2, 0, 2, 0, 2, -1, -1],
      [-1, 1, 1, 2, 1, 2, -1, -1, -1],
      [-1, 0, 0, 1, 0, 0, 0, -1, -1],
    ],
  },
  {
    id: 3,
    name: "Chromatic Gate",
    rows: 5,
    colors: 4,
    shots: 26,
    pattern: [
      [-1, 0, 1, 2, 3, 2, 1, 0, -1],
      [-1, 1, 2, 3, 0, 3, 2, -1, -1],
      [-1, 0, 3, 1, 2, 1, 3, -1, -1],
      [-1, 2, 0, 2, 3, 0, -1, -1, -1],
      [-1, 1, 1, 0, 2, 0, 1, -1, -1],
    ],
  },
  {
    id: 4,
    name: "Asymmetric Pulse",
    rows: 6,
    colors: 4,
    shots: 25,
    pattern: [
      [-1, 0, 0, 1, 1, 2, 2, 3, -1],
      [-1, 1, 2, 0, 3, 1, 0, -1, -1],
      [-1, 0, 3, 2, 1, 0, 2, -1, -1],
      [-1, 2, 1, 3, 0, 2, -1, -1, -1],
      [-1, 0, 1, 0, 2, 1, 3, -1, -1],
      [-1, 3, 2, 1, 0, 3, -1, -1, -1],
    ],
  },
  {
    id: 5,
    name: "Cluster Storm",
    rows: 6,
    colors: 4,
    shots: 24,
    pattern: [
      [-1, 0, 1, 0, 2, 0, 3, 0, -1],
      [-1, 1, 1, 2, 2, 3, 3, -1, -1],
      [-1, 0, 2, 0, 3, 0, 1, -1, -1],
      [-1, 3, 3, 1, 1, 2, 2, -1, -1],
      [-1, 0, 0, 1, 2, 3, 0, -1, -1],
      [-1, 2, 1, 3, 2, 1, -1, -1, -1],
    ],
  },
  {
    id: 6,
    name: "Pressure Grid",
    rows: 7,
    colors: 5,
    shots: 22,
    pressureEvery: 5,
    pattern: [
      [-1, 0, 1, 2, 3, 4, 3, 2, -1],
      [-1, 4, 3, 2, 1, 0, 4, -1, -1],
      [-1, 0, 2, 4, 1, 3, 0, -1, -1],
      [-1, 1, 3, 0, 4, 2, 1, -1, -1],
      [-1, 2, 0, 1, 3, 4, 2, -1, -1],
      [-1, 4, 1, 2, 0, 3, -1, -1, -1],
      [-1, 0, 3, 4, 1, 0, 2, -1, -1],
    ],
  },
  {
    id: 7,
    name: "Narrow Pockets",
    rows: 7,
    colors: 5,
    shots: 22,
    pressureEvery: 5,
    pattern: [
      [-1, 0, -1, 1, -1, 2, -1, 3, -1],
      [-1, 4, 0, 4, 1, 4, 2, -1, -1],
      [-1, -1, 3, 0, 3, 1, 3, -1, -1],
      [-1, 2, 4, 2, 4, 2, -1, -1, -1],
      [-1, -1, 1, 3, 1, 3, 1, -1, -1],
      [-1, 0, 2, 0, 2, 0, 2, -1, -1],
      [-1, 4, 3, 4, 3, 4, -1, -1, -1],
    ],
  },
  {
    id: 8,
    name: "Dense Ceiling",
    rows: 8,
    colors: 5,
    shots: 20,
    pressureEvery: 4,
    pattern: [
      [-1, 0, 1, 2, 3, 4, 3, 2, -1],
      [-1, 4, 3, 2, 1, 0, 4, 3, -1],
      [-1, 0, 2, 4, 1, 3, 0, 2, -1],
      [-1, 1, 3, 0, 4, 2, 1, 4, -1],
      [-1, 2, 0, 1, 3, 4, 2, 0, -1],
      [-1, 4, 1, 2, 0, 3, 4, 1, -1],
      [-1, 0, 3, 4, 1, 0, 2, 3, -1],
      [-1, 2, 1, 3, 2, 1, 3, 2, -1],
    ],
  },
  {
    id: 9,
    name: "Neon Siege",
    rows: 8,
    colors: 5,
    shots: 18,
    pressureEvery: 4,
    pattern: [
      [-1, 0, 1, 2, 3, 4, 0, 1, -1],
      [-1, 2, 3, 4, 0, 1, 2, 3, -1],
      [-1, 4, 0, 1, 2, 3, 4, 0, -1],
      [-1, 1, 3, 0, 4, 2, 1, 4, -1],
      [-1, 3, 1, 4, 0, 2, 3, 1, -1],
      [-1, 0, 2, 1, 3, 4, 0, 2, -1],
      [-1, 4, 3, 2, 1, 0, 4, 3, -1],
      [-1, 1, 0, 3, 2, 4, 1, 0, -1],
    ],
  },
  {
    id: 10,
    name: "Final Sector",
    rows: 9,
    colors: 6,
    shots: 16,
    pressureEvery: 4,
    pattern: [
      [-1, 0, 1, 2, 3, 4, 5, 4, -1],
      [-1, 5, 4, 3, 2, 1, 0, 5, -1],
      [-1, 0, 2, 4, 5, 3, 1, 0, -1],
      [-1, 1, 3, 5, 0, 4, 2, 1, -1],
      [-1, 2, 4, 0, 1, 5, 3, 2, -1],
      [-1, 3, 5, 1, 2, 0, 4, 3, -1],
      [-1, 4, 0, 2, 3, 1, 5, 4, -1],
      [-1, 5, 1, 3, 4, 2, 0, 5, -1],
      [-1, 0, 5, 4, 3, 2, 1, 0, -1],
    ],
  },
];

export function getLevel(id: number): LevelDefinition {
  return LEVELS.find((l) => l.id === id) ?? LEVELS[0];
}

export const STORAGE_KEY = "neon-bubble-shooter-progress";

export function loadProgress(): { level: number; highest: number; score: number } {
  if (typeof window === "undefined") {
    return { level: 1, highest: 1, score: 0 };
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { level: 1, highest: 1, score: 0 };
    return JSON.parse(raw) as { level: number; highest: number; score: number };
  } catch {
    return { level: 1, highest: 1, score: 0 };
  }
}

export function saveProgress(level: number, highest: number, score: number) {
  if (typeof window === "undefined") return;
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({ level, highest, score }),
  );
}
