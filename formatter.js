// formatter.js — Formato EXATO como antigo (icons, texto, risk 1-2%, explicação, botão Bybit)

function formatSignal(signal, type) {
  const channel = type === 'VIP' ? 'VIP' : 'GRATUITO';
  const operacao = signal.entry > signal.sl ? 'COMPRA' : 'VENDA'; // Ajuste se tiver lógica

  return `
⭐ *SINAL ${channel} — CRIPTO SEM CAÔ*

⭐ Força do sinal: ★★★

🔴 Par: ${signal.pair}
🟢 Operação: ${operacao}
💰 Entrada: ${signal.entry}
🔴 Stop: ${signal.sl}
🟢 Alvo (TP1): ${signal.tp1}
🟢 Alvo (TP2): ${signal.tp2}
🏆 Alvo Final: ${signal.alvoFinal || signal.tp2}

⏰ Timeframe: ${signal.tf}
📊 Tipo: ${type === 'VIP' ? 'SWING TRADE' : 'DAY TRADE'}

📖 Leitura ${channel}:
${type === 'VIP' ? 'Sinal mais filtrado (timeframes maiores).' : 'Foco em estrutura e leitura real.'}

Distância do stop: 7.00% - Stop equilibrado para este TF. Dica: paciência e consistência transformam trades em uma casa sólida. // NOVA EXPLICAÇÃO

RR = ${signal.rr}

💡 Quer operar com mais critério?
A Sala VIP entrega sinais mais filtrados, timeframes maiores e mentoria.
Para informações de acesso, fale comigo no privado: @maxmitrader.

📉 Gestão de risco: risque no máximo 1-2% da banca por trade.

Suporte e acompanhamento no privado: @maxmitrader

[🚀 Abrir conta na Bybit](https://partner.bybit.com/b/49037)

Boa sorte! 🚀
  `.trim();
}

module.exports = { formatSignal };
