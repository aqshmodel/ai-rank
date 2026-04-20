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

// Author Master configurations for E-E-A-T
const authorMaster = {
  "tsukada": {
    name: "塚田 崇博",
    title: "Aqsh株式会社 代表取締役 兼 「THE AI RANK」AIアルケミスト",
    avatar: "/assets/authors/tsukada.webp",
    description: "人材業界に24年間従事し、累計1万人超の面談経験を持つ。京都出身・岩手県八幡平市に移住し、同地を拠点に採用コンサルティングや組織構築の一気通貫支援を展開。ソシオニクス（ENTp型）など各種性格診断プロファイリングの知見を有し、さらにChatGPTやClaudeなど各種AIモデルを業務レベルで駆使するプロンプトエンジニアリングの実践者として、地域企業の現場に寄り添うAI導入伴走を行っている。"
  }
};

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

// 動的ルート群が確実に優先されるよう、ここではstaticの宣言を行わない

// Dynamic Sitemap Route
app.get('/sitemap.xml', (req, res) => {
  try {
    const baseUrl = 'https://ai-rank.aqsh.co.jp';
    
    const staticPages = [
      { url: '/', priority: 1.0, changefreq: 'weekly' },
      { url: '/iwate.html', priority: 0.9, changefreq: 'weekly' },
      { url: '/privacy', priority: 0.3, changefreq: 'yearly' },
    ];

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

    staticPages.forEach(page => {
      xml += `\n  <url>\n    <loc>${baseUrl}${page.url}</loc>\n    <changefreq>${page.changefreq}</changefreq>\n    <priority>${page.priority}</priority>\n  </url>`;
    });

    const postsDir = path.join(__dirname, 'posts');
    if (fs.existsSync(postsDir)) {
      const files = fs.readdirSync(postsDir);
      files.forEach(file => {
        if (file.endsWith('.md')) {
          const slug = file.replace('.md', '');
          const filePath = path.join(postsDir, file);
          const fileContent = fs.readFileSync(filePath, 'utf-8');
          const { data } = matter(fileContent);
          
          let lastmod = '';
          if (data && data.date) {
            const parsedDate = data.date.replace(/\./g, '-');
            lastmod = `\n    <lastmod>${parsedDate}</lastmod>`;
          }
          
          xml += `\n  <url>\n    <loc>${baseUrl}/articles/${slug}</loc>${lastmod}\n    <changefreq>monthly</changefreq>\n    <priority>0.7</priority>\n  </url>`;
        }
      });
    }

    xml += `\n</urlset>`;
    
    res.header('Content-Type', 'application/xml');
    res.send(xml);
  } catch (err) {
    console.error('[AIRANK:sitemap_error]', err);
    res.status(500).send('Error generating sitemap.');
  }
});

// API Route for Blog Articles
app.get('/api/articles', (req, res) => {
  try {
    const postsDir = path.join(__dirname, 'posts');
    if (!fs.existsSync(postsDir)) {
      return res.json([]);
    }
    
    const files = fs.readdirSync(postsDir);
    const articles = [];
    
    files.forEach(file => {
      if (file.endsWith('.md')) {
        const slug = file.replace('.md', '');
        const filePath = path.join(postsDir, file);
        const fileContent = fs.readFileSync(filePath, 'utf-8');
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

    // Sort by date (descending)
    articles.sort((a, b) => {
      const dateA = new Date(a.date.replace(/\./g, '-'));
      const dateB = new Date(b.date.replace(/\./g, '-'));
      return dateB - dateA;
    });

    res.json(articles);
  } catch (err) {
    console.error('[AIRANK:api_articles_error]', err);
    res.status(500).json({ error: 'Failed to load articles' });
  }
});

// Blog TOP (Index) Route
app.get('/articles', (req, res) => {
  try {
    const filePath = path.join(__dirname, 'views', 'articles-index.html');
    if (fs.existsSync(filePath)) {
      res.sendFile(filePath);
    } else {
      res.status(404).send('Blog index template not found.');
    }
  } catch (err) {
    console.error('[AIRANK:blog_index_error]', err);
    res.status(500).send('Error rendering blog index.');
  }
});

// Markdown Blog SSR Route (Individual Article)
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
    
    // Build tags HTML
    const tagsArr = data.tags || [];
    const tagsHtml = tagsArr.length > 0 
      ? tagsArr.map(t => `<span class="article-tag">${t}</span>`).join('') 
      : '';

    // Build Author HTML (E-E-A-T Profile)
    let authorHtml = '';
    if (data.author && authorMaster[data.author]) {
      const author = authorMaster[data.author];
      authorHtml = `
        <div class="author-profile-box">
          <img src="${author.avatar}" alt="${author.name}" class="author-avatar" loading="lazy" />
          <div class="author-info">
            <span class="author-title">${author.title}</span>
            <div class="author-name">${author.name}</div>
            <p class="author-desc">${author.description}</p>
          </div>
        </div>
      `;
    }

    // Build JSON-LD (Schema.org) for E-E-A-T and SEO
    const articleUrl = `https://ai-rank.aqsh.co.jp/articles/${slug}`;
    const defaultImage = 'https://ai-rank.aqsh.co.jp/assets/og-image.png';
    const finalImage = data.coverImage ? (data.coverImage.startsWith('http') ? data.coverImage : `https://ai-rank.aqsh.co.jp${data.coverImage}`) : defaultImage;

    const schemaData = {
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": data.title || 'THE AI RANK Article',
      "image": [finalImage],
      "datePublished": data.date ? new Date(data.date.replace(/\./g, '-')).toISOString() : new Date().toISOString(),
      "description": data.description || '',
      "author": {
        "@type": "Organization",
        "name": "Aqsh株式会社",
        "url": "https://aqsh.co.jp"
      }
    };

    if (data.author && authorMaster[data.author]) {
      const author = authorMaster[data.author];
      schemaData.author = {
        "@type": "Person",
        "name": author.name,
        "jobTitle": author.title,
        "description": author.description,
        "url": "https://aqsh.co.jp",
        "image": `https://ai-rank.aqsh.co.jp${author.avatar}`
      };
    }
    
    // Breadcrumb Schema
    const breadcrumbSchema = {
       "@context": "https://schema.org",
       "@type": "BreadcrumbList",
       "itemListElement": [{
         "@type": "ListItem",
         "position": 1,
         "name": "THE AI RANK",
         "item": "https://ai-rank.aqsh.co.jp/"
       },{
         "@type": "ListItem",
         "position": 2,
         "name": "ブログ・事例",
         "item": "https://ai-rank.aqsh.co.jp/articles"
       },{
         "@type": "ListItem",
         "position": 3,
         "name": data.title || 'Article',
         "item": articleUrl
       }]
    };

    const jsonLdScript = `
      <script type="application/ld+json">${JSON.stringify(schemaData)}</script>
      <script type="application/ld+json">${JSON.stringify(breadcrumbSchema)}</script>
    `;

    // Replace markers
    template = template.replace(/\{\{slug\}\}/g, slug);
    template = template.replace(/\{\{title\}\}/g, data.title || 'THE AI RANK Article');
    template = template.replace(/\{\{description\}\}/g, data.description || '');
    template = template.replace(/\{\{ogImage\}\}/g, data.coverImage || 'https://ai-rank.aqsh.co.jp/assets/og-image.png');
    template = template.replace(/\{\{date\}\}/g, data.date || '');
    template = template.replace(/\{\{tags\}\}/g, tagsHtml);
    template = template.replace(/\{\{authorProfile\}\}/g, authorHtml);
    template = template.replace(/\{\{jsonLd\}\}/g, jsonLdScript);
    template = template.replace(/\{\{content\}\}/g, htmlContent);

    res.send(template);
  } catch (err) {
    console.error('[AIRANK:blog_render_error]', err);
    res.status(500).send('Error rendering article.');
  }
});

// --- Glossary (Terms) Routes ---
app.get('/terms', (req, res) => {
  const termsDir = path.join(__dirname, 'terms');
  if (!fs.existsSync(termsDir)) return res.send('Terms directory not found');
  
  const files = fs.readdirSync(termsDir).filter(f => f.endsWith('.md'));
  const terms = [];
  
  files.forEach(file => {
    const content = fs.readFileSync(path.join(termsDir, file), 'utf-8');
    const { data } = matter(content);
    terms.push({
      slug: file.replace('.md', ''),
      title: data.title || '',
      furigana: data.furigana || '',
      category: data.category || 'その他',
      description: data.description || ''
    });
  });
  
  // Group by category
  const grouped = {};
  terms.forEach(t => {
    if (!grouped[t.category]) grouped[t.category] = [];
    grouped[t.category].push(t);
  });
  
  // Build HTML
  let contentHtml = '';
  let categoryNavHtml = '<div class="index-group">';
  const sortedCategories = Object.keys(grouped).sort();
  sortedCategories.forEach(cat => {
    categoryNavHtml += `<a href="#${cat}" class="index-badge">${cat}</a>`;
    contentHtml += `<div class="term-category-block" id="${cat}">`;
    contentHtml += `<h2 class="category-title">${cat}</h2>`;
    contentHtml += `<div class="terms-grid">`;
    
    // Sort term by furigana or title
    grouped[cat].sort((a,b) => (a.furigana || a.title).localeCompare(b.furigana || b.title));
    
    grouped[cat].forEach(t => {
      contentHtml += `
        <a href="/terms/${t.slug}" class="term-card">
          <span class="term-card-furigana">${t.furigana}</span>
          <h3 class="term-card-title">${t.title}</h3>
          <p class="term-card-desc">${t.description}</p>
        </a>
      `;
    });
    
    contentHtml += `</div></div>`;
  });
  categoryNavHtml += '</div>';
  
  let template = fs.readFileSync(path.join(__dirname, 'views', 'terms-index.html'), 'utf-8');
  template = template.replace(/\{\{categoryNav\}\}/g, categoryNavHtml);
  template = template.replace(/\{\{content\}\}/g, contentHtml || '<p>用語がありません。</p>');
  res.send(template);
});

app.get('/terms/:slug', (req, res) => {
  const { slug } = req.params;
  const filePath = path.join(__dirname, 'terms', `${slug}.md`);
  
  if (!fs.existsSync(filePath)) {
    return res.status(404).send('Term not found.');
  }

  try {
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const { data, content } = matter(fileContent);
    const htmlContent = marked.parse(content);
    
    let template = fs.readFileSync(path.join(__dirname, 'views', 'term-template.html'), 'utf-8');
    
    // JSON-LD (DefinedTerm)
    const termUrl = `https://ai-rank.aqsh.co.jp/terms/${slug}`;
    const schemaData = {
      "@context": "https://schema.org",
      "@type": "DefinedTerm",
      "name": data.title,
      "description": data.description,
      "url": termUrl
    };

    const breadcrumbSchema = {
       "@context": "https://schema.org",
       "@type": "BreadcrumbList",
       "itemListElement": [{
         "@type": "ListItem",
         "position": 1,
         "name": "THE AI RANK",
         "item": "https://ai-rank.aqsh.co.jp/"
       },{
         "@type": "ListItem",
         "position": 2,
         "name": "AI用語辞典",
         "item": "https://ai-rank.aqsh.co.jp/terms"
       },{
         "@type": "ListItem",
         "position": 3,
         "name": data.title,
         "item": termUrl
       }]
    };

    const jsonLdScript = `
      <script type="application/ld+json">${JSON.stringify(schemaData)}</script>
      <script type="application/ld+json">${JSON.stringify(breadcrumbSchema)}</script>
    `;

    template = template.replace(/\{\{slug\}\}/g, slug);
    template = template.replace(/\{\{title\}\}/g, data.title || '');
    template = template.replace(/\{\{description\}\}/g, data.description || '');
    template = template.replace(/\{\{furigana\}\}/g, data.furigana || '');
    template = template.replace(/\{\{category\}\}/g, data.category || '');
    template = template.replace(/\{\{jsonLd\}\}/g, jsonLdScript);
    template = template.replace(/\{\{content\}\}/g, htmlContent);

    res.send(template);
  } catch (err) {
    console.error('[AIRANK:term_render_error]', err);
    res.status(500).send('Error rendering term.');
  }
});

// Explicit route for privacy policy
app.get('/privacy', (req, res) => {
  res.sendFile(path.join(__dirname, 'privacy.html'));
});

// Dynamic XML Sitemap Generator
app.get('/sitemap.xml', (req, res) => {
  try {
    const baseUrl = 'https://ai-rank.aqsh.co.jp';
    const postsDir = path.join(__dirname, 'posts');
    const files = fs.existsSync(postsDir) ? fs.readdirSync(postsDir).filter(f => f.endsWith('.md')) : [];
    
    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
    
    // Core pages
    const corePages = [
      { url: '/', priority: '1.0' },
      { url: '/iwate.html', priority: '0.9' },
      { url: '/articles', priority: '0.8' },
      { url: '/terms', priority: '0.8' },
      { url: '/privacy', priority: '0.5' }
    ];
    
    corePages.forEach(p => {
      xml += `  <url>\n    <loc>${baseUrl}${p.url}</loc>\n    <changefreq>weekly</changefreq>\n    <priority>${p.priority}</priority>\n  </url>\n`;
    });

    // Dynamic blog articles
    files.forEach(file => {
      const filePath = path.join(postsDir, file);
      const content = fs.readFileSync(filePath, 'utf-8');
      const { data } = matter(content);
      const slug = file.replace('.md', '');
      let lastmod = '';
      if (data.date) {
         try {
           const d = new Date(data.date.replace(/\./g, '-'));
           if (!isNaN(d)) lastmod = `<lastmod>${d.toISOString().split('T')[0]}</lastmod>`;
         } catch(e){}
      }
      xml += `  <url>\n    <loc>${baseUrl}/articles/${slug}</loc>\n    ${lastmod}\n    <changefreq>monthly</changefreq>\n    <priority>0.7</priority>\n  </url>\n`;
    });

    // Dynamic terms (Glossary)
    const termsDir = path.join(__dirname, 'terms');
    const termFiles = fs.existsSync(termsDir) ? fs.readdirSync(termsDir).filter(f => f.endsWith('.md')) : [];
    termFiles.forEach(file => {
      const filePath = path.join(termsDir, file);
      const content = fs.readFileSync(filePath, 'utf-8');
      const { data } = matter(content);
      const slug = file.replace('.md', '');
      let lastmod = '';
      if (data.date) {
         try {
           const d = new Date(data.date.replace(/\./g, '-'));
           if (!isNaN(d)) lastmod = `<lastmod>${d.toISOString().split('T')[0]}</lastmod>`;
         } catch(e){}
      }
      xml += `  <url>\n    <loc>${baseUrl}/terms/${slug}</loc>\n    ${lastmod}\n    <changefreq>monthly</changefreq>\n    <priority>0.6</priority>\n  </url>\n`;
    });
    
    xml += `</urlset>`;
    
    res.header('Content-Type', 'application/xml');
    res.send(xml);
  } catch(err) {
    console.error('[AIRANK:sitemap_error]', err);
    res.status(500).end();
  }
});

// Explicit route for cert share page wrapper (optional, handled by static if named correctly, 
// but X usually requests /c?rank=N...)
app.get('/c', createExpressHandler(certHandler));

// Serve static files from root directory (index.html, style.css, assets/, scripts.js etc)
app.use(express.static(__dirname));

// Fallback
app.get('*', (req, res) => {
  // If the request is for a file (has an extension), don't return HTML
  if (req.path.includes('.')) {
    return res.status(404).send('Not Found');
  }
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`[AIRANK] Server listening on port ${PORT}`);
});
