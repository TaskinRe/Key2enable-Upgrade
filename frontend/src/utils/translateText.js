export async function translateText(text, targetLang) {
  const BASE_URL = import.meta.env.VITE_API_BASE_URL;
  
  const res = await fetch(`${BASE_URL}/api/translate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      text,
      target: targetLang,
    }),
  });

  const data = await res.json();
  return data.translatedText;
}
