import type { Point } from "../types";

export const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

export const clamp01 = (value: number) => clamp(value, 0, 1);

export const normalizeSigned = (value: number) => clamp(value, -1, 1);

export const normalizeToUnit = (value: number) => clamp01((value + 1) / 2);

export const distance = (a: Point, b: Point) =>
  Math.hypot(a.x - b.x, a.y - b.y);

export const pathLength = (points: Point[]) => {
  if (points.length < 2) return 0;
  let total = 0;
  for (let i = 1; i < points.length; i += 1) {
    total += distance(points[i - 1], points[i]);
  }
  return total;
};

export const countDirectionChanges = (points: Point[], threshold = 2) => {
  if (points.length < 3) return 0;
  let changes = 0;
  let lastSignX = 0;
  let lastSignY = 0;

  for (let i = 1; i < points.length; i += 1) {
    const dx = points[i].x - points[i - 1].x;
    const dy = points[i].y - points[i - 1].y;
    if (Math.abs(dx) < threshold && Math.abs(dy) < threshold) continue;

    const signX = Math.sign(dx);
    const signY = Math.sign(dy);
    if (lastSignX && signX && signX !== lastSignX) changes += 1;
    if (lastSignY && signY && signY !== lastSignY) changes += 1;
    lastSignX = signX || lastSignX;
    lastSignY = signY || lastSignY;
  }

  return changes;
};

export const countReturnsToTarget = (points: Point[], target: Point) => {
  if (points.length < 3) return 0;
  const distances = points.map((p) => distance(p, target));
  let returns = 0;
  let lastTrend = 0;

  for (let i = 1; i < distances.length; i += 1) {
    const delta = distances[i] - distances[i - 1];
    const trend = Math.sign(delta);
    if (lastTrend < 0 && trend > 0) returns += 1;
    if (trend !== 0) lastTrend = trend;
  }

  return returns;
};

export const average = (values: number[]) =>
  values.length === 0
    ? 0
    : values.reduce((sum, value) => sum + value, 0) / values.length;
