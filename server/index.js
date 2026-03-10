import fastify from 'fastify';
import cors from '@fastify/cors';
import { open } from 'sqlite';
import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';
import path from 'path';
import fastifyStatic from '@fastify/static';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = process.env.DB_PATH || path.join(__dirname, '../data/promptvault.db');

const app = fastify({ logger: true });

// Register CORS
await app.register(cors, { origin: '*' });

// Register Static for Frontend ONLY if it exists
const distPath = path.join(__dirname, '../client/dist');
if (fs.existsSync(distPath)) {
    await app.register(fastifyStatic, {
        root: distPath,
        prefix: '/',
    });
}

// Database initialization
const db = await open({
    filename: dbPath,
    driver: sqlite3.Database
});

await db.exec(`CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL
);`);

await db.exec(`CREATE TABLE IF NOT EXISTS prompts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    tags TEXT,
    category_id INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(category_id) REFERENCES categories(id)
);`);

await db.exec(`CREATE TABLE IF NOT EXISTS prompt_versions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    prompt_id INTEGER,
    content TEXT NOT NULL,
    version_number INTEGER,
    note TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(prompt_id) REFERENCES prompts(id)
);`);

await db.exec(`CREATE TABLE IF NOT EXISTS comments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    prompt_id INTEGER,
    text TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(prompt_id) REFERENCES prompts(id)
);`);

// Seed initial categories if empty
const { count } = await db.get("SELECT count(*) as count FROM categories");
if (count === 0) {
    const categoriesToSeed = ['Programación', 'Ventas', 'Copywriting', 'SEO'];
    for (const cat of categoriesToSeed) {
        await db.run("INSERT INTO categories (name) VALUES (?)", [cat]);
    }
}

// Categories API
app.get('/api/categories', async (req, res) => {
    return await db.all("SELECT * FROM categories ORDER BY name ASC");
});

app.post('/api/categories', async (req, res) => {
    const { name } = req.body;
    try {
        const result = await db.run("INSERT INTO categories (name) VALUES (?)", [name]);
        return { id: result.lastID, name };
    } catch (err) {
        res.code(400).send({ error: "Ya existe o es inválida" });
    }
});

app.put('/api/categories/:id', async (req, res) => {
    const { name } = req.body;
    const result = await db.run("UPDATE categories SET name = ? WHERE id = ?", [name, req.params.id]);
    return { updated: result.changes };
});

app.delete('/api/categories/:id', async (req, res) => {
    // Check if category has prompts
    const count = await db.get("SELECT COUNT(*) as c FROM prompts WHERE category_id = ?", [req.params.id]);
    if (count.c > 0) {
        return res.code(400).send({ error: "No se puede borrar; tiene prompts asociados." });
    }
    const result = await db.run("DELETE FROM categories WHERE id = ?", [req.params.id]);
    return { deleted: result.changes };
});

// Prompts API
app.get('/api/prompts', async (req, res) => {
    const { search, category } = req.query;
    let query = `
        SELECT p.*, c.name as category_name 
        FROM prompts p 
        LEFT JOIN categories c ON p.category_id = c.id
    `;
    const params = [];
    const conditions = [];

    if (search) {
        conditions.push("(p.title LIKE ? OR p.content LIKE ? OR p.tags LIKE ?)");
        params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    if (category && category !== 'Todos') {
        conditions.push("c.name = ?");
        params.push(category);
    }

    if (conditions.length > 0) {
        query += " WHERE " + conditions.join(" AND ");
    }
    query += " ORDER BY p.created_at DESC";
    return await db.all(query, params);
});

app.post('/api/prompts', async (req, res) => {
    const { title, content, tags, category_name } = req.body;
    const cat = await db.get("SELECT id FROM categories WHERE name = ?", [category_name]);
    const result = await db.run(
        "INSERT INTO prompts (title, content, tags, category_id) VALUES (?, ?, ?, ?)",
        [title, content, tags, cat?.id]
    );
    const id = result.lastID;
    await db.run("INSERT INTO prompt_versions (prompt_id, content, version_number) VALUES (?, ?, 1)", [id, content]);
    return { id };
});

app.put('/api/prompts/:id', async (req, res) => {
    const { title, content, tags, category_name } = req.body;
    const id = req.params.id;
    const cat = await db.get("SELECT id FROM categories WHERE name = ?", [category_name]);

    // Versioning
    const row = await db.get("SELECT MAX(version_number) as v FROM prompt_versions WHERE prompt_id = ?", [id]);
    const nextV = (row?.v || 0) + 1;

    await db.run(
        "UPDATE prompts SET title = ?, content = ?, tags = ?, category_id = ? WHERE id = ?",
        [title, content, tags, cat?.id, id]
    );
    await db.run("INSERT INTO prompt_versions (prompt_id, content, version_number) VALUES (?, ?, ?)", [id, content, nextV]);
    return { id, version: nextV };
});

app.get('/api/prompts/:id', async (request, reply) => {
    const prompt = await db.get(`
        SELECT p.*, c.name as category_name 
        FROM prompts p 
        LEFT JOIN categories c ON p.category_id = c.id 
        WHERE p.id = ?`,
        [request.params.id]
    );
    if (!prompt) {
        return reply.code(404).send({ error: 'Prompt not found' });
    }
    return prompt;
});

app.delete('/api/prompts/:id', async (request, reply) => {
    // Delete associated comments and versions first due to foreign key constraints
    await db.run("DELETE FROM comments WHERE prompt_id = ?", [request.params.id]);
    await db.run("DELETE FROM prompt_versions WHERE prompt_id = ?", [request.params.id]);
    const result = await db.run("DELETE FROM prompts WHERE id = ?", [request.params.id]);
    return { deleted: result.changes };
});

// Versions & Comments
app.get('/api/history/:id', async (request, reply) => {
    return await db.all("SELECT * FROM prompt_versions WHERE prompt_id = ? ORDER BY version_number DESC", [request.params.id]);
});

app.put('/api/history/:id', async (req, res) => {
    const { note } = req.body;
    const result = await db.run("UPDATE prompt_versions SET note = ? WHERE id = ?", [note, req.params.id]);
    return { updated: result.changes };
});

app.delete('/api/history/:id', async (req, res) => {
    const result = await db.run("DELETE FROM prompt_versions WHERE id = ?", [req.params.id]);
    return { deleted: result.changes };
});

app.get('/api/prompts/:id/comments', async (request, reply) => {
    return await db.all("SELECT * FROM comments WHERE prompt_id = ? ORDER BY created_at ASC", [request.params.id]);
});

app.post('/api/prompts/:id/comments', async (request, reply) => {
    const { text } = request.body;
    const result = await db.run("INSERT INTO comments (prompt_id, text) VALUES (?, ?)", [request.params.id, text]);
    return { id: result.lastID };
});

// Start Server
const PORT = process.env.PORT || 6100;
try {
    await app.listen({ port: PORT, host: '0.0.0.0' });
} catch (err) {
    app.log.error(err);
    process.exit(1);
}
