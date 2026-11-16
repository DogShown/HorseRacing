import { COMPETITOR_COUNT } from "../game/constants.js";

export const HORSES = [
  { id: "comet", name: "Comet", number: "01", color: "#ffcb57", emoji: "🐎", style: "gold" },
  { id: "blaze", name: "Blaze", number: "02", color: "#ff7777", emoji: "🐎", style: "coral" },
  { id: "pixel", name: "Pixel", number: "03", color: "#65e6c4", emoji: "🐎", style: "mint" },
];

if (HORSES.length !== COMPETITOR_COUNT) {
  throw new Error(`O catálogo deve conter exatamente ${COMPETITOR_COUNT} competidores.`);
}

export function createInitialHorses() {
  return HORSES.map((horse) => ({ ...horse, progress: 0 }));
}
