const MLIT_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Accept': 'application/json, text/plain, */*',
  'Accept-Language': 'ja,en-US;q=0.9',
  'Referer': 'https://www.land.mlit.go.jp/webland/servlet/MainServlet',
  'Origin': 'https://www.land.mlit.go.jp',
};

export default async function handler(req, res) {
  // フロントからの CORS を許可
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { mode, area, city, propType } = req.query;

  if (mode === 'cities') {
    if (!area) return res.status(400).json({ error: 'area パラメータが必要です' });

    const url = `https://www.land.mlit.go.jp/webland/api/CitySearch?area=${encodeURIComponent(area)}`;
    try {
      const response = await fetch(url, { headers: MLIT_HEADERS });
      const text = await response.text();

      let data;
      try { data = JSON.parse(text); } catch {
        return res.status(502).json({ error: 'MLIT API から不正なレスポンス', raw: text.slice(0, 300) });
      }

      return res.status(200).json(data);
    } catch (err) {
      return res.status(502).json({ error: err.message || '市区町村取得に失敗しました' });
    }
  }

  if (mode === 'trades') {
    if (!city) return res.status(400).json({ error: 'city パラメータが必要です' });

    const now = new Date();
    const cy  = now.getFullYear();
    const cq  = Math.ceil((now.getMonth() + 1) / 3);
    const from = `${cy - 1}${cq}`;
    const to   = `${cy}${cq}`;

    const params = new URLSearchParams({ from, to, city });
    if (propType) params.set('type', propType);

    const url = `https://www.land.mlit.go.jp/webland/api/TradeListSearch?${params}`;
    try {
      const response = await fetch(url, { headers: MLIT_HEADERS });
      const text = await response.text();

      let data;
      try { data = JSON.parse(text); } catch {
        return res.status(502).json({ error: 'MLIT API から不正なレスポンス', raw: text.slice(0, 300) });
      }

      return res.status(200).json(data);
    } catch (err) {
      return res.status(502).json({ error: err.message || '取引データ取得に失敗しました' });
    }
  }

  return res.status(400).json({ error: '不正な mode パラメータです' });
}
