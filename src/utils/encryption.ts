import { Buffer } from 'buffer';
import crypto from 'crypto';

const IV = Buffer.from('0123456789abcdef');

function pad(text: string) {
  const size = 16;
  const padLength = size - (text.length % size);
  // If the text is already a multiple of the block size, zero padding doesn't add a full block of padding.
  if (padLength === 0) {
    return text;
  }
  // Pad with null characters (\x00)
  return text + '\x00'.repeat(padLength);
}

export function encryptAES(text: string, base64Key: string) {
  const key = Buffer.from(base64Key, 'base64');
  const cipher = crypto.createCipheriv('aes-256-cbc', key, IV);
  cipher.setAutoPadding(false);
  let encrypted = cipher.update(pad(text), 'utf8', 'base64');
  encrypted += cipher.final('base64');
  return encrypted;
}

export function sha256Hex(text: string) {
  return crypto.createHash('sha256').update(text, 'utf8').digest('hex');
}