const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER, // email pengirim (Gmail)
    pass: process.env.GMAIL_PASS, // app password Gmail
  },
});

exports.sendMail = async ({ to, subject, html }) => {
  await transporter.sendMail({
    from: `"Rental Mobil" <${process.env.GMAIL_USER}>`,
    to,
    subject,
    html,
  });
};