import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import fs from "fs";
import dotenv from "dotenv";

dotenv.config();

// Define local storage structure
const BASE_DIR = path.join(process.cwd(), "HidraEletrica");
const BANCO_DIR = path.join(BASE_DIR, "banco");
const DADOS_DIR = path.join(BASE_DIR, "dados");
const BACKUP_DIR = path.join(BASE_DIR, "backup");

// Create directories if they don't exist
[BASE_DIR, BANCO_DIR, DADOS_DIR, BACKUP_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

const DB_PATH = path.join(BANCO_DIR, "hidra.db");
const db = new Database(DB_PATH);

// Automatic Backup on Startup
const backupFile = path.join(BACKUP_DIR, `backup-${new Date().toISOString().replace(/[:.]/g, "-")}.db`);
try {
  if (fs.existsSync(DB_PATH)) {
    fs.copyFileSync(DB_PATH, backupFile);
    console.log(`Backup automático criado: ${backupFile}`);
  }
} catch (err) {
  console.log("Erro ao criar backup inicial:", err);
}

// Initialize Database with requested schema
db.exec(`
  CREATE TABLE IF NOT EXISTS usuarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    senha TEXT NOT NULL,
    data_criacao TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS materiais (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    preco REAL NOT NULL,
    unidade TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS servicos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    preco REAL NOT NULL,
    descricao TEXT
  );

  CREATE TABLE IF NOT EXISTS pastas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    descricao TEXT,
    data_criacao TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS clientes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    email TEXT,
    telefone TEXT,
    endereco TEXT
  );

  CREATE TABLE IF NOT EXISTS estimativas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    cliente_id INTEGER,
    data TEXT DEFAULT CURRENT_TIMESTAMP,
    valor_total REAL,
    status TEXT DEFAULT 'pendente',
    descricao TEXT,
    FOREIGN KEY(cliente_id) REFERENCES clientes(id)
  );

  CREATE TABLE IF NOT EXISTS itens_estimativa (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    estimativa_id INTEGER,
    tipo TEXT, -- 'servico' ou 'material'
    item_id INTEGER,
    descricao TEXT,
    quantidade REAL,
    preco_unitario REAL,
    total REAL,
    FOREIGN KEY(estimativa_id) REFERENCES estimativas(id)
  );
`);

// Seed initial data if empty
const materialCount = db.prepare("SELECT COUNT(*) as count FROM materiais").get() as { count: number };
if (materialCount.count === 0) {
  const insertMaterial = db.prepare("INSERT INTO materiais (nome, preco, unidade) VALUES (?, ?, ?)");
  insertMaterial.run("Tomada 2P+T", 15, "un");
  insertMaterial.run("Fio 2.5mm", 3.5, "m");
  
  const insertService = db.prepare("INSERT INTO servicos (nome, preco, descricao) VALUES (?, ?, ?)");
  insertService.run("Instalação de tomada", 50, "Instalação completa de tomada 10A/20A");
  insertService.run("Instalação de chuveiro", 120, "Troca ou instalação de chuveiro elétrico");
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get("/api/clients", (req, res) => {
    const clients = db.prepare("SELECT * FROM clientes ORDER BY nome").all();
    res.json(clients);
  });

  app.post("/api/clients", (req, res) => {
    const { nome, email, telefone, endereco } = req.body;
    const result = db.prepare("INSERT INTO clientes (nome, email, telefone, endereco) VALUES (?, ?, ?, ?)").run(nome, email, telefone, endereco);
    res.json({ id: result.lastInsertRowid });
  });

  app.put("/api/clients/:id", (req, res) => {
    const { nome, email, telefone, endereco } = req.body;
    db.prepare("UPDATE clientes SET nome = ?, email = ?, telefone = ?, endereco = ? WHERE id = ?").run(nome, email, telefone, endereco, req.params.id);
    res.json({ success: true });
  });

  app.delete("/api/clients/:id", (req, res) => {
    db.prepare("DELETE FROM clientes WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  });

  app.get("/api/materials", (req, res) => {
    const materials = db.prepare("SELECT * FROM materiais ORDER BY nome").all();
    res.json(materials);
  });

  app.post("/api/materials", (req, res) => {
    const { nome, preco, unidade } = req.body;
    const result = db.prepare("INSERT INTO materiais (nome, preco, unidade) VALUES (?, ?, ?)").run(nome, preco, unidade);
    res.json({ id: result.lastInsertRowid });
  });

  app.put("/api/materials/:id", (req, res) => {
    const { nome, preco, unidade } = req.body;
    db.prepare("UPDATE materiais SET nome = ?, preco = ?, unidade = ? WHERE id = ?").run(nome, preco, unidade, req.params.id);
    res.json({ success: true });
  });

  app.delete("/api/materials/:id", (req, res) => {
    db.prepare("DELETE FROM materiais WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  });

  app.get("/api/services", (req, res) => {
    const services = db.prepare("SELECT * FROM servicos ORDER BY nome").all();
    res.json(services);
  });

  app.post("/api/services", (req, res) => {
    const { nome, preco, descricao } = req.body;
    const result = db.prepare("INSERT INTO servicos (nome, preco, descricao) VALUES (?, ?, ?)").run(nome, preco, descricao);
    res.json({ id: result.lastInsertRowid });
  });

  app.put("/api/services/:id", (req, res) => {
    const { nome, preco, descricao } = req.body;
    db.prepare("UPDATE servicos SET nome = ?, preco = ?, descricao = ? WHERE id = ?").run(nome, preco, descricao, req.params.id);
    res.json({ success: true });
  });

  app.delete("/api/services/:id", (req, res) => {
    db.prepare("DELETE FROM servicos WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  });

  // Pastas (Obras) API
  app.get("/api/pastas", (req, res) => {
    const pastas = db.prepare("SELECT * FROM pastas ORDER BY data_criacao DESC").all();
    res.json(pastas);
  });

  app.post("/api/pastas", (req, res) => {
    const { nome, descricao } = req.body;
    const result = db.prepare("INSERT INTO pastas (nome, descricao) VALUES (?, ?)").run(nome, descricao);
    res.json({ id: result.lastInsertRowid });
  });

  app.put("/api/pastas/:id", (req, res) => {
    const { nome, descricao } = req.body;
    db.prepare("UPDATE pastas SET nome = ?, descricao = ? WHERE id = ?").run(nome, descricao, req.params.id);
    res.json({ success: true });
  });

  app.delete("/api/pastas/:id", (req, res) => {
    db.prepare("DELETE FROM pastas WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  });

  app.get("/api/budgets", (req, res) => {
    const budgets = db.prepare(`
      SELECT e.*, c.nome as client_name 
      FROM estimativas e 
      JOIN clientes c ON e.cliente_id = c.id
      ORDER BY e.data DESC
    `).all();
    res.json(budgets);
  });

  app.get("/api/budgets/:id", (req, res) => {
    const budget = db.prepare("SELECT e.*, c.nome as client_name, c.email as client_email, c.telefone as client_phone, c.endereco as client_address FROM estimativas e JOIN clientes c ON e.cliente_id = c.id WHERE e.id = ?").get(req.params.id);
    const items = db.prepare("SELECT * FROM itens_estimativa WHERE estimativa_id = ?").all(req.params.id);
    res.json({ ...budget, items });
  });

  app.post("/api/budgets", (req, res) => {
    const { cliente_id, items, valor_total, descricao, status } = req.body;
    const insertBudget = db.prepare(`
      INSERT INTO estimativas (cliente_id, valor_total, descricao, status)
      VALUES (?, ?, ?, ?)
    `);
    const result = insertBudget.run(cliente_id, valor_total, descricao, status || 'pendente');
    const budgetId = result.lastInsertRowid;

    const insertItem = db.prepare(`
      INSERT INTO itens_estimativa (estimativa_id, tipo, item_id, descricao, quantidade, preco_unitario, total)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    for (const item of items) {
      insertItem.run(budgetId, item.tipo, item.item_id, item.descricao, item.quantidade, item.preco_unitario, item.total);
    }

    res.json({ id: budgetId });
  });

  app.delete("/api/budgets/:id", (req, res) => {
    db.prepare("DELETE FROM itens_estimativa WHERE estimativa_id = ?").run(req.params.id);
    db.prepare("DELETE FROM estimativas WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  });

  app.put("/api/budgets/:id/status", (req, res) => {
    const { status } = req.body;
    db.prepare("UPDATE estimativas SET status = ? WHERE id = ?").run(status, req.params.id);
    res.json({ success: true });
  });

  app.get("/api/stats", (req, res) => {
    const totalFaturado = db.prepare("SELECT SUM(valor_total) as total FROM estimativas WHERE status = 'concluido'").get() as any;
    const totalServicos = db.prepare("SELECT COUNT(*) as count FROM estimativas").get() as any;
    const topServicos = db.prepare(`
      SELECT descricao as name, COUNT(*) as count 
      FROM itens_estimativa 
      WHERE tipo = 'servico' 
      GROUP BY descricao 
      ORDER BY count DESC 
      LIMIT 5
    `).all();

    res.json({
      totalFaturado: totalFaturado.total || 0,
      totalServicos: totalServicos.count || 0,
      topServicos
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
