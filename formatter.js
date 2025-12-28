function formatSignal(signal, type) {
  const emoji = type === 'VIP' ? '💎' : '📢';
  const channel = type === 'VIP' ? 'VIP' : 'FREE';

  return `
${emoji} *SINAL ${channel} APROVADO*

*Par*: ${signal.pair}
*TF*: ${signal.tf}
*Score*: ${signal.score}
*RR*: ${signal.rr}

*Entrada*: ${signal.entry}
*TP1*: ${signal.tp1}
*TP2*: ${signal.tp2}
*SL*: ${signal.sl}

*Alavancagem*: 10-20x (ajuste risco)

Boa sorte! 🚀
  `.trim();
}

module.exports = { formatSignal };
