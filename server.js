import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { marked } from 'marked';
import matter from 'gray-matter';

// Import API handlers
import signupHandler from './api/signup.js';
import enterpriseHandler from './api/enterprise.js';
import certHandler from './api/cert.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3333;

// Trust proxy for rate limiting / IP detection via Nginx
app.set('trust proxy', 1);

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Express route wrapper for Vercel-style handlers
const createExpressHandler = (vercelHandler) => async (req, res) => {
  try {
    await vercelHandler(req, res);
  } catch (err) {
    console.error('[AIRANK:express_handler_error]', err);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
};

// Mount API routes
app.post('/api/signup', createExpressHandler(signupHandler));
app.post('/api/enterprise', createExpressHandler(enterpriseHandler));
app.get('/api/cert', createExpressHandler(certHandler));

// Serve static files from root directory (index.html, style.css, assets/, scripts.js etc)
app.use(express.static(__dirname));

// Markdown Blog SSR Route
app.get('/articles/:slug', (req, res) => {
  const { slug } = req.params;
  const filePath = path.join(__dirname, 'posts', `${slug}.md`);
  
  if (!fs.existsSync(filePath)) {
    return res.status(404).send('Article not found.');
  }

  try {
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const { data, content } = matter(fileContent);
    const htmlContent = marked.parse(content);
    
    let template = fs.readFileSync(path.join(__dirname, 'views', 'article-template.html'), 'utf-8');
    
    // Replace markers
    template = template.replace(/\{\{slug\}\}/g, slug);
    template = template.replace(/\{\{title\}\}/g, data.title || 'THE AI RANK Article');
    template = template.replace(/\{\{description\}\}/g, data.description || '');
    template = template.replace(/\{\{ogImage\}\}/g, data.coverImage || 'https://ai-rank.aqsh.co.jp/assets/og-image.png');
    template = template.replace(/\{\{date\}\}/g, data.date || '');
    template = template.replace(/\{\{content\}\}/g, htmlContent);

    res.send(template);
  } catch (err) {
    console.error('[AIRANK:blog_render_error]', err);
    res.status(500).send('Error rendering article.');
  }
});

// Explicit route for privacy policy
app.get('/privacy', (req, res) => {
  res.sendFile(path.join(__dirname, 'privacy.html'));
});

// Explicit route for cert share page wrapper (optional, handled by static if named correctly, 
// but X usually requests /c?rank=N...)
app.get('/c', createExpressHandler(certHandler));

// Fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`[AIRANK] Server listening on port ${PORT}`);
});
