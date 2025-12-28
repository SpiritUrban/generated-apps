export type Owner = "player" | "enemy";

export interface Vec2 {
  x: number;
  y: number;
}

export const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, value));

export const distance = (a: Vec2, b: Vec2) =>
  Math.hypot(a.x - b.x, a.y - b.y);
