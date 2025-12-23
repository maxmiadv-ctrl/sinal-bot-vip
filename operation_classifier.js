/**
 * operation_classifier.js
 *
 * Classificador FINAL de operações:
 * - Tipo (SCALP / DAY / SWING)
 * - Canal (FREE / VIP)
 * - Prioridade
 *
 * Esse arquivo é responsável por:
 * - equilibrar quantidade x qualidade
 * - decidir quem entra na sala FREE ou VIP
 * - manter o robô honesto e sustentável
 */

// =========================
// Utilidades
// =========================
function normalizarTimeframe(tf) {
  if (!tf || typeof tf !== "string") return "15m";

  const t = tf.toLowerCase().trim();

  if (t === "m5") return "5m";
  if (t === "m15") return "15m";
  if (t === "m30") return "30m";
  if (t === "h1") return "1h";
  if (t === "h4") return "4h";
  if (t === "d1" || t === "1d") return "1d";

  return t;
}

// =========================
// Tipo da operação
// =========================
function classificarTipo(tf) {
  if (tf.endsWith("m")) {
    const minutos = parseInt(tf.replace("m", ""), 10);
    if (minutos <= 15) return "SCALP";
    if (minutos <= 60) return "DAY_TRADE";
    return "SWING_TRADE";
  }

  if (tf.endsWith("h")) {
    const horas = parseInt(tf.replace("h", ""), 10);
    if (horas <= 4) return "DAY_TRADE";
    return "SWING_TRADE";
  }

  return "SWING_TRADE";
}

// =========================
// Canal (FREE / VIP)
// =========================
function classificarCanal({ score, stars }) {
  if (stars === "⭐⭐⭐" && score >= 85) return "VIP";
  if (stars === "⭐⭐") return "FREE";
  if (stars === "⭐") return "FREE";
  return null; // não envia
}

// =========================
// Prioridade (para ordenação futura)
// =========================
function calcularPrioridade({ score, stars }) {
  if (stars === "⭐⭐⭐") return 3;
  if (stars === "⭐⭐") return 2;
  if (stars === "⭐") return 1;
  return 0;
}

// =========================
// Classificador principal
// =========================
function classificarOperacao({ timeframe, score, stars }) {
  const tf = normalizarTimeframe(timeframe);
  const tipo = classificarTipo(tf);
  const canal = classificarCanal({ score, stars });
  const prioridade = calcularPrioridade({ score, stars });

  if (!canal || prioridade === 0) {
    return {
      enviar: false,
      motivo: "Score insuficiente para envio",
    };
  }

  // Regras de sanidade (humanas)
  if (tipo === "SCALP" && stars === "⭐") {
    return {
      enviar: false,
      motivo: "Scalp fraco descartado",
    };
  }

  if (tipo === "SWING_TRADE" && stars !== "⭐⭐⭐") {
    return {
      enviar: false,
      motivo: "Swing só é enviado quando excelente",
    };
  }

  return {
    enviar: true,
    tipo,
    timeframe: tf,
    canal,        // FREE ou VIP
    prioridade,   // 1, 2 ou 3
    descricao:
      tipo === "SCALP"
        ? "Operação curta, foco em movimento rápido."
        : tipo === "DAY_TRADE"
        ? "Operação intradiária, buscando movimento claro."
        : "Operação de médio prazo, focada em tendência.",
  };
}

module.exports = {
  classificarOperacao,
};
