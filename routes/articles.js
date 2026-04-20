import express from 'express';
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
      const dateA = new Date(a.date.replace(/\./g, '-'));
      const dateB = new Date(b.date.replace(/\./g, '-'));
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
  const filePath = path.join(__dirname, '../posts', `${slug}.md`);
  
  if (!fs.existsSync(filePath)) return res.status(404).send('Article not found.');

  try {
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const { data, content } = matter(fileContent);

    // --- TOC: h2見出しを抽出 ---
    const headings = [];
    const headingRegex = /^## (.+)$/gm;
    let headingMatch;
    while ((headingMatch = headingRegex.exec(content)) !== null) {
      const text = headingMatch[1].trim();
      const id = text.replace(/\s+/g, '-').replace(/[^\w\u3000-\u9FFF\u30A0-\u30FF\uFF00-\uFFEF-]/g, '').toLowerCase();
      headings.push({ text, id });
    }
    let tocHtml = '';
    if (headings.length >= 2) {
      tocHtml = '<nav class="article-toc" aria-label="目次"><p class="toc-label">目次</p><ol>';
      headings.forEach(h => {
        tocHtml += `<li><a href="#${h.id}">${h.text}</a></li>`;
      });
      tocHtml += '</ol></nav>';
    }

    // --- marked: カスタムrendererでh2にid付与 ---
    const renderer = new marked.Renderer();
    renderer.heading = function({ tokens, depth }) {
      const text = this.parser.parseInline(tokens);
      if (depth === 2) {
        const id = text.replace(/<[^>]*>/g, '').replace(/\s+/g, '-').replace(/[^\w\u3000-\u9FFF\u30A0-\u30FF\uFF00-\uFFEF-]/g, '').toLowerCase();
        return `<h2 id="${id}">${text}</h2>\n`;
      }
      return `<h${depth}>${text}</h${depth}>\n`;
    };
    const htmlContent = marked.parse(content, { renderer });
    let template = fs.readFileSync(path.join(__dirname, '../views', 'article-template.html'), 'utf-8');
    
    const tagsArr = data.tags || [];
    const tagsHtml = tagsArr.map(t => `<span class="article-tag">${t}</span>`).join('');

    let authorHtml = '';
    if (data.author && authorMaster[data.author]) {
      const au = authorMaster[data.author];
      authorHtml = `
        <div class="author-profile-box">
          <img src="${au.avatar}" alt="${au.name}" class="author-avatar" loading="lazy" />
          <div class="author-info">
            <span class="author-title">${au.title}</span>
            <div class="author-name">${au.name}</div>
            <p class="author-desc">${au.description}</p>
          </div>
        </div>`;
    }

    const articleUrl = `https://ai-rank.aqsh.co.jp/articles/${slug}`;
    const defaultImage = 'https://ai-rank.aqsh.co.jp/assets/og-image.png';
    const finalImg = data.coverImage ? (data.coverImage.startsWith('http') ? data.coverImage : `https://ai-rank.aqsh.co.jp${data.coverImage}`) : defaultImage;

    const schemaData = {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: data.title || 'THE AI RANK いわて Article',
      image: [finalImg],
      datePublished: data.date ? new Date(data.date.replace(/\./g, '-')).toISOString() : new Date().toISOString(),
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
        image: `https://ai-rank.aqsh.co.jp${au.avatar}`
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

    const jsonLdScript = `
      <script type="application/ld+json">${JSON.stringify(schemaData)}</script>
      <script type="application/ld+json">${JSON.stringify(breadcrumbSchema)}</script>
    `;

    // Related
    const postsDir = path.join(__dirname, '../posts');
    let relatedHtml = '';
    if (fs.existsSync(postsDir)) {
      const allFiles = fs.readdirSync(postsDir).filter(f => f.endsWith('.md') && f !== `${slug}.md`);
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
        return new Date((b.data.date||'').replace(/\./g,'-')) - new Date((a.data.date||'').replace(/\./g,'-'));
      });
      const selected = candidates.slice(0, 3);
      if(selected.length > 0) {
        relatedHtml = `<div class="related-section" style="margin-top:80px;"><h3 style="font-size:1.5rem; font-weight:700; margin-bottom:24px; border-bottom:2px solid var(--border); padding-bottom:12px;">関連記事</h3><div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(280px, 1fr)); gap:24px;">`;
        selected.forEach(s => {
          const cover = s.data.coverImage ? (s.data.coverImage.startsWith('http') ? s.data.coverImage : `https://ai-rank.aqsh.co.jp${s.data.coverImage}`) : '/assets/og-image.png';
          relatedHtml += `<a href="/articles/${s.slug}" style="display:flex; flex-direction:column; text-decoration:none; color:inherit; background:var(--lp-surface); border:1px solid var(--border); border-radius:12px; overflow:hidden; transition:transform 0.2s;"><div style="width:100%; height:160px; background:url('${cover}') center/cover no-repeat; border-bottom:1px solid var(--border);"></div><div style="padding:16px;"><h4 style="font-size:1.1rem; margin-bottom:8px; font-weight:700;">${s.data.title}</h4><p style="font-size:0.85rem; color:var(--ink-muted);">${s.data.date||''}</p></div></a>`;
        });
        relatedHtml += `</div></div>`;
      }
    }

    template = template.replace(/\{\{slug\}\}/g, slug);
    template = template.replace(/\{\{title\}\}/g, data.title || 'THE AI RANK いわて Article');
    template = template.replace(/\{\{description\}\}/g, data.description || '');
    template = template.replace(/\{\{ogImage\}\}/g, data.coverImage || 'https://ai-rank.aqsh.co.jp/assets/og-image.png');
    template = template.replace(/\{\{date\}\}/g, data.date || '');
    template = template.replace(/\{\{tags\}\}/g, tagsHtml);
    template = template.replace(/\{\{authorProfile\}\}/g, authorHtml);
    template = template.replace(/\{\{jsonLd\}\}/g, jsonLdScript);
    template = template.replace(/\{\{relatedArticles\}\}/g, relatedHtml);
    template = template.replace(/\{\{toc\}\}/g, tocHtml);
    template = template.replace(/\{\{content\}\}/g, htmlContent);

    res.send(template);
  } catch (err) {
    res.status(500).send('Error rendering article.');
  }
});

export default router;
