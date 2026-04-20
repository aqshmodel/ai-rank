import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const filePath = path.join(__dirname, '../diagnosis.html');
let content = fs.readFileSync(filePath, 'utf-8');

// The elements we want to remove starting from HERO until DIAGNOSIS
// Remove HERO
content = content.replace(/<!-- ─── HERO ─── -->[\s\S]*?(?=<!-- ─── PYRAMID \/ OVERVIEW ─── -->)/i, '');
// Remove PYRAMID
content = content.replace(/<!-- ─── PYRAMID \/ OVERVIEW ─── -->[\s\S]*?(?=<!-- ─── LEVELS ─── -->)/i, '');
// Remove LEVELS
content = content.replace(/<!-- ─── LEVELS ─── -->[\s\S]*?(?=<!-- ─── CROSSROADS)/i, '');
// Remove CROSSROADS
content = content.replace(/<!-- ─── CROSSROADS.*─── -->[\s\S]*?(?=<!-- ─── DIAGNOSIS ─── -->)/ig, '');

// The elements we want to remove AFTER DIAGNOSIS until TOAST or SIGNUP MODAL
content = content.replace(/<!-- ─── ENTERPRISE ─── -->[\s\S]*?(?=<!-- ─── PRINCIPLES )/i, '');
content = content.replace(/<!-- ─── PRINCIPLES.*─── -->[\s\S]*?(?=<!-- ─── COLOPHON ─── -->)/ig, '');
content = content.replace(/<!-- ─── COLOPHON ─── -->[\s\S]*?(?=<!-- ─── SIGNUP MODAL ─── -->|<footer)/i, '');

// lang-switch-float (Hero specific floating language switcher) もいらない場合は消すが、今回は念の為残す
fs.writeFileSync(filePath, content, 'utf-8');

console.log("Trimmed diagnosis.html successfully.");
