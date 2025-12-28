import type { Vec2 } from "../game/types";

export class Mouse {
  x = 0;
  y = 0;
  leftDown = false;
  rightDown = false;
  leftPressed = false;
  leftReleased = false;
  rightPressed = false;
  rightReleased = false;
  dragStart: Vec2 | null = null;
  dragEnd: Vec2 | null = null;

  constructor(private canvas: HTMLCanvasElement) {
    canvas.addEventListener("contextmenu", (event) => {
      event.preventDefault();
    });

    canvas.addEventListener("mousedown", (event) => {
      const pos = this.getCanvasPosition(event);
      this.x = pos.x;
      this.y = pos.y;
      if (event.button === 0) {
        this.leftDown = true;
        this.leftPressed = true;
        this.dragStart = { ...pos };
        this.dragEnd = { ...pos };
      } else if (event.button === 2) {
        this.rightDown = true;
        this.rightPressed = true;
      }
    });

    canvas.addEventListener("mousemove", (event) => {
      const pos = this.getCanvasPosition(event);
      this.x = pos.x;
      this.y = pos.y;
      if (this.leftDown && this.dragStart) {
        this.dragEnd = { ...pos };
      }
    });

    canvas.addEventListener("mouseup", (event) => {
      const pos = this.getCanvasPosition(event);
      this.x = pos.x;
      this.y = pos.y;
      if (event.button === 0) {
        this.leftDown = false;
        this.leftReleased = true;
        if (this.dragStart) {
          this.dragEnd = { ...pos };
        }
      } else if (event.button === 2) {
        this.rightDown = false;
        this.rightReleased = true;
      }
    });
  }

  beginFrame() {
    this.leftPressed = false;
    this.leftReleased = false;
    this.rightPressed = false;
    this.rightReleased = false;
  }

  clearDrag() {
    this.dragStart = null;
    this.dragEnd = null;
  }

  private getCanvasPosition(event: MouseEvent): Vec2 {
    const rect = this.canvas.getBoundingClientRect();
    const scaleX = this.canvas.width / rect.width;
    const scaleY = this.canvas.height / rect.height;
    return {
      x: (event.clientX - rect.left) * scaleX,
      y: (event.clientY - rect.top) * scaleY
    };
  }
}
