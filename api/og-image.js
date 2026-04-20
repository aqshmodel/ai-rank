import { createCanvas, registerFont } from 'canvas';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Font registration
const fontPath = path.join(__dirname, '../assets/fonts/NotoSansJP-Bold.otf');
let fontRegistered = false;
try {
  registerFont(fontPath, { family: 'Noto Sans JP', weight: 'bold' });
  fontRegistered = true;
} catch (err) {
  console.error('[AIRANK] WARNING: Failed to register font:', err.message);
}

const LEVELS = {
  0: { en: "THE ASPIRANT",     ja: "前哨" },
  1: { en: "THE BEGINNER",     ja: "ビギナー" },
  2: { en: "THE POWER USER",   ja: "パワーユーザー" },
  3: { en: "THE BOT BUILDER",  ja: "ボットビルダー" },
  4: { en: "THE ARTIFACTOR",   ja: "アーティファクター" },
  5: { en: "THE VIBE CODER",   ja: "バイブコーダー" },
  6: { en: "THE AUTOMATOR",    ja: "オートメーター" },
  7: { en: "THE AGENT MASTER", ja: "エージェントマスター" },
  8: { en: "THE AI ALCHEMIST", ja: "AIアルケミスト" },
  9: { en: "THE SINGULARIAN",  ja: "シンギュラリアン" },
};
const ROMAN = ["0","I","II","III","IV","V","VI","VII","VIII","IX"];

export default async function handler(req, res) {
  try {
    const rankParam = req.query?.rank ?? "0";
    const rankNum = Math.max(0, Math.min(9, parseInt(rankParam) || 0));
    const level = LEVELS[rankNum];
    const numeral = ROMAN[rankNum];
    
    const rawName = String(req.query?.name || "").slice(0, 30).trim();
    const userName = rawName || "名無し";

    const width = 1200;
    const height = 630;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    // 背景塗りつぶし (The AI Rank Paper Color)
    ctx.fillStyle = '#F1ECE0';
    ctx.fillRect(0, 0, width, height);

    // デコレーション（認定証風の枠）
    ctx.strokeStyle = '#17130F'; // Ink color
    ctx.lineWidth = 10;
    ctx.strokeRect(30, 30, width - 60, height - 60);

    ctx.strokeStyle = '#8B2514'; // Accent Red
    ctx.lineWidth = 2;
    ctx.strokeRect(42, 42, width - 84, height - 84);

    const defaultFontFamily = fontRegistered ? '"Noto Sans JP", sans-serif' : 'sans-serif';

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // ヘッダーテキスト
    ctx.fillStyle = '#5C5247'; // Ink-soft
    ctx.font = `bold 28px ${defaultFontFamily}`;
    ctx.fillText('THE AI RANK いわて 公式診断結果', width / 2, 100);

    // ユーザー名
    ctx.fillStyle = '#17130F';
    ctx.font = `bold 64px ${defaultFontFamily}`;
    ctx.fillText(`${userName} さんのAIランクは`, width / 2, 210);

    // ランク番号 (大きく)
    ctx.fillStyle = '#8B2514'; // Accent Red
    ctx.font = `bold 180px ${defaultFontFamily}`;
    ctx.fillText(`Lv.${numeral}`, width / 2, 380);

    // ランクごとの称号 (日本語 + 英語)
    ctx.fillStyle = '#17130F';
    ctx.font = `bold 44px ${defaultFontFamily}`;
    ctx.fillText(level.ja, width / 2, 500);

    ctx.fillStyle = '#5C5247';
    ctx.font = `bold 24px ${defaultFontFamily}`;
    ctx.fillText(level.en, width / 2, 555);

    // 画像として出力
    const buffer = canvas.toBuffer('image/png');
    res.setHeader('Content-Type', 'image/png');
    // CDN等のキャッシュに1年間(immutable)保持。画像は名前とランクごとに一意なので安全。
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    res.send(buffer);
  } catch (err) {
    console.error('[AIRANK:og-image_error]', err);
    res.status(500).json({ error: 'Failed to generate OG Image' });
  }
}
