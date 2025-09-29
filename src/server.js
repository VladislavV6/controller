import express from 'express';
import cors from 'cors';
import pkg from 'pg';
const { Pool } = pkg;

const app = express();
const PORT = 3000;

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'instrumental',
    password: '1',
    port: 5432,
});

pool.on('connect', () => {
    console.log('✅ Connected to PostgreSQL database');
});

pool.on('error', (err) => {
    console.error('❌ PostgreSQL connection error:', err);
});

app.use(cors());
app.use(express.json());

app.get('/api/items', async (req, res) => {
    try {
        console.log('Fetching all items...');
        const result = await pool.query('SELECT * FROM items ORDER BY id DESC');
        console.log(`Found ${result.rows.length} items`);
        res.json(result.rows);
    } catch (error) {
        console.error('Error in GET /api/items:', error);
        res.status(500).json({
            error: 'Internal server error',
            details: error.message
        });
    }
});

app.get('/api/items/:id', async (req, res) => {
    try {
        const { id } = req.params;
        console.log(`Fetching item with id: ${id}`);
        const result = await pool.query('SELECT * FROM items WHERE id = $1', [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Item not found' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error in GET /api/items/:id:', error);
        res.status(500).json({
            error: 'Internal server error',
            details: error.message
        });
    }
});

app.post('/api/items', async (req, res) => {
    try {
        const { name, description } = req.body;
        console.log('Creating item:', { name, description });

        if (!name) {
            return res.status(400).json({ error: 'Name is required' });
        }

        const result = await pool.query(
            'INSERT INTO items (name, description) VALUES ($1, $2) RETURNING *',
            [name, description || '']
        );

        console.log('Item created:', result.rows[0]);
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error in POST /api/items:', error);
        res.status(500).json({
            error: 'Internal server error',
            details: error.message
        });
    }
});

app.put('/api/items/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description } = req.body;
        console.log(`Updating item ${id}:`, { name, description });

        if (!name) {
            return res.status(400).json({ error: 'Name is required' });
        }

        const result = await pool.query(
            'UPDATE items SET name = $1, description = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3 RETURNING *',
            [name, description || '', id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Item not found' });
        }

        console.log('Item updated:', result.rows[0]);
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error in PUT /api/items/:id:', error);
        res.status(500).json({
            error: 'Internal server error',
            details: error.message
        });
    }
});

app.delete('/api/items/:id', async (req, res) => {
    try {
        const { id } = req.params;
        console.log(`Deleting item with id: ${id}`);

        const result = await pool.query('DELETE FROM items WHERE id = $1 RETURNING *', [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Item not found' });
        }

        console.log('Item deleted:', result.rows[0]);
        res.json({ message: 'Item deleted successfully', deletedItem: result.rows[0] });
    } catch (error) {
        console.error('Error in DELETE /api/items/:id:', error);
        res.status(500).json({
            error: 'Internal server error',
            details: error.message
        });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
    console.log(`🔍 Health check: http://localhost:${PORT}/api/health`);
});