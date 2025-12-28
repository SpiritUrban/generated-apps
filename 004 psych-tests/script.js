const STORAGE_KEY = "visual-psych-tests-v1";

const tests = {
  plane: {
    title: "Контроль x Риск",
    prompt: "Где тебе спокойнее находиться?",
    hint: "Кликни в точку на плоскости",
  },
  orbit: {
    title: "Движение и фокус",
    prompt: "Выбери объект, за которым хочешь следить",
    hint: "Кликни по движущейся точке",
  },
  comfort: {
    title: "Зона комфорта",
    prompt: "Смести маркер туда, где напряжение минимально",
    hint: "Перетащи маркер и отпусти в точке",
  },
};

const appState = {
  view: "home",
  active: null,
  results: loadResults(),
};

const ui = {
  home: document.getElementById("home"),
  test: document.getElementById("test"),
  result: document.getElementById("result"),
  testTitle: document.getElementById("testTitle"),
  testPrompt: document.getElementById("testPrompt"),
  testHint: document.getElementById("testHint"),
  stageHint: document.getElementById("stageHint"),
  canvas: document.getElementById("canvas"),
  progress: document.getElementById("progress"),
  progressBar: document.getElementById("progressBar"),
  radar: document.getElementById("radar"),
  summary: document.getElementById("summary"),
  metrics: document.getElementById("metrics"),
};

const ctx = ui.canvas.getContext("2d");

const controls = {
  dragging: false,
  pointer: { x: 0, y: 0, active: false },
  path: [],
  startAt: 0,
  raf: 0,
};

const orbitState = {
  orbs: [],
  target: null,
  tracking: false,
  trackStart: 0,
  frames: 0,
  distanceSum: 0,
  nearerOther: 0,
};

const comfortState = {
  marker: { x: 0, y: 0, radius: 16 },
  released: false,
};

document.addEventListener("DOMContentLoaded", init);

function init() {
  document.querySelectorAll("[data-start]").forEach((button) => {
    button.addEventListener("click", () => {
      const id = button.dataset.start;
      startTest(id);
    });
  });

  document.querySelectorAll("[data-view]").forEach((button) => {
    button.addEventListener("click", () => setView(button.dataset.view));
  });

  document.querySelectorAll("[data-reset]").forEach((button) => {
    button.addEventListener("click", () => {
      localStorage.removeItem(STORAGE_KEY);
      appState.results = {};
      if (appState.view === "result") renderResult();
    });
  });

  ui.canvas.addEventListener("pointerdown", handlePointerDown);
  ui.canvas.addEventListener("pointermove", handlePointerMove);
  ui.canvas.addEventListener("pointerup", handlePointerUp);

  setView("home");
  renderResult();
  window.addEventListener("resize", () => resizeCanvas(ui.canvas));
}

function setView(view) {
  appState.view = view;
  ui.home.classList.toggle("hidden", view !== "home");
  ui.test.classList.toggle("hidden", view !== "test");
  ui.result.classList.toggle("hidden", view !== "result");
  if (view === "result") renderResult();
}

function startTest(id) {
  appState.active = id;
  const config = tests[id];
  ui.testTitle.textContent = config.title;
  ui.testPrompt.textContent = config.prompt;
  ui.testHint.textContent = config.hint;
  ui.stageHint.textContent = config.hint;
  ui.progress.style.display = "none";
  ui.progressBar.style.width = "0%";
  ui.stageHint.style.display = "block";

  controls.dragging = false;
  controls.pointer.active = false;
  controls.path = [];
  controls.startAt = performance.now();
  comfortState.released = false;
  orbitState.tracking = false;
  orbitState.target = null;

  setView("test");
  resizeCanvas(ui.canvas);
  startRenderLoop();
}

function startRenderLoop() {
  cancelAnimationFrame(controls.raf);
  const render = () => {
    drawScene();
    controls.raf = requestAnimationFrame(render);
  };
  render();
}

function drawScene() {
  resizeCanvas(ui.canvas);
  const width = ui.canvas.clientWidth;
  const height = ui.canvas.clientHeight;
  ctx.clearRect(0, 0, width, height);

  if (appState.active === "plane") drawPlane(width, height);
  if (appState.active === "orbit") drawOrbit(width, height);
  if (appState.active === "comfort") drawComfort(width, height);
}

function drawPlane(width, height) {
  const center = { x: width / 2, y: height / 2 };
  const gradient = ctx.createRadialGradient(center.x, center.y, 10, center.x, center.y, width * 0.6);
  gradient.addColorStop(0, "rgba(245, 241, 232, 0.9)");
  gradient.addColorStop(1, "rgba(210, 221, 220, 0.2)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  ctx.strokeStyle = "rgba(60, 76, 78, 0.2)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, center.y);
  ctx.lineTo(width, center.y);
  ctx.moveTo(center.x, 0);
  ctx.lineTo(center.x, height);
  ctx.stroke();

  ctx.fillStyle = "rgba(60, 76, 78, 0.7)";
  ctx.font = "14px \"Libre Baskerville\", serif";
  ctx.fillText("контроль", 20, center.y - 10);
  ctx.fillText("свобода", width - 90, center.y - 10);
  ctx.fillText("безопасность", center.x + 12, 24);
  ctx.fillText("риск", center.x + 12, height - 50);

  if (controls.path.length > 1) {
    ctx.strokeStyle = "rgba(64, 96, 104, 0.4)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(controls.path[0].x, controls.path[0].y);
    controls.path.forEach((p) => ctx.lineTo(p.x, p.y));
    ctx.stroke();
  }
}

function drawOrbit(width, height) {
  if (!orbitState.orbs.length) initOrbs(width, height);

  ctx.fillStyle = "rgba(240, 235, 226, 0.7)";
  ctx.fillRect(0, 0, width, height);

  orbitState.orbs.forEach((orb, index) => {
    orb.x += orb.vx;
    orb.y += orb.vy;
    if (orb.x < orb.radius || orb.x > width - orb.radius) orb.vx *= -1;
    if (orb.y < orb.radius || orb.y > height - orb.radius) orb.vy *= -1;

    const isTarget = orbitState.target === index;
    ctx.beginPath();
    ctx.fillStyle = isTarget ? "rgba(40, 84, 84, 0.85)" : "rgba(110, 132, 136, 0.7)";
    ctx.arc(orb.x, orb.y, orb.radius, 0, Math.PI * 2);
    ctx.fill();
  });

  if (orbitState.tracking) updateOrbitStats(width, height);
}

function initOrbs(width, height) {
  orbitState.orbs = Array.from({ length: 5 }).map(() => ({
    x: width * (0.2 + 0.6 * Math.random()),
    y: height * (0.2 + 0.6 * Math.random()),
    vx: (Math.random() - 0.5) * 0.9,
    vy: (Math.random() - 0.5) * 0.9,
    radius: 10 + Math.random() * 6,
  }));
}

function updateOrbitStats(width, height) {
  const now = performance.now();
  const elapsed = now - orbitState.trackStart;
  const target = orbitState.target === null ? null : orbitState.orbs[orbitState.target];

  if (controls.pointer.active && target) {
    const d = distance(controls.pointer, target);
    orbitState.distanceSum += d;
    orbitState.frames += 1;

    let closestIndex = orbitState.target;
    let closest = d;
    orbitState.orbs.forEach((orb, idx) => {
      const dist = distance(controls.pointer, orb);
      if (dist < closest) {
        closest = dist;
        closestIndex = idx;
      }
    });
    if (closestIndex !== orbitState.target) orbitState.nearerOther += 1;
  }

  const duration = 7000;
  ui.progress.style.display = "block";
  ui.progressBar.style.width = `${Math.min(1, elapsed / duration) * 100}%`;

  if (elapsed >= duration) {
    const average = orbitState.distanceSum / Math.max(1, orbitState.frames);
    const norm = clamp01(1 - average / (Math.min(width, height) * 0.35));
    const stability = clamp01(1 - orbitState.nearerOther / Math.max(1, orbitState.frames));
    completeTest("orbit", {
      focus: norm,
      stability,
      commitment: clamp01(1 - (orbitState.trackStart - controls.startAt) / 3000),
    });
  }
}

function drawComfort(width, height) {
  if (!comfortState.marker.x && !comfortState.marker.y) {
    comfortState.marker.x = width / 2;
    comfortState.marker.y = height / 2;
  }

  const gradient = ctx.createRadialGradient(width * 0.7, height * 0.35, 40, width * 0.7, height * 0.35, width * 0.65);
  gradient.addColorStop(0, "rgba(229, 238, 234, 0.9)");
  gradient.addColorStop(1, "rgba(210, 218, 220, 0.2)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  if (controls.path.length > 1) {
    ctx.strokeStyle = "rgba(68, 96, 102, 0.5)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(controls.path[0].x, controls.path[0].y);
    controls.path.forEach((p) => ctx.lineTo(p.x, p.y));
    ctx.stroke();
  }

  ctx.beginPath();
  ctx.fillStyle = controls.dragging ? "rgba(45, 86, 86, 0.9)" : "rgba(72, 104, 108, 0.8)";
  ctx.arc(comfortState.marker.x, comfortState.marker.y, comfortState.marker.radius, 0, Math.PI * 2);
  ctx.fill();
}

function handlePointerDown(event) {
  const point = getPoint(event);
  controls.pointer = { ...point, active: true };

  if (appState.active === "plane") {
    if (!controls.startAt) controls.startAt = performance.now();
    controls.path.push(point);
    return;
  }

  if (appState.active === "orbit") {
    if (orbitState.tracking) return;
    const selected = selectOrb(point);
    if (selected === null) return;
    orbitState.target = selected;
    orbitState.tracking = true;
    orbitState.trackStart = performance.now();
    orbitState.frames = 0;
    orbitState.distanceSum = 0;
    orbitState.nearerOther = 0;
    ui.stageHint.style.display = "none";
    return;
  }

  if (appState.active === "comfort") {
    if (comfortState.released) return;
    if (distance(point, comfortState.marker) < comfortState.marker.radius + 8) {
      controls.dragging = true;
      controls.startAt = performance.now();
      controls.path = [point];
    }
  }
}

function handlePointerMove(event) {
  const point = getPoint(event);
  controls.pointer = { ...point, active: true };

  if (appState.active === "plane" && !controls.completed) {
    controls.path.push(point);
  }

  if (appState.active === "comfort" && controls.dragging) {
    comfortState.marker.x = point.x;
    comfortState.marker.y = point.y;
    controls.path.push(point);
  }
}

function handlePointerUp(event) {
  if (appState.active === "plane") {
    const point = getPoint(event);
    const width = ui.canvas.clientWidth;
    const height = ui.canvas.clientHeight;
    const xNorm = clamp((point.x - width / 2) / (width / 2), -1, 1);
    const yNorm = clamp((height / 2 - point.y) / (height / 2), -1, 1);
    const reaction = (performance.now() - controls.startAt) / 1000;
    const total = pathLength(controls.path);
    const direct = controls.path.length ? distance(controls.path[0], point) : 0;
    const wander = direct > 0 ? total / direct : 1;
    const hesitation = clamp01((wander - 1) / 2 + countDirectionChanges(controls.path) * 0.02);

    completeTest("plane", {
      controlFreedom: xNorm,
      safetyRisk: yNorm,
      decisiveness: clamp01(1 - reaction / 5),
      hesitation,
    });
  }

  if (appState.active === "comfort" && controls.dragging) {
    controls.dragging = false;
    comfortState.released = true;
    const total = pathLength(controls.path);
    const changes = countDirectionChanges(controls.path);
    const duration = (performance.now() - controls.startAt) / 1000;
    const width = ui.canvas.clientWidth;
    const height = ui.canvas.clientHeight;
    const center = { x: width / 2, y: height / 2 };
    const distNorm = clamp01(distance(center, comfortState.marker) / (Math.min(width, height) * 0.45));

    completeTest("comfort", {
      ease: clamp01(1 - duration / 6),
      steadiness: clamp01(1 - changes / 20),
      hesitation: clamp01(total / (Math.min(width, height) * 1.2) - 0.2),
      distance: distNorm,
    });
  }
}

function selectOrb(point) {
  let selected = null;
  let closest = Infinity;
  orbitState.orbs.forEach((orb, index) => {
    const d = distance(point, orb);
    if (d < orb.radius + 12 && d < closest) {
      closest = d;
      selected = index;
    }
  });
  return selected;
}

function completeTest(id, metrics) {
  const result = {
    id,
    startedAt: controls.startAt,
    completedAt: performance.now(),
    metrics,
  };
  appState.results[id] = result;
  saveResults(appState.results);
  cancelAnimationFrame(controls.raf);
  setView("result");
}

function renderResult() {
  const profile = buildProfile(appState.results);
  renderRadar(profile);
  renderSummary(profile);
}

function renderSummary(profile) {
  ui.summary.innerHTML = "";
  ui.metrics.innerHTML = "";
  const lines = buildSummary(profile);
  lines.forEach((line) => {
    const li = document.createElement("li");
    li.textContent = line;
    ui.summary.appendChild(li);
  });

  const metrics = [
    ["Контроль", profile.control],
    ["Риск", profile.risk],
    ["Фокус", profile.focus],
    ["Стабильность", profile.steadiness],
    ["Адаптивность", profile.adaptability],
    ["Решительность", profile.decisiveness],
  ];
  metrics.forEach(([label, value]) => {
    const div = document.createElement("div");
    div.textContent = `${label}: ${(value * 100).toFixed(0)}%`;
    ui.metrics.appendChild(div);
  });
}

function renderRadar(profile) {
  const keys = [
    ["control", "Контроль"],
    ["risk", "Риск"],
    ["focus", "Фокус"],
    ["steadiness", "Стабильность"],
    ["adaptability", "Адаптивность"],
    ["decisiveness", "Решительность"],
  ];
  const size = 320;
  const center = size / 2;
  const radius = 120;
  const step = (Math.PI * 2) / keys.length;

  const points = keys.map(([key], index) => {
    const value = profile[key];
    const angle = -Math.PI / 2 + index * step;
    const r = radius * value;
    return {
      x: center + Math.cos(angle) * r,
      y: center + Math.sin(angle) * r,
      labelX: center + Math.cos(angle) * (radius + 22),
      labelY: center + Math.sin(angle) * (radius + 22),
    };
  });

  ui.radar.innerHTML = "";
  ["1", "0.66", "0.33"].forEach((scale) => {
    const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    circle.setAttribute("cx", center);
    circle.setAttribute("cy", center);
    circle.setAttribute("r", radius * parseFloat(scale));
    circle.setAttribute("fill", "none");
    circle.setAttribute("stroke", "rgba(36, 54, 58, 0.12)");
    ui.radar.appendChild(circle);
  });

  points.forEach((point) => {
    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line.setAttribute("x1", center);
    line.setAttribute("y1", center);
    line.setAttribute("x2", point.x);
    line.setAttribute("y2", point.y);
    line.setAttribute("stroke", "rgba(36, 54, 58, 0.18)");
    ui.radar.appendChild(line);
  });

  const polygon = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
  polygon.setAttribute("points", points.map((p) => `${p.x},${p.y}`).join(" "));
  polygon.setAttribute("fill", "rgba(45, 85, 82, 0.2)");
  polygon.setAttribute("stroke", "rgba(45, 85, 82, 0.7)");
  polygon.setAttribute("stroke-width", "2");
  ui.radar.appendChild(polygon);

  keys.forEach(([, label], index) => {
    const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
    text.setAttribute("x", points[index].labelX);
    text.setAttribute("y", points[index].labelY);
    text.setAttribute("text-anchor", "middle");
    text.setAttribute("dominant-baseline", "middle");
    text.setAttribute("fill", "rgba(36, 54, 58, 0.6)");
    text.setAttribute("font-size", "11");
    text.textContent = label;
    ui.radar.appendChild(text);
  });
}

function buildProfile(results) {
  const plane = results.plane?.metrics;
  const orbit = results.orbit?.metrics;
  const comfort = results.comfort?.metrics;

  const control = plane ? clamp01((plane.controlFreedom + 1) / 2) : 0.5;
  const risk = plane ? clamp01((plane.safetyRisk + 1) / 2) : 0.5;
  const focus = orbit ? clamp01(orbit.focus) : 0.5;
  const decisiveness = plane ? clamp01(plane.decisiveness) : 0.5;
  const steadiness = comfort ? clamp01(comfort.steadiness) : 0.5;
  const adaptability = comfort
    ? clamp01(0.6 * comfort.ease + 0.4 * (1 - comfort.hesitation))
    : 0.5;

  return { control, risk, focus, steadiness, adaptability, decisiveness };
}

function buildSummary(profile) {
  const lines = [];
  if (profile.control > 0.65) lines.push("Ориентация на контроль и структуру");
  if (profile.control < 0.35) lines.push("Ориентация на свободу и гибкость");
  if (profile.risk > 0.65) lines.push("Тяга к риску и новизне");
  if (profile.risk < 0.35) lines.push("Стремление к безопасности и предсказуемости");
  if (profile.focus > 0.7) lines.push("Высокая концентрация внимания");
  if (profile.focus < 0.4) lines.push("Внимание распределено и подвижно");
  if (profile.steadiness > 0.7) lines.push("Стабильное движение к выбранному месту");
  if (profile.steadiness < 0.4) lines.push("Повышенная чувствительность к изменению условий");
  if (profile.adaptability > 0.7) lines.push("Гибкая адаптивность");
  if (profile.decisiveness > 0.7) lines.push("Быстрый выбор без лишних колебаний");
  return lines.length ? lines : ["Профиль сбалансирован, без ярких перекосов"];
}

function resizeCanvas(canvas) {
  const dpr = window.devicePixelRatio || 1;
  const width = Math.floor(canvas.clientWidth * dpr);
  const height = Math.floor(canvas.clientHeight * dpr);
  if (canvas.width !== width || canvas.height !== height) {
    canvas.width = width;
    canvas.height = height;
  }
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function getPoint(event) {
  const rect = ui.canvas.getBoundingClientRect();
  return {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top,
  };
}

function distance(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function pathLength(points) {
  let total = 0;
  for (let i = 1; i < points.length; i += 1) {
    total += distance(points[i - 1], points[i]);
  }
  return total;
}

function countDirectionChanges(points) {
  let changes = 0;
  for (let i = 2; i < points.length; i += 1) {
    const a = {
      x: points[i - 1].x - points[i - 2].x,
      y: points[i - 1].y - points[i - 2].y,
    };
    const b = {
      x: points[i].x - points[i - 1].x,
      y: points[i].y - points[i - 1].y,
    };
    const mag = Math.hypot(a.x, a.y) * Math.hypot(b.x, b.y);
    if (mag === 0) continue;
    const dot = (a.x * b.x + a.y * b.y) / mag;
    const angle = Math.acos(clamp(dot, -1, 1));
    if (angle > Math.PI * 0.6) changes += 1;
  }
  return changes;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function clamp01(value) {
  return clamp(value, 0, 1);
}

function loadResults() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  } catch {
    return {};
  }
}

function saveResults(results) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(results));
}



