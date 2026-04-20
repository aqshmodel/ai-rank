import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import basicAuth from 'express-basic-auth';
import { pool, dbEnabled } from '../api/_db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const router = express.Router();

const adminPassword = process.env.ADMIN_PASSWORD;
const authMiddleware = basicAuth({
  users: { 'tsukada-t@aqsh.co.jp': adminPassword || 'changeme' },
  challenge: true,
  realm: 'Aqsh Admin Area'
});

router.get('/admin', authMiddleware, (req, res) => {
  const filePath = path.join(__dirname, '../views', 'admin.html');
  if (fs.existsSync(filePath)) res.sendFile(filePath);
  else res.status(404).send('Admin template not found.');
});

router.get('/api/admin/signups', authMiddleware, async (req, res) => {
  if (!dbEnabled) return res.status(500).json({ error: 'DB not configured' });
  try {
    const result = await pool.query('SELECT * FROM signups ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch signups' });
  }
});

router.get('/api/admin/csv/:type', authMiddleware, async (req, res) => {
  if (!dbEnabled) return res.status(500).send('DB not configured');
  try {
    const table = 'signups';
    const result = await pool.query(`SELECT * FROM ${table} ORDER BY created_at DESC`);
    if (result.rows.length === 0) return res.send('No data available');
    
    const fields = Object.keys(result.rows[0]);
    const csvRows = [fields.join(',')];
    
    for (const row of result.rows) {
      const values = fields.map(f => {
        let val = row[f];
        if (val === null || val === undefined) val = '';
        if (typeof val === 'object') val = JSON.stringify(val);
        return `"${String(val).replace(/"/g, '""')}"`;
      });
      csvRows.push(values.join(','));
    }
    
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${table}_${new Date().toISOString().split('T')[0]}.csv"`);
    res.send('\uFEFF' + csvRows.join('\n'));
  } catch (err) {
    res.status(500).send('Failed to generate CSV');
  }
});

export default router;
