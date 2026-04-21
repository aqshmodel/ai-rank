import express from 'express';
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
    categoryNavHtml += `<a href="#${cat}" class="index-badge">${cat}</a>`;
    contentHtml += `<div class="term-category-block" id="${cat}"><h2 class="category-title">${cat}</h2><div class="terms-grid">`;
    grouped[cat].sort((a,b) => (a.furigana || a.title).localeCompare(b.furigana || b.title));
    grouped[cat].forEach(t => {
      const furiganaText = t.furigana ? `読み方：${t.furigana}` : '';
      contentHtml += `<a href="/terms/${t.slug}" class="term-card"><span class="term-card-furigana">${furiganaText}</span><h3 class="term-card-title">${t.title}</h3><p class="term-card-desc">${t.description}</p></a>`;
    });
    contentHtml += `</div></div>`;
  });
  categoryNavHtml += '</div>';
  
  let template = fs.readFileSync(path.join(__dirname, '../views', 'terms-index.html'), 'utf-8');
  template = template.replace(/\{\{categoryNav\}\}/g, categoryNavHtml);
  template = template.replace(/\{\{content\}\}/g, contentHtml || '<p>用語がありません。</p>');
  res.send(template);
});

router.get('/terms/:slug', (req, res) => {
  const { slug } = req.params;
  const filePath = path.join(__dirname, '../terms', `${slug}.md`);
  if (!fs.existsSync(filePath)) return res.status(404).send('Term not found.');

  try {
    const { data, content } = matter(fs.readFileSync(filePath, 'utf-8'));
    const htmlContent = marked.parse(content);
    let template = fs.readFileSync(path.join(__dirname, '../views', 'term-template.html'), 'utf-8');
    
    const termUrl = `https://ai-rank.aqsh.co.jp/terms/${slug}`;
    const seoDesc = data.furigana ? `読み方：${data.furigana}。${data.description}` : data.description;
    const jsonLdScript = `
      <script type="application/ld+json">{"@context":"https://schema.org","@type":"DefinedTerm","name":"${data.title}","description":"${seoDesc}","url":"${termUrl}"}</script>
      <script type="application/ld+json">{"@context":"https://schema.org","@type":"BreadcrumbList","itemListElement":[{"@type":"ListItem","position":1,"name":"THE AI RANK いわて","item":"https://ai-rank.aqsh.co.jp/"},{"@type":"ListItem","position":2,"name":"AI用語辞典","item":"https://ai-rank.aqsh.co.jp/terms"},{"@type":"ListItem","position":3,"name":"${data.title}","item":"${termUrl}"}]}</script>
    `;

    const termsDir = path.join(__dirname, '../terms');
    let relatedTermsHtml = '';
    if (fs.existsSync(termsDir) && data.category) {
      const allFiles = fs.readdirSync(termsDir).filter(f => f.endsWith('.md') && f !== `${slug}.md`);
      let candidates = [];
      allFiles.forEach(f => {
        const m = matter(fs.readFileSync(path.join(termsDir, f), 'utf-8'));
        if (m.data.category === data.category) candidates.push({ slug: f.replace('.md', ''), data: m.data });
      });
      candidates.sort(() => 0.5 - Math.random());
      const selected = candidates.slice(0, 4);
      if(selected.length > 0) {
        relatedTermsHtml = `<div class="related-section" style="margin-top: 80px;"><h3 style="font-size:1.3rem; font-weight:700; color:var(--accent); margin-bottom:24px; border-bottom:2px solid var(--border); padding-bottom:12px;">同じ「${data.category}」の関連用語</h3><div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(240px, 1fr)); gap:16px;">`;
        selected.forEach(s => {
          relatedTermsHtml += `<a href="/terms/${s.slug}" style="display:flex; flex-direction:column; text-decoration:none; color:inherit; background:var(--lp-surface); border:1px solid var(--border); border-radius:8px; padding:16px;"><span style="font-size:0.75rem; color:var(--ink-muted); margin-bottom:4px;">${s.data.furigana||''}</span><h4 style="font-size:1.1rem; font-weight:700; color:var(--ink);">${s.data.title}</h4></a>`;
        });
        relatedTermsHtml += `</div></div>`;
      }
    }

    const displayFurigana = data.furigana ? `読み方：${data.furigana}` : '';
    
    template = template.replace(/\{\{slug\}\}/g, slug);
    template = template.replace(/\{\{title\}\}/g, data.title || '');
    template = template.replace(/\{\{description\}\}/g, seoDesc || '');
    template = template.replace(/\{\{furigana\}\}/g, displayFurigana);
    template = template.replace(/\{\{category\}\}/g, data.category || '');
    template = template.replace(/\{\{jsonLd\}\}/g, jsonLdScript);
    template = template.replace(/\{\{relatedTerms\}\}/g, relatedTermsHtml);
    template = template.replace(/\{\{content\}\}/g, htmlContent);

    res.send(template);
  } catch (err) {
    res.status(500).send('Error rendering term.');
  }
});
export default router;
