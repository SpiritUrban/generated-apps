import "./style.css";
import { Game } from "./game/Game";

const canvas = document.querySelector<HTMLCanvasElement>("#gameCanvas");
if (!canvas) {
  throw new Error("Canvas not found");
}

const resourcePanel = document.querySelector<HTMLDivElement>("#resourcePanel");
const selectionPanel = document.querySelector<HTMLDivElement>("#selectionPanel");
const buildUnitBtn = document.querySelector<HTMLButtonElement>("#buildUnitBtn");
const buildExtractorBtn =
  document.querySelector<HTMLButtonElement>("#buildExtractorBtn");
const upgradeAttackBtn =
  document.querySelector<HTMLButtonElement>("#upgradeAttackBtn");
const upgradeSpeedBtn =
  document.querySelector<HTMLButtonElement>("#upgradeSpeedBtn");
const upgradeArmorBtn =
  document.querySelector<HTMLButtonElement>("#upgradeArmorBtn");

if (
  !resourcePanel ||
  !selectionPanel ||
  !buildUnitBtn ||
  !buildExtractorBtn ||
  !upgradeAttackBtn ||
  !upgradeSpeedBtn ||
  !upgradeArmorBtn
) {
  throw new Error("HUD elements missing");
}

const game = new Game(canvas, {
  resourcePanel,
  selectionPanel,
  buildUnitBtn,
  buildExtractorBtn,
  upgradeAttackBtn,
  upgradeSpeedBtn,
  upgradeArmorBtn
});

game.start();
