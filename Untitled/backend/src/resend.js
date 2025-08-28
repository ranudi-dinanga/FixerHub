const { Resend } = require('resend');
require('dotenv').config();

if (!process.env.RESEND_API_KEY) {
  console.error('RESEND_API_KEY is not set in environment variables');
  throw new Error('RESEND_API_KEY is required');
}

const resend = new Resend(process.env.RESEND_API_KEY||"re_3pzrFy4S_Jd6jDstuTCSmND2NKffDn5xj");

module.exports = resend;
