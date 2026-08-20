import fs from 'fs';
import path from 'path';
import https from 'https';
import http from 'http';

const STEP_OUTPUT_PATH = 'C:/Users/AI/.gemini/antigravity/brain/2a362461-daa6-4c77-b5b9-a3e9dcc6fbb4/.system_generated/steps/17/output.txt';
const TARGET_DIR = 'C:/Users/AI/Rumr/public/screens';
const SRC_SCREENS_DIR = 'C:/Users/AI/Rumr/src/screens';

if (!fs.existsSync(TARGET_DIR)) {
  fs.mkdirSync(TARGET_DIR, { recursive: true });
}
if (!fs.existsSync(SRC_SCREENS_DIR)) {
  fs.mkdirSync(SRC_SCREENS_DIR, { recursive: true });
}

function sanitizeFilename(name) {
  return name.toLowerCase().replace(/[^a-z0-9_-]/g, '_').replace(/_+/g, '_').slice(0, 50);
}

function downloadUrl(url, destPath) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    const req = protocol.get(url, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return downloadUrl(res.headers.location, destPath).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`Failed with status code: ${res.statusCode}`));
      }
      const fileStream = fs.createWriteStream(destPath);
      res.pipe(fileStream);
      fileStream.on('finish', () => {
        fileStream.close(resolve);
      });
    });
    req.on('error', reject);
  });
}

async function run() {
  console.log('Reading screens from Stitch MCP output...');
  if (!fs.existsSync(STEP_OUTPUT_PATH)) {
    console.error('Step output not found!');
    return;
  }

  const rawData = fs.readFileSync(STEP_OUTPUT_PATH, 'utf-8');
  const parsed = JSON.parse(rawData);
  const screens = parsed.screens || [];
  console.log(`Found ${screens.length} screens to process.`);

  const indexList = [];

  for (let i = 0; i < screens.length; i++) {
    const s = screens[i];
    const screenId = s.name ? s.name.split('/').pop() : `screen_${i + 1}`;
    const cleanTitle = sanitizeFilename(s.title || `screen_${i + 1}`);
    const filename = `${String(i + 1).padStart(2, '0')}_${cleanTitle}.html`;
    const targetFile = path.join(TARGET_DIR, filename);
    const srcFile = path.join(SRC_SCREENS_DIR, filename);

    indexList.push({
      index: i + 1,
      id: screenId,
      title: s.title || 'Untitled Screen',
      filename,
      width: s.width || '390',
      height: s.height || '844',
      deviceType: s.deviceType || 'MOBILE',
      screenshotUrl: s.screenshot && s.screenshot.downloadUrl ? s.screenshot.downloadUrl : null
    });

    if (s.htmlCode && s.htmlCode.downloadUrl) {
      try {
        console.log(`[${i + 1}/${screens.length}] Downloading ${filename}...`);
        await downloadUrl(s.htmlCode.downloadUrl, targetFile);
        fs.copyFileSync(targetFile, srcFile);
      } catch (err) {
        console.warn(`Could not download ${filename}: ${err.message}`);
      }
    }
  }

  const manifestPath = path.join('C:/Users/AI/Rumr/tokens', 'screens-manifest.json');
  fs.writeFileSync(manifestPath, JSON.stringify(indexList, null, 2));
  console.log(`Saved screens manifest to ${manifestPath}`);
  console.log('Done downloading all screens!');
}

run().catch(console.error);
