// formatter.js — Formato exato como antigo com icons, risk 1-2%, espaços \n

function formatSignal(signal, type) {
  const emoji = type === 'VIP' ? '💎' : '📢';
  const channel = type === 'VIP' ? 'VIP' : 'FREE';

  const operacao = signal.close > signal.open ? 'COMPRA' : 'VENDA'; // Exemplo simples de operação

  return `
${emoji} *SINAL ${channel} APROVADO*

★ Força do sinal: ★★★

📌 Par: ${signal.pair}
🛡️ Operação: ${operacao}
💰 Entrada: ${signal.entry.toFixed(4)}
🛑 Stop: ${signal.sl.toFixed(4)}
🎯 Alvo (TP1): ${signal.tp1.toFixed(4)}
🎯 Alvo (TP2): ${signal.tp2.toFixed(4)}
🏆 Alvo Final: ${(signal.entry * 0.96).toFixed(4)} // Ajuste se quiser

⏱ Timeframe: ${signal.tf}
📈 Tipo: ${type === 'VIP' ? 'SWING TRADE' : 'DAY TRADE'}

📖 Leitura ${channel}:
Sinal mais filtrado (timeframes maiores).
Distância do stop: 5.00%. Stop equilibrado para este TF. Dica: paciência e consistência transformam trades em uma casa sólida. // NOVA EXPLICAÇÃO
RR ${signal.rr.toFixed(1)}.

Quer operar com mais critério?
A Sala VIP entrega sinais mais filtrados, timeframes maiores e mentoria.
Informações de acesso, fale comigo no privado: @maxmitrader.

📉 Gestão de risco: risque no máximo 1-2% da banca por trade.

Boa sorte! 🚀
  `.trim();
}

module.exports = { formatSignal };
