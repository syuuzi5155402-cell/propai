export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: { message: 'Method Not Allowed' } });
  }

  const { mode, area, city, propType } = req.query;

  if (mode === 'cities') {
    if (!area) {
      return res.status(400).json({ error: { message: 'area パラメータが必要です' } });
    }
    try {
      const url = `https://www.land.mlit.go.jp/webland/api/CitySearch?area=${encodeURIComponent(area)}`;
      const response = await fetch(url);
      const data = await response.json();
      return res.status(200).json(data);
    } catch (err) {
      return res.status(500).json({ error: { message: err.message || '市区町村取得に失敗しました' } });
    }
  }

  if (mode === 'trades') {
    if (!city) {
      return res.status(400).json({ error: { message: 'city パラメータが必要です' } });
    }

    // Calculate dynamic date range: from = 1 year ago quarter, to = current quarter
    // Format: YYYYQ (e.g., 20251 = 2025 Q1)
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1; // 1-12
    const currentQuarter = Math.ceil(currentMonth / 3); // 1-4

    // One year ago
    const fromYear = currentYear - 1;
    const fromQuarter = currentQuarter;

    const from = `${fromYear}${fromQuarter}`;
    const to = `${currentYear}${currentQuarter}`;

    try {
      const params = new URLSearchParams({
        from,
        to,
        city,
      });
      if (propType) {
        params.set('type', propType);
      }

      const url = `https://www.land.mlit.go.jp/webland/api/TradeListSearch?${params.toString()}`;
      const response = await fetch(url);
      const data = await response.json();
      return res.status(200).json(data);
    } catch (err) {
      return res.status(500).json({ error: { message: err.message || '取引データ取得に失敗しました' } });
    }
  }

  return res.status(400).json({ error: { message: '不正な mode パラメータです' } });
}
