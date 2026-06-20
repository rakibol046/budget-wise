import nodemailer from 'nodemailer';

let transporter;

/**
 * Creates a nodemailer transporter.
 * In dev (no EMAIL_USER set): auto-creates an Ethereal test account and logs the preview URL.
 * In prod: uses EMAIL_HOST / EMAIL_PORT / EMAIL_USER / EMAIL_PASS from env.
 */
const getTransporter = async () => {
  if (transporter) return transporter;

  if (!process.env.SMTP_USER) {
    // Dev mode — use Ethereal fake SMTP
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: { user: testAccount.user, pass: testAccount.pass },
    });
    console.log(`📧 Ethereal test account created: ${testAccount.user}`);
  } else {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_PORT === '465',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  return transporter;
};

export const sendOtpEmail = async (to, otp) => {
  const transport = await getTransporter();

  const html = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="UTF-8"></head>
    <body style="margin:0;padding:0;background:#0f1117;font-family:'Inter',system-ui,sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#0f1117;padding:40px 0;">
        <tr><td align="center">
          <table width="480" cellpadding="0" cellspacing="0" style="background:#1a1d26;border:1px solid #262a38;border-radius:16px;overflow:hidden;">
            <!-- Header -->
            <tr>
              <td style="padding:32px 40px 24px;border-bottom:1px solid #262a38;">
                <span style="font-size:28px;">💰</span>
                <span style="font-family:'IBM Plex Mono',monospace;font-size:20px;font-weight:700;color:#4fd1c5;margin-left:10px;vertical-align:middle;">BudgetWise</span>
              </td>
            </tr>
            <!-- Body -->
            <tr>
              <td style="padding:32px 40px;">
                <p style="margin:0 0 8px;font-size:22px;font-weight:700;color:#e2e8f0;">Verify your email</p>
                <p style="margin:0 0 28px;font-size:15px;color:#94a3b8;line-height:1.6;">Use the code below to complete your registration. It expires in <strong style="color:#e2e8f0;">10 minutes</strong>.</p>
                <!-- OTP Box -->
                <div style="background:#0f1117;border:1px solid #262a38;border-radius:12px;padding:24px;text-align:center;margin-bottom:28px;">
                  <span style="font-family:'IBM Plex Mono',monospace;font-size:42px;font-weight:700;color:#4fd1c5;letter-spacing:12px;">${otp}</span>
                </div>
                <p style="margin:0;font-size:13px;color:#64748b;line-height:1.6;">If you did not create a BudgetWise account, you can safely ignore this email.</p>
              </td>
            </tr>
            <!-- Footer -->
            <tr>
              <td style="padding:20px 40px;border-top:1px solid #262a38;">
                <p style="margin:0;font-size:12px;color:#475569;">© 2026 BudgetWise. All rights reserved.</p>
              </td>
            </tr>
          </table>
        </td></tr>
      </table>
    </body>
    </html>
  `;

  const info = await transport.sendMail({
    from: process.env.SMTP_FROM || '"BudgetWise" <noreply@budgetwise.app>',
    to,
    subject: `${otp} — Your BudgetWise verification code`,
    html,
  });

  // In dev, log the Ethereal preview URL so devs can see the email
  if (!process.env.SMTP_USER) {
    console.log(`📧 Email preview: ${nodemailer.getTestMessageUrl(info)}`);
  }

  return info;
};
