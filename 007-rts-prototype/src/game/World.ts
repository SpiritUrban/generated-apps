import { Building } from "./Building";
import { ResourceNode } from "./Resource";
import { Unit } from "./Unit";
import type { Owner, Vec2 } from "./types";
import { distance } from "./types";

export interface WorldBounds {
  left: number;
  right: number;
  top: number;
  bottom: number;
}

export class World {
  width: number;
  height: number;
  tileSize: number;
  units: Unit[];
  buildings: Building[];
  resources: ResourceNode[];
  nextId: number;
  playerResources: number;
  enemyResources: number;
  bounds: WorldBounds;

  constructor(width: number, height: number, tileSize: number) {
    this.width = width;
    this.height = height;
    this.tileSize = tileSize;
    this.units = [];
    this.buildings = [];
    this.resources = [];
    this.nextId = 1;
    this.playerResources = 200;
    this.enemyResources = 200;
    this.bounds = {
      left: 0,
      right: width,
      top: 0,
      bottom: height
    };
  }

  addResources(owner: Owner, amount: number) {
    if (owner === "player") {
      this.playerResources += amount;
    } else {
      this.enemyResources += amount;
    }
  }

  spendResources(owner: Owner, amount: number): boolean {
    if (owner === "player") {
      if (this.playerResources < amount) return false;
      this.playerResources -= amount;
      return true;
    }
    if (this.enemyResources < amount) return false;
    this.enemyResources -= amount;
    return true;
  }

  getBase(owner: Owner) {
    return this.buildings.find(
      (building) => building.owner === owner && building.type === "base"
    );
  }

  spawnUnitNear(position: Vec2, owner: Owner) {
    const offset = (Math.random() - 0.5) * 30;
    const spawnPos = {
      x: position.x + offset,
      y: position.y + offset
    };
    const unit = new Unit(this.nextId++, spawnPos, owner);
    this.units.push(unit);
    return unit;
  }

  addBuilding(type: "base" | "extractor", position: Vec2, owner: Owner) {
    const building = new Building(this.nextId++, type, position, owner);
    this.buildings.push(building);
    return building;
  }

  addResource(position: Vec2, amount: number) {
    const node = new ResourceNode(this.nextId++, position, amount);
    this.resources.push(node);
    return node;
  }

  findNearestResource(position: Vec2, maxDistance: number) {
    let best: ResourceNode | null = null;
    let bestDist = maxDistance;
    for (const node of this.resources) {
      if (node.amount <= 0) continue;
      const dist = distance(position, node.position);
      if (dist < bestDist) {
        best = node;
        bestDist = dist;
      }
    }
    return best;
  }

  findUnitAt(position: Vec2, radius: number, owner?: Owner) {
    return this.units.find((unit) => {
      if (owner && unit.owner !== owner) return false;
      return distance(unit.position, position) <= radius + unit.radius;
    });
  }

  findBuildingAt(position: Vec2, radius: number, owner?: Owner) {
    return this.buildings.find((building) => {
      if (owner && building.owner !== owner) return false;
      return distance(building.position, position) <= radius + building.size / 2;
    });
  }

  update(dt: number) {
    for (const unit of this.units) {
      unit.update(dt, this);
    }

    for (const building of this.buildings) {
      building.update(dt, this);
    }

    this.units = this.units.filter((unit) => unit.hp > 0);
    this.buildings = this.buildings.filter((building) => building.hp > 0);
  }
}
