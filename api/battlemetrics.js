async function getOnlineStatus(bmId, headers) {
  try {
    // only filter[players] is valid — check if any session has stop===null
    // include=server pulls the server record into `included` so we can read its name
    const res = await fetch(
      `https://api.battlemetrics.com/sessions?filter[players]=${bmId}&include=server&page[size]=10`,
      { headers }
    );
    const text = await res.text();
    let data;
    try { data = JSON.parse(text); } catch { return { online: false }; }
    if (!res.ok) return { online: false };
    if (!Array.isArray(data.data)) return { online: false };

    const activeSession = data.data.find(s => s.attributes?.stop === null);
    if (!activeSession) return { online: false };

    const serverId = activeSession.relationships?.server?.data?.id || null;
    let serverName = null;
    if (serverId && Array.isArray(data.included)) {
      const serverObj = data.included.find(i => i.type === 'server' && i.id === serverId);
      serverName = serverObj?.attributes?.name || null;
    }
    return { online: true, serverId, serverName };
  } catch {
    return { online: false };
  }
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'no-store');
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (!process.env.BM_TOKEN) {
    return res.status(503).json({ error: 'no_token' });
  }

  const headers = {
    'Accept': 'application/json',
    'Authorization': `Bearer ${process.env.BM_TOKEN}`,
  };

  try {
    // Steam64 ID lookup
    if (req.query.steam) {
      const steamId = req.query.steam.trim();
      if (!/^\d{17}$/.test(steamId)) {
        return res.status(400).json({ error: 'Invalid Steam ID (must be 17-digit Steam64 ID)' });
      }
      const searchRes = await fetch(
        `https://api.battlemetrics.com/players?filter[search]=${encodeURIComponent(steamId)}&page[size]=1`,
        { headers }
      );
      if (!searchRes.ok) {
        return res.status(searchRes.status).json({ error: `BattleMetrics error ${searchRes.status}` });
      }
      const searchData = await searchRes.json();
      if (!searchData.data?.length) {
        return res.status(404).json({ error: 'Player not found on BattleMetrics' });
      }
      const player = searchData.data[0];
      const bmId = player.id;
      const name = player.attributes?.name || 'Unknown';
      const { online, serverId, serverName } = await getOnlineStatus(bmId, headers);
      return res.json({ id: bmId, name, online, serverId: serverId || null, serverName: serverName || null });
    }

    // BattleMetrics player ID lookup
    const { id } = req.query;
    if (!id || !/^\d+$/.test(id)) {
      return res.status(400).json({ error: 'Invalid player ID' });
    }

    const playerRes = await fetch(`https://api.battlemetrics.com/players/${id}`, { headers });
    if (!playerRes.ok) {
      const body = await playerRes.text();
      return res.status(playerRes.status).json({ error: `BattleMetrics error ${playerRes.status}`, detail: body.slice(0, 300) });
    }

    const playerData = await playerRes.json();
    const name = playerData.data?.attributes?.name || 'Unknown';
    const { online, serverId, serverName } = await getOnlineStatus(id, headers);

    res.json({ id, name, online, serverId: serverId || null, serverName: serverName || null });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
