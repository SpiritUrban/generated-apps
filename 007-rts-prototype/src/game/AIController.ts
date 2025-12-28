import type { World } from "./World";
import type { Owner, Vec2 } from "./types";

type AIState = "scout" | "gather" | "attack";

export class AIController {
  state: AIState;
  stateTimer: number;
  waveTimer: number;
  scoutTarget: Vec2 | null;

  constructor() {
    this.state = "scout";
    this.stateTimer = 0;
    this.waveTimer = 0;
    this.scoutTarget = null;
  }

  update(dt: number, world: World) {
    this.stateTimer += dt;
    this.waveTimer += dt;

    const enemyBase = world.getBase("enemy");
    if (!enemyBase) return;

    if (this.state === "scout") {
      if (!this.scoutTarget) {
        this.scoutTarget = {
          x: world.width * 0.4 + Math.random() * world.width * 0.2,
          y: world.height * 0.4 + Math.random() * world.height * 0.2
        };
      }

      const scout = world.units.find((unit) => unit.owner === "enemy");
      if (scout && this.scoutTarget) {
        scout.setMoveTarget(this.scoutTarget);
      }

      if (this.stateTimer > 10) {
        this.transition("gather");
      }
      return;
    }

    if (this.state === "gather") {
      this.ensureExtractor(world, enemyBase.position);
      this.ensureProduction(world, "enemy");

      if (this.stateTimer > 18 || world.enemyResources > 280) {
        this.transition("attack");
      }
      return;
    }

    if (this.state === "attack") {
      this.ensureProduction(world, "enemy");

      if (this.waveTimer > 6) {
        this.waveTimer = 0;
        this.sendWave(world);
      }
      return;
    }
  }

  private transition(next: AIState) {
    this.state = next;
    this.stateTimer = 0;
    this.waveTimer = 0;
  }

  private ensureProduction(world: World, owner: Owner) {
    const base = world.getBase(owner);
    if (!base) return;

    if (base.queue < 2 && world.spendResources(owner, 50)) {
      base.enqueueUnit();
    }
  }

  private ensureExtractor(world: World, basePos: Vec2) {
    const hasExtractor = world.buildings.some(
      (building) => building.owner === "enemy" && building.type === "extractor"
    );
    if (hasExtractor) return;

    const resource = world.findNearestResource(basePos, 200);
    if (!resource) return;

    if (!world.spendResources("enemy", 100)) return;

    world.addBuilding(
      "extractor",
      { x: resource.position.x + 40, y: resource.position.y + 20 },
      "enemy"
    );
  }

  private sendWave(world: World) {
    const playerBase = world.getBase("player");
    if (!playerBase) return;

    for (const unit of world.units) {
      if (unit.owner !== "enemy") continue;
      unit.setAttackTargetBuilding(playerBase.id);
    }
  }
}
