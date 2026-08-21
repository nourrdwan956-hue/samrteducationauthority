import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import nodemailer from 'nodemailer';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Nodemailer transporter setup
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: process.env.SMTP_USER || 'nourrdwan956@gmail.com',
      pass: process.env.SMTP_PASS || 'nefv liot lydk ewns', // User provided new app password
    },
  });

  // API Route to send OTP
  app.post('/api/send-otp', async (req, res) => {
    const { email, otp, name } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ success: false, message: 'البريد الإلكتروني والرمز مطلوبان.' });
    }

    try {
      const logoEmailPath = path.join(process.cwd(), 'public', 'logo-email.png');
      const logoMainPath = path.join(process.cwd(), 'public', 'logo.png');
      const activeLogoPath = fs.existsSync(logoEmailPath) ? logoEmailPath : (fs.existsSync(logoMainPath) ? logoMainPath : null);

      const attachments = activeLogoPath
        ? [
            {
              filename: 'sea-logo.png',
              path: activeLogoPath,
              cid: 'sea_logo_img@sea-platform',
              contentType: 'image/png',
              contentDisposition: 'inline' as const,
            },
          ]
        : [];

      const displayName = name && name.trim() ? name.trim() : 'طالبنا العزيز';

      const plainTextContent = `مرحباً بك ${displayName} في منظومة Smart Education Authority (SEA)\n\nرمز التحقق وتأكيد حسابك هو:\n${otp}\n\nصلاحية هذا الرمز هي 10 دقائق فقط.\nيرجى عدم مشاركة هذا الرمز مع أي شخص للحفاظ على أمان حسابك.\n\nطاقم تدريس عالي بالتعاون مع Smart Education Authority (SEA)`;

      const senderEmail = process.env.SMTP_USER || 'nourrdwan956@gmail.com';
      const mailOptions = {
        from: `"Smart Education Authority" <${senderEmail}>`,
        replyTo: senderEmail,
        to: email,
        subject: `رمز تأكيد حسابك - Smart Education Authority (SEA)`,
        text: plainTextContent,
        attachments: attachments,
        headers: {
          'X-Priority': '1',
          'X-MSMail-Priority': 'High',
          'Importance': 'High',
          'X-Mailer': 'Smart Education Authority System Mailer',
        },
        html: `
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="ar" dir="rtl">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>رمز تأكيد الحساب - SEA</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: 'Segoe UI', Tahoma, Arial, sans-serif; direction: rtl; text-align: right;">
  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f1f5f9; padding: 30px 15px;">
    <tr>
      <td align="center">
        <!-- Main Email Container -->
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 580px; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 24px; overflow: hidden; box-shadow: 0 10px 25px rgba(0, 0, 0, 0.06);">
          
          <!-- Top Accent Banner -->
          <tr>
            <td style="height: 6px; background: linear-gradient(90deg, #0284c7, #06b6d4, #4f46e5); font-size: 0; line-height: 0;">&nbsp;</td>
          </tr>

          <!-- Header Section with Logo -->
          <tr>
            <td align="center" style="padding: 35px 30px 20px 30px; background-color: #ffffff; text-align: center;">
              ${
                activeLogoPath
                  ? `<div style="display: inline-block; padding: 6px; background-color: #f8fafc; border: 2px solid #0284c7; border-radius: 20px; box-shadow: 0 4px 12px rgba(2, 132, 199, 0.15);">
                      <img src="cid:sea_logo_img@sea-platform" alt="SEA" width="80" height="80" style="display: block; width: 80px; height: 80px; border-radius: 14px; border: 0; outline: none;" />
                    </div>`
                  : `<div style="width: 75px; height: 75px; line-height: 75px; text-align: center; background: linear-gradient(135deg, #0284c7, #4f46e5); color: #ffffff; font-weight: 900; font-size: 24px; border-radius: 20px; margin: 0 auto;">SEA</div>`
              }
              
              <div style="margin-top: 16px;">
                <span style="display: inline-block; background-color: #e0f2fe; color: #0369a1; border: 1px solid #bae6fd; font-size: 11px; font-weight: 800; padding: 4px 14px; border-radius: 20px;">
                  منظومة القبول والتسجيل المركزي المعتمد
                </span>
              </div>
              
              <h1 style="color: #0f172a; font-size: 22px; font-weight: 900; margin: 12px 0 4px 0;">
                طاقم تدريس عالي
              </h1>
              <p style="color: #64748b; font-size: 13px; margin: 0; font-weight: 700;">
                Smart Education Authority (SEA)
              </p>
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding: 0 35px;">
              <div style="height: 1px; background-color: #f1f5f9;"></div>
            </td>
          </tr>

          <!-- Content Section -->
          <tr>
            <td style="padding: 30px 35px 20px 35px; text-align: right;">
              <p style="color: #1e293b; font-size: 16px; line-height: 1.8; margin: 0 0 12px 0; font-weight: 700;">
                مرحباً بك يا <span style="color: #0284c7;">${displayName}</span>،
              </p>
              <p style="color: #475569; font-size: 14px; line-height: 1.7; margin: 0 0 22px 0;">
                لتأكيد إنشاء حسابك والتحقق من بريدك الإلكتروني داخل المنظومة التعليمية، يرجى استخدام رمز التأكيد التالي:
              </p>

              <!-- OTP Luxury Box -->
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 20px 0;">
                <tr>
                  <td align="center">
                    <div style="background-color: #0f172a; border: 2px solid #0284c7; border-radius: 18px; padding: 18px 28px; display: inline-block; box-shadow: 0 8px 20px rgba(15, 23, 42, 0.15); text-align: center; min-width: 220px;">
                      <div style="color: #94a3b8; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 6px;">
                        رمز التأكيد الخاص بك
                      </div>
                      <div style="color: #fbbf24; font-size: 36px; font-weight: 900; letter-spacing: 10px; font-family: 'Courier New', Courier, monospace; padding-right: 10px;">
                        ${otp}
                      </div>
                    </div>
                  </td>
                </tr>
              </table>

              <!-- Notice Box -->
              <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 14px; padding: 14px 18px; margin-top: 20px;">
                <p style="color: #334155; font-size: 12px; line-height: 1.7; margin: 0;">
                  ⏳ <strong>مدة الصلاحية:</strong> هذا الرمز صالح لمدة <strong>10 دقائق</strong> فقط.<br />
                  🔒 <strong>تنبيه أمني:</strong> لا تشارك هذا الرمز مع أي شخص لحماية حسابك وبياناتك.
                </p>
              </div>
            </td>
          </tr>

          <!-- Footer Section -->
          <tr>
            <td style="background-color: #f8fafc; padding: 22px 30px; border-top: 1px solid #e2e8f0; text-align: center;">
              <p style="color: #64748b; font-size: 12px; margin: 0 0 4px 0; font-weight: 600;">
                هذه رسالة آلية لتأكيد التسجيل في منظومة SEA التعليمية
              </p>
              <p style="color: #94a3b8; font-size: 11px; margin: 0;">
                جميع الحقوق محفوظة © Smart Education Authority 2025-2026
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
        `,
      };

      await transporter.sendMail(mailOptions);
      res.json({ success: true, message: 'تم إرسال الرمز بنجاح.' });
    } catch (error: any) {
      console.error('Error sending email:', error);
      res.status(500).json({ 
        success: false, 
        message: `فشل إرسال البريد الإلكتروني. يرجى التأكد من صحة البريد المدخل. التفاصيل: ${error.message || error}` 
      });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
