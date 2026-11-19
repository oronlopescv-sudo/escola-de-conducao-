import { test } from "node:test";
import assert from "node:assert/strict";
import { validarIdadeCategoria, calcularIdade, youtubeEmbed, IDADES_MINIMAS } from "../src/lib/regras";
import { rateLimit } from "../src/lib/ratelimit";

test("âge minimal : 17 ans ne peut pas obtenir la catégorie B", () => {
  const hoje = new Date("2026-07-07");
  const nasc = new Date("2009-01-01"); // 17 ans
  const v = validarIdadeCategoria(nasc, "B", hoje);
  assert.equal(v.valido, false);
  assert.equal(v.minima, 18);
});

test("âge minimal : 16 ans peut A1 et B1", () => {
  const hoje = new Date("2026-07-07");
  const nasc = new Date("2010-01-01"); // 16 ans
  assert.equal(validarIdadeCategoria(nasc, "A1", hoje).valido, true);
  assert.equal(validarIdadeCategoria(nasc, "B1", hoje).valido, true);
  assert.equal(validarIdadeCategoria(nasc, "B", hoje).valido, false);
});

test("âge minimal : les catégories C et D exigent 21 ans", () => {
  const hoje = new Date("2026-07-07");
  const nasc = new Date("2006-06-01"); // 20 ans
  for (const cat of ["C", "D", "CE", "DE", "C1", "D1"]) {
    assert.equal(validarIdadeCategoria(nasc, cat, hoje).valido, false, cat);
  }
  const nasc21 = new Date("2005-06-01"); // 21 ans
  assert.equal(validarIdadeCategoria(nasc21, "C", hoje).valido, true);
});

test("le calcul de l'âge respecte le mois/jour (n'utilise pas une moyenne de 365,25)", () => {
  const hoje = new Date("2026-07-07");
  // aura 18 ans demain → a encore 17
  assert.equal(calcularIdade(new Date("2008-07-08"), hoje), 17);
  // a eu 18 ans aujourd'hui
  assert.equal(calcularIdade(new Date("2008-07-07"), hoje), 18);
});

test("toutes les catégories de l'enum ont un âge minimal défini", () => {
  for (const cat of ["A", "B", "C", "D", "F", "A1", "B1", "C1", "D1", "BE", "CE", "DE"]) {
    assert.ok(IDADES_MINIMAS[cat], cat);
  }
});

test("youtubeEmbed accepte les formats watch, youtu.be, shorts et embed", () => {
  const id = "dQw4w9WgXcQ";
  const esperado = `https://www.youtube.com/embed/${id}`;
  assert.equal(youtubeEmbed(`https://www.youtube.com/watch?v=${id}`), esperado);
  assert.equal(youtubeEmbed(`https://youtu.be/${id}`), esperado);
  assert.equal(youtubeEmbed(`https://www.youtube.com/shorts/${id}`), esperado);
  assert.equal(youtubeEmbed(`https://www.youtube.com/embed/${id}`), esperado);
  assert.equal(youtubeEmbed("https://exemplo.com/video"), null);
  assert.equal(youtubeEmbed(undefined), null);
  assert.equal(youtubeEmbed(""), null);
});

test("rateLimit bloque après la limite et réinitialise après la fenêtre", async () => {
  const chave = "test:" + Math.random();
  assert.equal(rateLimit(chave, 3, 50), true);
  assert.equal(rateLimit(chave, 3, 50), true);
  assert.equal(rateLimit(chave, 3, 50), true);
  assert.equal(rateLimit(chave, 3, 50), false); // 4e bloquée
  await new Promise((r) => setTimeout(r, 60));
  assert.equal(rateLimit(chave, 3, 50), true); // fenêtre réinitialisée
});
