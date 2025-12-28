import type { Owner, Vec2 } from "./types";
import type { World } from "./World";
import { distance } from "./types";

export type BuildingType = "base" | "extractor";

export class Building {
  id: number;
  type: BuildingType;
  position: Vec2;
  size: number;
  hp: number;
  owner: Owner;
  queue: number;
  buildTimer: number;
  gatherTimer: number;
  linkedResourceId: number | null;

  constructor(id: number, type: BuildingType, position: Vec2, owner: Owner) {
    this.id = id;
    this.type = type;
    this.position = position;
    this.owner = owner;
    this.size = type === "base" ? 36 : 26;
    this.hp = type === "base" ? 300 : 160;
    this.queue = 0;
    this.buildTimer = 0;
    this.gatherTimer = 0;
    this.linkedResourceId = null;
  }

  enqueueUnit() {
    if (this.type !== "base") return;
    this.queue += 1;
    if (this.buildTimer <= 0) {
      this.buildTimer = 2.5;
    }
  }

  update(dt: number, world: World) {
    if (this.type === "base") {
      this.gatherTimer += dt;
      if (this.gatherTimer >= 2.5) {
        this.gatherTimer = 0;
        world.addResources(this.owner, 5);
      }
      if (this.queue > 0) {
        this.buildTimer -= dt;
        if (this.buildTimer <= 0) {
          world.spawnUnitNear(this.position, this.owner);
          this.queue -= 1;
          this.buildTimer = this.queue > 0 ? 2.5 : 0;
        }
      }
      return;
    }

    if (this.linkedResourceId === null) {
      const nearest = world.findNearestResource(this.position, 90);
      this.linkedResourceId = nearest ? nearest.id : null;
    }

    const resource = this.linkedResourceId
      ? world.resources.find((node) => node.id === this.linkedResourceId)
      : null;

    if (!resource || resource.amount <= 0) {
      return;
    }

    if (distance(this.position, resource.position) > 90) {
      return;
    }

    this.gatherTimer += dt;
    if (this.gatherTimer >= 1.2) {
      this.gatherTimer = 0;
      const harvest = Math.min(10, resource.amount);
      resource.amount -= harvest;
      world.addResources(this.owner, harvest);
    }
  }
}
