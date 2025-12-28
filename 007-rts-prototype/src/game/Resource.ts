import type { Vec2 } from "./types";

export class ResourceNode {
  id: number;
  position: Vec2;
  amount: number;
  radius: number;

  constructor(id: number, position: Vec2, amount: number) {
    this.id = id;
    this.position = position;
    this.amount = amount;
    this.radius = 14;
  }
}
