import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const responseData = Object.fromEntries(formData.entries());

    console.log('Failure Callback Received:', responseData);

    // Redirect to the final display page with a status
    const url = req.nextUrl.clone();
    url.pathname = '/payment-result';
    url.searchParams.set('status', 'failed');
    url.searchParams.set('orderId', String(responseData.order_no || ''));
    return NextResponse.redirect(url);

  } catch (error) {
    console.error('Error in failure callback:', error);
    const url = req.nextUrl.clone();
    url.pathname = '/payment-result';
    url.searchParams.set('status', 'error');
    return NextResponse.redirect(url);
  }
}