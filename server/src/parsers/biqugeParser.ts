import * as cheerio from 'cheerio';
import iconv from 'iconv-lite';
import http from 'http';
import type { Book, Chapter, ChapterContent } from '../types';

const BASE = 'http://m.biquge900.com';

function fetchGBK(url: string, opts?: { body?: Buffer; method?: 'GET' | 'POST' }): Promise<cheerio.CheerioAPI> {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const isPost = opts?.method === 'POST';
    const body = opts?.body;

    const req = http.request(
      {
        hostname: u.hostname,
        port: u.port || 80,
        path: u.pathname + u.search,
        method: opts?.method ?? 'GET',
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Mobile Safari/537.36',
          Referer: BASE + '/',
          ...(isPost && body
            ? {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': String(body.length),
              }
            : {}),
        },
      },
      (res) => {
        const chunks: Buffer[] = [];
        res.on('data', (c: Buffer) => chunks.push(c));
        res.on('end', () => {
          const html = iconv.decode(Buffer.concat(chunks), 'gbk');
          resolve(cheerio.load(html));
        });
        res.on('error', reject);
      }
    );
    req.on('error', reject);
    req.setTimeout(15000, () => {
      req.destroy();
      reject(new Error('请求超时'));
    });

    if (isPost && body) req.write(body);
    req.end();
  });
}

function toAbsUrl(path: string): string {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  if (path.startsWith('/')) return BASE + path;
  return BASE + '/' + path.replace(/^\.\//, '');
}

export async function searchBooks(keyword: string): Promise<Book[]> {
  const prefix = Buffer.from('searchkey=', 'ascii');
  const suffix = Buffer.from('&t=1', 'ascii');
  const keyBuf = iconv.encode(keyword, 'gbk');
  const body = Buffer.concat([prefix, keyBuf, suffix]);

  const $ = await fetchGBK(`${BASE}/modules/article/search.php`, {
    method: 'POST',
    body,
  });

  const books: Book[] = [];
  $('.hot_sale').each((_i, el) => {
    const a = $(el).find('a').first();
    const href = a.attr('href');
    if (!href) return;
    const name = a.find('.title').text().trim() || a.find('p').first().text().trim();
    if (!name) return;

    books.push({
      title: name,
      author: a.find('.author').text().trim() || undefined,
      kind: a.find('.review').text().trim() || undefined,
      lastChapter: undefined,
      bookId: toAbsUrl(href),
      sourceKey: 'biquge900',
      source: 'biquge900',
      tab: '',
    });
  });
  return books;
}

export async function getChapters(bookUrl: string): Promise<Chapter[]> {
  const $ = await fetchGBK(bookUrl);

  const chapters: Chapter[] = [];
  $('.directoryArea p').each((_i, el) => {
    const a = $(el).find('a');
    const href = a.attr('href') ?? '';
    const title = a.text().trim();
    if (!href || !title) return;
    chapters.push({
      title,
      itemId: toAbsUrl(href),
    });
  });
  return chapters;
}

export async function getChapterContent(chapterUrl: string): Promise<ChapterContent> {
  const $ = await fetchGBK(chapterUrl);

  const title = $('.title').first().text().trim() || '';

  const chapterDiv = $('#chaptercontent');
  chapterDiv.find('script, style, div, a').remove();
  // 把 <br> 转成换行再取文本，否则段落会粘在一起
  chapterDiv.find('br').replaceWith('\n');
  const raw = chapterDiv.text();

  const cleaned = raw
    .replace(/笔趣阁最新域名：/g, '')
    .replace(/，请牢记本域名并相互转告！\s*/g, '')
    .replace(/https?:\/\/[^\s]*/g, '')
    .replace(/www\.[^\s]*/g, '')
    .replace(/[ \t]{2,}/g, '') // 去除 &nbsp; 转换来的多余缩进空格
    .trim();

  return {
    title,
    content: cleanContent(cleaned),
  };
}

function cleanContent(text: string): string {
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .map((line) => `<p>${line}</p>`)
    .join('\n');
}
