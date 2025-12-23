// discord.js — Versão FINAL com log completo

const { Client, GatewayIntentBits } = require('discord.js');
require('dotenv').config();

const DISCORD_TOKEN = process.env.DISCORD_TOKEN?.trim();
const DISCORD_CHANNEL_ID = process.env.DISCORD_VIP_CHANNEL_ID;

if (!DISCORD_TOKEN || !DISCORD_CHANNEL_ID) {
  console.log("⚠️ Discord VIP não configurado no .env");
  module.exports = { sendToDiscord: async () => false };
} else {
  const client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent
    ]
  });

  client.once('ready', () => {
    console.log(`🤖 DISCORD VIP CONECTADO COM SUCESSO como ${client.user.tag}!`);
    console.log(`Canal VIP configurado: ${DISCORD_CHANNEL_ID}`);
    // Teste automático
    sendToDiscord("💎 **BOT VIP ONLINE 22/12/2025!** 🚀\nCripto Sem Caô VIP pronto para sinais exclusivos ★★★ e aulas ao vivo.\nTeste de conexão – tudo funcionando!");
  });

  client.on('error', err => console.error("❌ Erro Discord:", err));

  client.login(DISCORD_TOKEN).catch(err => {
    console.error("❌ FALHA LOGIN DISCORD (token errado ou intents faltando):", err.message);
  });

  async function sendToDiscord(text) {
    try {
      const channel = await client.channels.fetch(DISCORD_CHANNEL_ID);
      await channel.send(text);
      console.log("✅ Sinal/mensagem enviada para Discord VIP");
      return true;
    } catch (err) {
      console.error("❌ Erro envio Discord:", err.message);
      return false;
    }
  }

  module.exports = { sendToDiscord };
}