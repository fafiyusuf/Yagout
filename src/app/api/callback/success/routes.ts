import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const responseData = Object.fromEntries(formData.entries());

    // IMPORTANT: In a real application, you would re-calculate the hash
    // from responseData and compare it with the hash sent by YagoutPay
    // to verify the request is authentic.

    console.log('Success Callback Received:', responseData);

    // Securely redirect to the final display page with a status
    const url = req.nextUrl.clone();
    url.pathname = '/payment-result';
    url.searchParams.set('status', 'success');
    url.searchParams.set('orderId', String(responseData.order_no || ''));
    return NextResponse.redirect(url);

  } catch (error) {
    console.error('Error in success callback:', error);
    const url = req.nextUrl.clone();
    url.pathname = '/payment-result';
    url.searchParams.set('status', 'error');
    return NextResponse.redirect(url);
  }
}