import express from 'express';
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
    
    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
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

    const getDynamicUrls = (dir, routePrefix, priority) => {
      let dynamicXml = '';
      if (fs.existsSync(dir)) {
        const files = fs.readdirSync(dir).filter(f => f.endsWith('.md'));
        files.forEach(f => {
          const { data } = matter(fs.readFileSync(path.join(dir, f), 'utf-8'));
          let lastmod = '';
          if (data.date) {
            try { lastmod = `<lastmod>${new Date(data.date.replace(/\./g, '-')).toISOString().split('T')[0]}</lastmod>`; } catch(e){}
          }
          dynamicXml += `  <url>\n    <loc>${baseUrl}/${routePrefix}/${f.replace('.md', '')}</loc>\n    ${lastmod}\n    <changefreq>monthly</changefreq>\n    <priority>${priority}</priority>\n  </url>\n`;
        });
      }
      return dynamicXml;
    };

    xml += getDynamicUrls(postsDir, 'articles', '0.7');
    xml += getDynamicUrls(termsDir, 'terms', '0.6');
    xml += `</urlset>`;
    
    res.header('Content-Type', 'application/xml');
    res.send(xml);
  } catch(err) {
    res.status(500).end();
  }
});
export default router;
