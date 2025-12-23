const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./bot_history.db');

console.log("\n📊 RELATÓRIO DO ROBÔ CRIPTO SEM CAÔ - 23/12/2025\n");

// Quantidade de sinais enviados (total, FREE, VIP)
db.serialize(() => {
  db.get("SELECT COUNT(*) as total FROM signals", (err, row) => {
    if (err) return console.error(err.message);
    console.log(`Total de sinais enviados: ${row.total}`);
  });

  db.all("SELECT room, COUNT(*) as count FROM signals GROUP BY room", [], (err, rows) => {
    if (err) return console.error(err.message);
    console.log("\nPor sala:");
    rows.forEach(row => {
      console.log(` - ${row.room || 'Desconhecida'}: ${row.count} sinais`);
    });
  });

  // Acerto/Erro (win rate)
  db.all("SELECT status, COUNT(*) as count FROM signals GROUP BY status", [], (err, rows) => {
    if (err) return console.error(err.message);
    let total = 0, wins = 0, losses = 0, open = 0;
    rows.forEach(row => {
      total += row.count;
      if (row.status === 'WIN') wins = row.count;
      if (row.status === 'LOSS') losses = row.count;
      if (row.status === 'OPEN') open = row.count;
    });
    console.log("\nPerformance:");
    console.log(` - Aberto: ${open}`);
    console.log(` - Acertos (WIN): ${wins}`);
    console.log(` - Erros (LOSS): ${losses}`);
    if (total > open) {
      console.log(` - Win rate (fechados): ${((wins / (wins + losses)) * 100).toFixed(2)}%`);
    }
  });

  // Melhores horários (acertos por hora do dia)
  db.all("SELECT strftime('%H', timestamp) as hora, COUNT(*) as wins FROM signals WHERE status = 'WIN' GROUP BY hora ORDER BY wins DESC LIMIT 10", [], (err, rows) => {
    if (err) return console.error(err.message);
    console.log("\nMelhores horários (mais acertos):");
    if (rows.length === 0) console.log(" - Ainda sem acertos fechados");
    rows.forEach(row => console.log(` - Hora ${row.hora}:00 - ${row.wins} wins`));
  });

  // Pairs melhores (win rate por par)
  db.all("SELECT symbol, COUNT(*) as total, SUM(CASE WHEN status = 'WIN' THEN 1 ELSE 0 END) as wins FROM signals GROUP BY symbol HAVING total > 0 ORDER BY (wins * 1.0 / total) DESC", [], (err, rows) => {
    if (err) return console.error(err.message);
    console.log("\nPairs com melhor desempenho:");
    if (rows.length === 0) console.log(" - Ainda sem dados");
    rows.forEach(row => {
      const rate = ((row.wins / row.total) * 100).toFixed(2);
      console.log(` - ${row.symbol}: ${row.wins}/${row.total} (${rate}%)`);
    });
  });
});

db.close();