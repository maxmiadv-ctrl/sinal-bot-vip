// bot.js — Bot privado com boas-vindas + botões inline (exato como o modelo antigo)

const { Telegraf } = require('telegraf');
require('dotenv').config();

const bot = new Telegraf(process.env.TELEGRAM_TOKEN_FREE);

const FREE_CHANNEL_LINK = "https://t.me/+seu_link_canal_free"; // MUDE PRA LINK DO CANAL FREE
const PRIVATE_USER = process.env.PRIVATE_USER || "@maxmitrader";
const BYBIT_LINK = process.env.BYBIT_LINK || "https://partner.bybit.com/b/49037";

// Mensagem de boas-vindas com botões inline
bot.start((ctx) => ctx.reply(
`👋 Bem-vindo ao CRIPTO SEM CAÔ

Aqui você está em um ambiente:
✅ real
✅ sem promessas
✅ com método e responsabilidade

🔹 SALA GRATUITA
• Sinais educacionais
• Foco em estrutura e leitura real
• Ideal para aprender o método

🔹 SALA VIP
• Sinais mais filtrados
• Timeframes maiores (4h e Diário)
• Menos trades, mais critério
• Mentoria e acompanhamento

⚠️ Importante:
Leia sempre a mensagem fixada dentro das salas.

👇 Use os botões abaixo:`,
{
  reply_markup: {
    inline_keyboard: [
      [{ text: "🔊 Entrar na Sala Gratuita", url: FREE_CHANNEL_LINK }],
      [{ text: "💎 Falar comigo sobre a Sala VIP", url: `https://t.me/${PRIVATE_USER.replace('@', '')}` }],
      [{ text: "🚀 Abrir conta na Bybit", url: BYBIT_LINK }]
    ]
  }
}
));

// Responde qualquer mensagem privada com a mesma mensagem
bot.on('text', (ctx) => {
  if (ctx.chat.type === 'private') {
    ctx.reply(
`👋 Bem-vindo ao CRIPTO SEM CAÔ

Aqui você está em um ambiente:
✅ real
✅ sem promessas
✅ com método e responsabilidade

🔹 SALA GRATUITA
• Sinais educacionais
• Foco em estrutura e leitura real
• Ideal para aprender o método

🔹 SALA VIP
• Sinais mais filtrados
• Timeframes maiores (4h e Diário)
• Menos trades, mais critério
• Mentoria e acompanhamento

⚠️ Importante:
Leia sempre a mensagem fixada dentro das salas.

👇 Use os botões abaixo:`,
{
  reply_markup: {
    inline_keyboard: [
      [{ text: "🔊 Entrar na Sala Gratuita", url: FREE_CHANNEL_LINK }],
      [{ text: "💎 Falar comigo sobre a Sala VIP", url: `https://t.me/${PRIVATE_USER.replace('@', '')}` }],
      [{ text: "🚀 Abrir conta na Bybit", url: BYBIT_LINK }]
    ]
  }
}
    );
  }
});

bot.launch();

module.exports = { bot };
