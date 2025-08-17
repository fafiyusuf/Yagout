import { encryptAES, sha256Hex } from '@/utils/encryption';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  console.log('\n--- New Payment Request Received (Final Attempt) ---');
  let body: any;
  try {
    body = await req.json();
  } catch (err) {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { amount, cust_name, email_id, mobile_no } = body ?? {};
  if (!amount || !cust_name || !email_id || !mobile_no) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const MERCHANT_ID = process.env.MERCHANT_ID;
  const MERCHANT_KEY = process.env.MERCHANT_KEY;
  const SUCCESS_URL = process.env.SUCCESS_URL;
  const FAIL_URL = process.env.FAIL_URL;
  
  if (!MERCHANT_ID || !MERCHANT_KEY || !SUCCESS_URL || !FAIL_URL) {
    return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 });
  }

  const AGGREGATOR_ID = 'yagout';
  const order_no = 'TEST' + Math.floor(Math.random() * 100000);
  const amountStr = Number(amount).toFixed(2);

  // --- HASH GENERATION (As per the new PDF) ---
  console.log('\n--- Preparing HASH (New PDF Method) ---');
  // 1. Gather ONLY the 5 required parameters for the hash.
  const hashParams: { [key: string]: string } = {
    amount: amountStr,
    currency: 'ETB',
    customer_email: email_id,
    merchant_id: MERCHANT_ID,
    order_id: order_no,
  };
  // 2. Sort alphabetically by key.
  const sortedHashKeys = Object.keys(hashParams).sort();
  // 3. Format into a query string.
  const hashQueryString = sortedHashKeys
    .map(key => `${key}=${hashParams[key]}`)
    .join('&');
  // 4. Append the Secret Key.
  const stringToHash = hashQueryString + MERCHANT_KEY;
  console.log(`[Hash] String to hash: "${hashQueryString}...[SECRET_KEY_APPENDED]"`);
  // 5 & 6. Calculate SHA256 hash.
  const finalHash = sha256Hex(stringToHash);
  console.log(`[Hash] Final Hash: ${finalHash}`);


  // --- MERCHANT_REQUEST GENERATION (As per original docs) ---
  console.log('\n--- Preparing Encrypted Request Body (Old Method) ---');
  const txn_details = `${AGGREGATOR_ID}|${MERCHANT_ID}|${order_no}|${amountStr}|ETH|ETB|SALE|${SUCCESS_URL}|${FAIL_URL}|WEB`;
  const pg_details = '|||';
  const card_details = '||||';
  const cust_details = `${cust_name}|${email_id}|${mobile_no}||Y`;
  const bill_details = '||||';
  const ship_details = '||||||';
  const item_details = '||';
  const upi_details = '||||';

  const all_values = [
    txn_details, pg_details, card_details, cust_details,
    bill_details, ship_details, item_details, upi_details,
  ].join('~');

  const encrypted_request = encryptAES(all_values, MERCHANT_KEY);

  // --- FINAL PAYLOAD ---
  const responsePayload = {
    url: 'https://uatcheckout.yagoutpay.com/ms-transaction-core-1-0/paymentRedirection/checksumGatewayPage',
    me_id: MERCHANT_ID,
    merchant_request: encrypted_request,
    hash: finalHash,
  };

  console.log('\n--- Final Payload Sent to Gateway ---', {
      ...responsePayload,
      merchant_request: '...ENCRYPTED...',
  });
  return NextResponse.json(responsePayload);
}