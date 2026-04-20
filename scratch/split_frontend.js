import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

const jsDir = path.join(rootDir, 'js');
const cssDir = path.join(rootDir, 'css');

// Create directories
[jsDir, path.join(jsDir, 'data'), path.join(jsDir, 'core'), cssDir].forEach(d => {
  if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
});

// ==========================================
// 1. Refactor JS (script.js -> modules)
// ==========================================
const scriptPath = path.join(rootDir, 'script.js');
if (fs.existsSync(scriptPath)) {
  let scriptContent = fs.readFileSync(scriptPath, 'utf8');

  // Extract LEVELS
  const levelsMatch = scriptContent.match(/const LEVELS = \[\s*\{[\s\S]*?\];/);
  let levelsContent = '';
  if (levelsMatch) {
    levelsContent = levelsMatch[0];
    scriptContent = scriptContent.replace(levelsMatch[0], '');
  }

  // Extract QUESTIONS
  const qsMatch = scriptContent.match(/const QUESTIONS = \[\s*\{[\s\S]*?\];/);
  let qsContent = '';
  if (qsMatch) {
    qsContent = qsMatch[0];
    scriptContent = scriptContent.replace(qsMatch[0], '');
  }

  if (levelsContent || qsContent) {
    const dataJsPath = path.join(jsDir, 'data', 'diagnosisData.js');
    const dataJsContent = `// Auto-generated data module
export ${levelsContent.replace('const LEVELS', 'const LEVELS')}
export ${qsContent.replace('const QUESTIONS', 'const QUESTIONS')}
`;
    fs.writeFileSync(dataJsPath, dataJsContent);
    console.log('[OK] Created js/data/diagnosisData.js');

    // Add imports to the top of script.js
    scriptContent = `import { LEVELS, QUESTIONS } from './js/data/diagnosisData.js';\n\n` + scriptContent;
  }
  
  // We will rename script.js to js/main.js to indicate it's an ES module now
  const mainJsPath = path.join(jsDir, 'main.js');
  fs.writeFileSync(mainJsPath, scriptContent);
  console.log('[OK] Moved script.js to js/main.js and refactored as ES Module');

  // Rename original to script.legacy.js just in case
  fs.renameSync(scriptPath, path.join(rootDir, 'script.legacy.js'));
}

// ==========================================
// 2. Refactor CSS (style.css -> partial modules)
// ==========================================
const stylePath = path.join(rootDir, 'style.css');
if (fs.existsSync(stylePath)) {
  let styleContent = fs.readFileSync(stylePath, 'utf8');

  // We extract the premium glassmorphism 4-areas CSS we injected earlier
  const svcRegex = /\/\* ─── SERVICE 4 AREAS \(Premium Glassmorphism\) ─── \*\/[\s\S]*?(?=\n\n\/\*|\n\n$|$)/;
  const svcMatch = styleContent.match(svcRegex);
  
  if (svcMatch) {
    const svcCssContent = svcMatch[0];
    styleContent = styleContent.replace(svcMatch[0], '');
    
    const componentsDir = path.join(cssDir, 'components');
    if (!fs.existsSync(componentsDir)) fs.mkdirSync(componentsDir);
    
    fs.writeFileSync(path.join(componentsDir, 'cards.css'), svcCssContent);
    console.log('[OK] Extracted Glassmorphism cards to css/components/cards.css');
    
    // Insert @import at the top of style.css
    styleContent = `@import url('./css/components/cards.css');\n` + styleContent;
  }
  
  fs.writeFileSync(stylePath, styleContent);
  console.log('[OK] Updated style.css with @imports');
}

// ==========================================
// 3. Update HTML files linking to JS
// ==========================================
const htmlFiles = ['index.html', 'diagnosis.html', 'iwate.html', 'privacy.html'];
htmlFiles.forEach(file => {
  const fp = path.join(rootDir, file);
  if (fs.existsSync(fp)) {
    let html = fs.readFileSync(fp, 'utf8');
    // Replace old script tag with module type and new path
    html = html.replace(/<script src="script\.js"( defer)?>/g, '<script type="module" src="/js/main.js" defer>');
    fs.writeFileSync(fp, html);
    console.log(`[OK] Updated script tag in ${file}`);
  }
});

console.log('Frontend Architecture Refactoring Completed (Data Extraction & File Generation)!');
