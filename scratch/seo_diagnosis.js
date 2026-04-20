import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 1. diagnosis.html の修正
const diagnosisPath = path.join(__dirname, '../diagnosis.html');
let html = fs.readFileSync(diagnosisPath, 'utf8');

// Title & Desc
html = html.replace(
  /<title>.*?<\/title>/,
  '<title>AIスキル診断テスト - あなたのAI活用レベルを10問で格付け | THE AI RANK いわて</title>'
);

const newDesc = "無料のAIスキル診断テスト。10個の質問に答えるだけで、あなたのAI活用レベル（AIリテラシー）を9段階で格付けし、専用の認定証を発行します。約2分で診断完了。";
html = html.replace(/<meta name="description" content="[^"]*"/, `<meta name="description" content="${newDesc}"`);
html = html.replace(/<meta property="og:description" content="[^"]*"/, `<meta property="og:description" content="${newDesc}"`);
html = html.replace(/<meta name="twitter:description" content="[^"]*"/, `<meta name="twitter:description" content="${newDesc}"`);

// Canonical & URL
html = html.replace(/<link rel="canonical" href="[^"]*"/, '<link rel="canonical" href="https://ai-rank.aqsh.co.jp/diagnosis"');
html = html.replace(/<meta property="og:url" content="[^"]*"/, '<meta property="og:url" content="https://ai-rank.aqsh.co.jp/diagnosis"');
html = html.replace(/<meta property="og:title" content="[^"]*"/, '<meta property="og:title" content="AIスキル診断テスト - あなたのAI活用レベルを10問で格付け | THE AI RANK いわて"');
html = html.replace(/<meta name="twitter:title" content="[^"]*"/, '<meta name="twitter:title" content="AIスキル診断テスト - あなたのAI活用レベルを10問で格付け | THE AI RANK いわて"');

// JSON-LD (Schema.org) の書き換え
const ldJsonStart = html.indexOf('<script type="application/ld+json">');
const ldJsonEnd = html.indexOf('</script>', ldJsonStart);
if (ldJsonStart !== -1 && ldJsonEnd !== -1) {
  const newSchema = `<script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        "@id": "https://ai-rank.aqsh.co.jp/diagnosis#app",
        "name": "THE AI RANK いわて — AI スキル診断テスト",
        "url": "https://ai-rank.aqsh.co.jp/diagnosis",
        "applicationCategory": "EducationalApplication",
        "operatingSystem": "Any",
        "browserRequirements": "Requires JavaScript. Requires HTML5.",
        "inLanguage": "ja",
        "isAccessibleForFree": true,
        "offers": {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "JPY",
          "availability": "https://schema.org/InStock"
        },
        "description": "10問で個人のAI活用スキルを9段階で測定し、即座に結果を反映した認定証を発行する無料の診断ツールです。",
        "provider": {
          "@type": "Organization",
          "name": "Aqsh株式会社",
          "url": "https://aqsh.co.jp"
        }
      },
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "THE AI RANK いわて",
            "item": "https://ai-rank.aqsh.co.jp/"
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": "AIスキル診断テスト",
            "item": "https://ai-rank.aqsh.co.jp/diagnosis"
          }
        ]
      }
    ]
  }
  `;
  html = html.substring(0, ldJsonStart) + newSchema + html.substring(ldJsonEnd);
}

// Thin Content 対策 (テキストとFAQの追加)
const faqSection = `
  <!-- ─── DIAGNOSIS DESCRIPTION & FAQ (SEO) ─── -->
  <section class="diagnosis-faq" style="max-width: 800px; margin: 60px auto 120px; padding: 0 24px;">
    <h2 style="font-family: 'Bricolage Grotesque', sans-serif; font-size: 24px; margin-bottom: 24px; color: #17130F;">AIスキル診断テストとは？</h2>
    <p style="font-size: 15px; line-height: 1.8; color: #5C5247; margin-bottom: 32px;">
      THE AI RANK いわてが提供するこの無料テストは、あなたの現在のAI（人工知能）活用スキル・リテラシーを客観的に測るためのツールです。
      「ChatGPTやGeminiを使ったことがある」という初心者レベルから、「AIが会社や業務の収益基盤を自動化している」というシンギュラリアン（最高峰）レベルまで、全9段階の公式基準に基づいて判定します。
      <br><br>
      全10問の選択式テストに答える（所要時間：約2分）だけで、あなたの現在の立ち位置と「次に目指すべきステップ」を可視化します。
    </p>

    <h3 style="font-family: 'Shippori Mincho B1', serif; font-size: 20px; margin-bottom: 16px; color: #17130F; border-bottom: 1px solid rgba(0,0,0,0.1); padding-bottom: 12px;">よくあるご質問（FAQ）</h3>
    <dl style="font-size: 14px; line-height: 1.6; color: #5C5247;">
      <dt style="font-weight: bold; margin-bottom: 8px; color: #17130F;">Q. 診断に料金や会員登録は必要ですか？</dt>
      <dd style="margin-left: 0; margin-bottom: 24px;">A. いいえ、完全無料でご利用いただけます。会員登録なしでも診断可能ですが、SNS（Xなど）で結果画像（認定証）をシェアしたり、記録を後から確認したりする場合は、任意の簡単な入力（本名以外も可）のみでご利用いただけます。</dd>

      <dt style="font-weight: bold; margin-bottom: 8px; color: #17130F;">Q. 診断結果の「9段階」はどのような基準ですか？</dt>
      <dd style="margin-left: 0; margin-bottom: 24px;">A. 利用しているAIツール（汎用AI/特化AI）の数、自動化やプロンプトの設計能力、さらには自身が作成したAIツールによる収益化・社内導入実績など、具体的な「活用と結果」の深度に基づいて判定しています。</dd>

      <dt style="font-weight: bold; margin-bottom: 8px; color: #17130F;">Q. 法人で社員全体のAIスキルをまとめてテストすることは可能ですか？</dt>
      <dd style="margin-left: 0; margin-bottom: 24px;">A. はい。企業や自治体向けに、社内全体のレベルを可視化する「法人向け専用アカウント」と研修プログラムを提供可能です。ご興味がある方はページ下部やお問い合わせフォームよりご相談ください。</dd>
    </dl>
  </section>
`;

// `<!-- ─── SIGNUP MODAL ─── -->` や `<!-- ─── TOAST ─── -->` の直前か、`<footer`の前に入れる。
// footerがあるなら、`<footer` の直前を狙う。
if (html.includes('<footer class="global-footer">')) {
  html = html.replace('<footer class="global-footer">', faqSection + '\n  <footer class="global-footer">');
} else {
  // footerがなければとりあえずTOASTの前
  html = html.replace('<!-- ─── TOAST ─── -->', faqSection + '\n  <!-- ─── TOAST ─── -->');
}

fs.writeFileSync(diagnosisPath, html, 'utf8');

// 2. server.js (sitemap.xmlの修正)
const serverPath = path.join(__dirname, '../server.js');
let serverJs = fs.readFileSync(serverPath, 'utf8');
const sitemapUrlTpl = "`<url>\\n    <loc>\\${baseUrl}/</loc>\\n    <changefreq>weekly</changefreq>\\n    <priority>1.0</priority>\\n  </url>\\n`";
// xml += の部分に `/diagnosis` も追加する
const targetStr = `xml += \`<url>\\n    <loc>\${baseUrl}/</loc>\\n    <changefreq>weekly</changefreq>\\n    <priority>1.0</priority>\\n  </url>\\n\`;`;
if (serverJs.includes(targetStr) && !serverJs.includes('${baseUrl}/diagnosis')) {
  const replacement = `
    xml += \`<url>\\n    <loc>\${baseUrl}/</loc>\\n    <changefreq>weekly</changefreq>\\n    <priority>1.0</priority>\\n  </url>\\n\`;
    xml += \`<url>\\n    <loc>\${baseUrl}/diagnosis</loc>\\n    <changefreq>weekly</changefreq>\\n    <priority>0.9</priority>\\n  </url>\\n\`;
  `;
  serverJs = serverJs.replace(targetStr, replacement.trim());
  fs.writeFileSync(serverPath, serverJs, 'utf8');
}

console.log("SEO improvements applied to diagnosis.html and server.js");
