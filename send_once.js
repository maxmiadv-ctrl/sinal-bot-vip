/**
 * send_once.js — Teste manual
 */

const { gerarSinalMaisForte } = require("./main");

(async function testar() {
  console.log("🔍 Gerando sinal para teste (15m)...\n");

  const sinal = await gerarSinalMaisForte("15m");

  console.log("📊 META DO SINAL:");
  console.log(sinal.meta);

  if (sinal.gratuito) {
    console.log("\n📨 FREE seria ENVIADO ✅");
  } else {
    console.log("\n🔕 FREE não enviaria neste ciclo.");
  }

  if (sinal.vip) {
    console.log("💎 VIP seria ENVIADO ✅");
  } else {
    console.log("🔕 VIP não enviaria neste ciclo.");
  }

  console.log("\n✔ Teste concluído.");
})();
