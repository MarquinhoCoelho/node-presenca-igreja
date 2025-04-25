import { Pool } from 'pg';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

const sql = `
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Tabela Igreja
CREATE TABLE IF NOT EXISTS Igreja (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome VARCHAR(255) NOT NULL,
  endereco VARCHAR(255),
  telefone VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Tabela Membro
CREATE TABLE IF NOT EXISTS Membro (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome VARCHAR(255) NOT NULL,
  data_nascimento DATE,
  telefone VARCHAR(20),
  email VARCHAR(255),
  password VARCHAR(255),
  perfil VARCHAR(20) DEFAULT 'comum' CHECK (perfil IN ('admin', 'comum')),
  igreja_id UUID REFERENCES Igreja(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Tabela Presenca
CREATE TABLE IF NOT EXISTS Presenca (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  membro_id UUID REFERENCES Membro(id) ON DELETE CASCADE,
  data_presenca DATE NOT NULL,
  dia_semana VARCHAR(15),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
`;

async function executeSQL() {
  try {
    const client = await pool.connect();
    console.log('Conexão com o banco de dados estabelecida!');
    
    await client.query(sql);
    console.log('Tabelas criadas com sucesso!');
    
    client.release();
    await pool.end();
    console.log('Conexão encerrada.');
  } catch (error) {
    console.error('Erro ao executar o SQL:', error);
  }
}

executeSQL(); 