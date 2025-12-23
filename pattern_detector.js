/**
 * pattern_detector.js — padrões mais rígidos (menos falso positivo)
 */

function corpo(c) {
  return Math.abs(c.close - c.open);
}

function rangeTotal(c) {
  return Math.abs(c.high - c.low) || 0;
}

function isDoji(c) {
  const r = rangeTotal(c);
  if (r <= 0) return false;
  return corpo(c) <= r * 0.08; // mais rígido
}

function isBullishEngulf(prev, cur) {
  // precisa engolir + corpo relevante
  const prevBody = corpo(prev);
  const curBody = corpo(cur);
  if (prevBody <= 0 || curBody <= 0) return false;

  const prevBear = prev.close < prev.open;
  const curBull = cur.close > cur.open;

  const engolfeu = cur.open <= prev.close && cur.close >= prev.open;
  const maior = curBody >= prevBody * 1.2; // cur precisa ser bem maior

  return prevBear && curBull && engolfeu && maior;
}

function isBearishEngulf(prev, cur) {
  const prevBody = corpo(prev);
  const curBody = corpo(cur);
  if (prevBody <= 0 || curBody <= 0) return false;

  const prevBull = prev.close > prev.open;
  const curBear = cur.close < cur.open;

  const engolfeu = cur.open >= prev.close && cur.close <= prev.open;
  const maior = curBody >= prevBody * 1.2;

  return prevBull && curBear && engolfeu && maior;
}

function detectarPadroes(klines) {
  try {
    if (!klines || klines.length < 40) return { padrao: null, zona: null };

    const cur = klines[klines.length - 1];
    const prev = klines[klines.length - 2];

    let padrao = null;

    if (isDoji(cur)) padrao = "DOJI";
    else if (isBullishEngulf(prev, cur)) padrao = "ENGOLFO DE ALTA";
    else if (isBearishEngulf(prev, cur)) padrao = "ENGOLFO DE BAIXA";

    return { padrao, zona: null };
  } catch (err) {
    return { padrao: null, zona: null };
  }
}

module.exports = { detectarPadroes };
