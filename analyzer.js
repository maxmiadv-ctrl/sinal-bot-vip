// analyzer.js — Análise VIP e FREE (cole completo)

const { fetchKlines } = require('./fetcher');

async function analyzeVIP(pair) {
  const klines4h = await fetchKlines(pair, '4h', 300);
  const klines1d = await fetchKlines(pair, '1d', 300);
  if (klines4h.length < 200 || klines1d.length < 200) return null;

  // Lógica VIP simples (score alto, RR bom)
  const score4h = calculateScore(klines4h);
  const score1d = calculateScore(klines1d);
  if (score4h < 80 || score1d < 80) return null;

  const rr = calculateRR(klines4h);
  if (rr < 2.0) return null;

  return {
    pair,
    tf: '4h',
    score: score4h,
    rr: rr.toFixed(2),
    entry: klines4h[klines4h.length - 1].close.toFixed(2),
    tp1: (klines4h[klines4h.length - 1].close * 1.02).toFixed(2),
    tp2: (klines4h[klines4h.length - 1].close * 1.04).toFixed(2),
    sl: (klines4h[klines4h.length - 1].close * 0.98).toFixed(2),
  };
}

async function analyzeFree(pair) {
  const tfs = ['5m', '15m', '1h', '2h', '4h'];
  for (const tf of tfs) {
    const klines = await fetchKlines(pair, tf, 260);
    if (klines.length < 200) continue;

    const score = calculateScore(klines);
    if (score < 90) continue;

    const rr = calculateRR(klines);
    if (rr < 1.8) continue;

    return {
      pair,
      tf,
      score,
      rr: rr.toFixed(2),
      entry: klines[klines.length - 1].close.toFixed(2),
      tp1: (klines[klines.length - 1].close * 1.015).toFixed(2),
      tp2: (klines[klines.length - 1].close * 1.03).toFixed(2),
      sl: (klines[klines.length - 1].close * 0.985).toFixed(2),
    };
  }
  return null;
}

function calculateScore(klines) {
  // Lógica simples de score (exemplo – você pode ajustar)
  const last = klines[klines.length - 1];
  const prev = klines[klines.length - 2];
  if (last.close > last.open && prev.close > prev.open) return 100;
  if (last.close > last.open) return 80;
  return 40;
}

function calculateRR(klines) {
  // RR simples (exemplo)
  return 2.0;
}

module.exports = { analyzeVIP, analyzeFree };
