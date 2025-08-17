import { Buffer } from 'buffer';
import crypto from 'crypto';


const IV = Buffer.from('0123456789abcdef', 'latin1');
const ALGORITHM = 'aes-256-cbc';
const BLOCK_SIZE = 16;

function pkcs7Pad(buffer: Buffer): Buffer {
  const padSize = BLOCK_SIZE - (buffer.length % BLOCK_SIZE);
  console.log(`[encryptAES] Buffer length: ${buffer.length}, Pad size: ${padSize}`);
  const padding = Buffer.alloc(padSize, padSize);
  const paddedBuffer = Buffer.concat([buffer, padding]);
  console.log(`[encryptAES] Padded buffer length: ${paddedBuffer.length}`);
  return paddedBuffer;
}

export function encryptAES(text: string, base64Key: string) {
  console.log(`\n--- Encrypting Data ---`);
  console.log(`[encryptAES] Input text: "${text}"`);
  console.log(`[encryptAES] Using key (first 4 chars): ${base64Key.substring(0, 4)}...`);
  
  const key = Buffer.from(base64Key, 'base64');
  
  // Manually pad the input text.
  const textBuffer = Buffer.from(text, 'utf8');
  const paddedText = pkcs7Pad(textBuffer);

  const cipher = crypto.createCipheriv(ALGORITHM, key, IV);
  // Disable auto-padding to match the PHP sample's OPENSSL_ZERO_PADDING behavior.
  cipher.setAutoPadding(false);

  const encrypted = Buffer.concat([cipher.update(paddedText), cipher.final()]);
  
  const finalBase64 = encrypted.toString('base64');
  console.log(`[encryptAES] Final Base64 Output: ${finalBase64}`);
  console.log(`--- Encryption Finished ---\n`);
  
  // Return the final result as a base64 string.
  return finalBase64;
}

export function sha256Hex(text: string) {
  console.log(`[sha256Hex] Hashing input: "${text}"`);
  const hash = crypto.createHash('sha256').update(text, 'utf8').digest('hex');
  console.log(`[sha256Hex] Resulting hash: ${hash}`);
  return hash;}
