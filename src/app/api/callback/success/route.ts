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

function pick(obj: Record<string, any>, keys: string[]): string | undefined {
  for (const k of keys) {
    const v = obj[k];
    if (v !== undefined && v !== null && String(v).trim() !== '') return String(v);
  }
  return undefined;
}

function attachDetails(url: URL, source: Record<string, any>) {
  // Normalize common field names from providers
  const orderId = pick(source, ['order_no', 'orderId', 'order_id']);
  const txnId = pick(source, ['transaction_id', 'txn_id', 'txnid', 'rrn', 'bank_txn', 'bank_ref_no']);
  const amount = pick(source, ['amount', 'amt', 'txn_amount']);
  const currency = pick(source, ['currency', 'cur', 'txn_currency']);
  const dateTime = pick(source, ['date_time', 'datetime', 'txn_date', 'time']);
  const message = pick(source, ['message', 'resp_message', 'resp_desc', 'status_desc', 'error_message']);
  const code = pick(source, ['code', 'resp_code', 'status_code', 'error_code']);

  if (orderId) url.searchParams.set('orderId', orderId);
  if (txnId) url.searchParams.set('txnId', txnId);
  if (amount) url.searchParams.set('amount', amount);
  if (currency) url.searchParams.set('currency', currency);
  if (dateTime) url.searchParams.set('time', dateTime);
  if (message) url.searchParams.set('message', message);
  if (code) url.searchParams.set('code', code);
}

function buildRedirect(baseUrl: string, status: 'success' | 'error', orderId?: string, details?: Record<string, any>): URL {
  const url = new URL('/payment-result', baseUrl);
  url.searchParams.set('status', status);
  if (orderId) url.searchParams.set('orderId', orderId);
  if (details) attachDetails(url, details);
  return url;
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const responseData = Object.fromEntries(formData.entries());
    const orderId = String((responseData as any).order_no || '');
  const baseUrl = getBaseUrl(req);
  const redirectUrl = buildRedirect(baseUrl, 'success', orderId, responseData as any);
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
  const raw: Record<string, any> = {};
  req.nextUrl.searchParams.forEach((value, key) => (raw[key] = value));
  const redirectUrl = buildRedirect(baseUrl, 'success', orderId || undefined, raw);
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