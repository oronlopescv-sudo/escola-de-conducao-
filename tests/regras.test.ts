import { test } from "node:test";
import assert from "node:assert/strict";
import { validarIdadeCategoria, calcularIdade, youtubeEmbed, IDADES_MINIMAS } from "../src/lib/regras";
import { rateLimit } from "../src/lib/ratelimit";

test("idade mínima: 17 anos não pode categoria B", () => {
  const hoje = new Date("2026-07-07");
  const nasc = new Date("2009-01-01"); // 17 anos
  const v = validarIdadeCategoria(nasc, "B", hoje);
  assert.equal(v.valido, false);
  assert.equal(v.minima, 18);
});

test("idade mínima: 16 anos pode A1 e B1", () => {
  const hoje = new Date("2026-07-07");
  const nasc = new Date("2010-01-01"); // 16 anos
  assert.equal(validarIdadeCategoria(nasc, "A1", hoje).valido, true);
  assert.equal(validarIdadeCategoria(nasc, "B1", hoje).valido, true);
  assert.equal(validarIdadeCategoria(nasc, "B", hoje).valido, false);
});

test("idade mínima: categorias C e D exigem 21 anos", () => {
  const hoje = new Date("2026-07-07");
  const nasc = new Date("2006-06-01"); // 20 anos
  for (const cat of ["C", "D", "CE", "DE", "C1", "D1"]) {
    assert.equal(validarIdadeCategoria(nasc, cat, hoje).valido, false, cat);
  }
  const nasc21 = new Date("2005-06-01"); // 21 anos
  assert.equal(validarIdadeCategoria(nasc21, "C", hoje).valido, true);
});

test("cálculo de idade respeita mês/dia (não usa média de 365.25)", () => {
  const hoje = new Date("2026-07-07");
  // faz 18 anos amanhã → ainda tem 17
  assert.equal(calcularIdade(new Date("2008-07-08"), hoje), 17);
  // fez 18 anos hoje
  assert.equal(calcularIdade(new Date("2008-07-07"), hoje), 18);
});

test("todas as categorias do enum têm idade mínima definida", () => {
  for (const cat of ["A", "B", "C", "D", "F", "A1", "B1", "C1", "D1", "BE", "CE", "DE"]) {
    assert.ok(IDADES_MINIMAS[cat], cat);
  }
});

test("youtubeEmbed aceita formatos watch, youtu.be, shorts e embed", () => {
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

test("rateLimit bloqueia após o limite e repõe após a janela", async () => {
  const chave = "teste:" + Math.random();
  assert.equal(rateLimit(chave, 3, 50), true);
  assert.equal(rateLimit(chave, 3, 50), true);
  assert.equal(rateLimit(chave, 3, 50), true);
  assert.equal(rateLimit(chave, 3, 50), false); // 4ª bloqueada
  await new Promise((r) => setTimeout(r, 60));
  assert.equal(rateLimit(chave, 3, 50), true); // janela reposta
});
