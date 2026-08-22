export default {
  async fetch(request: Request, env: any, ctx: any) {
    const url = new URL(request.url);
    
    // API Route Interceptor
    if (url.pathname === '/api/send-otp' && request.method === 'POST') {
      return new Response(JSON.stringify({ 
        success: false, 
        message: 'بيئة Cloudflare لا تدعم إرسال البريد عبر Gmail SMTP (Nodemailer). يرجى نشر التطبيق على بيئة تدعم Node.js مثل Google Cloud Run أو Render، أو استخدام خدمة بريد مثل Resend API.' 
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Serve Static Assets from Cloudflare
    return env.ASSETS.fetch(request);
  }
};
