import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');
const routesDir = path.join(rootDir, 'routes');

if (!fs.existsSync(routesDir)) {
  fs.mkdirSync(routesDir);
}

// 1. Create admin.js
const adminJs = `import express from 'express';
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
    const result = await pool.query(\`SELECT * FROM \${table} ORDER BY created_at DESC\`);
    if (result.rows.length === 0) return res.send('No data available');
    
    const fields = Object.keys(result.rows[0]);
    const csvRows = [fields.join(',')];
    
    for (const row of result.rows) {
      const values = fields.map(f => {
        let val = row[f];
        if (val === null || val === undefined) val = '';
        if (typeof val === 'object') val = JSON.stringify(val);
        return \`"\${String(val).replace(/"/g, '""')}"\`;
      });
      csvRows.push(values.join(','));
    }
    
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', \`attachment; filename="\${table}_\${new Date().toISOString().split('T')[0]}.csv"\`);
    res.send('\\uFEFF' + csvRows.join('\\n'));
  } catch (err) {
    res.status(500).send('Failed to generate CSV');
  }
});

export default router;
`;
fs.writeFileSync(path.join(routesDir, 'admin.js'), adminJs);

// 2. Create articles.js
const articlesJs = `import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { marked } from 'marked';
import matter from 'gray-matter';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const router = express.Router();

const authorMaster = {
  "tsukada": {
    name: "塚田 崇博",
    title: "Aqsh株式会社 代表取締役 兼 「THE AI RANK いわて」AIアルケミスト",
    avatar: "/assets/authors/tsukada.webp",
    description: "人材業界に24年間従事し、累計1万人超の面談経験を持つ。京都出身・岩手県八幡平市に移住し、同地を拠点に採用コンサルティングや組織構築の一気通貫支援を展開。ソシオニクス（ENTp型）など各種性格診断プロファイリングの知見を有し、さらにChatGPTやClaudeなど各種AIモデルを業務レベルで駆使するプロンプトエンジニアリングの実践者として、地域企業の現場に寄り添うAI導入伴走を行っている。"
  }
};

router.get('/api/articles', (req, res) => {
  try {
    const postsDir = path.join(__dirname, '../posts');
    if (!fs.existsSync(postsDir)) return res.json([]);
    const files = fs.readdirSync(postsDir);
    const articles = [];
    
    files.forEach(file => {
      if (file.endsWith('.md')) {
        const slug = file.replace('.md', '');
        const fileContent = fs.readFileSync(path.join(postsDir, file), 'utf-8');
        const { data } = matter(fileContent);
        articles.push({
          slug,
          title: data.title || 'No Title',
          description: data.description || '',
          coverImage: data.coverImage || '/assets/og-image.png',
          date: data.date || '',
          tags: data.tags || []
        });
      }
    });

    articles.sort((a, b) => {
      const dateA = new Date(a.date.replace(/\\./g, '-'));
      const dateB = new Date(b.date.replace(/\\./g, '-'));
      return dateB - dateA;
    });

    res.json(articles);
  } catch (err) {
    res.status(500).json({ error: 'Failed to load articles' });
  }
});

router.get('/articles', (req, res) => {
  const filePath = path.join(__dirname, '../views', 'articles-index.html');
  if (fs.existsSync(filePath)) res.sendFile(filePath);
  else res.status(404).send('Blog index template not found.');
});

router.get('/articles/:slug', (req, res) => {
  const { slug } = req.params;
  const filePath = path.join(__dirname, '../posts', \`\${slug}.md\`);
  
  if (!fs.existsSync(filePath)) return res.status(404).send('Article not found.');

  try {
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const { data, content } = matter(fileContent);
    const htmlContent = marked.parse(content);
    let template = fs.readFileSync(path.join(__dirname, '../views', 'article-template.html'), 'utf-8');
    
    const tagsArr = data.tags || [];
    const tagsHtml = tagsArr.map(t => \`<span class="article-tag">\${t}</span>\`).join('');

    let authorHtml = '';
    if (data.author && authorMaster[data.author]) {
      const au = authorMaster[data.author];
      authorHtml = \`
        <div class="author-profile-box">
          <img src="\${au.avatar}" alt="\${au.name}" class="author-avatar" loading="lazy" />
          <div class="author-info">
            <span class="author-title">\${au.title}</span>
            <div class="author-name">\${au.name}</div>
            <p class="author-desc">\${au.description}</p>
          </div>
        </div>\`;
    }

    const articleUrl = \`https://ai-rank.aqsh.co.jp/articles/\${slug}\`;
    const defaultImage = 'https://ai-rank.aqsh.co.jp/assets/og-image.png';
    const finalImg = data.coverImage ? (data.coverImage.startsWith('http') ? data.coverImage : \`https://ai-rank.aqsh.co.jp\${data.coverImage}\`) : defaultImage;

    const schemaData = {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: data.title || 'THE AI RANK いわて Article',
      image: [finalImg],
      datePublished: data.date ? new Date(data.date.replace(/\\./g, '-')).toISOString() : new Date().toISOString(),
      description: data.description || '',
      author: {
        "@type": "Organization",
        name: "Aqsh株式会社",
        url: "https://aqsh.co.jp"
      }
    };
    if (data.author && authorMaster[data.author]) {
      const au = authorMaster[data.author];
      schemaData.author = {
        "@type": "Person",
        name: au.name,
        jobTitle: au.title,
        description: au.description,
        url: "https://aqsh.co.jp",
        image: \`https://ai-rank.aqsh.co.jp\${au.avatar}\`
      };
    }
    
    const breadcrumbSchema = {
       "@context": "https://schema.org",
       "@type": "BreadcrumbList",
       "itemListElement": [
         { "@type": "ListItem", position: 1, name: "THE AI RANK いわて", item: "https://ai-rank.aqsh.co.jp/" },
         { "@type": "ListItem", position: 2, name: "ブログ・事例", item: "https://ai-rank.aqsh.co.jp/articles" },
         { "@type": "ListItem", position: 3, name: data.title || 'Article', item: articleUrl }
       ]
    };

    const jsonLdScript = \`
      <script type="application/ld+json">\${JSON.stringify(schemaData)}</script>
      <script type="application/ld+json">\${JSON.stringify(breadcrumbSchema)}</script>
    \`;

    // Related
    const postsDir = path.join(__dirname, '../posts');
    let relatedHtml = '';
    if (fs.existsSync(postsDir)) {
      const allFiles = fs.readdirSync(postsDir).filter(f => f.endsWith('.md') && f !== \`\${slug}.md\`);
      let candidates = allFiles.map(f => {
        const m = matter(fs.readFileSync(path.join(postsDir, f), 'utf-8'));
        return { slug: f.replace('.md', ''), data: m.data };
      });
      const currentTags = data.tags || [];
      candidates.forEach(c => {
        let sc = 0;
        (c.data.tags || []).forEach(t => { if(currentTags.includes(t)) sc++; });
        c.score = sc;
      });
      candidates.sort((a,b) => {
        if(b.score !== a.score) return b.score - a.score;
        return new Date((b.data.date||'').replace(/\\./g,'-')) - new Date((a.data.date||'').replace(/\\./g,'-'));
      });
      const selected = candidates.slice(0, 3);
      if(selected.length > 0) {
        relatedHtml = \`<div class="related-section" style="margin-top:80px;"><h3 style="font-size:1.5rem; font-weight:700; margin-bottom:24px; border-bottom:2px solid var(--border); padding-bottom:12px;">関連記事</h3><div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(280px, 1fr)); gap:24px;">\`;
        selected.forEach(s => {
          const cover = s.data.coverImage ? (s.data.coverImage.startsWith('http') ? s.data.coverImage : \`https://ai-rank.aqsh.co.jp\${s.data.coverImage}\`) : '/assets/og-image.png';
          relatedHtml += \`<a href="/articles/\${s.slug}" style="display:flex; flex-direction:column; text-decoration:none; color:inherit; background:var(--lp-surface); border:1px solid var(--border); border-radius:12px; overflow:hidden; transition:transform 0.2s;"><div style="width:100%; height:160px; background:url('\${cover}') center/cover no-repeat; border-bottom:1px solid var(--border);"></div><div style="padding:16px;"><h4 style="font-size:1.1rem; margin-bottom:8px; font-weight:700;">\${s.data.title}</h4><p style="font-size:0.85rem; color:var(--ink-muted);">\${s.data.date||''}</p></div></a>\`;
        });
        relatedHtml += \`</div></div>\`;
      }
    }

    template = template.replace(/\\{\\{slug\\}\\}/g, slug);
    template = template.replace(/\\{\\{title\\}\\}/g, data.title || 'THE AI RANK いわて Article');
    template = template.replace(/\\{\\{description\\}\\}/g, data.description || '');
    template = template.replace(/\\{\\{ogImage\\}\\}/g, data.coverImage || 'https://ai-rank.aqsh.co.jp/assets/og-image.png');
    template = template.replace(/\\{\\{date\\}\\}/g, data.date || '');
    template = template.replace(/\\{\\{tags\\}\\}/g, tagsHtml);
    template = template.replace(/\\{\\{authorProfile\\}\\}/g, authorHtml);
    template = template.replace(/\\{\\{jsonLd\\}\\}/g, jsonLdScript);
    template = template.replace(/\\{\\{relatedArticles\\}\\}/g, relatedHtml);
    template = template.replace(/\\{\\{content\\}\\}/g, htmlContent);

    res.send(template);
  } catch (err) {
    res.status(500).send('Error rendering article.');
  }
});

export default router;
`;
fs.writeFileSync(path.join(routesDir, 'articles.js'), articlesJs);

// 3. Create terms.js
const termsJs = `import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { marked } from 'marked';
import matter from 'gray-matter';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const router = express.Router();

router.get('/terms', (req, res) => {
  const termsDir = path.join(__dirname, '../terms');
  if (!fs.existsSync(termsDir)) return res.send('Terms directory not found');
  
  const files = fs.readdirSync(termsDir).filter(f => f.endsWith('.md'));
  const terms = files.map(file => {
    const { data } = matter(fs.readFileSync(path.join(termsDir, file), 'utf-8'));
    return {
      slug: file.replace('.md', ''),
      title: data.title || '',
      furigana: data.furigana || '',
      category: data.category || 'その他',
      description: data.description || ''
    };
  });
  
  const grouped = {};
  terms.forEach(t => {
    if (!grouped[t.category]) grouped[t.category] = [];
    grouped[t.category].push(t);
  });
  
  let contentHtml = '';
  let categoryNavHtml = '<div class="index-group">';
  const sortedCategories = Object.keys(grouped).sort();
  sortedCategories.forEach(cat => {
    categoryNavHtml += \`<a href="#\${cat}" class="index-badge">\${cat}</a>\`;
    contentHtml += \`<div class="term-category-block" id="\${cat}"><h2 class="category-title">\${cat}</h2><div class="terms-grid">\`;
    grouped[cat].sort((a,b) => (a.furigana || a.title).localeCompare(b.furigana || b.title));
    grouped[cat].forEach(t => {
      contentHtml += \`<a href="/terms/\${t.slug}" class="term-card"><span class="term-card-furigana">\${t.furigana}</span><h3 class="term-card-title">\${t.title}</h3><p class="term-card-desc">\${t.description}</p></a>\`;
    });
    contentHtml += \`</div></div>\`;
  });
  categoryNavHtml += '</div>';
  
  let template = fs.readFileSync(path.join(__dirname, '../views', 'terms-index.html'), 'utf-8');
  template = template.replace(/\\{\\{categoryNav\\}\\}/g, categoryNavHtml);
  template = template.replace(/\\{\\{content\\}\\}/g, contentHtml || '<p>用語がありません。</p>');
  res.send(template);
});

router.get('/terms/:slug', (req, res) => {
  const { slug } = req.params;
  const filePath = path.join(__dirname, '../terms', \`\${slug}.md\`);
  if (!fs.existsSync(filePath)) return res.status(404).send('Term not found.');

  try {
    const { data, content } = matter(fs.readFileSync(filePath, 'utf-8'));
    const htmlContent = marked.parse(content);
    let template = fs.readFileSync(path.join(__dirname, '../views', 'term-template.html'), 'utf-8');
    
    const termUrl = \`https://ai-rank.aqsh.co.jp/terms/\${slug}\`;
    const jsonLdScript = \`
      <script type="application/ld+json">{"@context":"https://schema.org","@type":"DefinedTerm","name":"\${data.title}","description":"\${data.description}","url":"\${termUrl}"}</script>
      <script type="application/ld+json">{"@context":"https://schema.org","@type":"BreadcrumbList","itemListElement":[{"@type":"ListItem","position":1,"name":"THE AI RANK いわて","item":"https://ai-rank.aqsh.co.jp/"},{"@type":"ListItem","position":2,"name":"AI用語辞典","item":"https://ai-rank.aqsh.co.jp/terms"},{"@type":"ListItem","position":3,"name":"\${data.title}","item":"\${termUrl}"}]}</script>
    \`;

    const termsDir = path.join(__dirname, '../terms');
    let relatedTermsHtml = '';
    if (fs.existsSync(termsDir) && data.category) {
      const allFiles = fs.readdirSync(termsDir).filter(f => f.endsWith('.md') && f !== \`\${slug}.md\`);
      let candidates = [];
      allFiles.forEach(f => {
        const m = matter(fs.readFileSync(path.join(termsDir, f), 'utf-8'));
        if (m.data.category === data.category) candidates.push({ slug: f.replace('.md', ''), data: m.data });
      });
      candidates.sort(() => 0.5 - Math.random());
      const selected = candidates.slice(0, 4);
      if(selected.length > 0) {
        relatedTermsHtml = \`<div class="related-section" style="margin-top: 80px;"><h3 style="font-size:1.3rem; font-weight:700; color:var(--accent); margin-bottom:24px; border-bottom:2px solid var(--border); padding-bottom:12px;">同じ「\${data.category}」の関連用語</h3><div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(240px, 1fr)); gap:16px;">\`;
        selected.forEach(s => {
          relatedTermsHtml += \`<a href="/terms/\${s.slug}" style="display:flex; flex-direction:column; text-decoration:none; color:inherit; background:var(--lp-surface); border:1px solid var(--border); border-radius:8px; padding:16px;"><span style="font-size:0.75rem; color:var(--ink-muted); margin-bottom:4px;">\${s.data.furigana||''}</span><h4 style="font-size:1.1rem; font-weight:700; color:var(--ink);">\${s.data.title}</h4></a>\`;
        });
        relatedTermsHtml += \`</div></div>\`;
      }
    }

    template = template.replace(/\\{\\{slug\\}\\}/g, slug);
    template = template.replace(/\\{\\{title\\}\\}/g, data.title || '');
    template = template.replace(/\\{\\{description\\}\\}/g, data.description || '');
    template = template.replace(/\\{\\{furigana\\}\\}/g, data.furigana || '');
    template = template.replace(/\\{\\{category\\}\\}/g, data.category || '');
    template = template.replace(/\\{\\{jsonLd\\}\\}/g, jsonLdScript);
    template = template.replace(/\\{\\{relatedTerms\\}\\}/g, relatedTermsHtml);
    template = template.replace(/\\{\\{content\\}\\}/g, htmlContent);

    res.send(template);
  } catch (err) {
    res.status(500).send('Error rendering term.');
  }
});
export default router;
`;
fs.writeFileSync(path.join(routesDir, 'terms.js'), termsJs);

// 4. Create sitemap.js
const sitemapJs = `import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import matter from 'gray-matter';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const router = express.Router();

router.get('/sitemap.xml', (req, res) => {
  try {
    const baseUrl = 'https://ai-rank.aqsh.co.jp';
    const postsDir = path.join(__dirname, '../posts');
    const termsDir = path.join(__dirname, '../terms');
    
    let xml = \`<?xml version="1.0" encoding="UTF-8"?>\\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\\n\`;
    const corePages = [
      { url: '/', priority: '1.0' },
      { url: '/iwate.html', priority: '0.9' },
      { url: '/articles', priority: '0.8' },
      { url: '/terms', priority: '0.8' },
      { url: '/privacy', priority: '0.5' }
    ];
    
    corePages.forEach(p => {
      xml += \`  <url>\\n    <loc>\${baseUrl}\${p.url}</loc>\\n    <changefreq>weekly</changefreq>\\n    <priority>\${p.priority}</priority>\\n  </url>\\n\`;
    });

    const getDynamicUrls = (dir, routePrefix, priority) => {
      let dynamicXml = '';
      if (fs.existsSync(dir)) {
        const files = fs.readdirSync(dir).filter(f => f.endsWith('.md'));
        files.forEach(f => {
          const { data } = matter(fs.readFileSync(path.join(dir, f), 'utf-8'));
          let lastmod = '';
          if (data.date) {
            try { lastmod = \`<lastmod>\${new Date(data.date.replace(/\\./g, '-')).toISOString().split('T')[0]}</lastmod>\`; } catch(e){}
          }
          dynamicXml += \`  <url>\\n    <loc>\${baseUrl}/\${routePrefix}/\${f.replace('.md', '')}</loc>\\n    \${lastmod}\\n    <changefreq>monthly</changefreq>\\n    <priority>\${priority}</priority>\\n  </url>\\n\`;
        });
      }
      return dynamicXml;
    };

    xml += getDynamicUrls(postsDir, 'articles', '0.7');
    xml += getDynamicUrls(termsDir, 'terms', '0.6');
    xml += \`</urlset>\`;
    
    res.header('Content-Type', 'application/xml');
    res.send(xml);
  } catch(err) {
    res.status(500).end();
  }
});
export default router;
`;
fs.writeFileSync(path.join(routesDir, 'sitemap.js'), sitemapJs);

// 5. Rewrite server.js
const serverJs = `import express from 'express';
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

const createExpressHandler = (vercelHandler) => async (req, res) => {
  try {
    await vercelHandler(req, res);
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

app.use(express.static(__dirname));

app.get('*', (req, res) => {
  if (req.path.includes('.')) return res.status(404).send('Not Found');
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(\`[AIRANK] Server listening on port \${PORT}\`);
});
`;
fs.writeFileSync(path.join(rootDir, 'server.js'), serverJs);

console.log('Successfully refactored server.js strictly avoiding over-engineering!');
