import { encryptAES, sha256Hex } from '@/utils/encryption';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  // Validate and parse JSON
  let body: any;
  try {
    body = await req.json();
  } catch (err) {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { amount, cust_name, email_id, mobile_no } = body ?? {};
  if (!amount || !cust_name || !email_id || !mobile_no) {
    return NextResponse.json({ error: 'Missing required fields: amount, cust_name, email_id, mobile_no' }, { status: 400 });
  }

  // Validate environment variables
  const MERCHANT_ID = process.env.MERCHANT_ID;
  const MERCHANT_KEY = process.env.MERCHANT_KEY;
  const SUCCESS_URL = process.env.SUCCESS_URL;
  const FAIL_URL = process.env.FAIL_URL;
  if (!MERCHANT_ID || !MERCHANT_KEY || !SUCCESS_URL || !FAIL_URL) {
    return NextResponse.json({ error: 'Server misconfiguration: missing merchant credentials or URLs' }, { status: 500 });
  }

  const AGGREGATOR_ID = 'yagout';
  const order_no = 'ORDER_' + Date.now();

  // Normalize amount to string with two decimals (gateway may expect fixed format)
  const amountStr = typeof amount === 'number' ? amount.toFixed(2) : String(amount);

  // Step 1: Create hash
  const hash_input = `${MERCHANT_ID}~${order_no}~${amountStr}~ETH~ETB`;
  const hashed = sha256Hex(hash_input);
  const encrypted_hash_raw = encryptAES(hashed, MERCHANT_KEY);
  const encrypted_hash = String(encrypted_hash_raw);

  // Step 2: Build transaction sections (ALL CORRECTED)
  const txn_details = `${AGGREGATOR_ID}|${MERCHANT_ID}|${order_no}|${amountStr}|ETH|ETB|SALE|${SUCCESS_URL}|${FAIL_URL}|WEB`;
  const pg_details = '|||';
  const card_details = '||||';
  const cust_details = `${cust_name}|${email_id}|${mobile_no}||Y`;
  const bill_details = '||||';
  const ship_details = '||||||';
  const item_details = '||';
  const upi_details = '||||'; // Removed the leading space

  const all_values = [
    txn_details,
    pg_details,
    card_details,
    cust_details,
    bill_details,
    ship_details,
    item_details,
    upi_details,
  ].join('~');

  const encrypted_request_raw = encryptAES(all_values, MERCHANT_KEY);
  const encrypted_request = String(encrypted_request_raw);

  return NextResponse.json({
    url: 'https://uatcheckout.yagoutpay.com/ms-transaction-core-1-0/paymentRedirection/checksumGatewayPage',
    me_id: MERCHANT_ID,
    merchant_request: encrypted_request,
    hash: encrypted_hash,
  });
}