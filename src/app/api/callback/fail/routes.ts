import { NextRequest, NextResponse } from 'next/server';

function getBaseUrl(req: NextRequest) {
  // Same implementation as in success route
  if (process.env.BASE_URL) return process.env.BASE_URL;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  if (process.env.NEXTAUTH_URL) return process.env.NEXTAUTH_URL;
  
  const host = req.headers.get('host');
  const protocol = host?.includes('localhost') ? 'http' : 'https';
  return `${protocol}://${host}`;
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const responseData = Object.fromEntries(formData.entries());
    const orderId = String(responseData.order_no || '');
    
    const baseUrl = getBaseUrl(req);
    const redirectUrl = `${baseUrl}/payment-result?status=failed${orderId ? `&orderId=${encodeURIComponent(orderId)}` : ''}`;

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta http-equiv="refresh" content="0; url=${redirectUrl}" />
          <script>window.location.href = "${redirectUrl}"</script>
        </head>
        <body>
          <p>Payment failed! Redirecting...</p>
          <a href="${redirectUrl}">Click here if not redirected</a>
        </body>
      </html>
    `;

    return new NextResponse(html, {
      headers: { 'Content-Type': 'text/html' },
    });
  } catch (error) {
    console.error('Error in failure callback:', error);
    const baseUrl = getBaseUrl(req);
    const errorUrl = `${baseUrl}/payment-result?status=error`;
    
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta http-equiv="refresh" content="0; url=${errorUrl}" />
        </head>
      </html>
    `;
    
    return new NextResponse(html, {
      headers: { 'Content-Type': 'text/html' },
    });
  }
}