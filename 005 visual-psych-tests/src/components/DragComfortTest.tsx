import { useEffect, useRef, useState, type PointerEvent } from "react";
import type { Action, Point, TestResult } from "../types";
import {
  clamp01,
  countDirectionChanges,
  countReturnsToTarget,
  normalizeSigned,
  pathLength,
} from "../utils/metrics";

type DragComfortTestProps = {
  onComplete: (result: TestResult) => void;
  onExit: () => void;
};

const SAMPLE_INTERVAL = 16;

export default function DragComfortTest({
  onComplete,
  onExit,
}: DragComfortTestProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [dragging, setDragging] = useState(false);
  const [marker, setMarker] = useState<Point | null>(null);

  const startRef = useRef(performance.now());
  const dragStartRef = useRef<number | null>(null);
  const lastSampleRef = useRef(0);
  const pointsRef = useRef<Point[]>([]);
  const actionsRef = useRef<Action[]>([]);

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
    if (!size.width || !size.height || marker) return;
    const center = {
      x: size.width / 2,
      y: size.height / 2,
      t: 0,
    };
    setMarker(center);
  }, [marker, size.height, size.width]);

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

      const gradient = ctx.createRadialGradient(
        size.width * 0.7,
        size.height * 0.3,
        40,
        size.width * 0.7,
        size.height * 0.3,
        Math.max(size.width, size.height)
      );
      gradient.addColorStop(0, "rgba(226, 238, 239, 0.95)");
      gradient.addColorStop(1, "rgba(250, 247, 242, 0.95)");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, size.width, size.height);

      ctx.strokeStyle = "rgba(20, 40, 50, 0.15)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(size.width * 0.7, size.height * 0.3, 120, 0, Math.PI * 2);
      ctx.stroke();

      const points = pointsRef.current;
      if (points.length > 1) {
        ctx.strokeStyle = "rgba(68, 118, 112, 0.3)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        for (let i = 1; i < points.length; i += 1) {
          ctx.lineTo(points[i].x, points[i].y);
        }
        ctx.stroke();
      }

      if (marker) {
        ctx.fillStyle = dragging
          ? "rgba(35, 86, 90, 0.85)"
          : "rgba(35, 86, 90, 0.65)";
        ctx.beginPath();
        ctx.arc(marker.x, marker.y, 14, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "rgba(255, 255, 255, 0.7)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(marker.x, marker.y, 18, 0, Math.PI * 2);
        ctx.stroke();
      }

      frame = requestAnimationFrame(render);
    };

    frame = requestAnimationFrame(render);
    return () => cancelAnimationFrame(frame);
  }, [dragging, marker, size.height, size.width]);

  const recordPoint = (event: PointerEvent<HTMLCanvasElement>) => {
    const now = performance.now();
    if (now - lastSampleRef.current < SAMPLE_INTERVAL) return;
    lastSampleRef.current = now;
    if (!dragging) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const point = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
      t: now - startRef.current,
    };
    pointsRef.current.push(point);
  };

  const handlePointerDown = (event: PointerEvent<HTMLCanvasElement>) => {
    if (!marker) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    if (Math.hypot(marker.x - x, marker.y - y) > 24) return;

    setDragging(true);
    dragStartRef.current = performance.now();
    actionsRef.current.push({
      type: "drag-start",
      t: dragStartRef.current - startRef.current,
      x,
      y,
    });
    pointsRef.current = [{ x, y, t: dragStartRef.current - startRef.current }];
  };

  const handlePointerMove = (event: PointerEvent<HTMLCanvasElement>) => {
    recordPoint(event);
    if (!dragging) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = Math.min(rect.width - 16, Math.max(16, event.clientX - rect.left));
    const y = Math.min(rect.height - 16, Math.max(16, event.clientY - rect.top));
    setMarker({ x, y, t: performance.now() - startRef.current });
  };

  const finalize = () => {
    if (!marker || !dragStartRef.current) return;
    const now = performance.now();
    const duration = now - dragStartRef.current;
    const path = pointsRef.current;
    const centerX = size.width / 2;
    const centerY = size.height / 2;
    const normX = normalizeSigned((marker.x - centerX) / centerX);
    const normY = normalizeSigned((centerY - marker.y) / centerY);
    const oscillations = countDirectionChanges(path);
    const returns = countReturnsToTarget(path, marker);
    const travel = pathLength(path) / Math.hypot(size.width, size.height);

    actionsRef.current.push({
      type: "drag-end",
      t: now - startRef.current,
      x: marker.x,
      y: marker.y,
    });

    onComplete({
      id: "drag",
      completedAt: Date.now(),
      metrics: {
        comfortX: normX,
        comfortY: normY,
        steadiness: clamp01(1 - oscillations / 20),
        resolve: clamp01(1 - duration / 5200),
        returns: clamp01(returns / 12),
        travel: clamp01(travel),
      },
      raw: {
        points: path,
        actions: actionsRef.current,
      },
    });
  };

  const handlePointerUp = () => {
    if (!dragging) return;
    setDragging(false);
    finalize();
  };

  return (
    <div className="test-screen">
      <div className="hud">
        <div className="prompt">Перемести маркер туда, где комфортнее.</div>
        <button className="ghost" onClick={onExit}>
          Выход
        </button>
      </div>
      <div className="canvas-shell" ref={containerRef}>
        <canvas
          ref={canvasRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
        />
      </div>
      <div className="hint">Потяни маркер и отпусти.</div>
    </div>
  );
}
