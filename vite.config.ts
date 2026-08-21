import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';
import nodemailer from 'nodemailer';

function otpApiPlugin() {
  return {
    name: 'otp-api-plugin',
    configureServer(server: any) {
      server.middlewares.use((req: any, res: any, next: any) => {
        if (req.url === '/api/send-otp' && req.method === 'POST') {
          let body = '';
          req.on('data', (chunk: any) => {
            body += chunk;
          });
          req.on('end', async () => {
            try {
              const { email, otp, name } = JSON.parse(body);

              const transporter = nodemailer.createTransport({
                host: 'smtp.gmail.com',
                port: 465,
                secure: true,
                auth: {
                  user: 'nourrdwan956@gmail.com',
                  pass: 'nefv liot lydk ewns',
                },
              });

              const emailHtml = `
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
              <div style="width: 75px; height: 75px; line-height: 75px; text-align: center; background: linear-gradient(135deg, #0284c7, #4f46e5); color: #ffffff; font-weight: 900; font-size: 24px; border-radius: 20px; margin: 0 auto;">SEA</div>
              
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
                مرحباً بك يا <span style="color: #0284c7;">${name}</span>،
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
              `;

              await transporter.sendMail({
                from: '"Smart Education Authority" <nourrdwan956@gmail.com>',
                to: email,
                subject: `رمز تأكيد حسابك - SEA [ ${otp} ]`,
                html: emailHtml,
              });

              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: true, message: 'OTP sent successfully' }));
            } catch (error: any) {
              console.error('Error in Vite OTP plugin:', error);
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: false, message: error.message }));
            }
          });
        } else {
          next();
        }
      });
    }
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), otpApiPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    build: {
      outDir: 'dist',
      emptyOutDir: true,
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
