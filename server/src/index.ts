import express from 'express';
import cors from 'cors';
import path from 'path';
import { searchBooks, getChapters, getChapterContent } from './parsers/index';
import type { SourceKey } from './parsers/index';
import { getHotBooks } from './bookParser';
import type { ApiResponse, Book, Chapter, ChapterContent } from './types';
import authRouter from './routes/auth';
import bookshelfRouter from './routes/bookshelf';

const app = express();
const PORT = Number(process.env.PORT) || 3001;
const isProduction = process.env.NODE_ENV === 'production';

// 生产模式：托管前端静态文件
if (isProduction) {
  const clientDist = path.join(__dirname, '../client/dist');
  app.use(express.static(clientDist));
}

app.use(cors());
app.use(express.json());

// 认证路由
app.use('/api/auth', authRouter);

// 书架路由（需要认证）
app.use('/api/bookshelf', bookshelfRouter);

function getSource(query: Record<string, unknown>): SourceKey {
  const s = String(query.source ?? 'guangyu');
  if (s === 'biquge900' || s === 'qixinge') return s;
  return 'guangyu';
}

/** GET /api/search?keyword=xxx&source=xxx */
app.get('/api/search', async (req, res) => {
  const keyword = String(req.query.keyword ?? '').trim();
  if (!keyword) {
    const body: ApiResponse<Book[]> = { success: false, error: '请输入搜索关键词' };
    res.status(400).json(body);
    return;
  }

  const source = getSource(req.query);
  try {
    const books = await searchBooks({ source, keyword });
    const body: ApiResponse<Book[]> = { success: true, data: books };
    res.json(body);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : '搜索失败';
    console.error('[searchBooks]', source, message);
    const body: ApiResponse<Book[]> = { success: false, error: message };
    res.status(500).json(body);
  }
});

/** GET /api/hot — 热门推荐（仅光遇支持） */
app.get('/api/hot', async (_req, res) => {
  try {
    const books = await getHotBooks();
    const body: ApiResponse<Book[]> = { success: true, data: books };
    res.json(body);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : '获取热门推荐失败';
    console.error('[getHotBooks]', message);
    const body: ApiResponse<Book[]> = { success: false, error: message };
    res.status(500).json(body);
  }
});

/** GET /api/chapters?bookId=xxx&source=xxx[&innerSource=xxx&innerTab=xxx] */
app.get('/api/chapters', async (req, res) => {
  const bookId = String(req.query.bookId ?? '');
  if (!bookId) {
    const body: ApiResponse<Chapter[]> = { success: false, error: '缺少 bookId 参数' };
    res.status(400).json(body);
    return;
  }

  const source = getSource(req.query);
  try {
    const chapters = await getChapters({
      source,
      bookId,
      innerSource: String(req.query.innerSource ?? '番茄'),
      innerTab: String(req.query.innerTab ?? '小说'),
    });
    const body: ApiResponse<Chapter[]> = { success: true, data: chapters };
    res.json(body);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : '获取章节失败';
    console.error('[getChapters]', source, message);
    const body: ApiResponse<Chapter[]> = { success: false, error: message };
    res.status(500).json(body);
  }
});

/** GET /api/content?bookId=xxx&itemId=xxx&source=xxx[&innerSource=xxx&innerTab=xxx] */
app.get('/api/content', async (req, res) => {
  const bookId = String(req.query.bookId ?? '');
  const itemId = String(req.query.itemId ?? '');
  if (!bookId || !itemId) {
    const body: ApiResponse<ChapterContent> = { success: false, error: '缺少 bookId 或 itemId 参数' };
    res.status(400).json(body);
    return;
  }

  const source = getSource(req.query);
  try {
    const content = await getChapterContent({
      source,
      bookId,
      itemId,
      innerSource: String(req.query.innerSource ?? '番茄'),
      innerTab: String(req.query.innerTab ?? '小说'),
    });
    const body: ApiResponse<ChapterContent> = { success: true, data: content };
    res.json(body);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : '获取正文失败';
    console.error('[getChapterContent]', source, message);
    const body: ApiResponse<ChapterContent> = { success: false, error: message };
    res.status(500).json(body);
  }
});

// 生产模式：SPA 兜底，非 /api 请求返回 index.html
if (isProduction) {
  const clientIndex = path.join(__dirname, '../client/dist/index.html');
  app.get('*', (_req, res) => {
    res.sendFile(clientIndex);
  });
}

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
