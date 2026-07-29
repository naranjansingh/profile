const fs = require('fs');
const https = require('https');
const path = require('path');

const ICONS = {
  flutter: [
    ['Devicon', 'https://raw.githubusercontent.com/devicons/devicon/master/icons/flutter/flutter-original.svg'],
    ['Simple Icons', 'https://raw.githubusercontent.com/simple-icons/simple-icons/develop/icons/flutter.svg'],
  ],
  dart: [
    ['Devicon', 'https://raw.githubusercontent.com/devicons/devicon/master/icons/dart/dart-original.svg'],
    ['Simple Icons', 'https://raw.githubusercontent.com/simple-icons/simple-icons/develop/icons/dart.svg'],
  ],
  firebase: [
    ['Devicon', 'https://raw.githubusercontent.com/devicons/devicon/master/icons/firebase/firebase-original.svg'],
    ['Simple Icons', 'https://raw.githubusercontent.com/simple-icons/simple-icons/develop/icons/firebase.svg'],
  ],
  git: [
    ['Devicon', 'https://raw.githubusercontent.com/devicons/devicon/master/icons/git/git-original.svg'],
    ['Simple Icons', 'https://raw.githubusercontent.com/simple-icons/simple-icons/develop/icons/git.svg'],
  ],
  github: [
    ['Devicon', 'https://raw.githubusercontent.com/devicons/devicon/master/icons/github/github-original.svg'],
    ['Simple Icons', 'https://raw.githubusercontent.com/simple-icons/simple-icons/develop/icons/github.svg'],
  ],
  bitbucket: [
    ['Devicon', 'https://raw.githubusercontent.com/devicons/devicon/master/icons/bitbucket/bitbucket-original.svg'],
    ['Simple Icons', 'https://raw.githubusercontent.com/simple-icons/simple-icons/develop/icons/bitbucket.svg'],
  ],
  android: [
    ['Devicon', 'https://raw.githubusercontent.com/devicons/devicon/master/icons/android/android-original.svg'],
    ['Simple Icons', 'https://raw.githubusercontent.com/simple-icons/simple-icons/develop/icons/android.svg'],
  ],
  ios: [
    ['Devicon', 'https://raw.githubusercontent.com/devicons/devicon/master/icons/apple/apple-original.svg'],
    ['Simple Icons', 'https://raw.githubusercontent.com/simple-icons/simple-icons/develop/icons/apple.svg'],
  ],
  'google-maps': [
    ['Simple Icons', 'https://raw.githubusercontent.com/simple-icons/simple-icons/develop/icons/googlemaps.svg'],
  ],
  onesignal: [
    ['Simple Icons', 'https://raw.githubusercontent.com/simple-icons/simple-icons/develop/icons/onesignal.svg'],
  ],
  razorpay: [
    ['Simple Icons', 'https://raw.githubusercontent.com/simple-icons/simple-icons/develop/icons/razorpay.svg'],
  ],
  cashfree: [
    ['Simple Icons', 'https://raw.githubusercontent.com/simple-icons/simple-icons/develop/icons/cashapp.svg'],
  ],
};

const CONCEPT_ICONS = [
  'rest-api', 'provider', 'getx', 'riverpod', 'bloc', 'firebase-auth', 'firestore',
  'storage', 'cloud-messaging', 'websocket', 'clean-architecture', 'mvc', 'mvvm', 'payment-gateway',
];

function download(url) {
  return new Promise((resolve, reject) => {
    const request = https.get(url, { headers: { 'User-Agent': 'naranjan-profile-icon-fetcher' } }, (response) => {
      if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        response.resume();
        download(response.headers.location).then(resolve, reject);
        return;
      }
      if (response.statusCode !== 200) {
        response.resume();
        reject(new Error(`HTTP ${response.statusCode}`));
        return;
      }
      let body = '';
      response.setEncoding('utf8');
      response.on('data', (chunk) => { body += chunk; });
      response.on('end', () => {
        if (!body.includes('<svg')) {
          reject(new Error('Response is not SVG'));
          return;
        }
        resolve(body.trim() + '\n');
      });
    });
    request.setTimeout(20000, () => request.destroy(new Error('Request timed out')));
    request.on('error', reject);
  });
}

function neutralIcon(name) {
  const label = name.replace(/-/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
  const shortLabel = label.slice(0, 16);
  return `<svg width="96" height="96" viewBox="0 0 96 96" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${label} concept icon"><defs><linearGradient id="g" x1="16" y1="14" x2="80" y2="82"><stop stop-color="#42A5F5"/><stop offset=".5" stop-color="#00D4FF"/><stop offset="1" stop-color="#7C3AED"/></linearGradient></defs><rect x="6" y="6" width="84" height="84" rx="24" fill="#05070D" stroke="#FFFFFF22"/><path d="M28 60 44 28h24L52 60H28Z" fill="url(#g)" opacity=".95"/><path d="M36 68h28" stroke="#fff" stroke-opacity=".82" stroke-width="5" stroke-linecap="round"/><text x="48" y="82" text-anchor="middle" font-family="Inter,Arial" font-size="7.5" font-weight="800" fill="#DCE7FF">${shortLabel}</text></svg>\n`;
}

async function resolveIcon(name, sources) {
  for (const [provider, url] of sources) {
    try {
      const svg = await download(url);
      return { svg, source: `${provider}: ${url}` };
    } catch (error) {
      console.warn(`${name}: ${provider} unavailable (${error.message})`);
    }
  }
  return { svg: neutralIcon(name), source: 'Brand-neutral local SVG fallback; no redistributable Devicon/Simple Icons/official brand SVG available.' };
}

async function main() {
  const iconDir = path.join(process.cwd(), 'assets', 'icons');
  fs.mkdirSync(iconDir, { recursive: true });
  const rows = [];

  for (const [name, sources] of Object.entries(ICONS)) {
    const resolved = await resolveIcon(name, sources);
    fs.writeFileSync(path.join(iconDir, `${name}.svg`), resolved.svg);
    rows.push(`| \`${name}.svg\` | ${resolved.source} |`);
  }

  for (const name of CONCEPT_ICONS) {
    fs.writeFileSync(path.join(iconDir, `${name}.svg`), neutralIcon(name));
    rows.push(`| \`${name}.svg\` | Brand-neutral local SVG fallback; concept/state-management mark without Devicon/Simple Icons equivalent. |`);
  }

  fs.writeFileSync(
    path.join(iconDir, 'SOURCES.md'),
    `# SVG Icon Sources\n\nIcons are resolved automatically in this order: **Devicon → Simple Icons → official/legal equivalent → brand-neutral SVG fallback**. The fallback is used only for concepts or brands without a safely redistributable SVG in the first two registries.\n\n| File | Source |\n|---|---|\n${rows.join('\n')}\n`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
