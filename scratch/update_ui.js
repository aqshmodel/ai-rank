import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const targetFiles = [
  '../index.html',
  '../iwate.html',
  '../privacy.html',
  '../views/articles-index.html',
  '../views/article-template.html',
  '../views/terms-index.html',
  '../views/term-template.html'
];

targetFiles.forEach(relPath => {
  const filePath = path.join(__dirname, relPath);
  if (!fs.existsSync(filePath)) {
    console.warn(`File not found: ${filePath}`);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf-8');

  // 1. Menu links replacement
  // <a href="/#diagnosis" ...> --> <a href="/diagnosis" ...>
  // <a href="#diagnosis" ...> --> <a href="/diagnosis" ...>
  // We need to be careful. The hero CTA might be missed if it's href="#diagnosis", let's catch it.
  content = content.replace(/href="\/(#diagnosis)"/g, 'href="/diagnosis"');
  content = content.replace(/href="(#diagnosis)"/g, 'href="/diagnosis"');

  // 2. Footer Add Terms Link
  // Target pattern: <a href="/articles">ブログ・導入事例</a>
  if (content.includes('<a href="/articles">ブログ・導入事例</a>') && !content.includes('<a href="/terms">用語集</a>')) {
    content = content.replace(
      '<a href="/articles">ブログ・導入事例</a>',
      '<a href="/articles">ブログ・導入事例</a>\n          <a href="/terms">用語集</a>'
    );
  }

  // 3. Footer Remove TEL
  // Target: <dt>連絡先</dt><dd>TEL: 0195-78-8045<br>Mail: info@aqsh.co.jp</dd>
  // or <dt>連絡先</dt><dd>TEL: 0195-78-8045<br />Mail: info@aqsh.co.jp</dd>
  content = content.replace(/<dt>連絡先<\/dt><dd>TEL:\s*0195-78-8045<br\s*\/?>/g, '<dt>連絡先</dt><dd>');

  fs.writeFileSync(filePath, content, 'utf-8');
  console.log(`Updated: ${relPath}`);
});
