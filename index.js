// index.js — Corrigido para Koyeb: sem erro 409, exclui pares indesejados, endpoint público, try/catch
require('dotenv').config();
const { fetchKlines } = require('./fetcher');
const { analyzeVIP, analyzeFree } = require('./analyzer');
const { formatSignal } = require('./formatter');
const { bot } = require('./bot');
const TELEGRAM_TOKEN_FREE = process.env.TELEGRAM_TOKEN_FREE;
const FREE_CHANNEL_ID = process.env.FREE_CHANNEL_ID;
const VIP_CHANNEL_ID = process.env.VIP_CHANNEL_ID;
const BYBIT_LINK = process.env.BYBIT_LINK || "https://partner.bybit.com/b/49037";
const PRIVATE_USER = process.env.PRIVATE_USER || "@maxmitrader";
const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
const DISCORD_VIP_CHANNEL_ID = process.env.DISCORD_VIP_CHANNEL_ID;
const { Client, GatewayIntentBits, ChannelType } = require('discord.js');
let discordClient;
if (DISCORD_TOKEN && DISCORD_VIP_CHANNEL_ID) {
  discordClient = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });
  discordClient.login(DISCORD_TOKEN);
  discordClient.on('ready', () => {
    console.log(`🤖 DISCORD VIP CONECTADO COM SUCESSO como ${discordClient.user.tag}!`);
    console.log(`Canal VIP configurado: ${DISCORD_VIP_CHANNEL_ID}`);
  });
} else {
  console.log("⚠️ Discord VIP não configurado no .env");
}

// Pares indesejados
const PARES_EXCLUIDOS = ['TETHERUSDT', 'EOSUSDT', 'AGIXUSDT'];

const TOP_50_PAIRS = ['BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'BNBUSDT', 'XRPUSDT', 'ADAUSDT', 'DOGEUSDT', 'AVAXUSDT', 'TRXUSDT', 'LINKUSDT', 'DOTUSDT', 'SHIBUSDT', 'MATICUSDT', 'BCHUSDT', 'LTCUSDT', 'TONUSDT', 'UNIUSDT', 'ICPUSDT', 'ETCUSDT', 'LEOUSDT', 'APTUSDT', 'FILUSDT', 'NEARUSDT', 'ATOMUSDT', 'RNDRUSDT', 'XLMUSDT', 'HBARUSDT', 'CROUSDT', 'GRTUSDT', 'STXUSDT', 'OPUSDT', 'INJUSDT', 'IMXUSDT', 'MKRUSDT', 'VETUSDT', 'ARBUSDT', 'KASUSDT', 'XMRUSDT', 'BGBUSDT', 'FLOKIUSDT', 'THETAUSDT', 'BSVUSDT', 'ARUSDT', 'ALGOUSDT', 'RUNEUSDT', 'LDOUSDT', 'FTMUSDT', 'FLOWUSDT', 'GALAUSDT', 'AAVEUSDT'];

// Filtra pares indesejados
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

async function sendToTelegram(channelId, message) {
  try {
    await bot.telegram.sendMessage(channelId, message, { parse_mode: 'Markdown' });
    console.log(`✅ SINAL ENVIADO: ${message} | Canal: ${channelId}`);
  } catch (err) {
    console.log(`❌ Erro Telegram: ${err.message}`);
  }
}

async function sendToDiscord(channelId, message) {
  try {
    const channel = await discordClient.channels.fetch(channelId);
    if (channel.type === ChannelType.GuildText) {
      await channel.send(message);
      console.log(`✅ SINAL DISCORD ENVIADO: ${message}`);
    }
  } catch (err) {
    console.log(`❌ Erro Discord: ${err.message}`);
  }
}

async function analyzePair(pair) {
  console.log(`🔍 [${index + 1}] Analisando: ${pair} | ${new Date().toLocaleString('pt-BR')}`);
  try {
    let vipSignal = await analyzeVIP(pair);
    if (vipSignal) {
      vipCount++;
      if (vipCount <= MAX_VIP) {
        const formatted = formatSignal(vipSignal, 'VIP');
        await sendToTelegram(VIP_CHANNEL_ID, formatted);
        if (DISCORD_TOKEN) await sendToDiscord(DISCORD_VIP_CHANNEL_ID, formatted);
        console.log(`💎 VIP ENVIADO (${vipCount}/${MAX_VIP}) | ${pair}`);
      }
    }

    let freeSignal = await analyzeFree(pair);
    if (freeSignal) {
      freeCount++;
      if (freeCount <= MAX_FREE) {
        const formatted = formatSignal(freeSignal, 'FREE');
        await sendToTelegram(FREE_CHANNEL_ID, formatted);
        console.log(`📢 FREE ENVIADO (${freeCount}/${MAX_FREE}) | ${pair}`);
      }
    }
  } catch (err) {
    console.log(`❌ Erro na análise de ${pair}: ${err.message}`);
  }
  await new Promise(r => setTimeout(r, 30000)); // Delay 30s
}

async function main() {
  console.log(`🚀 ROBÔ CRIPTO SEM CAÔ INICIADO 24/7 - VERSÃO ULTRA ASSERTIVA 2025`);
  console.log(`🔥 Analisando apenas os TOP 50 pares de alta liquidez`);
  console.log(`📊 Aguardando oportunidades...`);

  while (true) {
    try {
      if (index >= pool.length) {
        pool = shuffle([...PARES_FILTRADOS]);
        index = 0;
        console.log(`🔄 Pool recarregado e embaralhado: ${pool.length} pares prontos!`);
      }
      await analyzePair(pool[index]);
      index++;
    } catch (err) {
      console.log(`❌ Erro no loop principal: ${err.message}`);
    }
    await new Promise(r => setTimeout(r, 60000)); // Pausa extra para estabilidade
  }
}

main().catch(err => console.log(`❌ Erro principal: ${err.message}`));

// Graceful shutdown para Koyeb
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
