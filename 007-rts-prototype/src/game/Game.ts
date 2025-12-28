import { AIController } from "./AIController";
import { World } from "./World";
import { Mouse } from "../input/mouse";
import { SelectionManager } from "../input/selection";
import { renderWorld } from "../render/renderWorld";
import { renderUnits } from "../render/renderUnits";
import { renderUI } from "../render/renderUI";
import type { Vec2 } from "./types";

interface HUDRefs {
  resourcePanel: HTMLDivElement;
  selectionPanel: HTMLDivElement;
  buildUnitBtn: HTMLButtonElement;
  buildExtractorBtn: HTMLButtonElement;
}

type BuildMode = "extractor" | "base" | null;

export class Game {
  private ctx: CanvasRenderingContext2D;
  private world: World;
  private ai: AIController;
  private mouse: Mouse;
  private selection: SelectionManager;
  private lastTime = 0;
  private running = false;
  private buildMode: BuildMode = null;
  private requestBuildUnit = false;
  private message: string | null = null;

  constructor(
    private canvas: HTMLCanvasElement,
    private hud: HUDRefs
  ) {
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      throw new Error("Canvas 2D context missing");
    }
    this.ctx = ctx;
    this.world = new World(960, 540, 32);
    this.ai = new AIController();
    this.mouse = new Mouse(canvas);
    this.selection = new SelectionManager();

    this.bindUI();
    this.resize();
    this.initWorld();
  }

  start() {
    this.running = true;
    requestAnimationFrame((ts) => this.loop(ts));
  }

  private bindUI() {
    this.hud.buildUnitBtn.addEventListener("click", () => {
      this.requestBuildUnit = true;
    });

    this.hud.buildExtractorBtn.addEventListener("click", () => {
      this.buildMode = "extractor";
    });

    window.addEventListener("keydown", (event) => {
      if (event.key.toLowerCase() === "b") {
        this.buildMode = "base";
      }
    });

    window.addEventListener("resize", () => this.resize());
  }

  private resize() {
    const rect = this.canvas.getBoundingClientRect();
    this.canvas.width = rect.width;
    this.canvas.height = rect.height;
    this.world.width = rect.width;
    this.world.height = rect.height;
    this.world.bounds = {
      left: 0,
      right: rect.width,
      top: 0,
      bottom: rect.height
    };
  }

  private initWorld() {
    const padding = 80;
    const playerBasePos = { x: padding, y: this.world.height - padding };
    const enemyBasePos = { x: this.world.width - padding, y: padding };

    this.world.addBuilding("base", playerBasePos, "player");
    this.world.addBuilding("base", enemyBasePos, "enemy");

    for (let i = 0; i < 3; i += 1) {
      this.world.spawnUnitNear(playerBasePos, "player");
      this.world.spawnUnitNear(enemyBasePos, "enemy");
    }

    const center = { x: this.world.width / 2, y: this.world.height / 2 };
    for (let i = 0; i < 5; i += 1) {
      this.world.addResource(
        {
          x: center.x + (Math.random() - 0.5) * 260,
          y: center.y + (Math.random() - 0.5) * 200
        },
        180
      );
    }

    this.world.addResource(
      { x: playerBasePos.x + 120, y: playerBasePos.y - 80 },
      160
    );
    this.world.addResource(
      { x: enemyBasePos.x - 120, y: enemyBasePos.y + 80 },
      160
    );
  }

  private loop(timestamp: number) {
    if (!this.running) return;
    const dt = Math.min(0.05, (timestamp - this.lastTime) / 1000 || 0);
    this.lastTime = timestamp;

    this.update(dt);
    this.render();

    requestAnimationFrame((ts) => this.loop(ts));
  }

  private update(dt: number) {
    if (!this.message) {
      this.handleBuildRequests();
      this.handleInput();
      this.ai.update(dt, this.world);
      this.world.update(dt);
      this.checkEndConditions();
    }

    this.updateHUD();
    this.mouse.beginFrame();
  }

  private handleBuildRequests() {
    if (this.requestBuildUnit) {
      const base = this.world.getBase("player");
      if (base && this.world.spendResources("player", 50)) {
        base.enqueueUnit();
      }
      this.requestBuildUnit = false;
    }
  }

  private handleInput() {
    if (this.buildMode) {
      if (this.mouse.leftReleased) {
        const placed = this.tryPlaceBuilding(
          this.buildMode,
          { x: this.mouse.x, y: this.mouse.y },
          "player"
        );
        if (placed) {
          this.buildMode = null;
        }
        this.mouse.clearDrag();
      }
      return;
    }

    this.selection.update(this.world, this.mouse);

    if (this.mouse.rightReleased && this.selection.selectedUnitIds.size > 0) {
      const clickPos = { x: this.mouse.x, y: this.mouse.y };
      const enemyUnit = this.world.findUnitAt(clickPos, 12, "enemy");
      const enemyBuilding = this.world.findBuildingAt(clickPos, 14, "enemy");
      const resource = this.world.resources.find((node) => {
        const dx = node.position.x - clickPos.x;
        const dy = node.position.y - clickPos.y;
        return Math.hypot(dx, dy) <= node.radius + 8 && node.amount > 0;
      });

      const selectedUnits = this.world.units.filter((unit) =>
        this.selection.selectedUnitIds.has(unit.id)
      );

      if (enemyUnit) {
        for (const unit of selectedUnits) {
          unit.setAttackTargetUnit(enemyUnit.id);
        }
      } else if (enemyBuilding) {
        for (const unit of selectedUnits) {
          unit.setAttackTargetBuilding(enemyBuilding.id);
        }
      } else if (resource) {
        for (const unit of selectedUnits) {
          unit.setGatherTarget(resource.id);
        }
      } else {
        for (const unit of selectedUnits) {
          unit.setMoveTarget(clickPos);
        }
      }
    }
  }

  private tryPlaceBuilding(type: "extractor" | "base", position: Vec2, owner: "player") {
    const cost = type === "extractor" ? 100 : 200;
    if (!this.world.spendResources(owner, cost)) {
      return false;
    }

    const size = type === "base" ? 36 : 26;
    for (const building of this.world.buildings) {
      const dx = building.position.x - position.x;
      const dy = building.position.y - position.y;
      if (Math.hypot(dx, dy) < building.size / 2 + size / 2 + 10) {
        this.world.addResources(owner, cost);
        return false;
      }
    }

    if (
      position.x < size ||
      position.y < size ||
      position.x > this.world.width - size ||
      position.y > this.world.height - size
    ) {
      this.world.addResources(owner, cost);
      return false;
    }

    this.world.addBuilding(type, position, owner);
    return true;
  }

  private checkEndConditions() {
    const playerBase = this.world.getBase("player");
    const enemyBase = this.world.getBase("enemy");
    if (!enemyBase) {
      this.message = "Victory! Enemy base destroyed.";
    } else if (!playerBase) {
      this.message = "Defeat! Your base was destroyed.";
    }
  }

  private updateHUD() {
    this.hud.resourcePanel.textContent = `Resources: ${this.world.playerResources}`;

    if (this.selection.selectedUnitIds.size > 0) {
      this.hud.selectionPanel.textContent = `Selected units: ${this.selection.selectedUnitIds.size}`;
    } else if (this.selection.selectedBuildingId) {
      const building = this.world.buildings.find(
        (item) => item.id === this.selection.selectedBuildingId
      );
      this.hud.selectionPanel.textContent = building
        ? `Selected: ${building.type}`
        : "Selected: none";
    } else {
      this.hud.selectionPanel.textContent = "Selected: none";
    }

    if (this.buildMode) {
      this.hud.selectionPanel.textContent += ` | Placing ${this.buildMode}`;
    }
  }

  private render() {
    renderWorld(this.ctx, this.world);
    renderUnits(this.ctx, this.world, this.selection.selectedUnitIds);
    renderUI(this.ctx, this.selection.rect, this.message);
  }
}
