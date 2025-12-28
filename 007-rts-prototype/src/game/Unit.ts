import type { Owner, UnitUpgrades, Vec2 } from "./types";
import type { World } from "./World";
import { clamp, distance } from "./types";

export type UnitState = "idle" | "moving" | "attacking" | "gathering";

export class Unit {
  id: number;
  position: Vec2;
  hp: number;
  maxHp: number;
  speed: number;
  attackRange: number;
  attackDamage: number;
  owner: Owner;
  radius: number;
  state: UnitState;
  moveTarget: Vec2 | null;
  targetUnitId: number | null;
  targetBuildingId: number | null;
  targetResourceId: number | null;
  attackCooldown: number;
  gatherTimer: number;
  baseMaxHp: number;
  baseSpeed: number;
  baseAttackRange: number;
  baseAttackDamage: number;

  constructor(
    id: number,
    position: Vec2,
    owner: Owner,
    upgrades: UnitUpgrades
  ) {
    this.id = id;
    this.position = position;
    this.owner = owner;
    this.baseMaxHp = 100;
    this.baseSpeed = 65;
    this.baseAttackRange = 40;
    this.baseAttackDamage = 12;
    this.maxHp = this.baseMaxHp;
    this.hp = this.baseMaxHp;
    this.speed = this.baseSpeed;
    this.attackRange = this.baseAttackRange;
    this.attackDamage = this.baseAttackDamage;
    this.radius = 8;
    this.state = "idle";
    this.moveTarget = null;
    this.targetUnitId = null;
    this.targetBuildingId = null;
    this.targetResourceId = null;
    this.attackCooldown = 0;
    this.gatherTimer = 0;
    this.applyUpgrades(upgrades);
  }

  setMoveTarget(target: Vec2) {
    this.state = "moving";
    this.moveTarget = { ...target };
    this.targetUnitId = null;
    this.targetBuildingId = null;
    this.targetResourceId = null;
  }

  setAttackTargetUnit(id: number) {
    this.state = "attacking";
    this.targetUnitId = id;
    this.targetBuildingId = null;
    this.targetResourceId = null;
  }

  setAttackTargetBuilding(id: number) {
    this.state = "attacking";
    this.targetUnitId = null;
    this.targetBuildingId = id;
    this.targetResourceId = null;
  }

  setGatherTarget(id: number) {
    this.state = "gathering";
    this.targetResourceId = id;
    this.targetUnitId = null;
    this.targetBuildingId = null;
  }

  update(dt: number, world: World) {
    this.attackCooldown = Math.max(0, this.attackCooldown - dt);

    if (this.state === "attacking") {
      const targetUnit = this.targetUnitId
        ? world.units.find((unit) => unit.id === this.targetUnitId)
        : null;
      const targetBuilding = this.targetBuildingId
        ? world.buildings.find((building) => building.id === this.targetBuildingId)
        : null;
      if (!targetUnit && !targetBuilding) {
        this.state = "idle";
        return;
      }

      const targetPos = targetUnit?.position ?? targetBuilding!.position;
      const dist = distance(this.position, targetPos);

      if (dist > this.attackRange) {
        this.moveTowards(targetPos, dt, world);
      } else if (this.attackCooldown <= 0) {
        if (targetUnit) {
          targetUnit.hp -= this.attackDamage;
        } else if (targetBuilding) {
          targetBuilding.hp -= this.attackDamage;
        }
        this.attackCooldown = 0.8;
      }
      return;
    }

    if (this.state === "gathering") {
      const resource = this.targetResourceId
        ? world.resources.find((node) => node.id === this.targetResourceId)
        : null;
      if (!resource || resource.amount <= 0) {
        this.state = "idle";
        return;
      }
      const dist = distance(this.position, resource.position);
      if (dist > resource.radius + 6) {
        this.moveTowards(resource.position, dt, world);
        return;
      }
      this.gatherTimer += dt;
      if (this.gatherTimer >= 1.1) {
        this.gatherTimer = 0;
        const harvest = Math.min(6, resource.amount);
        resource.amount -= harvest;
        world.addResources(this.owner, harvest);
      }
      return;
    }

    if (this.state === "moving" && this.moveTarget) {
      const dist = distance(this.position, this.moveTarget);
      if (dist <= 2) {
        this.state = "idle";
        this.moveTarget = null;
        return;
      }
      this.moveTowards(this.moveTarget, dt, world);
    }
  }

  private moveTowards(target: Vec2, dt: number, world: World) {
    const dx = target.x - this.position.x;
    const dy = target.y - this.position.y;
    const dist = Math.hypot(dx, dy) || 1;
    const step = Math.min(dist, this.speed * dt);
    this.position.x = clamp(
      this.position.x + (dx / dist) * step,
      world.bounds.left + this.radius,
      world.bounds.right - this.radius
    );
    this.position.y = clamp(
      this.position.y + (dy / dist) * step,
      world.bounds.top + this.radius,
      world.bounds.bottom - this.radius
    );
  }

  applyUpgrades(upgrades: UnitUpgrades) {
    const oldMax = this.maxHp;
    this.attackDamage = this.baseAttackDamage + upgrades.attack * 4;
    this.speed = this.baseSpeed + upgrades.speed * 6;
    this.maxHp = this.baseMaxHp + upgrades.armor * 20;
    if (this.hp < this.maxHp) {
      this.hp = Math.min(this.maxHp, this.hp + (this.maxHp - oldMax));
    }
  }
}
