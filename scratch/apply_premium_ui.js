import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 1. Update diagnosis.html padding
const diagPath = path.join(__dirname, '../diagnosis.html');
if (fs.existsSync(diagPath)) {
  let diagHtml = fs.readFileSync(diagPath, 'utf8');
  // 余白を抑える inline style の注入
  diagHtml = diagHtml.replace(
    /<section class="diagnosis"\s+id="diagnosis"[^>]*>/g,
    '<section class="diagnosis" id="diagnosis" style="padding-top: calc(var(--header-height, 60px) + 32px); min-height: 100vh;">'
  );
  fs.writeFileSync(diagPath, diagHtml, 'utf8');
  console.log("Updated padding for diagnosis.html");
}

// 2. Update style.css premium redesign
const cssPath = path.join(__dirname, '../style.css');
if (fs.existsSync(cssPath)) {
  let cssText = fs.readFileSync(cssPath, 'utf8');

  // 前回のCSSを消去
  const regex = /\/\* ─── SERVICE 4 AREAS \(Refined\) ─── \*\/[\s\S]*?(?=\.ent-sub-heading|\/\* ───|\n\n|$)/;
  cssText = cssText.replace(regex, '');

  const premiumCss = `
/* ─── SERVICE 4 AREAS (Premium Glassmorphism) ─── */
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
  border-radius: 16px;
  text-align: center;
  box-shadow: 0 4px 16px rgba(0,0,0,0.06);
  background: var(--color-paper);
  border: 1px solid var(--color-border);
  transition: transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease;
  display: flex;
  flex-direction: column;
  padding: 32px 24px;
  position: relative;
  overflow: hidden;
}

/* Glassmorphism specifically for Dark Mode */
html.dark .svc-card {
  background: rgba(255, 255, 255, 0.035); /* Elegant glass tint */
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.1); /* Subtle glowing rim */
  box-shadow: 0 8px 32px rgba(0,0,0,0.3);
}
html.dark .svc-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 40px rgba(0,0,0,0.5);
  border-color: rgba(255, 255, 255, 0.2);
}

.svc-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(0,0,0,0.1);
}

.svc-title {
  font-size: 20px;
  font-weight: 700;
  margin: 0 0 16px 0;
  letter-spacing: 0.5px;
  position: relative;
  z-index: 2;
}
html.dark .svc-title {
  color: #fff;
}

.svc-val {
  font-size: 15px;
  font-weight: 500;
  color: var(--color-ink);
  margin: 0;
  line-height: 1.6;
  position: relative;
  z-index: 2;
}
html.dark .svc-val {
  color: rgba(255, 255, 255, 0.75);
}

/* Glow gradient pseudo-element */
.svc-card::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 120px;
  z-index: 1;
  opacity: 0.5; /* Always show slight glow in dark mode */
  transition: opacity 0.4s ease;
  border-top: 2px solid transparent;
  pointer-events: none;
}
/* In light mode, hide glow unless hovered, and don't use translucent grad */
.svc-card::before {
  opacity: 0;
}
html.dark .svc-card::before {
  opacity: 0.3;
}
html.dark .svc-card:hover::before {
  opacity: 1; /* Brighten glow on hover */
}

/* ─── Light mode standard borders ─── */
.svc-blue { border-top-color: #3B82F6; border-top-width: 4px; }
.svc-green { border-top-color: #10B981; border-top-width: 4px; }
.svc-orange { border-top-color: #F59E0B; border-top-width: 4px; }
.svc-purple { border-top-color: #8B5CF6; border-top-width: 4px; }

/* ─── Dark mode glow logic ─── */
html.dark .svc-blue { border-top-width: 1px; }
html.dark .svc-blue::before {
  background: linear-gradient(180deg, rgba(59, 130, 246, 0.15) 0%, transparent 100%);
  border-top-color: rgba(59, 130, 246, 0.8);
}
html.dark .svc-blue:hover { border-color: rgba(59, 130, 246, 0.4); }

html.dark .svc-green { border-top-width: 1px; }
html.dark .svc-green::before {
  background: linear-gradient(180deg, rgba(16, 185, 129, 0.15) 0%, transparent 100%);
  border-top-color: rgba(16, 185, 129, 0.8);
}
html.dark .svc-green:hover { border-color: rgba(16, 185, 129, 0.4); }

html.dark .svc-orange { border-top-width: 1px; }
html.dark .svc-orange::before {
  background: linear-gradient(180deg, rgba(245, 158, 11, 0.15) 0%, transparent 100%);
  border-top-color: rgba(245, 158, 11, 0.8);
}
html.dark .svc-orange:hover { border-color: rgba(245, 158, 11, 0.4); }

html.dark .svc-purple { border-top-width: 1px; }
html.dark .svc-purple::before {
  background: linear-gradient(180deg, rgba(139, 92, 246, 0.15) 0%, transparent 100%);
  border-top-color: rgba(139, 92, 246, 0.8);
}
html.dark .svc-purple:hover { border-color: rgba(139, 92, 246, 0.4); }
`;
  
  cssText += '\n' + premiumCss + '\n';
  fs.writeFileSync(cssPath, cssText, 'utf8');
  console.log("Applied premium Glassmorphism design to style.css");
}
