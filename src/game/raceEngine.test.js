import test from "node:test";
import assert from "node:assert/strict";
import {
  advanceHorses,
  findFinishers,
  parseSavedScore,
} from "./raceEngine.js";

test("pontuação aceita apenas inteiros seguros e não negativos", () => {
  assert.equal(parseSavedScore("0"), 0);
  assert.equal(parseSavedScore("1200"), 1200);
  for (const invalid of [null, "", "   ", "-1", "1.5", "NaN", "Infinity", "9007199254740992"]) {
    assert.equal(parseSavedScore(invalid), 0);
  }
});

test("todos os cavalos usam a mesma faixa de velocidade", () => {
  const horses = [
    { id: "a", progress: 10 },
    { id: "b", progress: 10 },
    { id: "c", progress: 10 },
  ];
  const samples = [0, 0.5, 1];
  const advanced = advanceHorses(horses, () => samples.shift());

  assert.deepEqual(
    advanced.map((horse) => horse.progress),
    [11.5, 12.4, 13.3]
  );
});

test("identifica o cruzamento mais rápido quando vários chegam no mesmo ciclo", () => {
  const previous = [
    { id: "comet", progress: 98 },
    { id: "blaze", progress: 99 },
    { id: "pixel", progress: 97 },
  ];
  const advanced = [
    { id: "comet", progress: 101 },
    { id: "blaze", progress: 101 },
    { id: "pixel", progress: 101 },
  ];

  assert.deepEqual(
    findFinishers(previous, advanced).map((horse) => horse.id),
    ["blaze"]
  );
});

test("retorna todos os competidores quando cruzam exatamente juntos", () => {
  const previous = [
    { id: "comet", progress: 99 },
    { id: "blaze", progress: 98 },
    { id: "pixel", progress: 99 },
  ];
  const advanced = [
    { id: "comet", progress: 101 },
    { id: "blaze", progress: 102 },
    { id: "pixel", progress: 101 },
  ];

  assert.deepEqual(
    findFinishers(previous, advanced).map((horse) => horse.id),
    ["comet", "blaze", "pixel"]
  );
});

test("não declara vencedor quando nenhum cavalo alcança a chegada", () => {
  const previous = [{ id: "comet", progress: 20 }];
  const advanced = [{ id: "comet", progress: 22 }];

  assert.deepEqual(findFinishers(previous, advanced), []);
});
