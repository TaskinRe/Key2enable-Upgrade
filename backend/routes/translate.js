import express from 'express';
import axios from 'axios';
const router = express.Router();

router.post('/translate', async (req, res) => {
  console.log('🔵 POST /api/translate hit!');
  const { text, target } = req.body;
  if (!text || !target) {
    return res.status(400).json({ error: 'Missing text or target' });
  }

  try {
    console.log('🔵 Calling Google Translate...');
    const result = await axios.post(
      'https://translation.googleapis.com/language/translate/v2',
      {},
      {
        params: {
          key: process.env.GOOGLE_API_KEY,
          q: text,
          target: target,
        },
      }
    );

    console.log('🔵 Google responded:', result.data);
    res.json({ translatedText: result.data.data.translations[0].translatedText });

  } catch (err) {
    console.error('🔴 Google error:', err.response?.data || err.message);
    res.status(500).json({ error: 'Translation failed' });
  }
});

export default router;
