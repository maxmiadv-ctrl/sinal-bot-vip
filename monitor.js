const winston = require('winston');
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./bot_history.db'); // DB simples

// Cria tabela se não existir
db.run(`CREATE TABLE IF NOT EXISTS signals (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  symbol TEXT,
  tf TEXT,
  direction TEXT,
  entry REAL,
  stop REAL,
  tp1 REAL,
  rr REAL,
  score INTEGER,
  stars TEXT,
  room TEXT, -- FREE ou VIP
  status TEXT DEFAULT 'OPEN', -- OPEN, WIN, LOSS
  close_time DATETIME,
  profit REAL
)`);

// Logger pra arquivos diários
const logger = winston.createLogger({
  transports: [
    new winston.transports.File({ filename: 'bot_logs.log' })
  ]
});

// Função pra salvar sinal enviado
function logSignal(sinal, room) {
  db.run(`INSERT INTO signals (symbol, tf, direction, entry, stop, tp1, rr, score, stars, room) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
    sinal.symbol,
    sinal.timeframe,
    sinal.direction,
    sinal.entrada,
    sinal.stop,
    sinal.tp1,
    sinal.rr,
    sinal.score,
    sinal.estrelas,
    room
  ]);

  logger.info(`Sinal enviado: ${room} - ${sinal.symbol} ${sinal.timeframe} - Score: ${sinal.score}`);
}

// Função pra checar acerto/erro (rode a cada hora)
async function checkOpenSignals() {
  const { fetchKlines } = require("./fetcher");
  db.all(`SELECT * FROM signals WHERE status = 'OPEN'`, [], (err, rows) => {
    if (err) return logger.error(err.message);
    rows.forEach(async row => {
      const klines = await fetchKlines(row.symbol, '5m', 1); // Preço atual
      const current = klines[0]?.close || 0;
      let status = 'OPEN';
      let profit = 0;
      if (row.direction === "COMPRA") {
        if (current <= row.stop) { status = 'LOSS'; profit = row.stop - row.entry; }
        if (current >= row.tp1) { status = 'WIN'; profit = row.tp1 - row.entry; }
      } else {
        if (current >= row.stop) { status = 'LOSS'; profit = row.entry - row.stop; }
        if (current <= row.tp1) { status = 'WIN'; profit = row.entry - row.tp1; }
      }
      if (status !== 'OPEN') {
        db.run(`UPDATE signals SET status = ?, close_time = CURRENT_TIMESTAMP, profit = ? WHERE id = ?`, [status, profit, row.id]);
        logger.info(`Trade fechado: ${row.symbol} ${status} - Profit: ${profit}`);
      }
    });
  });
}

// Rode check a cada hora
setInterval(checkOpenSignals, 60 * 60 * 1000); // 1 hora

// Relatório simples (ex: acertos por hora)
function getReport(type = 'daily') {
  // Implementar consulta DB pra relatório
  // Ex: db.all(`SELECT * FROM signals WHERE timestamp > date('now','-1 day')`, ... )
  console.log("Relatório gerado – ver bot_logs.log");
}

module.exports = { logSignal, getReport };