import type { ApiResponse, Book, Chapter, ChapterContent } from './types';

const BASE = '/api';
const DEFAULT_SOURCE = 'guangyu';

async function request<T>(path: string): Promise<ApiResponse<T>> {
  try {
    const res = await fetch(`${BASE}${path}`);
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
      return { success: false, error: err.error ?? `请求失败 (${res.status})` };
    }
    return res.json();
  } catch {
    return { success: false, error: '网络连接失败，请确认后端服务已启动' };
  }
}

export async function fetchSearch(keyword: string, sourceKey: string = DEFAULT_SOURCE): Promise<ApiResponse<Book[]>> {
  return request<Book[]>(`/search?keyword=${encodeURIComponent(keyword)}&source=${sourceKey}`);
}

export async function fetchHotBooks(): Promise<ApiResponse<Book[]>> {
  return request<Book[]>('/hot');
}

export async function fetchChapters(
  bookId: string,
  sourceKey: string = DEFAULT_SOURCE,
  innerSource: string = '番茄',
  innerTab: string = '小说'
): Promise<ApiResponse<Chapter[]>> {
  const params = new URLSearchParams({ bookId, source: sourceKey, innerSource, innerTab });
  return request<Chapter[]>(`/chapters?${params}`);
}

export async function fetchContent(
  bookId: string,
  itemId: string,
  sourceKey: string = DEFAULT_SOURCE,
  innerSource: string = '番茄',
  innerTab: string = '小说'
): Promise<ApiResponse<ChapterContent>> {
  const params = new URLSearchParams({ bookId, itemId, source: sourceKey, innerSource, innerTab });
  return request<ChapterContent>(`/content?${params}`);
}
