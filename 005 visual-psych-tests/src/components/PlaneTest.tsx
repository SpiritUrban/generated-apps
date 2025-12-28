import { useEffect, useRef, useState, type PointerEvent } from "react";
import type { Action, Point, TestResult } from "../types";
import {
  clamp01,
  countDirectionChanges,
  normalizeSigned,
  pathLength,
} from "../utils/metrics";

const SAMPLE_INTERVAL = 18;

type PlaneTestProps = {
  onComplete: (result: TestResult) => void;
  onExit: () => void;
};

export default function PlaneTest({ onComplete, onExit }: PlaneTestProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });

  const startRef = useRef(performance.now());
  const lastSampleRef = useRef(0);
  const pointsRef = useRef<Point[]>([]);
  const actionsRef = useRef<Action[]>([]);
  const cursorRef = useRef<Point | null>(null);
  const clickRef = useRef<Point | null>(null);

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return undefined;

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) {
        setSize({
          width: Math.floor(entry.contentRect.width),
          height: Math.floor(entry.contentRect.height),
        });
      }
    });

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !size.width || !size.height) return undefined;

    const ratio = window.devicePixelRatio || 1;
    canvas.width = Math.floor(size.width * ratio);
    canvas.height = Math.floor(size.height * ratio);
    canvas.style.width = `${size.width}px`;
    canvas.style.height = `${size.height}px`;

    const ctx = canvas.getContext("2d");
    if (!ctx) return undefined;
    ctx.scale(ratio, ratio);

    let frame: number;
    const render = () => {
      ctx.clearRect(0, 0, size.width, size.height);
      ctx.fillStyle = "rgba(255, 255, 255, 0.88)";
      ctx.fillRect(0, 0, size.width, size.height);

      const centerX = size.width / 2;
      const centerY = size.height / 2;

      ctx.strokeStyle = "rgba(20, 40, 50, 0.25)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, centerY);
      ctx.lineTo(size.width, centerY);
      ctx.moveTo(centerX, 0);
      ctx.lineTo(centerX, size.height);
      ctx.stroke();

      ctx.strokeStyle = "rgba(20, 40, 50, 0.14)";
      ctx.setLineDash([5, 6]);
      ctx.beginPath();
      ctx.rect(16, 16, size.width - 32, size.height - 32);
      ctx.stroke();
      ctx.setLineDash([]);

      const points = pointsRef.current;
      if (points.length > 1) {
        ctx.strokeStyle = "rgba(59, 123, 139, 0.35)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        for (let i = 1; i < points.length; i += 1) {
          ctx.lineTo(points[i].x, points[i].y);
        }
        ctx.stroke();
      }

      const cursor = cursorRef.current;
      if (cursor) {
        ctx.fillStyle = "rgba(59, 123, 139, 0.5)";
        ctx.beginPath();
        ctx.arc(cursor.x, cursor.y, 6, 0, Math.PI * 2);
        ctx.fill();
      }

      const click = clickRef.current;
      if (click) {
        ctx.fillStyle = "rgba(22, 70, 82, 0.9)";
        ctx.beginPath();
        ctx.arc(click.x, click.y, 10, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.fillStyle = "rgba(20, 40, 50, 0.7)";
      ctx.font = "14px 'Fira Sans', sans-serif";
      ctx.fillText("контроль", centerX + 12, centerY - 12);
      ctx.fillText("свобода", centerX - 74, centerY - 12);
      ctx.fillText("безопасность", centerX + 12, centerY + 24);
      ctx.fillText("риск", centerX - 32, centerY - 24);

      frame = requestAnimationFrame(render);
    };

    frame = requestAnimationFrame(render);
    return () => cancelAnimationFrame(frame);
  }, [size.height, size.width]);

  const recordPoint = (event: PointerEvent<HTMLCanvasElement>) => {
    const now = performance.now();
    if (now - lastSampleRef.current < SAMPLE_INTERVAL) return;
    lastSampleRef.current = now;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const point = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
      t: now - startRef.current,
    };
    pointsRef.current.push(point);
    cursorRef.current = point;
  };

  const finish = (point: Point) => {
    clickRef.current = point;
    actionsRef.current.push({ type: "click", t: point.t, x: point.x, y: point.y });

    const centerX = size.width / 2;
    const centerY = size.height / 2;
    const normX = normalizeSigned((point.x - centerX) / centerX);
    const normY = normalizeSigned((centerY - point.y) / centerY);
    const reaction = point.t;
    const path = pointsRef.current;
    const drift = pathLength(path) / Math.hypot(size.width, size.height);
    const oscillations = countDirectionChanges(path);

    onComplete({
      id: "plane",
      completedAt: Date.now(),
      metrics: {
        control: normX,
        risk: normY,
        decisiveness: clamp01(1 - reaction / 4200),
        drift: clamp01(drift),
        oscillations: clamp01(oscillations / 18),
      },
      raw: {
        points: path,
        actions: actionsRef.current,
      },
    });
  };

  const handlePointerDown = (event: PointerEvent<HTMLCanvasElement>) => {
    if (clickRef.current) return;
    recordPoint(event);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    finish({
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
      t: performance.now() - startRef.current,
    });
  };

  return (
    <div className="test-screen">
      <div className="hud">
        <div className="prompt">Где тебе спокойнее находиться?</div>
        <button className="ghost" onClick={onExit}>
          Выход
        </button>
      </div>
      <div className="canvas-shell" ref={containerRef}>
        <canvas
          ref={canvasRef}
          onPointerMove={recordPoint}
          onPointerDown={handlePointerDown}
        />
      </div>
      <div className="hint">Кликни в точку на плоскости.</div>
    </div>
  );
}
