// formatter.js — FORMATADOR COM TEXTO EDUCACIONAL (RISCO + EXPLICAÇÃO STOP)

const BYBIT_LINK = process.env.BYBIT_LINK || "https://partner.bybit.com/b/49037";
const PRIVATE_USER = process.env.PRIVATE_USER || "@maxmitrader";

function safe(v, fallback = "—") {
  return v !== undefined && v !== null && v !== "" ? v : fallback;
}

function toNum(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function fmtNum(v, digits = 6) {
  const n = toNum(v);
  if (n === null) return "—";
  return Number(n.toFixed(digits)).toString();
}

function traduzirTipoPorTF(tf) {
  if (!tf) return "INDEFINIDO";
  if (tf === "5m" || tf === "15m") return "SCALP";
  if (tf === "1h" || tf === "2h") return "DAY TRADE";
  if (tf === "4h" || tf === "1d") return "SWING TRADE";
  return "TRADE";
}

function direcaoLabel(s) {
  return s?.direction || s?.lado || "NEUTRO";
}

function estrelasLabel(s) {
  if (typeof s?.estrelas === "string" && s.estrelas.trim()) return s.estrelas.trim();
  if (typeof s?.stars === "number" && s.stars > 0) return "★".repeat(s.stars);
  return "★";
}

function rrLabel(s) {
  if (typeof s?.rr === "number" && Number.isFinite(s.rr)) return s.rr.toFixed(2);
  return "—";
}

// NOVA: Calcula distância % do stop e explica educacional
function explicaStop(entry, stop, tf) {
  const distanciaPct = Math.abs((stop - entry) / entry * 100).toFixed(2);
  const tipo = traduzirTipoPorTF(tf);
  let msg = `Distância do stop: ${distanciaPct}% - `;

  if (distanciaPct > 10) {
    msg += "Stop mais amplo para capturar tendência real. Lembre: trading é construir bloco por bloco, não enriquecer em um trade só.";
  } else if (distanciaPct < 5) {
    msg += "Stop apertado para movimento rápido. Gerencie risco: nunca arrisque mais que 1-2% da sua banca por trade.";
  } else {
    msg += "Stop equilibrado para este TF. Dica: paciência e consistência transformam trades em uma casa sólida.";
  }

  return msg;
}

function buildButton() {
  return {
    reply_markup: {
      inline_keyboard: [[{ text: "🚀 Abrir conta na Bybit", url: BYBIT_LINK }]]
    }
  };
}

function formatFree(s) {
  if (!s || !s.symbol) {
    return {
      text: "⚠️ Sinal descartado: dados incompletos.",
      options: { parse_mode: "HTML", disable_web_page_preview: true, ...buildButton() }
    };
  }
  const tf = safe(s.timeframe);
  const tipo = traduzirTipoPorTF(tf);
  const stopExplica = explicaStop(s.entrada, s.stop, tf);
  const text =
`📢 <b>SINAL GRATUITO — CRIPTO SEM CAÔ</b>
⭐ <b>Força do sinal:</b> ${estrelasLabel(s)}
📌 <b>Par:</b> ${safe(s.symbol)}
📈 <b>Operação:</b> ${safe(direcaoLabel(s))}
💰 <b>Entrada:</b> ${fmtNum(s.entrada)}
🛑 <b>Stop:</b> ${fmtNum(s.stop)}
🎯 <b>Alvo (TP1):</b> ${fmtNum(s.tp1)}
⏱️ <b>Timeframe:</b> ${tf}
🎯 <b>Tipo:</b> ${tipo}
📘 <b>Leitura técnica:</b>
Estrutura + contexto alinhados.
${stopExplica}  // NOVA EXPLICAÇÃO
RR ≈ <b>${rrLabel(s)}</b>.
💡 <b>Quer operar com mais critério?</b>
A Sala VIP entrega sinais mais filtrados, timeframes maiores e mentoria.
Para informações de acesso, fale comigo no privado: <b>${PRIVATE_USER}</b>.
📈 Gestão de risco: risque no máximo 1-2% da banca por trade.`;
  return {
    text,
    options: {
      parse_mode: "HTML",
      disable_web_page_preview: true,
      ...buildButton()
    }
  };
}

function formatVip(s) {
  if (!s || !s.symbol) {
    return {
      text: "⚠️ Sinal VIP descartado: dados incompletos.",
      options: { parse_mode: "HTML", disable_web_page_preview: true, ...buildButton() }
    };
  }
  const tf = safe(s.timeframe);
  const tipo = traduzirTipoPorTF(tf);
  const stopExplica = explicaStop(s.entrada, s.stop, tf);
  const tp2 = s.tp2 != null ? `\n🎯 <b>Alvo (TP2):</b> ${fmtNum(s.tp2)}` : "";
  const tpf = s.tpFinal != null ? `\n🏆 <b>Alvo Final:</b> ${fmtNum(s.tpFinal)}` : "";
  const text =
`💎 <b>SINAL VIP — CRIPTO SEM CAÔ</b>
⭐ <b>Força do sinal:</b> ${estrelasLabel(s)}
📌 <b>Par:</b> ${safe(s.symbol)}
📈 <b>Operação:</b> ${safe(direcaoLabel(s))}
💰 <b>Entrada:</b> ${fmtNum(s.entrada)}
🛑 <b>Stop:</b> ${fmtNum(s.stop)}
🎯 <b>Alvo (TP1):</b> ${fmtNum(s.tp1)}${tp2}${tpf}
⏱️ <b>Timeframe:</b> ${tf}
🎯 <b>Tipo:</b> ${tipo}
📘 <b>Leitura VIP:</b>
Sinal mais filtrado (timeframes maiores).
${stopExplica}  // NOVA EXPLICAÇÃO
RR ≈ <b>${rrLabel(s)}</b>.
📈 Gestão de risco: risque no máximo 1-2% da banca por trade.
📩 Suporte e acompanhamento no privado: <b>${PRIVATE_USER}</b>`;
  return {
    text,
    options: {
      parse_mode: "HTML",
      disable_web_page_preview: true,
      ...buildButton()
    }
  };
}

module.exports = { formatFree, formatVip };