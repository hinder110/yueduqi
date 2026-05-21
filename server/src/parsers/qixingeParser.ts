import * as cheerio from 'cheerio';
import http from 'http';
import type { Book, Chapter, ChapterContent } from '../types';
import { toAbsUrl } from '../utils';
import { cleanContent } from '../bookParser';

const BASE = 'http://www.qixinge.net';

function fetchHTML(url: string): Promise<cheerio.CheerioAPI> {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    http.get(
      {
        hostname: u.hostname,
        port: u.port || 80,
        path: u.pathname + u.search,
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Mobile Safari/537.36',
          Referer: BASE + '/',
        },
        timeout: 15000,
      },
      (res) => {
        const chunks: Buffer[] = [];
        res.on('data', (c: Buffer) => chunks.push(c));
        res.on('end', () => resolve(cheerio.load(Buffer.concat(chunks).toString('utf8'))));
        res.on('error', reject);
      }
    ).on('error', reject);
  });
}

export async function searchBooks(keyword: string): Promise<Book[]> {
  const $ = await fetchHTML(
    `${BASE}/search.php?q=${encodeURIComponent(keyword)}&p=1`
  );

  const books: Book[] = [];
  $('.col-md-6 dl').each((_i, el) => {
    const coverImg = $(el).find('dt img').attr('src');
    const nameLink = $(el).find('h3 a');
    const name = nameLink.text()
      .replace(/^\[.*?\]/, '')
      .replace(/免费阅读小说/g, '')
      .trim();
    const href = nameLink.attr('href') ?? '';
    if (!name || !href) return;

    const bookOthers = $(el).find('.book_other');
    // book_other[0] = 作者：<span>xxx</span>
    const author = bookOthers.eq(0).find('span').first().text().trim();

    books.push({
      title: name,
      author: author || undefined,
      cover: toAbsUrl(coverImg || '', BASE),
      kind: bookOthers.eq(1).text().replace(/.*：/, '').trim() || undefined,
      lastChapter: bookOthers.eq(3).find('a').text().trim() || undefined,
      bookId: toAbsUrl(href, BASE),
      sourceKey: 'qixinge',
      source: 'qixinge',
      tab: '',
    });
  });
  return books;
}

export async function getChapters(bookUrl: string): Promise<Chapter[]> {
  const $ = await fetchHTML(bookUrl);

  const chapters: Chapter[] = [];
  $('.book_list2 li a').each((_i, el) => {
    const href = $(el).attr('href') ?? '';
    const title = $(el).text().trim();
    if (!href || !title) return;
    chapters.push({
      title,
      itemId: toAbsUrl(href, BASE),
    });
  });
  return chapters;
}

export async function getChapterContent(chapterUrl: string): Promise<ChapterContent> {
  const $ = await fetchHTML(chapterUrl);

  const rawTitle = $('h1').first().text().trim() || '';
  const title = rawTitle.replace(/-《.*》/, '').trim();

  const article = $('article.font_max');
  // 先清理广告和脚本
  article.find('script, style, div, a').remove();
  // <br> 转换行，再取文本
  article.find('br').replaceWith('\n');
  let text = article.text();

  // 应用 replaceRegex 清理
  text = text
    .replace(/本章未完.*/g, '')
    .replace(/第\s*\(?\s*\d+\s*\/\s*\d+\s*\)?\s*页/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  return {
    title,
    content: cleanContent(text),
  };
}
