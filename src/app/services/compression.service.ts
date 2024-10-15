import { Injectable } from '@angular/core';

import { memoize } from '~/helpers';
import { ZBASE64ABC, ZMAP, ZMAX } from '~/models/constants';

@Injectable({
  providedIn: 'root',
})
export class CompressionService {
  private base64codes = new Uint8Array(256).fill(255);

  constructor() {
    for (let i = 0; i < ZBASE64ABC.length; i++)
      this.base64codes[ZBASE64ABC.charCodeAt(i)] = i;

    this.base64codes['_'.charCodeAt(0)] = 0;
  }

  nToId = memoize((n: number): string => {
    if (n / ZMAX >= 1)
      return this.nToId(Math.floor(n / ZMAX)) + this.nToId(n % ZMAX);

    return ZBASE64ABC[n];
  });

  idToN = memoize((id: string): number => {
    const n = ZMAP[id[0]];
    if (id.length > 1) {
      id = id.substring(1);
      return n * Math.pow(ZMAX, id.length) + this.idToN(id);
    }

    return n;
  });

  async deflate(str: string): Promise<string> {
    const bytes = await this.compress(str, 'deflate');
    return this.bytesToBase64(bytes);
  }

  async inflate(str: string): Promise<string> {
    try {
      return await this.inflateStr(str);
    } catch {
      console.warn(
        'Router failed to parse url, checking for missing trailing characters...',
      );
    }

    try {
      return await this.inflateMend(str, '-');
    } catch {
      // ignore error
    }

    try {
      return await this.inflateMend(str, '.');
    } catch {
      // ignore error
    }

    return await this.inflateMend(str, '_');
  }

  private async inflateMend(str: string, char: string): Promise<string> {
    const z = await this.inflateStr(str + char);
    if (!z) throw new Error('Failed to parse, generated empty string');
    console.warn(`Router mended url by appending '${char}'`);
    return z;
  }

  private inflateStr(str: string): Promise<string> {
    return this.decompress(this.base64ToBytes(str));
  }

  private bytesToBase64(bytes: Uint8Array): string {
    let result = '';
    let i: number;
    const l = bytes.length;
    for (i = 2; i < l; i += 3) {
      result += ZBASE64ABC[bytes[i - 2] >> 2];
      result += ZBASE64ABC[((bytes[i - 2] & 0x03) << 4) | (bytes[i - 1] >> 4)];
      result += ZBASE64ABC[((bytes[i - 1] & 0x0f) << 2) | (bytes[i] >> 6)];
      result += ZBASE64ABC[bytes[i] & 0x3f];
    }

    if (i === l + 1) {
      // 1 octet yet to write
      result += ZBASE64ABC[bytes[i - 2] >> 2];
      result += ZBASE64ABC[(bytes[i - 2] & 0x03) << 4];
      result += '__';
    }

    if (i === l) {
      // 2 octets yet to write
      result += ZBASE64ABC[bytes[i - 2] >> 2];
      result += ZBASE64ABC[((bytes[i - 2] & 0x03) << 4) | (bytes[i - 1] >> 4)];
      result += ZBASE64ABC[(bytes[i - 1] & 0x0f) << 2];
      result += '_';
    }
    return result;
  }

  private getBase64Code(charCode: number): number {
    if (charCode >= this.base64codes.length) {
      throw new Error('Unable to parse base64 string.');
    }

    const code = this.base64codes[charCode];
    if (code === 255) {
      throw new Error('Unable to parse base64 string.');
    }

    return code;
  }

  private base64ToBytes(str: string): Uint8Array {
    if (str.length % 4 !== 0) {
      throw new Error('Unable to parse base64 string.');
    }

    const index = str.indexOf('_');
    if (index !== -1 && index < str.length - 2) {
      throw new Error('Unable to parse base64 string.');
    }

    const missingOctets = str.endsWith('__') ? 2 : str.endsWith('_') ? 1 : 0;
    const n = str.length;
    const result = new Uint8Array(3 * (n / 4));
    let buffer: number;
    for (let i = 0, j = 0; i < n; i += 4, j += 3) {
      buffer =
        (this.getBase64Code(str.charCodeAt(i)) << 18) |
        (this.getBase64Code(str.charCodeAt(i + 1)) << 12) |
        (this.getBase64Code(str.charCodeAt(i + 2)) << 6) |
        this.getBase64Code(str.charCodeAt(i + 3));
      result[j] = buffer >> 16;
      result[j + 1] = (buffer >> 8) & 0xff;
      result[j + 2] = buffer & 0xff;
    }

    return result.subarray(0, result.length - missingOctets);
  }

  private async compress(
    str: string,
    encoding = 'deflate' as CompressionFormat,
  ): Promise<Uint8Array> {
    const byteArray = new TextEncoder().encode(str);
    const cs = new CompressionStream(encoding);
    const writer = cs.writable.getWriter();
    void writer.write(byteArray);
    void writer.close();
    const arrayBuffer = new Response(cs.readable).arrayBuffer();
    return new Uint8Array(await arrayBuffer);
  }

  private async decompress(
    byteArray: Uint8Array,
    encoding = 'deflate' as CompressionFormat,
  ): Promise<string> {
    const cs = new DecompressionStream(encoding);
    const writer = cs.writable.getWriter();
    writer.write(byteArray).catch(() => {
      // Ignore error
    });
    writer.close().catch(() => {
      // Ignore error
    });
    const arrayBuffer = new Response(cs.readable).arrayBuffer();
    return new TextDecoder().decode(await arrayBuffer);
  }
}
