const { initializeApp, cert, getApps } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');

function parsePrivateKey(raw) {
  if (!raw) throw new Error('FIREBASE_PRIVATE_KEY env var is not set');
  const HEADER = '-----BEGIN PRIVATE KEY-----';
  const FOOTER = '-----END PRIVATE KEY-----';
  // Handle literal \n strings
  let key = raw.replace(/\\n/g, '\n').trim();
  // Strip header/footer if present, then rebuild cleanly
  const bodyRaw = key
    .replace(HEADER, '').replace(FOOTER, '')
    .replace(/\s/g, '');
  const lines = bodyRaw.match(/.{1,64}/g) || [];
  return `${HEADER}\n${lines.join('\n')}\n${FOOTER}\n`;
}

function getAdmin() {
  if (getApps().length) return getApps()[0];
  return initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: parsePrivateKey(process.env.FIREBASE_PRIVATE_KEY),
    }),
  });
}

async function verifySteamLogin(query) {
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(query)) params.set(k, v);
  params.set('openid.mode', 'check_authentication');
  const res = await fetch('https://steamcommunity.com/openid/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString(),
  });
  return (await res.text()).includes('is_valid:true');
}

function extractSteamId(claimedId) {
  const m = (claimedId || '').match(/\/id\/(\d+)$/);
  return m ? m[1] : null;
}

async function fetchSteamPersona(steamId) {
  const key = process.env.STEAM_WEB_API_KEY;
  if (!key) return '';
  try {
    const url = `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/?key=${key}&steamids=${steamId}`;
    const res = await fetch(url);
    if (!res.ok) return '';
    const data = await res.json();
    return data?.response?.players?.[0]?.personaname || '';
  } catch {
    return '';
  }
}

module.exports = async function handler(req, res) {
  const appUrl = process.env.APP_URL || 'https://coderaid.win';
  try {
    if (!await verifySteamLogin(req.query)) {
      return res.redirect(`${appUrl}?steamError=invalid`);
    }
    const steamId = extractSteamId(req.query['openid.claimed_id']);
    if (!steamId) return res.redirect(`${appUrl}?steamError=no_id`);

    const token = await getAuth(getAdmin()).createCustomToken(`steam_${steamId}`, { steamId });
    const persona = await fetchSteamPersona(steamId);
    const personaParam = persona ? `&steamPersona=${encodeURIComponent(persona)}` : '';
    res.redirect(`${appUrl}?steamToken=${encodeURIComponent(token)}&steamId=${steamId}${personaParam}`);
  } catch (err) {
    console.error('Steam auth error:', err);
    const msg = encodeURIComponent((err && err.message) ? err.message.slice(0, 200) : 'unknown');
    res.redirect(`${appUrl}?steamError=server&steamMsg=${msg}`);
  }
};
