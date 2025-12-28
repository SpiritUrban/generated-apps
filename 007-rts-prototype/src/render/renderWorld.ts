import type { World } from "../game/World";

export function renderWorld(ctx: CanvasRenderingContext2D, world: World) {
  ctx.save();
  ctx.clearRect(0, 0, world.width, world.height);

  ctx.strokeStyle = "rgba(255, 255, 255, 0.06)";
  ctx.lineWidth = 1;
  for (let x = 0; x <= world.width; x += world.tileSize) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, world.height);
    ctx.stroke();
  }
  for (let y = 0; y <= world.height; y += world.tileSize) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(world.width, y);
    ctx.stroke();
  }

  for (const node of world.resources) {
    if (node.amount <= 0) continue;
    ctx.fillStyle = "rgba(80, 220, 255, 0.8)";
    ctx.beginPath();
    ctx.arc(node.position.x, node.position.y, node.radius, 0, Math.PI * 2);
    ctx.fill();
  }

  for (const building of world.buildings) {
    ctx.fillStyle =
      building.owner === "player" ? "rgba(80, 220, 120, 0.9)" : "rgba(220, 80, 80, 0.9)";
    ctx.fillRect(
      building.position.x - building.size / 2,
      building.position.y - building.size / 2,
      building.size,
      building.size
    );

    ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
    ctx.fillRect(
      building.position.x - building.size / 2,
      building.position.y - building.size / 2 - 8,
      building.size,
      4
    );
    ctx.fillStyle = "rgba(0, 255, 150, 0.8)";
    const hpRatio = Math.max(0, building.hp) / (building.type === "base" ? 300 : 160);
    ctx.fillRect(
      building.position.x - building.size / 2,
      building.position.y - building.size / 2 - 8,
      building.size * hpRatio,
      4
    );
  }

  ctx.restore();
}
