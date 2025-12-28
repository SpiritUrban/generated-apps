import type { SelectionRect } from "../input/selection";

export function renderUI(
  ctx: CanvasRenderingContext2D,
  rect: SelectionRect | null,
  message: string | null,
  toast: string | null,
  toastTimer: number
) {
  if (rect) {
    ctx.strokeStyle = "rgba(255, 255, 255, 0.6)";
    ctx.lineWidth = 1;
    ctx.strokeRect(rect.x, rect.y, rect.width, rect.height);
    ctx.fillStyle = "rgba(255, 255, 255, 0.08)";
    ctx.fillRect(rect.x, rect.y, rect.width, rect.height);
  }

  if (message) {
    ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
    ctx.fillRect(ctx.canvas.width / 2 - 160, 20, 320, 40);
    ctx.fillStyle = "#ffffff";
    ctx.font = "20px 'Trebuchet MS', sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(message, ctx.canvas.width / 2, 47);
  }

  if (toast) {
    const alpha = Math.min(1, Math.max(0, toastTimer / 2.2));
    ctx.fillStyle = `rgba(0, 0, 0, ${0.6 * alpha})`;
    ctx.fillRect(ctx.canvas.width / 2 - 180, ctx.canvas.height - 70, 360, 36);
    ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
    ctx.font = "16px 'Trebuchet MS', sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(toast, ctx.canvas.width / 2, ctx.canvas.height - 46);
  }
}
