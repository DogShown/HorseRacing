import { COMPETITOR_COUNT, STORAGE_KEYS } from "../game/constants.js";

export const HORSES = [
  { id: "comet", name: "Comet", number: "01", breed: "Puro-sangue inglês", participant: "Participante 1", color: "#ffcb57", emoji: "🐎", style: "gold" },
  { id: "blaze", name: "Blaze", number: "02", breed: "Quarto de milha", participant: "Participante 2", color: "#ff7777", emoji: "🐎", style: "coral" },
  { id: "pixel", name: "Pixel", number: "03", breed: "Árabe", participant: "Participante 3", color: "#65e6c4", emoji: "🐎", style: "mint" },
  { id: "shadow", name: "Shadow", number: "04", breed: "Andaluz", participant: "Participante 4", color: "#a9a9a9", emoji: "🐎", style: "silver" },
  { id: "gold-rush", name: "Gold Rush", number: "05", breed: "Appaloosa", participant: "Participante 5", color: "#d8a45b", emoji: "🐎", style: "gold" },
  { id: "thunder", name: "Thunder", number: "06", breed: "Árabe", participant: "Participante 6", color: "#b86b72", emoji: "🐎", style: "coral" },
  { id: "frost", name: "Frost", number: "07", breed: "Puro-sangue inglês", participant: "Participante 7", color: "#c8d2d6", emoji: "🐎", style: "silver" },
  { id: "storm", name: "Storm", number: "08", breed: "Crioulo", participant: "Participante 8", color: "#8b7355", emoji: "🐎", style: "mint" },
];

if (HORSES.length !== COMPETITOR_COUNT) {
  throw new Error(`O catálogo deve conter exatamente ${COMPETITOR_COUNT} competidores.`);
}

export function createInitialHorses() {
  let profiles = {};
  try {
    profiles = JSON.parse(window.localStorage.getItem(STORAGE_KEYS.HORSE_PROFILES) || "{}");
    if (!profiles || typeof profiles !== "object" || Array.isArray(profiles)) profiles = {};
  } catch {
    profiles = {};
  }

  return HORSES.map((horse) => {
    const saved = profiles[horse.id] || {};
    return {
      ...horse,
      name: typeof saved.name === "string" && saved.name.trim() ? saved.name.trim().slice(0, 22) : horse.name,
      breed: typeof saved.breed === "string" && saved.breed.trim() ? saved.breed.trim().slice(0, 32) : horse.breed,
      participant: typeof saved.participant === "string" && saved.participant.trim() ? saved.participant.trim().slice(0, 22) : horse.participant,
      color: typeof saved.color === "string" && /^#[0-9a-fA-F]{6}$/.test(saved.color) ? saved.color.toLowerCase() : horse.color,
      progress: 0,
    };
  });
}

export function saveHorseProfile(horseId, changes) {
  try {
    const current = JSON.parse(window.localStorage.getItem(STORAGE_KEYS.HORSE_PROFILES) || "{}");
    const profiles = current && typeof current === "object" && !Array.isArray(current) ? current : {};
    profiles[horseId] = { ...(profiles[horseId] || {}), ...changes };
    window.localStorage.setItem(STORAGE_KEYS.HORSE_PROFILES, JSON.stringify(profiles));
    return true;
  } catch {
    return false;
  }
}