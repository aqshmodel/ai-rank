import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 1. Clean up index.html Inline Styles
const indexPath = path.join(__dirname, '../index.html');
let indexHtml = fs.readFileSync(indexPath, 'utf8');

indexHtml = indexHtml.replace(
  /<h3 class="ent-sub-heading"[^>]*>対応可能な4領域<\/h3>/,
  '<h3 class="ent-sub-heading">対応可能な4領域</h3>'
);

indexHtml = indexHtml.replace(
  /<h3 class="ent-sub-heading"[^>]*>THE AI RANK いわて の導入メリット<\/h3>/,
  '<h3 class="ent-sub-heading">THE AI RANK いわての導入メリット</h3>'
);

fs.writeFileSync(indexPath, indexHtml, 'utf8');

// 2. Add 4 Areas & CTA to diagnosis.html
const diagPath = path.join(__dirname, '../diagnosis.html');
let diagHtml = fs.readFileSync(diagPath, 'utf8');

const diagEnterpriseHtml = `
  <!-- ─── FOR ENTERPRISE (Shortened for Diagnosis Page) ─── -->
  <section class="enterprise" id="enterprise" style="padding-top:0;">
    <h2 class="ent-sub-heading">法人向けサービス・支援領域</h2>
    <p class="section-sub" style="font-size:15px; margin-bottom:48px;">
      THE AI RANK いわて を運営するAqsh株式会社では、岩手県内および全国の企業・自治体様向けに、生成AIの組織導入から現場定着までを伴走支援する以下のサービスを提供しています。
    </p>

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

    <div style="text-align: center; margin-top: 56px; margin-bottom: 40px;">
      <button class="cta-btn primary" onclick="if(window.openModal) window.openModal('enterprise')">
        <span>法人プランの無料相談はこちら</span>
        <span class="mono">→</span>
      </button>
    </div>
  </section>
`;

// Insert the section right after the FAQ section, before the global footer
if (diagHtml.includes('</section>\n  <footer class="global-footer">')) {
  diagHtml = diagHtml.replace('</section>\n  <footer class="global-footer">', '</section>\n' + diagEnterpriseHtml + '\n  <footer class="global-footer">');
} else {
  // Fallback if structure differs slightly
  diagHtml = diagHtml.replace(/<footer class="global-footer">/, diagEnterpriseHtml + '\n  <footer class="global-footer">');
}

fs.writeFileSync(diagPath, diagHtml, 'utf8');

// 3. Update style.css to absorb inline styles
const cssPath = path.join(__dirname, '../style.css');
let cssText = fs.readFileSync(cssPath, 'utf8');

// Extract .ent-sub-heading and update it
const subHeadingStyle = `
.ent-sub-heading {
  font-family: 'Bricolage Grotesque', 'Shippori Mincho B1', sans-serif;
  text-align: center;
  font-size: 26px;
  font-weight: 700;
  color: var(--color-ink);
  margin: 60px 0 24px;
}
html.dark .ent-sub-heading {
  color: #fff;
}
`;

// If we appended it last time, let's replace it
if (cssText.includes('.ent-sub-heading {') && cssText.includes("font-family: 'Shippori Mincho B1', serif;")) {
  cssText = cssText.replace(/\.ent-sub-heading\s*\{\s*font-family:\s*'Shippori Mincho B1',\s*serif;\s*\}/, subHeadingStyle.trim());
} else {
  // fallback append
  cssText += '\n' + subHeadingStyle;
}

fs.writeFileSync(cssPath, cssText, 'utf8');

console.log("Refinement completed: Cleaned styles and added Enterprise CTA to diagnosis.html.");
