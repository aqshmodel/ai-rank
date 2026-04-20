import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 1. Fix diagnosis.html First View
const diagPath = path.join(__dirname, '../diagnosis.html');
if (fs.existsSync(diagPath)) {
  let diagHtml = fs.readFileSync(diagPath, 'utf8');
  // CROSSROADS を完全削除
  diagHtml = diagHtml.replace(/<!-- ─── CROSSROADS ─── -->[\s\S]*?(?=<!-- ─── DIAGNOSIS \(Multi-step\) ─── -->)/i, '');
  fs.writeFileSync(diagPath, diagHtml, 'utf8');
  console.log("Cleaned up diagnosis.html first view.");
}

// 2. Fix style.css card design
const cssPath = path.join(__dirname, '../style.css');
if (fs.existsSync(cssPath)) {
  let cssText = fs.readFileSync(cssPath, 'utf8');
  
  // 先ほど追加したCSS全体を検索して削除
  const regex = /\/\* ─── SERVICE 4 AREAS \(Added for Enterprise\) ─── \*\/[\s\S]*?(?=\.ent-sub-heading|\/\* ───|\n\n|$)/;
  cssText = cssText.replace(regex, '');

  // もう一度、不要な svc-* クラス指定が残っていたら消す
  cssText = cssText.replace(/\.svc-blue[^}]+\}/g, '');
  cssText = cssText.replace(/\.svc-green[^}]+\}/g, '');
  cssText = cssText.replace(/\.svc-orange[^}]+\}/g, '');
  cssText = cssText.replace(/\.svc-purple[^}]+\}/g, '');

  const refinedCss = `
/* ─── SERVICE 4 AREAS (Refined) ─── */
.service-4areas {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  max-width: 900px;
  margin: 0 auto;
  padding: 0 5%;
}
@media (max-width: 768px) {
  .service-4areas { grid-template-columns: 1fr; }
}

.svc-card {
  border-radius: 12px;
  text-align: center;
  box-shadow: 0 4px 16px rgba(0,0,0,0.06);
  background: var(--color-paper);
  border: 1px solid var(--color-border);
  border-top-width: 6px; /* Thick accent border on top */
  transition: transform 0.2s, box-shadow 0.2s;
  display: flex;
  flex-direction: column;
  padding: 32px 24px;
}
html.dark .svc-card {
  background: #14110E; /* Deep dark background matching the dark mode body */
  border-color: #2A241E; /* Subtle border */
  box-shadow: 0 8px 24px rgba(0,0,0,0.5);
}
.svc-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0,0,0,0.1);
}
html.dark .svc-card:hover {
  box-shadow: 0 12px 32px rgba(0,0,0,0.6);
}

.svc-title {
  font-size: 20px;
  font-weight: 700;
  margin: 0 0 16px 0;
  letter-spacing: 0.5px;
}

.svc-val {
  font-size: 15px;
  font-weight: 500;
  color: var(--color-ink);
  margin: 0;
  line-height: 1.6;
}

/* Accent colors applied to top border and title text */
.svc-blue { border-top-color: #3B82F6; }
.svc-blue .svc-title { color: #2563EB; }
html.dark .svc-blue { border-top-color: #60A5FA; }
html.dark .svc-blue .svc-title { color: #60A5FA; }

.svc-green { border-top-color: #10B981; }
.svc-green .svc-title { color: #059669; }
html.dark .svc-green { border-top-color: #34D399; }
html.dark .svc-green .svc-title { color: #34D399; }

.svc-orange { border-top-color: #F59E0B; }
.svc-orange .svc-title { color: #D97706; }
html.dark .svc-orange { border-top-color: #FBBF24; }
html.dark .svc-orange .svc-title { color: #FBBF24; }

.svc-purple { border-top-color: #8B5CF6; }
.svc-purple .svc-title { color: #7C3AED; }
html.dark .svc-purple { border-top-color: #A78BFA; }
html.dark .svc-purple .svc-title { color: #A78BFA; }
`;
  
  cssText += '\n' + refinedCss + '\n';
  fs.writeFileSync(cssPath, cssText, 'utf8');
  console.log("Refined style.css service card design.");
}
