/**
 * operation_engine.js
 *
 * GUARDA FINAL antes do envio:
 * - decide SE envia
 * - decide PARA ONDE (FREE / VIP)
 * - monta SOMENTE o necessário
 * - protege contra spam e sinais fracos
 */

const { gerarRisco } = require("./risk_engine");
const { formatFree, formatVip } = require("./formatter");
const { classificarOperacao } = require("./operation_classifier");

// =========================
// Utilidades
// =========================
function contarEstrelas(starsString) {
  if (!starsString) return 0;
  return (starsString.match(/⭐/g) || []).length;
}

// =========================
// Engine principal
// =========================
function montarOperacao({
  par,
  direction,
  close,
  atr,
  score,
  stars,
  timeframe,
  emaInfo,
  patterns,
  multiInfo,
  modoHard = true
}) {
  // 0️⃣ Classificação final (FREE / VIP / tipo)
  const classificacao = classificarOperacao({
    timeframe,
    score,
    stars
  });

  if (!classificacao || !classificacao.enviar) {
    return {
      enviar: false,
      motivo: classificacao?.motivo || "Descartado pelo classificador final"
    };
  }

  const { canal, tipo } = classificacao;

  // 1️⃣ Gera risco institucional
  const risco = gerarRisco(direction, close, atr, score, modoHard);

  // Sanidade mínima
  if (!risco || !risco.stop || !risco.tp1) {
    return {
      enviar: false,
      motivo: "Risco inválido ou incompleto"
    };
  }

  // 2️⃣ Objeto base
  const base = {
    par,
    lado: direction,
    entrada: close,
    stop: risco.stop,
    tp1: risco.tp1,
    timeframe,
    estrelas: stars,
    tipo
  };

  // 3️⃣ FREE
  let gratuito = null;
  if (canal === "FREE") {
    gratuito = formatFree(base);
  }

  // 4️⃣ VIP (somente ⭐⭐⭐)
  let vip = null;
  const nStars = contarEstrelas(stars);
  if (canal === "VIP" && nStars === 3) {
    vip = formatVip({
      ...base,
      tp2: risco.tp2,
      tpFinal: risco.tpFinal
    });
  }

  // 5️⃣ Meta (logs / auditoria)
  const meta = {
    par,
    price: close,
    score,
    stars,
    direction,
    canal,
    tipo_operacao: tipo,
    entry: close,
    stop: risco.stop,
    tp1: risco.tp1,
    tp2: risco.tp2,
    tpFinal: risco.tpFinal,
    timeframe,
    multi_tf: multiInfo,
    patterns,
    indicators: { ema: emaInfo }
  };

  return {
    enviar: true,
    canal,
    gratuito,
    vip,
    meta
  };
}

module.exports = {
  montarOperacao
};
