import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import ogImageHandler from '../api/og-image.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function run() {
  const req = {
    query: {
      rank: '7',
      name: '山田 太郎'
    }
  };

  const res = {
    setHeader: (key, val) => console.log(`Header set: ${key} = ${val}`),
    status: (code) => ({
      json: (data) => console.log(`Error JSON:`, data)
    }),
    send: (buffer) => {
      const outPath = path.join(__dirname, '..', 'assets', 'og-test-output.png');
      fs.writeFileSync(outPath, buffer);
      console.log(`Success! PNG written to ${outPath}`);
    }
  };

  await ogImageHandler(req, res);
}

run();
