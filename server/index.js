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
app.get('/api/categories', async (request, reply) => {
    return await db.all("SELECT * FROM categories");
});

app.post('/api/categories', async (request, reply) => {
    const { name } = request.body;
    try {
        const result = await db.run("INSERT INTO categories (name) VALUES (?)", [name]);
        return { id: result.lastID, name };
    } catch (err) {
        if (err.message.includes('UNIQUE constraint failed')) {
            reply.code(400).send({ error: 'Categoría ya existe' });
        } else {
            reply.code(500).send({ error: 'Error al crear categoría' });
        }
    }
});

app.put('/api/categories/:id', async (request, reply) => {
    const { name } = request.body;
    const result = await db.run("UPDATE categories SET name = ? WHERE id = ?", [name, request.params.id]);
    return { updated: result.changes };
});

app.delete('/api/categories/:id', async (request, reply) => {
    const result = await db.run("DELETE FROM categories WHERE id = ?", [request.params.id]);
    return { deleted: result.changes };
});

// Prompts API
app.get('/api/prompts', async (request, reply) => {
    const { search, category, tag } = request.query;
    let query = `
        SELECT p.*, c.name as category_name 
        FROM prompts p 
        LEFT JOIN categories c ON p.category_id = c.id
    `;
    const params = [];
    const conditions = [];

    if (search) {
        conditions.push("(p.title LIKE ? OR p.content LIKE ?)");
        params.push(`%${search}%`, `%${search}%`);
    }
    if (category) {
        conditions.push("c.name = ?");
        params.push(category);
    }
    if (tag) {
        conditions.push("p.tags LIKE ?");
        params.push(`%${tag}%`);
    }

    if (conditions.length > 0) {
        query += " WHERE " + conditions.join(" AND ");
    }

    query += " ORDER BY p.created_at DESC"; // Or updated_at if preferred

    return await db.all(query, params);
});

app.post('/api/prompts', async (request, reply) => {
    const { title, content, tags, category_name } = request.body;
    let category_id = null;
    if (category_name) {
        const category = await db.get("SELECT id FROM categories WHERE name = ?", [category_name]);
        if (category) {
            category_id = category.id;
        }
    }

    const result = await db.run(
        "INSERT INTO prompts (title, content, tags, category_id) VALUES (?, ?, ?, ?)",
        [title, content, tags, category_id]
    );
    const promptId = result.lastID;

    // Auto-create first version
    await db.run("INSERT INTO prompt_versions (prompt_id, content, version_number) VALUES (?, ?, 1)", [promptId, content]);
    return { id: promptId };
});

app.put('/api/prompts/:id', async (request, reply) => {
    const { title, content, tags, category_name } = request.body;
    const promptId = request.params.id;

    let category_id = null;
    if (category_name) {
        const category = await db.get("SELECT id FROM categories WHERE name = ?", [category_name]);
        if (category) {
            category_id = category.id;
        }
    }

    // Get current version count to increment
    const row = await db.get("SELECT MAX(version_number) as max_v FROM prompt_versions WHERE prompt_id = ?", [promptId]);
    const nextVersion = (row?.max_v || 0) + 1;

    const result = await db.run(
        "UPDATE prompts SET title = ?, content = ?, tags = ?, category_id = ? WHERE id = ?",
        [title, content, tags, category_id, promptId]
    );

    // Log new version
    await db.run("INSERT INTO prompt_versions (prompt_id, content, version_number) VALUES (?, ?, ?)", [promptId, content, nextVersion]);
    return { updated: result.changes, version: nextVersion };
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
        reply.code(404).send({ error: 'Prompt not found' });
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
app.get('/api/prompts/:id/history', async (request, reply) => {
    return await db.all("SELECT * FROM prompt_versions WHERE prompt_id = ? ORDER BY version_number DESC", [request.params.id]);
});

app.get('/api/prompts/:id/comments', async (request, reply) => {
    return await db.all("SELECT * FROM comments WHERE prompt_id = ? ORDER BY created_at ASC", [request.params.id]);
});

app.post('/api/prompts/:id/comments', async (request, reply) => {
    const { text } = request.body;
    const result = await db.run("INSERT INTO comments (prompt_id, text) VALUES (?, ?)", [request.params.id, text]);
    return { id: result.lastID };
});

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
