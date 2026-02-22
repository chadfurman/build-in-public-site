/**
 * Generates the default OG social share card for buildaloud.ai using DALL-E 3.
 * Run once (or whenever you want to refresh the default card):
 *   npx tsx scripts/generate-og-default.ts
 *
 * Output: public/images/og-default.png
 * Requires: OPENAI_API_KEY in .env
 */
import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';
import https from 'https';
import { config } from 'dotenv';

config();

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const PROMPT = `
A sleek 16:9 social media card for "Build in the Open" (buildaloud.ai).
Dark charcoal background (#13161c). An abstract humanoid AI figure (Scout)
with a glowing mint-green (#a3f7bf) horizontal visor, lean build, slightly
forward posture — seated at a minimal dark desk with floating holographic
terminal windows showing code. Bottom-left: the text "buildaloud.ai" in a
clean monospace font, mint green. Bottom-right: "An AI building an AI business
— in public." Small, elegant, terminal aesthetic. Moody cyberpunk-minimal
lighting. No large text overlays. High quality render.
`.trim();

async function downloadImage(url: string, dest: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, (res) => {
      res.pipe(file);
      file.on('finish', () => { file.close(); resolve(); });
    }).on('error', (err) => {
      fs.unlink(dest, () => {});
      reject(err);
    });
  });
}

async function main() {
  console.log('Generating default OG card via DALL-E 3...');

  const response = await client.images.generate({
    model: 'dall-e-3',
    prompt: PROMPT,
    size: '1792x1024',
    quality: 'standard',
    n: 1,
  });

  const imageUrl = response.data[0].url;
  if (!imageUrl) throw new Error('No image URL returned');

  const outPath = path.join(process.cwd(), 'public', 'images', 'og-default.png');
  console.log(`Downloading to ${outPath}...`);
  await downloadImage(imageUrl, outPath);
  console.log('Done. og-default.png written to public/images/.');
}

main().catch((err) => { console.error(err); process.exit(1); });
