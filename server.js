const express = require("express");
const path = require("path");
const { Pool } = require("pg");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const app = express();
const PORT = process.env.PORT || 10000;
const JWT_SECRET = process.env.JWT_SECRET || "troque-esta-chave-no-render";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "123456";

if (!process.env.DATABASE_URL) {
  console.error("ERRO: configure DATABASE_URL no Render.");
  process.exit(1);
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

async function initDb() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS cargas (
      id SERIAL PRIMARY KEY,
      carga TEXT NOT NULL,
      valor NUMERIC(12,2) NOT NULL DEFAULT 0,
      coleta TEXT NOT NULL,
      entrega TEXT NOT NULL,
      placa TEXT NOT NULL,
      motorista TEXT NOT NULL,
      data_viagem DATE,
      observacao TEXT DEFAULT '',
      status TEXT NOT NULL DEFAULT 'Disponível',
      criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);
  console.log("Banco de dados pronto.");
}

function autenticar(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) return res.status(401).json({ erro: "Não autorizado." });

  try {
    req.admin = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ erro: "Sessão expirada." });
  }
}

app.post("/api/login", async (req, res) => {
  const senha = String(req.body.senha || "");
  const ok = senha === ADMIN_PASSWORD;

  if (!ok) return res.status(401).json({ erro: "Senha incorreta." });

  const token = jwt.sign({ admin: true }, JWT_SECRET, { expiresIn: "7d" });
  res.json({ token });
});

app.get("/api/cargas", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, carga, valor, coleta, entrega, placa, motorista,
             data_viagem, observacao, status, criado_em
      FROM cargas
      ORDER BY id DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: "Erro ao carregar cargas." });
  }
});

app.post("/api/cargas", autenticar, async (req, res) => {
  const {
    carga, valor, coleta, entrega, placa, motorista,
    data_viagem, observacao, status
  } = req.body;

  if (!carga || !coleta || !entrega || !placa || !motorista) {
    return res.status(400).json({ erro: "Preencha os campos obrigatórios." });
  }

  try {
    const result = await pool.query(`
      INSERT INTO cargas
      (carga, valor, coleta, entrega, placa, motorista, data_viagem, observacao, status)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
      RETURNING *
    `, [
      carga,
      Number(valor) || 0,
      coleta,
      entrega,
      placa,
      motorista,
      data_viagem || null,
      observacao || "",
      status || "Disponível"
    ]);

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: "Erro ao criar carga." });
  }
});

app.put("/api/cargas/:id", autenticar, async (req, res) => {
  const id = Number(req.params.id);
  const {
    carga, valor, coleta, entrega, placa, motorista,
    data_viagem, observacao, status
  } = req.body;

  try {
    const result = await pool.query(`
      UPDATE cargas SET
        carga=$1, valor=$2, coleta=$3, entrega=$4, placa=$5,
        motorista=$6, data_viagem=$7, observacao=$8, status=$9
      WHERE id=$10
      RETURNING *
    `, [
      carga,
      Number(valor) || 0,
      coleta,
      entrega,
      placa,
      motorista,
      data_viagem || null,
      observacao || "",
      status || "Disponível",
      id
    ]);

    if (!result.rowCount) return res.status(404).json({ erro: "Carga não encontrada." });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: "Erro ao editar carga." });
  }
});

app.delete("/api/cargas/:id", autenticar, async (req, res) => {
  try {
    const result = await pool.query("DELETE FROM cargas WHERE id=$1", [Number(req.params.id)]);
    if (!result.rowCount) return res.status(404).json({ erro: "Carga não encontrada." });
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: "Erro ao excluir carga." });
  }
});

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

initDb()
  .then(() => app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`)))
  .catch(err => {
    console.error("Falha ao iniciar:", err);
    process.exit(1);
  });
