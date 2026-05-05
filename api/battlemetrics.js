module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { id } = req.query;
  if (!id || !/^\d+$/.test(id)) {
    return res.status(400).json({ error: 'Invalid player ID' });
  }

  if (!process.env.BM_TOKEN) {
    return res.status(503).json({ error: 'no_token' });
  }

  const headers = {
    'Accept': 'application/json',
    'Authorization': `Bearer ${process.env.BM_TOKEN}`,
  };

  try {
    const playerRes = await fetch(`https://api.battlemetrics.com/players/${id}`, { headers });

    if (!playerRes.ok) {
      const body = await playerRes.text();
      return res.status(playerRes.status).json({ error: `BattleMetrics error ${playerRes.status}`, detail: body.slice(0, 200) });
    }

    const playerData = await playerRes.json();
    const name = playerData.data?.attributes?.name || 'Unknown';

    // Check for an active (open) session = currently online
    let online = false;
    try {
      const sessionRes = await fetch(
        `https://api.battlemetrics.com/sessions?filter[players]=${id}&filter[status]=open&page[size]=1`,
        { headers }
      );
      if (sessionRes.ok) {
        const sessionData = await sessionRes.json();
        online = Array.isArray(sessionData.data) && sessionData.data.length > 0;
      }
    } catch { /* treat as offline if sessions call fails */ }

    res.json({ id, name, online });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
