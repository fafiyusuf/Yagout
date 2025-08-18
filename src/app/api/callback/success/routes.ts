import { NextRequest, NextResponse } from 'next/server';

function getBaseUrl(req: NextRequest) {
  // Use environment variable if set
  if (process.env.BASE_URL) return process.env.BASE_URL;
  
  // Fallback to Vercel URL if available
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  
  // Fallback to NEXTAUTH_URL if available
  if (process.env.NEXTAUTH_URL) return process.env.NEXTAUTH_URL;
  
  // Final fallback using request headers
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
    const redirectUrl = `${baseUrl}/payment-result?status=success${orderId ? `&orderId=${encodeURIComponent(orderId)}` : ''}`;

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta http-equiv="refresh" content="0; url=${redirectUrl}" />
          <script>window.location.href = "${redirectUrl}"</script>
        </head>
        <body>
          <p>Payment successful! Redirecting...</p>
          <a href="${redirectUrl}">Click here if not redirected</a>
        </body>
      </html>
    `;

    return new NextResponse(html, {
      headers: { 'Content-Type': 'text/html' },
    });
  } catch (error) {
    console.error('Error in success callback:', error);
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