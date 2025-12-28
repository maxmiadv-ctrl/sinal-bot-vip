// index.js — Corrigido para Koyeb: webhook Telegram, endpoint spot, filtro pares, estabilidade
require('dotenv').config();
const { Telegraf } = require('telegraf');
const { fetchKlines } = require('./fetcher');
const { analyzeVIP, analyzeFree } = require('./analyzer');
const { formatSignal } = require('./formatter');
const { Client, GatewayIntentBits, ChannelType } = require('discord.js');

const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN || process.env.TELEGRAM_TOKEN_FREE;
const FREE_CHANNEL_ID = process.env.FREE_CHANNEL_ID;
const VIP_CHANNEL_ID = process.env.VIP_CHANNEL_ID;
const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
const DISCORD_VIP_CHANNEL_ID = process.env.DISCORD_VIP_CHANNEL_ID;

const bot = new Telegraf(TELEGRAM_TOKEN);

// Pares indesejados
const PARES_EXCLUIDOS = ['TETHERUSDT', 'EOSUSDT', 'AGIXUSDT'];

// Top 50 filtrado
const TOP_50_PAIRS = ['BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'BNBUSDT', 'XRPUSDT', 'ADAUSDT', 'DOGEUSDT', 'AVAXUSDT', 'TRXUSDT', 'LINKUSDT', 'DOTUSDT', 'SHIBUSDT', 'MATICUSDT', 'BCHUSDT', 'LTCUSDT', 'TONUSDT', 'UNIUSDT', 'ICPUSDT', 'ETCUSDT', 'LEOUSDT', 'APTUSDT', 'FILUSDT', 'NEARUSDT', 'ATOMUSDT', 'RNDRUSDT', 'XLMUSDT', 'HBARUSDT', 'CROUSDT', 'GRTUSDT', 'STXUSDT', 'OPUSDT', 'INJUSDT', 'IMXUSDT', 'MKRUSDT', 'VETUSDT', 'ARBUSDT', 'KASUSDT', 'XMRUSDT', 'BGBUSDT', 'FLOKIUSDT', 'THETAUSDT', 'BSVUSDT', 'ARUSDT', 'ALGOUSDT', 'RUNEUSDT', 'LDOUSDT', 'FTMUSDT', 'FLOWUSDT', 'GALAUSDT', 'AAVEUSDT'];
const PARES_FILTRADOS = TOP_50_PAIRS.filter(p => !PARES_EXCLUIDOS.includes(p));

function shuffle(array) {
  return array.sort(() => Math.random() - 0.5);
}

let pool = shuffle([...PARES_FILTRADOS]);
let index = 0;
let freeCount = 0;
let vipCount = 0;
const MAX_FREE = 25;
const MAX_VIP = 12;

// Discord
let discordClient;
if (DISCORD_TOKEN && DISCORD_VIP_CHANNEL_ID) {
  discordClient = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });
  discordClient.login(DISCORD_TOKEN);
  discordClient.on('ready', () => {
    console.log(`🤖 DISCORD VIP CONECTADO COM SUCESSO como ${discordClient.user.tag}!`);
    console.log(`Canal VIP configurado: ${DISCORD_VIP_CHANNEL_ID}`);
  });
}

// Envio Telegram
async function sendToTelegram(channelId, message) {
  try {
    await bot.telegram.sendMessage(channelId, message, { parse_mode: 'Markdown' });
    console.log(`✅ SINAL ENVIADO: ${message} | Canal: ${channelId}`);
  } catch (err) {
    console.log(`❌ Erro Telegram: ${err.message}`);
  }
}

// Envio Discord
async function sendToDiscord(message) {
  if (!discordClient) return;
  try {
    const channel = await discordClient.channels.fetch(DISCORD_VIP_CHANNEL_ID);
    if (channel.type === ChannelType.GuildText) {
      await channel.send(message);
      console.log(`✅ SINAL DISCORD ENVIADO`);
    }
  } catch (err) {
    console.log(`❌ Erro Discord: ${err.message}`);
  }
}

// Análise par (com filtro)
async function analyzePair(pair) {
  if (PARES_EXCLUIDOS.includes(pair)) {
    console.log(`Ignorando par indesejado: ${pair}`);
    return;
  }

  console.log(`🔍 Analisando: ${pair}`);
  try {
    let vipSignal = await analyzeVIP(pair);
    if (vipSignal) {
      vipCount++;
      if (vipCount <= MAX_VIP) {
        const formatted = formatSignal(vipSignal, 'VIP');
        await sendToTelegram(VIP_CHANNEL_ID, formatted);
        await sendToDiscord(formatted);
      }
    }

    let freeSignal = await analyzeFree(pair);
    if (freeSignal) {
      freeCount++;
      if (freeCount <= MAX_FREE) {
        const formatted = formatSignal(freeSignal, 'FREE');
        await sendToTelegram(FREE_CHANNEL_ID, formatted);
      }
    }
  } catch (err) {
    console.log(`❌ Erro análise ${pair}: ${err.message}`);
  }
  await new Promise(r => setTimeout(r, 60000)); // Delay 60s para estabilidade
}

// Loop principal
async function main() {
  console.log(`🚀 ROBÔ INICIADO 24/7`);
  while (true) {
    try {
      if (index >= pool.length) {
        pool = shuffle([...PARES_FILTRADOS]);
        index = 0;
        console.log(`Pool recarregado: ${pool.length} pares`);
      }
      await analyzePair(pool[index]);
      index++;
    } catch (err) {
      console.log(`❌ Erro loop: ${err.message}`);
    }
    await new Promise(r => setTimeout(r, 300000)); // Pausa 5min
  }
}

main().catch(err => console.log(`❌ Erro principal: ${err.message}`));

// Webhook para Telegram (Koyeb suporta)
const PORT = process.env.PORT || 3000;
bot.telegram.setWebhook(`https://seu-app.koyeb.app/${TELEGRAM_TOKEN}`);
bot.startWebhook(`/${TELEGRAM_TOKEN}`, null, PORT);

// Graceful shutdown
process.on('SIGTERM', () => {
  bot.stop('SIGTERM');
  discordClient?.destroy();
  process.exit(0);
});
process.on('SIGINT', () => {
  bot.stop('SIGINT');
  discordClient?.destroy();
  process.exit(0);
});
