const nodemailer = require('nodemailer');
const env = require('../configs/env');

const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: env.SMTP_PORT,
  secure: env.SMTP_PORT === 465, // true for 465, false for 587 (STARTTLS)
  auth: {
    user: env.SMTP_USER,
    pass: env.SMTP_PASS,
  },
});

/**
 * Send an email.
 * @param {{ to: string, subject: string, html: string }} options
 */
const sendMail = ({ to, subject, html }) =>
  transporter.sendMail({ from: env.SMTP_FROM, to, subject, html });

module.exports = { sendMail };
