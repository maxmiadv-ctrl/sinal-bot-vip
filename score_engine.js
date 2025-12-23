/**
 * score_engine.js — Versão FINAL tolerante e realista
 */

const { rsi, macd, obv, bollinger } = require("./candles");
const { calcularEMAs } = require("./ema");

function calcularScore(klines, modo = "FREE") {
  if (!klines || klines.length < 100) {
    return { score: 0, direction: "NEUTRO", stars: "" };
  }

  const closes = klines.map(k => Number(k.close)).filter(n => Number.isFinite(n));
  if (closes.length < 100) return { score: 0, direction: "NEUTRO", stars: "" };

  const lastClose = closes[closes.length - 1];
  const volumes = klines.map(k => Number(k.volume));
  const lastVolume = volumes[volumes.length - 1];
  const avgVolume = volumes.slice(-20).reduce((a, b) => a + b, 0) / 20 || 1;

  const emas = calcularEMAs(klines);
  if (!emas) return { score: 0, direction: "NEUTRO", stars: "" };

  const { ema9, ema20, ema50, ema200 } = emas;

  const rsiVal = rsi(closes);
  const macdInfo = macd(closes);
  const boll = bollinger(closes, 20, 2);

  let score = 40; // base mais baixa para ter chance
  let direction = "NEUTRO";

  // Tendência principal
  if (ema9 && ema20 && ema50 && ema9 > ema20 && ema20 > ema50 && lastClose > ema9) {
    direction = "COMPRA";
    score += 30;
    if (ema200 && ema50 > ema200) score += 10;
  } else if (ema9 && ema20 && ema50 && ema9 < ema20 && ema20 < ema50 && lastClose < ema9) {
    direction = "VENDA";
    score += 30;
    if (ema200 && ema50 < ema200) score += 10;
  }

  if (direction === "NEUTRO") return { score: score, direction: "NEUTRO", stars: "" };

  // Confirmações
  if (direction === "COMPRA") {
    if (macdInfo.hist > 0) score += 12;
    if (rsiVal >= 45 && rsiVal <= 75) score += 10;
    if (lastClose > boll.middle) score += 8;
    if (lastVolume > avgVolume * 1.05) score += 6;
  } else {
    if (macdInfo.hist < 0) score += 12;
    if (rsiVal <= 55 && rsiVal >= 25) score += 10;
    if (lastClose < boll.middle) score += 8;
    if (lastVolume > avgVolume * 1.05) score += 6;
  }

  score = Math.min(100, score);

  let stars = "";
  if (score >= 80) stars = "★★★";
  else if (score >= 70) stars = "★★";
  else if (score >= 60) stars = "★";

  return { score, direction, stars };
}

module.exports = { calcularScore };