// analyzer.js — Análise VIP e FREE com score e RR (cole completo)

async function analyzeVIP(pair) {
  const klines4h = await fetchKlines(pair, '4h', 300, "BINANCE");
  if (klines4h.length < 200) {
    console.log(`❌ Dados insuficientes VIP ${pair} 4h`);
    return null;
  }
  const score4h = calculateScore(klines4h);
  if (score4h < 80) {
    console.log(`❌ Score VIP baixo ${pair} 4h: ${score4h}`);
    return null;
  }

  const klines1d = await fetchKlines(pair, '1d', 300, "BINANCE");
  if (klines1d.length < 200) {
    console.log(`❌ Dados insuficientes VIP ${pair} 1d`);
    return null;
  }
  const score1d = calculateScore(klines1d);
  if (score1d < 80) {
    console.log(`❌ Confirmação diária falhou ${pair} 4h`);
    console.log(`❌ Score VIP baixo ${pair} 1d: ${score1d}`);
    return null;
  }

  const rr = calculateRR(klines4h);
  if (rr < 2.0) return null;

  return {
    pair,
    tf: '4h',
    score: score4h,
    rr,
    entry: klines4h[klines4h.length - 1].close,
    tp1: klines4h[klines4h.length - 1].close * 1.02,
    tp2: klines4h[klines4h.length - 1].close * 1.04,
    sl: klines4h[klines4h.length - 1].close * 0.98,
  };
}

async function analyzeFree(pair) {
  const tfs = ['5m', '15m', '1h', '2h', '4h'];
  for (const tf of tfs) {
    const klines = await fetchKlines(pair, tf, 260, "BINANCE");
    if (klines.length < 200) {
      console.log(`❌ Dados insuficientes ${pair} ${tf}`);
      continue;
    }

    const score = calculateScore(klines);
    if (score < 90) {
      console.log(`❌ Score baixo ${pair} ${tf}: ${score}`);
      continue;
    }

    const rr = calculateRR(klines);
    if (rr < 1.8) continue;

    console.log(`✅ SINAL FREE OK: ${pair} ${tf} | Score: ${score} | RR: ${rr}`);
    return {
      pair,
      tf,
      score,
      rr,
      entry: klines[klines.length - 1].close,
      tp1: klines[klines.length - 1].close * 1.015,
      tp2: klines[klines.length - 1].close * 1.03,
      sl: klines[klines.length - 1].close * 0.985,
    };
  }
  return null;
}

function calculateScore(klines) {
  // Lógica simples de score (baseada em tendências)
  const last = klines[klines.length - 1];
  const prev = klines[klines.length - 2];
  if (last.close > last.open && prev.close > prev.open) return 100;
  if (last.close > last.open) return 80;
  return 40;
}

function calculateRR(klines) {
  // RR simples (exemplo fixo - ajuste se quiser)
  return 2.0;
}

module.exports = { analyzeVIP, analyzeFree };
