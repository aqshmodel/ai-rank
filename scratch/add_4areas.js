import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 1. Update index.html
const indexPath = path.join(__dirname, '../index.html');
let indexHtml = fs.readFileSync(indexPath, 'utf8');

const injectionHtml = `
    <!-- ─── ADDED: 4 SERVICE AREAS ─── -->
    <h3 class="ent-sub-heading" style="text-align: center; font-size: 26px; font-weight: 700; color: var(--color-ink); margin: 60px 0 24px;">対応可能な4領域</h3>
    <div class="service-4areas">
      <div class="svc-card svc-blue">
        <h3 class="svc-title">AIコンサルティング</h3>
        <p class="svc-val">生成AI導入戦略〜定着支援</p>
      </div>
      <div class="svc-card svc-green">
        <h3 class="svc-title">システム開発</h3>
        <p class="svc-val">Claude Code活用の高速開発</p>
      </div>
      <div class="svc-card svc-orange">
        <h3 class="svc-title">研修講師派遣</h3>
        <p class="svc-val">経営層〜現場まで対応</p>
      </div>
      <div class="svc-card svc-purple">
        <h3 class="svc-title">業務自動化</h3>
        <p class="svc-val">RPA / ワークフロー自動化</p>
      </div>
    </div>

    <!-- Features Heading -->
    <h3 class="ent-sub-heading" style="text-align: center; font-size: 26px; font-weight: 700; color: var(--color-ink); margin: 80px 0 40px;">THE AI RANK いわて の導入メリット</h3>
`;

// Insert the 4 areas exactly before the `<div class="ent-grid">`
indexHtml = indexHtml.replace(/<div class="ent-grid">/, injectionHtml + '\n    <div class="ent-grid">');
fs.writeFileSync(indexPath, indexHtml, 'utf8');
console.log("Updated index.html");

// 2. Update style.css
const cssPath = path.join(__dirname, '../style.css');
let cssText = fs.readFileSync(cssPath, 'utf8');

const newCss = `
/* ─── SERVICE 4 AREAS (Added for Enterprise) ─── */
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
  overflow: hidden;
  text-align: center;
  box-shadow: 0 4px 12px rgba(0,0,0,0.06);
  background: var(--color-paper);
  border: 1px solid var(--color-border);
  transition: transform 0.2s;
  display: flex;
  flex-direction: column;
}
html.dark .svc-card {
  box-shadow: 0 4px 16px rgba(0,0,0,0.4);
}
.svc-card:hover { transform: translateY(-4px); }

.svc-title {
  padding: 16px;
  font-size: 20px;
  font-weight: 700;
  color: #fff;
  margin: 0;
  letter-spacing: 0.5px;
}
html.dark .svc-title { font-weight: 600; }

.svc-val {
  padding: 24px 16px;
  font-size: 16px;
  font-weight: 600;
  color: var(--color-ink);
  margin: 0;
  background: var(--color-surface);
  flex-grow: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Specific colors matching the provided image */
.svc-blue   { border-color: #0E4DB4; }
.svc-blue   .svc-title { background-color: #0E4DB4; }
.svc-green  { border-color: #26A567; }
.svc-green  .svc-title { background-color: #26A567; }
.svc-orange { border-color: #F18A1D; }
.svc-orange .svc-title { background-color: #F18A1D; }
.svc-purple { border-color: #8C28A1; }
.svc-purple .svc-title { background-color: #8C28A1; }

.ent-sub-heading {
  font-family: 'Shippori Mincho B1', serif;
}
`;

cssText += '\n' + newCss + '\n';
fs.writeFileSync(cssPath, cssText, 'utf8');
console.log("Updated style.css");
