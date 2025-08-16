const fetch = require("node-fetch");

const getSystemPrompt = (stats) => `
Kamu adalah AI asisten admin rental mobil.
Data bisnis hari ini:
- Omzet: Rp${stats.revenue}
- Pesanan: ${stats.orders}
- User aktif: ${stats.users}
- Mobil tersedia: ${stats.availableCars}
Jawab semua pertanyaan admin berdasarkan data di atas.
`.trim();

exports.chat = async (req, res) => {
  console.log('AI_CHAT headers:', {
    auth: req.headers.authorization ? 'present' : 'missing',
    origin: req.headers.origin,
  });
  console.log('AI_CHAT body:', req.body);

  try {
    const { message, systemPrompt, stats } = req.body;
    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    const prompt = systemPrompt || getSystemPrompt(stats);

    const model = "openai/gpt-3.5-turbo";
    const messages = [
      { role: "system", content: prompt },
      { role: "user", content: message }
    ];

    // Daftar max_tokens yang akan dicoba bertahap
    const tokenSteps = [1024, 512, 256, 128, 64];
    let lastError = null;

    for (let maxTokens of tokenSteps) {
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model,
          messages,
          max_tokens: maxTokens
        })
      });

      if (response.status === 402) {
        // Coba dengan token lebih kecil
        const text = await response.text().catch(() => '');
        lastError = text;
        continue;
      }

      if (!response.ok) {
        const text = await response.text().catch(() => '');
        return res.status(502).json({
          error: `OpenRouter error: ${response.status}`,
          detail: text.slice(0, 500)
        });
      }

      const data = await response.json();
      if (data.error) {
        return res.status(502).json({ error: data.error.message || 'AI error' });
      }

      const aiReply = data.choices?.[0]?.message?.content || "Maaf, terjadi kesalahan pada AI.";
      return res.json({ response: aiReply });
    }

    // Jika semua percobaan gagal
    return res.status(402).json({
      error: "OpenRouter error: 402 (token limit)",
      detail: lastError || "Token limit terlalu kecil, silakan upgrade akun OpenRouter."
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};