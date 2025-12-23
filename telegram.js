// telegram.js — Bot único Telegraf (free e VIP)
const { Telegraf } = require('telegraf');
require('dotenv').config();

const TOKEN = process.env.TELEGRAM_TOKEN || process.env.TELEGRAM_TOKEN_FREE;

if (!TOKEN) {
  throw new Error("❌ TELEGRAM_TOKEN não encontrado no .env");
}

const bot = new Telegraf(TOKEN);

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));

bot.launch();
console.log('Bot Telegram iniciado!');

module.exports = { bot };