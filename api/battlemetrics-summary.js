const GAME_NAMES = {
  '7dtd': '7 Days to Die',
  'arksa': 'ARK: Survival Ascended',
  'ark': 'ARK: Survival Evolved',
  'arma2': 'ArmA 2',
  'arma3': 'ArmA 3',
  'reforger': 'Arma Reforger',
  'atlas': 'Atlas',
  'battalion1944': 'Battalion 1944',
  'battlebit': 'BattleBit Remastered',
  'btw': 'Beyond the Wire',
  'conanexiles': 'Conan Exiles',
  'cs': 'Counter-Strike',
  'css': 'Counter-Strike: Source',
  'dnl': 'Dark and Light',
  'dayz': 'DayZ',
  'enshrouded': 'Enshrouded',
  'gmod': "Garry's Mod",
  'hll': 'Hell Let Loose',
  'insurgency': 'Insurgency',
  'sandstorm': 'Insurgency: Sandstorm',
  'minecraft': 'Minecraft',
  'mordhau': 'MORDHAU',
  'moe': 'Myth of Empires',
  'palworld': 'Palworld',
  'pixark': 'PixARK',
  'zomboid': 'Project Zomboid',
  'rend': 'Rend',
  'rs2vietnam': 'Rising Storm 2: Vietnam',
  'rust': 'Rust',
  'scum': 'SCUM',
  'soulmask': 'Soulmask',
  'squad': 'Squad',
  'postscriptum': 'Squad 44',
  'tf2': 'Team Fortress 2',
  'thefront': 'The Front',
  'unturned': 'Unturned',
  'vrising': 'V Rising',
  'valheim': 'Valheim',
};

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'no-store');
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (!process.env.BM_TOKEN) return res.status(503).json({ error: 'no_token' });

  const { id } = req.query;
  if (!id || !/^\d+$/.test(id)) return res.status(400).json({ error: 'Invalid player ID' });

  const headers = {
    'Accept': 'application/json',
    'Authorization': `Bearer ${process.env.BM_TOKEN}`,
  };

  try {
    const resp = await fetch(
      `https://api.battlemetrics.com/players/${id}?include=server,identifier`,
      { headers }
    );
    if (!resp.ok) {
      const body = await resp.text();
      return res.status(resp.status).json({
        error: `BattleMetrics error ${resp.status}`,
        detail: body.slice(0, 300),
      });
    }
    const data = await resp.json();
    const name = data.data?.attributes?.name || 'Unknown';
    const included = Array.isArray(data.included) ? data.included : [];

    const pastNames = included
      .filter(r => r.type === 'identifier' && r.attributes?.type === 'name')
      .map(r => ({
        name: r.attributes.identifier,
        lastSeen: r.attributes.lastSeen || null,
      }))
      .sort((a, b) => (b.lastSeen || '').localeCompare(a.lastSeen || ''));

    const serverRecords = included
      .filter(r =>
        r.type === 'server' &&
        r.meta &&
        typeof r.meta.timePlayed === 'number' &&
        r.meta.timePlayed > 0
      )
      .map(r => ({
        id: r.id,
        name: r.attributes?.name || 'Unknown server',
        game: r.relationships?.game?.data?.id || null,
        timePlayed: r.meta.timePlayed,
      }));

    const byGame = new Map();
    for (const s of serverRecords) {
      if (!s.game) continue;
      if (!byGame.has(s.game)) byGame.set(s.game, []);
      byGame.get(s.game).push(s);
    }

    const fmtH = (sec) => Math.round(sec / 36) / 100; // -> hours with 2dp

    const games = [...byGame.entries()]
      .map(([gameId, list]) => {
        const totalSec = list.reduce((sum, s) => sum + s.timePlayed, 0);
        const servers = [...list]
          .sort((a, b) => b.timePlayed - a.timePlayed)
          .slice(0, 10)
          .map(s => ({ id: s.id, name: s.name, hours: fmtH(s.timePlayed) }));
        return {
          id: gameId,
          label: GAME_NAMES[gameId] || gameId,
          totalHours: fmtH(totalSec),
          servers,
        };
      })
      .sort((a, b) => b.totalHours - a.totalHours);

    res.json({ id, name, pastNames, games });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};
