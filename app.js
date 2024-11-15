import express from 'express';
import { Low, JSONFile } from 'lowdb';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import cors from 'cors';

// Importa as rotas dos estudantes
import routes from './routes/students.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware para permitir CORS
app.use(cors());

// Middleware para analisar corpos JSON
app.use(express.json());

// Obtém o nome do diretório atual
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Verifica se o diretório do banco de dados existe
const dbDir = join(__dirname, 'db');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir);
}

// Cria uma nova instância do Low com um arquivo JSON
const db = new Low(new JSONFile(join(dbDir, 'db.json')));

// Inicializa o banco de dados
async function init() {
  // Lê o banco de dados
  await db.read();
  db.data ||= { students: [] }; // Dados padrão
  await db.write();

  // O Express servirá a pasta public
  app.use(express.static(join(__dirname, 'public')));

  // Endpoint principal para direcionar "/" ao frontend
  app.get('/', (req, res) => {
    res.sendFile(join(__dirname, 'public', 'index.html'));
  });

  // Rotas de students
  app.use('/students', routes(db));

  // Inicia o servidor
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

init().catch(err => {
  console.error('Error running the server:', err);
});
