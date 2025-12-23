// bot.js — Bot oficial CRIPTO SEM CAÔ (versão nova com Telegraf)
// - Mensagem automática no privado (/start)
// - Botões FREE, VIP e Bybit
// - Trava de sanidade (nunca envia mensagem vazia)

const { Telegraf } = require('telegraf');
require('dotenv').config(); // Carrega o .env

const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN_FREE || process.env.TELEGRAM_TOKEN; // Usa free ou o geral

if (!TELEGRAM_TOKEN) {
  throw new Error("❌ TELEGRAM_TOKEN não encontrado no .env");
}

const bot = new Telegraf(TELEGRAM_TOKEN);

// ========================
// LINKS OFICIAIS (do .env ou fixos)
// ========================
const LINK_FREE = "https://t.me/+pu1aRiPMWUo3OWIx";
const LINK_VIP_CHAT = "tg://resolve?domain=maxmitrader";
const LINK_BYBIT = process.env.BYBIT_LINK || "https://partner.bybit.com/b/49037";

// ========================
// BOAS-VINDAS / START
// ========================
bot.start((ctx) => {
  const texto =
`👋 <b>Bem-vindo ao CRIPTO SEM CAÔ</b>

Aqui você está em um ambiente:
✅ real
✅ sem promessas
✅ com método e responsabilidade

━━━━━━━━━━━━━━━━━━
📢 <b>SALA GRATUITA</b>
• Sinais educacionais
• Foco em estrutura e leitura real
• Ideal para aprender o método

💎 <b>SALA VIP</b>
• Sinais mais filtrados
• Timeframes maiores (4h e Diário)
• Menos trades, mais critério
• Mentoria e acompanhamento

📌 <b>Importante:</b>
Leia sempre a <b>mensagem fixada</b> dentro das salas.

👇 Use os botões abaixo:`;

  ctx.replyWithHTML(texto, {
    reply_markup: {
      inline_keyboard: [
        [{ text: "📢 Entrar na Sala Gratuita", url: LINK_FREE }],
        [{ text: "💎 Falar comigo sobre a Sala VIP", url: LINK_VIP_CHAT }],
        [{ text: "🚀 Abrir conta na Bybit", url: LINK_BYBIT }]
      ]
    }
  });
});

// ========================
// FUNÇÃO DE ENVIO (COM SANIDADE) — Útil para outros arquivos
// ========================
async function sendMessage(chatId, text, extra = {}) {
  if (!text || typeof text !== "string" || text.trim().length === 0) {
    console.log("⚠️ Mensagem vazia ignorada (sanidade aplicada)");
    return false;
  }

  try {
    await bot.telegram.sendMessage(chatId, text, {
      parse_mode: "HTML",
      disable_web_page_preview: true,
      ...extra
    });
    return true;
  } catch (error) {
    console.error("Erro ao enviar mensagem:", error.message);
    return false;
  }
}

// ========================
// START BOT
// ========================
function startBot() {
  console.log("🤖 Bot conectado ao Telegram!");
  bot.launch();
  console.log("Bot iniciado com sucesso!");
}

// Para parar o bot se fechar o programa
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));

module.exports = {
  bot,
  sendMessage,
  startBot
};