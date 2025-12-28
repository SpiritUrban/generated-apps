import type { World } from "../game/World";
import type { Vec2 } from "../game/types";
import { distance } from "../game/types";
import type { Mouse } from "./mouse";

export interface SelectionRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export class SelectionManager {
  selectedUnitIds = new Set<number>();
  selectedBuildingId: number | null = null;
  rect: SelectionRect | null = null;

  update(world: World, mouse: Mouse) {
    if (mouse.leftDown && mouse.dragStart && mouse.dragEnd) {
      this.rect = this.makeRect(mouse.dragStart, mouse.dragEnd);
    }

    if (!mouse.leftReleased || !mouse.dragStart || !mouse.dragEnd) {
      return;
    }

    const dragDistance = distance(mouse.dragStart, mouse.dragEnd);
    if (dragDistance < 6) {
      this.handleSingleClick(world, mouse.dragEnd);
    } else {
      this.handleBoxSelect(world, mouse.dragStart, mouse.dragEnd);
    }

    this.rect = null;
    mouse.clearDrag();
  }

  clear() {
    this.selectedUnitIds.clear();
    this.selectedBuildingId = null;
  }

  private handleSingleClick(world: World, position: Vec2) {
    const unit = world.findUnitAt(position, 10, "player");
    if (unit) {
      this.selectedUnitIds = new Set([unit.id]);
      this.selectedBuildingId = null;
      return;
    }

    const building = world.findBuildingAt(position, 12, "player");
    if (building) {
      this.selectedUnitIds.clear();
      this.selectedBuildingId = building.id;
      return;
    }

    this.clear();
  }

  private handleBoxSelect(world: World, start: Vec2, end: Vec2) {
    const rect = this.makeRect(start, end);
    this.selectedUnitIds.clear();
    this.selectedBuildingId = null;
    for (const unit of world.units) {
      if (unit.owner !== "player") continue;
      if (
        unit.position.x >= rect.x &&
        unit.position.x <= rect.x + rect.width &&
        unit.position.y >= rect.y &&
        unit.position.y <= rect.y + rect.height
      ) {
        this.selectedUnitIds.add(unit.id);
      }
    }
  }

  private makeRect(a: Vec2, b: Vec2): SelectionRect {
    const x = Math.min(a.x, b.x);
    const y = Math.min(a.y, b.y);
    const width = Math.abs(a.x - b.x);
    const height = Math.abs(a.y - b.y);
    return { x, y, width, height };
  }
}
