const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: process.env.EMAIL_PORT || 587,
  secure: true,
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
});

const sendReceiptEmail = async ({ to, name, bill, paymentId, societyName }) => {
  const html = `
  <!DOCTYPE html>
  <html>
  <head><meta charset="utf-8"><style>
    body { font-family: Arial, sans-serif; background: #f4f4f8; margin: 0; padding: 20px; }
    .card { max-width: 520px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #6366f1, #8b5cf6); padding: 32px; text-align: center; }
    .header h1 { color: white; margin: 0; font-size: 24px; }
    .header p { color: rgba(255,255,255,0.8); margin: 6px 0 0; font-size: 14px; }
    .badge { display: inline-block; background: rgba(255,255,255,0.2); color: white; padding: 6px 16px; border-radius: 20px; font-size: 13px; margin-top: 12px; }
    .amount { text-align: center; padding: 28px; border-bottom: 1px dashed #e2e8f0; }
    .amount .num { font-size: 48px; font-weight: 800; color: #6366f1; }
    .amount .label { color: #94a3b8; font-size: 14px; margin-top: 4px; }
    .details { padding: 20px 28px; }
    .row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #f1f5f9; font-size: 14px; }
    .row .key { color: #94a3b8; }
    .row .val { color: #1e293b; font-weight: 500; }
    .footer { background: #f8fafc; padding: 20px 28px; text-align: center; }
    .footer p { color: #94a3b8; font-size: 12px; margin: 0; }
    .success { color: #10b981; font-weight: 700; }
  </style></head>
  <body>
    <div class="card">
      <div class="header">
        <div class="img"><img src="https://res.cloudinary.com/df1pwtvft/image/upload/v1775314353/societynestlogo_xxp7sa.png"
         alt="SocietyNest Logo" style="width: 100px; height: auto;" /></div>
        <h1>${societyName}</h1>
        <p>Official Payment Receipt</p>
        <div class="badge">✅ Payment Confirmed</div>
      </div>
      <div class="amount">
        <div class="num">₹${bill.totalAmount.toLocaleString('en-IN')}</div>
        <div class="label">${bill.title} — ${bill.billMonth} ${bill.billYear}</div>
      </div>
      <div class="details">
        <div class="row"><span class="key">Resident</span><span class="val">${name}</span></div>
        <div class="row"><span class="key">Flat</span><span class="val">${bill.flatNumber || '—'}</span></div>
        <div class="row"><span class="key">Wing</span><span class="val">${bill.wing || '—'}</span></div>
        <div class="row"><span class="key">Receipt No.</span><span class="val">#${paymentId.slice(-10).toUpperCase()}</span></div>
        <div class="row"><span class="key">Payment ID</span><span class="val">${paymentId}</span></div>
        <div class="row"><span class="key">Date & Time</span><span class="val">${new Date(bill.paidAt).toLocaleString('en-IN')}</span></div>
        <div class="row"><span class="key">Status</span><span class="val success">✅ PAID</span></div>
      </div>
      <div class="footer">
        <p>This is a computer-generated receipt. No signature required.</p>
        <p style="margin-top:6px;">Powered by <strong>SocietyNest</strong></p>
      </div>
    </div>
  </body>
  </html>`;

  await transporter.sendMail({
    from: process.env.EMAIL_FROM || '"SocietyNest" <noreply@societynest.in>',
    to,
    subject: `Payment Receipt — ${bill.title} (${bill.billMonth} ${bill.billYear})`,
    html,
  });
};

const sendOtpEmail = async ({ to, otp }) => {
  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject: 'SocietyNest — Email Verification OTP',
    html: `<div style="font-family:Arial;padding:32px;text-align:center"><h2>Your OTP</h2><div style="font-size:48px;font-weight:800;color:#6366f1;letter-spacing:8px;">${otp}</div><p style="color:#94a3b8;margin-top:16px;">Valid for 10 minutes. Do not share with anyone.</p></div>`,
  });
};

module.exports = { sendReceiptEmail, sendOtpEmail, transporter };
