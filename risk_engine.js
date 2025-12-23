/**
 * risk_engine.js — Gestão de risco PROFISSIONAL e HUMANA
 * Stop técnico + RR realista
 * ATR usado APENAS como buffer
 */

function gerarRisco(direction, entry, atr, score, modoHard = true) {
  // 🔹 Parâmetros base (seguros)
  const ATR_BUFFER = atr ? atr * 0.35 : entry * 0.003;

  // 🔹 Stop mínimo absoluto (proteção contra stops ridículos)
  const MIN_STOP_PCT = 0.004; // 0.4%
  const MIN_STOP = entry * MIN_STOP_PCT;

  let stop;

  if (direction === "COMPRA") {
    stop = entry - Math.max(MIN_STOP, ATR_BUFFER);
  } else {
    stop = entry + Math.max(MIN_STOP, ATR_BUFFER);
  }

  const risk = Math.abs(entry - stop);

  // 🔹 RR por perfil de qualidade
  let rr1 = 1.6;
  let rr2 = 2.4;
  let rrFinal = 3.2;

  if (score >= 86) {
    rr1 = 1.8;
    rr2 = 2.8;
    rrFinal = 4.0;
  }

  let tp1, tp2, tpFinal;

  if (direction === "COMPRA") {
    tp1 = entry + risk * rr1;
    tp2 = entry + risk * rr2;
    tpFinal = entry + risk * rrFinal;
  } else {
    tp1 = entry - risk * rr1;
    tp2 = entry - risk * rr2;
    tpFinal = entry - risk * rrFinal;
  }

  return {
    stop: Number(stop.toFixed(6)),
    tp1: Number(tp1.toFixed(6)),
    tp2: Number(tp2.toFixed(6)),
    tpFinal: Number(tpFinal.toFixed(6)),
    tipo_operacao: "GESTÃO TÉCNICA REAL"
  };
}

module.exports = {
  gerarRisco
};
