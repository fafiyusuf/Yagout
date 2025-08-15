import { Buffer } from 'buffer';
import crypto from 'crypto';

const IV = Buffer.from('0123456789abcdef');

function pad(text: string) {
  const size = 16;
  const pad = size - (text.length % size);
  return text + String.fromCharCode(pad).repeat(pad);
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
