export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { priceId, email } = req.body;

  if (!priceId) {
    return res.status(400).json({ error: 'priceId is required' });
  }

  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    return res.status(500).json({ error: 'STRIPE_SECRET_KEY が設定されていません' });
  }

  const baseUrl = `https://${req.headers.host}`;

  const params = new URLSearchParams();
  params.append('mode', 'subscription');
  params.append('success_url', `${baseUrl}?success=true`);
  params.append('cancel_url', baseUrl);
  params.append('line_items[0][price]', priceId);
  params.append('line_items[0][quantity]', '1');
  if (email) params.append('customer_email', email);

  try {
    const response = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${secretKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ error: data.error?.message || '決済セッションの作成に失敗しました' });
    }

    return res.status(200).json({ url: data.url });
  } catch (err) {
    return res.status(500).json({ error: err.message || '内部エラーが発生しました' });
  }
}
