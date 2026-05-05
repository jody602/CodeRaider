module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { id } = req.query;
  if (!id || !/^\d+$/.test(id)) {
    return res.status(400).json({ error: 'Invalid player ID' });
  }

  const headers = { 'Accept': 'application/json' };
  if (process.env.BM_TOKEN) {
    headers['Authorization'] = `Bearer ${process.env.BM_TOKEN}`;
  }

  try {
    const [playerRes, sessionRes] = await Promise.all([
      fetch(`https://api.battlemetrics.com/players/${id}`, { headers }),
      fetch(`https://api.battlemetrics.com/sessions?filter[players]=${id}&filter[status]=open&page[size]=1`, { headers }),
    ]);

    if (!playerRes.ok) {
      return res.status(playerRes.status).json({ error: `Player not found (${playerRes.status})` });
    }

    const playerData = await playerRes.json();
    const name = playerData.data?.attributes?.name || 'Unknown';

    let online = false;
    if (sessionRes.ok) {
      const sessionData = await sessionRes.json();
      online = Array.isArray(sessionData.data) && sessionData.data.length > 0;
    }

    res.json({ id, name, online });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
