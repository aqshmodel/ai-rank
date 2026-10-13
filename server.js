import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

// Import API handlers
import signupHandler from './api/signup.js';
import enterpriseHandler from './api/enterprise.js';
import certHandler from './api/cert.js';
import ogImageHandler from './api/og-image.js';

// Import Routes
import adminRouter from './routes/admin.js';
import articlesRouter from './routes/articles.js';
import termsRouter from './routes/terms.js';
import sitemapRouter from './routes/sitemap.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3333;

app.set('trust proxy', 1);
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const createExpressHandler = (routeHandler) => async (req, res) => {
  try {
    await routeHandler(req, res);
  } catch (err) {
    console.error('[AIRANK:express_handler_error]', err);
    if (!res.headersSent) res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Standard API Routes
app.post('/api/signup', createExpressHandler(signupHandler));
app.post('/api/enterprise', createExpressHandler(enterpriseHandler));
app.get('/api/cert', createExpressHandler(certHandler));
app.get('/api/og-image', createExpressHandler(ogImageHandler));

// Module Routes
app.use(adminRouter);
app.use(articlesRouter);
app.use(termsRouter);
app.use(sitemapRouter);

app.get('/c', createExpressHandler(certHandler));
app.get('/privacy', (req, res) => res.sendFile(path.join(__dirname, 'privacy.html')));
app.get('/diagnosis', (req, res) => res.sendFile(path.join(__dirname, 'diagnosis.html')));

const publicFiles = new Set(['index.html', 'diagnosis.html', 'privacy.html', 'iwate.html',
  'i18n.js', 'script.legacy.js', 'style.css', 'robots.txt', 'site.webmanifest']);
for (const directory of ['assets', 'js', 'css', 'og', '.well-known']) {
  app.use('/' + directory, express.static(path.join(__dirname, directory), { dotfiles: 'deny', index: false }));
}
app.get('/:filename', (req, res, next) => {
  if (!publicFiles.has(req.params.filename)) return next();
  res.sendFile(path.join(__dirname, req.params.filename));
});

app.get('*', (req, res) => {
  if (req.path.includes('.')) return res.status(404).send('Not Found');
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, '127.0.0.1', () => {
  console.log(`[AIRANK] Server listening on port ${PORT}`);
});
