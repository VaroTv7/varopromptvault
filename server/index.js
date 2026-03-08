import fastify from 'fastify';
import cors from '@fastify/cors';
import { open } from 'sqlite';
import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';
import path from 'path';
import fastifyStatic from '@fastify/static';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = process.env.DB_PATH || path.join(__dirname, '../data/promptvault.db');

const app = fastify({ logger: true });

// Register CORS
await app.register(cors, { origin: '*' });

// Register Static for Frontend
await app.register(fastifyStatic, {
    root: path.join(__dirname, '../client/dist'),
    prefix: '/',
});

// Database initialization
const db = await open({
    filename: dbPath,
    driver: sqlite3.Database
});

await db.exec(`
  CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL
  );

  CREATE TABLE IF NOT EXISTS prompts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    category_id INTEGER,
    tags TEXT, -- Comma separated tags for simplicity in this version
    version INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories (id)
  );

  CREATE TABLE IF NOT EXISTS comments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    prompt_id INTEGER,
    content TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (prompt_id) REFERENCES prompts (id)
  );
`);

// API Routes
app.get('/api/prompts', async (request, reply) => {
    const { search, category, tag } = request.query;
    let query = 'SELECT p.*, c.name as category_name FROM prompts p LEFT JOIN categories c ON p.category_id = c.id WHERE 1=1';
    const params = [];

    if (search) {
        query += ' AND (p.title LIKE ? OR p.content LIKE ?)';
        params.push(`%${search}%`, `%${search}%`);
    }
    if (category) {
        query += ' AND c.name = ?';
        params.push(category);
    }
    if (tag) {
        query += ' AND p.tags LIKE ?';
        params.push(`%${tag}%`);
    }

    query += ' ORDER BY p.updated_at DESC';
    return await db.all(query, params);
});

app.post('/api/prompts', async (request, reply) => {
    const { title, content, category_id, tags } = request.body;
    const result = await db.run(
        'INSERT INTO prompts (title, content, category_id, tags) VALUES (?, ?, ?, ?)',
        [title, content, category_id, tags]
    );
    return { id: result.lastID };
});

app.get('/api/categories', async () => {
    return await db.all('SELECT * FROM categories');
});

app.post('/api/categories', async (request, reply) => {
    const { name } = request.body;
    try {
        const result = await db.run('INSERT INTO categories (name) VALUES (?)', [name]);
        return { id: result.lastID };
    } catch (err) {
        reply.code(400).send({ error: 'Category already exists' });
    }
});

// Start Server
const PORT = process.env.PORT || 3000;
try {
    await app.listen({ port: PORT, host: '0.0.0.0' });
} catch (err) {
    app.log.error(err);
    process.exit(1);
}
