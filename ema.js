/**
 * ema.js — cálculo de EMAs mais tolerante
 */

function calcularEMA(periodo, closes) {
  if (closes.length < periodo) return null;
  const k = 2 / (periodo + 1);
  let ema = closes[0];
  for (let i = 1; i < closes.length; i++) {
    ema = closes[i] * k + ema * (1 - k);
  }
  return ema;
}

function calcularEMAs(candles) {
  if (!Array.isArray(candles) || candles.length < 50) return null; // abaixamos de 210 para 50

  const closes = candles
    .map(c => Number(c.close))
    .filter(n => Number.isFinite(n));

  if (closes.length < 50) return null;

  return {
    ema9: calcularEMA(9, closes),
    ema12: calcularEMA(12, closes),
    ema20: calcularEMA(20, closes),
    ema26: calcularEMA(26, closes),
    ema50: calcularEMA(50, closes),
    ema200: closes.length >= 200 ? calcularEMA(200, closes) : null, // ema200 opcional
  };
}

module.exports = { calcularEMAs };