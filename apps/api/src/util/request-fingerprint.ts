import { Buffer } from 'node:buffer';

import { hmacSha256 } from '@fortress/crypto';
import type { Request } from 'express';

import { clientIp } from './client-ip.js';

export function hashSessionToken(hmacKeyUtf8: string, bearerToken: string): string {
  const key = Buffer.from(hmacKeyUtf8, 'utf8');
  const digest = hmacSha256(key, Buffer.from(bearerToken, 'utf8'));
  return Buffer.from(digest).toString('hex');
}

export function hashIp(hmacKeyUtf8: string, req: Request): string {
  const key = Buffer.from(hmacKeyUtf8, 'utf8');
  const ip = clientIp(req);
  const digest = hmacSha256(key, Buffer.from(ip, 'utf8'));
  return Buffer.from(digest).toString('hex');
}

export function hashUa(hmacKeyUtf8: string, req: Request): string {
  const key = Buffer.from(hmacKeyUtf8, 'utf8');
  const ua =
    typeof req.headers['user-agent'] === 'string' ? req.headers['user-agent'] : '';
  const digest = hmacSha256(key, Buffer.from(ua, 'utf8'));
  return Buffer.from(digest).toString('hex');
}
