import axios, { AxiosInstance } from 'axios';
import * as cheerio from 'cheerio';
import http from 'http';
import iconv from 'iconv-lite';

export const USER_AGENT =
  'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Mobile Safari/537.36';

export const httpClient: AxiosInstance = axios.create({
  timeout: 15000,
  headers: {
    'User-Agent': USER_AGENT,
  },
});

export function toAbsUrl(path: string, base: string): string {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  if (path.startsWith('/')) return base + path;
  return base + '/' + path;
}

export interface FetchHTMLOptions {
  referer: string;
  encoding?: string;
  body?: Buffer;
  method?: 'GET' | 'POST';
}

export function fetchHTML(url: string, opts: FetchHTMLOptions): Promise<cheerio.CheerioAPI> {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const isPost = opts.method === 'POST';
    const req = http.request(
      {
        hostname: u.hostname,
        port: u.port || 80,
        path: u.pathname + u.search,
        method: opts.method ?? 'GET',
        headers: {
          'User-Agent': USER_AGENT,
          Referer: opts.referer,
          ...(isPost && opts.body
            ? {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': String(opts.body.length),
              }
            : {}),
        },
      },
      (res) => {
        const chunks: Buffer[] = [];
        res.on('data', (c: Buffer) => chunks.push(c));
        res.on('end', () => {
          const buf = Buffer.concat(chunks);
          const html = iconv.decode(buf, opts.encoding ?? 'utf8');
          resolve(cheerio.load(html));
        });
        res.on('error', reject);
      },
    );
    req.on('error', reject);
    req.setTimeout(15000, () => {
      req.destroy();
      reject(new Error('请求超时'));
    });
    if (isPost && opts.body) req.write(opts.body);
    req.end();
  });
}
