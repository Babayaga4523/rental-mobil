const axios = require("axios");

async function sendWhatsappFonnte(to, message) {
  try {
    const res = await axios({
      method: "POST",
      url: "https://api.fonnte.com/send",
      headers: {
        Authorization: process.env.FONNTE_API_KEY,
      },
      data: {
        target: to, // format: 628xxxxxx
        message: message,
      },
    });
    return res.data;
  } catch (err) {
    console.error("Fonnte WA error:", err.response?.data || err.message);
    return null;
  }
}

module.exports = { sendWhatsappFonnte };