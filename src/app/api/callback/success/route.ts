import { NextRequest, NextResponse } from 'next/server';

function normalizeAbsoluteUrl(url?: string): string | undefined {
  if (!url) return undefined;
  const trimmed = url.trim();
  if (!trimmed) return undefined;
  try {
    const u = new URL(trimmed);
    return u.origin;
  } catch {
    return undefined;
  }
}

function getBaseUrl(req: NextRequest): string {
  const envBase = normalizeAbsoluteUrl(process.env.BASE_URL);
  if (envBase) return envBase;
  try {
    return req.nextUrl.origin;
  } catch {
    const host = req.headers.get('host');
    if (host) {
      const protocol = host.startsWith('localhost') || host.startsWith('127.0.0.1') ? 'http' : 'https';
      return `${protocol}://${host}`;
    }
    console.warn('No origin or host detected. Falling back to http://localhost:3000. Consider setting BASE_URL.');
    return 'http://localhost:3000';
  }
}

function buildRedirect(baseUrl: string, status: 'success' | 'error', orderId?: string): URL {
  const url = new URL('/payment-result', baseUrl);
  url.searchParams.set('status', status);
  if (orderId) url.searchParams.set('orderId', orderId);
  return url;
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const responseData = Object.fromEntries(formData.entries());
    const orderId = String(responseData.order_no || '');
  const baseUrl = getBaseUrl(req);
  const redirectUrl = buildRedirect(baseUrl, 'success', orderId);
  console.debug('[callback/success] Redirecting (POST) to:', redirectUrl.toString());
  return NextResponse.redirect(redirectUrl.toString(), { status: 303 });
  } catch (error) {
  console.error('Error in success callback (POST):', error);
  const baseUrl = getBaseUrl(req);
  const errorUrl = buildRedirect(baseUrl, 'error');
  console.debug('[callback/success] Redirecting (POST error) to:', errorUrl.toString());
  return NextResponse.redirect(errorUrl.toString(), { status: 303 });
  }
}

export async function GET(req: NextRequest) {
  try {
  const orderId = req.nextUrl.searchParams.get('order_no') || req.nextUrl.searchParams.get('orderId') || '';
  const baseUrl = getBaseUrl(req);
  const redirectUrl = buildRedirect(baseUrl, 'success', orderId || undefined);
  console.debug('[callback/success] Redirecting (GET) to:', redirectUrl.toString());
  return NextResponse.redirect(redirectUrl.toString(), { status: 303 });
  } catch (error) {
  console.error('Error in success callback (GET):', error);
  const baseUrl = getBaseUrl(req);
  const errorUrl = buildRedirect(baseUrl, 'error');
  console.debug('[callback/success] Redirecting (GET error) to:', errorUrl.toString());
  return NextResponse.redirect(errorUrl.toString(), { status: 303 });
  }
}