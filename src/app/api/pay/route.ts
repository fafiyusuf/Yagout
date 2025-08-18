import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";

const MERCHANT_ID = process.env.MERCHANT_ID ?? "";
const MERCHANT_KEY = process.env.MERCHANT_KEY ?? "";
const SUCCESS_URL = process.env.SUCCESS_URL ?? "";
const FAIL_URL = process.env.FAIL_URL ?? "";
const AGGREGATOR_ID = "yagout";
const IV = "0123456789abcdef";

// AES-256-CBC Encryption with PKCS7 padding
function encryptAES(text: string, key: string) {
  const keyBuffer = Buffer.from(key, "base64");
  const ivBuffer = Buffer.from(IV, "utf8");

  const blockSize = 16;
  const padLength = blockSize - (text.length % blockSize);
  const paddedText = text + String.fromCharCode(padLength).repeat(padLength);

  const cipher = crypto.createCipheriv("aes-256-cbc", keyBuffer, ivBuffer);
  cipher.setAutoPadding(false);

  let encrypted = cipher.update(paddedText, "utf8");
  encrypted = Buffer.concat([encrypted, cipher.final()]);

  return encrypted.toString("base64");
}

// Hash generation
function generateHash(
  merchantId: string,
  orderNo: string,
  amount: string,
  currencyFrom: string,
  currencyTo: string,
  key: string
) {
  const hashInput = `${merchantId}~${orderNo}~${amount}~${currencyFrom}~${currencyTo}`;
  const sha256Hash = crypto
    .createHash("sha256")
    .update(hashInput, "utf8")
    .digest("hex");
  return encryptAES(sha256Hash, key);
}

export async function POST(req: NextRequest) {
  let body: any;
  try {
    body = await req.json();
  } catch (err) {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { amount, cust_name, email_id, mobile_no } = body ?? {};
  if (!amount || !cust_name || !email_id || !mobile_no) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }

  const order_no = "TEST" + Math.floor(Math.random() * 100000);
  const amountStr = Number(amount).toFixed(2);

  // Transaction details
  const txnDetails = [
    AGGREGATOR_ID,
    MERCHANT_ID,
    order_no,
    amountStr,
    "ETH",
    "ETB",
    "SALE",
    SUCCESS_URL,
    FAIL_URL,
    "WEB",
  ].join("|");

  const pgDetails = "|||";
  const cardDetails = "||||";
  const custDetails = [
    "", // card_name
    cust_name,
    mobile_no,
    email_id,
    "Y",
  ].join("|");
  const billDetails = "||||";
  const shipDetails = "||||||";
  const itemDetails = "||";
  const upiDetails = "";
  const otherDetails = "||||";

  const allValues = [
    txnDetails,
    pgDetails,
    cardDetails,
    custDetails,
    billDetails,
    shipDetails,
    itemDetails,
    upiDetails,
    otherDetails,
  ].join("~");

  const encryptedRequest = encryptAES(allValues, MERCHANT_KEY);
  const hash = generateHash(
    MERCHANT_ID,
    order_no,
    amountStr,
    "ETH",
    "ETB",
    MERCHANT_KEY
  );

  const responsePayload = {
    url: "https://uatcheckout.yagoutpay.com/ms-transaction-core-1-0/paymentRedirection/checksumGatewayPage",
    me_id: MERCHANT_ID,
    merchant_request: encryptedRequest,
    hash: hash,
  };

  return NextResponse.json(responsePayload);
}