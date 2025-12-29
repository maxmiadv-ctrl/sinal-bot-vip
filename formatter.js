function formatFree(signal) {
  return `
📢 *SINAL FREE APROVADO*

Par: ${signal.symbol}
TF: ${signal.timeframe}
Score: ${signal.score}
RR: ${signal.rr}

Entrada: ${signal.entrada}
TP1: ${signal.tp1}
SL: ${signal.stop}

Alavancagem: 10-20x (ajuste risco)

Boa sorte! 🚀
  `.trim();
}

function formatVip(signal) {
  return `
💎 *SINAL VIP APROVADO*

Par: ${signal.symbol}
TF: ${signal.timeframe}
Score: ${signal.score}
RR: ${signal.rr}

Entrada: ${signal.entrada}
TP1: ${signal.tp1}
TP2: ${signal.tp2}
TP Final: ${signal.tpFinal}
SL: ${signal.stop}

Alavancagem: 10-20x (ajuste risco)

Boa sorte! 🚀
  `.trim();
}

module.exports = { formatFree, formatVip };
