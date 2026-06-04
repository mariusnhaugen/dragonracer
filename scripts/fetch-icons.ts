import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const WIKI_API = 'https://oldschool.runescape.wiki/api.php';
const OUT_DIR = join(__dirname, '../public/region-icons');

const REGION_FILES = [
  'Globe-icon.png',
  'Asgarnia_Area_Badge.png',
  'Desert_Area_Badge.png',
  'Fremennik_Area_Badge.png',
  'Kandarin_Area_Badge.png',
  'Karamja_Area_Badge.png',
  'Kourend_Area_Badge.png',
  'Morytania_Area_Badge.png',
  'Tirannwn_Area_Badge.png',
  'Varlamore_Area_Badge.png',
  'Wilderness_Area_Badge.png',
];

const TIER_FILES = [
  'Trailblazer_Reloaded_League_tasks_-_Easy.png',
  'Trailblazer_Reloaded_League_tasks_-_Medium.png',
  'Trailblazer_Reloaded_League_tasks_-_Hard.png',
  'Trailblazer_Reloaded_League_tasks_-_Elite.png',
  'Trailblazer_Reloaded_League_tasks_-_Master.png',
];

async function fetchImageUrls(filenames: string[]): Promise<Map<string, string>> {
  const titles = filenames.map(f => `File:${f}`).join('|');
  const url = `${WIKI_API}?action=query&titles=${encodeURIComponent(titles)}&prop=imageinfo&iiprop=url&format=json`;
  const res = await fetch(url, {
    headers: { 'User-Agent': 'leagues-planner/1.0 fetch-icons' },
  });
  const json = await res.json() as { query: { pages: Record<string, { title: string; imageinfo?: { url: string }[] }> } };
  const map = new Map<string, string>();
  for (const page of Object.values(json.query.pages)) {
    if (!page.imageinfo?.[0]?.url) continue;
    const filename = page.title.replace(/^File:/, '').replace(/ /g, '_');
    map.set(filename, page.imageinfo[0].url);
  }
  return map;
}

async function downloadFile(url: string, dest: string) {
  const res = await fetch(url, {
    headers: { 'User-Agent': 'leagues-planner/1.0 fetch-icons' },
  });
  if (!res.ok) throw new Error(`Failed to download ${url}: ${res.status}`);
  const buffer = Buffer.from(await res.arrayBuffer());
  writeFileSync(dest, buffer);
}

async function main() {
  mkdirSync(OUT_DIR, { recursive: true });

  const allFiles = [...REGION_FILES, ...TIER_FILES];
  const urlMap = await fetchImageUrls(allFiles);

  for (const filename of allFiles) {
    const url = urlMap.get(filename);
    if (!url) { console.warn(`  Missing: ${filename}`); continue; }
    await downloadFile(url, join(OUT_DIR, filename));
    console.log(`  Downloaded: ${filename}`);
  }

  console.log(`\nWrote ${urlMap.size} icons to ${OUT_DIR}`);
}

main().catch(e => { console.error(e); process.exit(1); });
