export default {
  async fetch(request: Request, env: any, ctx: any) {
    const url = new URL(request.url);
    
    // API Route Interceptor
    if (url.pathname === '/api/send-otp' && request.method === 'POST') {
      try {
        const body = await request.json() as any;
        const { email, otp, name } = body;
        
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
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 580px; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 24px; overflow: hidden; box-shadow: 0 10px 25px rgba(0, 0, 0, 0.06);">
          <tr>
            <td style="height: 6px; background: linear-gradient(90deg, #0284c7, #06b6d4, #4f46e5); font-size: 0; line-height: 0;">&nbsp;</td>
          </tr>
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
            </td>
          </tr>
          <tr>
            <td style="padding: 30px 35px 20px 35px; text-align: right;">
              <p style="color: #1e293b; font-size: 16px; line-height: 1.8; margin: 0 0 12px 0; font-weight: 700;">
                مرحباً بك يا <span style="color: #0284c7;">${name}</span>،
              </p>
              <p style="color: #475569; font-size: 14px; line-height: 1.7; margin: 0 0 22px 0;">
                لتأكيد إنشاء حسابك والتحقق من بريدك الإلكتروني داخل المنظومة التعليمية، يرجى استخدام رمز التأكيد التالي:
              </p>
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 20px 0;">
                <tr>
                  <td align="center">
                    <div style="background-color: #0f172a; border: 2px solid #0284c7; border-radius: 18px; padding: 18px 28px; display: inline-block; text-align: center; min-width: 220px;">
                      <div style="color: #94a3b8; font-size: 11px; font-weight: 700; text-transform: uppercase; margin-bottom: 6px;">
                        رمز التأكيد الخاص بك
                      </div>
                      <div style="color: #fbbf24; font-size: 36px; font-weight: 900; letter-spacing: 10px; font-family: monospace;">
                        ${otp}
                      </div>
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
        `;

        // We route the request directly to our running Node.js backend on AI Studio,
        // which natively runs `nodemailer` with a true SMTP connection.
        // This completely bypasses SmtpJS (which is currently down globally) and guarantees delivery!
        const smtpResponse = await fetch('https://ais-pre-3y4yfcigeld4hyp5r6n3hz-394428558579.europe-west2.run.app/api/send-otp', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ email, otp, name })
        });

        const data = await smtpResponse.json() as any;
        if (!data || !data.success) {
          return new Response(JSON.stringify({ success: false, message: 'Backend Delivery Error: ' + (data?.message || 'Unknown') }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
          });
        }

        return new Response(JSON.stringify({ success: true, message: 'OTP sent successfully' }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
        
      } catch (err: any) {
        return new Response(JSON.stringify({ success: false, message: err.message }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }
    
    // Serve Static Assets from Cloudflare
    return env.ASSETS.fetch(request);
  }
};
