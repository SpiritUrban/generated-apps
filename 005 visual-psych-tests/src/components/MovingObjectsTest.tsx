import { useEffect, useMemo, useRef, useState, type PointerEvent } from "react";
import type { Action, Point, TestResult } from "../types";
import { average, clamp01 } from "../utils/metrics";

type MovingObjectsTestProps = {
  onComplete: (result: TestResult) => void;
  onExit: () => void;
};

type MovingObject = {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  hue: number;
};

const FOLLOW_DURATION = 3500;
const SAMPLE_INTERVAL = 20;

export default function MovingObjectsTest({
  onComplete,
  onExit,
}: MovingObjectsTestProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [phase, setPhase] = useState<"select" | "follow">("select");

  const startRef = useRef(performance.now());
  const followStartRef = useRef<number | null>(null);
  const actionsRef = useRef<Action[]>([]);
  const pointsRef = useRef<Point[]>([]);
  const lastSampleRef = useRef(0);
  const distancesRef = useRef<number[]>([]);
  const completedRef = useRef(false);

  const objectsRef = useRef<MovingObject[]>([]);

  const palette = useMemo(
    () => [196, 168, 34, 12, 210, 82],
    []
  );

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
    if (!size.width || !size.height || objectsRef.current.length) return;

    const objects: MovingObject[] = [];
    for (let i = 0; i < 6; i += 1) {
      objects.push({
        id: i,
        x: size.width * (0.2 + 0.6 * Math.random()),
        y: size.height * (0.2 + 0.6 * Math.random()),
        vx: (Math.random() - 0.5) * 0.7,
        vy: (Math.random() - 0.5) * 0.7,
        radius: 18 + Math.random() * 10,
        hue: palette[i % palette.length],
      });
    }
    objectsRef.current = objects;
  }, [palette, size.height, size.width]);

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
    let lastTime = performance.now();

    const render = (now: number) => {
      const dt = now - lastTime;
      lastTime = now;
      ctx.clearRect(0, 0, size.width, size.height);

      ctx.fillStyle = "rgba(250, 248, 244, 0.92)";
      ctx.fillRect(0, 0, size.width, size.height);

      const objects = objectsRef.current;
      objects.forEach((obj) => {
        obj.x += obj.vx * dt * 0.04;
        obj.y += obj.vy * dt * 0.04;
        if (obj.x < obj.radius || obj.x > size.width - obj.radius) {
          obj.vx *= -1;
        }
        if (obj.y < obj.radius || obj.y > size.height - obj.radius) {
          obj.vy *= -1;
        }
        obj.x = Math.min(size.width - obj.radius, Math.max(obj.radius, obj.x));
        obj.y = Math.min(size.height - obj.radius, Math.max(obj.radius, obj.y));
      });

      objects.forEach((obj) => {
        const isSelected = obj.id === selectedId;
        ctx.fillStyle = `hsla(${obj.hue}, 48%, ${isSelected ? 45 : 58}%, 0.9)`;
        ctx.beginPath();
        ctx.arc(obj.x, obj.y, obj.radius, 0, Math.PI * 2);
        ctx.fill();

        if (isSelected) {
          ctx.strokeStyle = "rgba(15, 40, 50, 0.4)";
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(obj.x, obj.y, obj.radius + 6, 0, Math.PI * 2);
          ctx.stroke();
        }
      });

      if (selectedId !== null) {
        const pointer =
          pointsRef.current[pointsRef.current.length - 1] ?? null;
        const target = objects.find((obj) => obj.id === selectedId);
        if (pointer && target) {
          const dist = Math.hypot(pointer.x - target.x, pointer.y - target.y);
          distancesRef.current.push(dist);
        }
      }

      if (selectedId !== null && phase === "follow") {
        const started = followStartRef.current;
        if (started && now - started > FOLLOW_DURATION && !completedRef.current) {
          completedRef.current = true;
          const reaction = started - startRef.current;
          const diag = Math.hypot(size.width, size.height);
          const focus = clamp01(1 - average(distancesRef.current) / diag);
          const intent = clamp01(1 - reaction / 3500);
          onComplete({
            id: "moving",
            completedAt: Date.now(),
            metrics: {
              focus,
              intent,
              persistence: clamp01(focus * 0.7 + intent * 0.3),
            },
            raw: {
              points: pointsRef.current,
              actions: actionsRef.current,
              meta: {
                selectedId,
              },
            },
          });
        }
      }

      frame = requestAnimationFrame(render);
    };

    frame = requestAnimationFrame(render);
    return () => cancelAnimationFrame(frame);
  }, [onComplete, phase, selectedId, size.height, size.width]);

  const recordPoint = (event: PointerEvent<HTMLCanvasElement>) => {
    const now = performance.now();
    if (now - lastSampleRef.current < SAMPLE_INTERVAL) return;
    lastSampleRef.current = now;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    pointsRef.current.push({
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
      t: now - startRef.current,
    });
  };

  const handleSelect = (event: PointerEvent<HTMLCanvasElement>) => {
    if (phase !== "select") return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const point = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
    pointsRef.current.push({
      x: point.x,
      y: point.y,
      t: performance.now() - startRef.current,
    });
    const objects = objectsRef.current;
    let chosen: MovingObject | null = null;
    objects.forEach((obj) => {
      const dist = Math.hypot(obj.x - point.x, obj.y - point.y);
      if (dist < obj.radius + 8) {
        chosen = obj;
      }
    });

    if (!chosen) return;
    setSelectedId(chosen.id);
    setPhase("follow");
    followStartRef.current = performance.now();
    actionsRef.current.push({
      type: "select",
      t: followStartRef.current - startRef.current,
      x: point.x,
      y: point.y,
    });
  };

  return (
    <div className="test-screen">
      <div className="hud">
        <div className="prompt">Выбери объект, за которым хочется следить.</div>
        <button className="ghost" onClick={onExit}>
          Выход
        </button>
      </div>
      <div className="canvas-shell" ref={containerRef}>
        <canvas
          ref={canvasRef}
          onPointerMove={recordPoint}
          onPointerDown={handleSelect}
        />
      </div>
      <div className="hint">
        {phase === "select"
          ? "Кликни по движущемуся объекту."
          : "Следи взглядом или курсором за выбранным объектом."}
      </div>
    </div>
  );
}
