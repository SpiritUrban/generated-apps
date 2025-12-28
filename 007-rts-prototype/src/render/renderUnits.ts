import type { World } from "../game/World";

export function renderUnits(
  ctx: CanvasRenderingContext2D,
  world: World,
  selectedUnitIds: Set<number>
) {
  for (const unit of world.units) {
    ctx.fillStyle =
      unit.owner === "player" ? "rgba(140, 255, 180, 0.95)" : "rgba(255, 140, 140, 0.95)";
    ctx.beginPath();
    ctx.arc(unit.position.x, unit.position.y, unit.radius, 0, Math.PI * 2);
    ctx.fill();

    if (selectedUnitIds.has(unit.id)) {
      ctx.strokeStyle = "rgba(255, 255, 255, 0.8)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(unit.position.x, unit.position.y, unit.radius + 4, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
    ctx.fillRect(unit.position.x - 12, unit.position.y - 18, 24, 3);
    ctx.fillStyle = "rgba(0, 255, 150, 0.8)";
    ctx.fillRect(
      unit.position.x - 12,
      unit.position.y - 18,
      24 * Math.max(0, unit.hp) / 100,
      3
    );
  }
}
