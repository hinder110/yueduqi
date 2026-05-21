import { describe, it, expect } from 'vitest';
import { toAbsUrl } from './biqugeParser';

describe('biqugeParser — toAbsUrl URL 拼接', () => {
  it('完整 URL 直接返回', () => {
    expect(toAbsUrl('https://example.com/book/123')).toBe('https://example.com/book/123');
    expect(toAbsUrl('http://m.biquge900.com/book/456')).toBe('http://m.biquge900.com/book/456');
  });

  it('绝对路径补全 BASE', () => {
    const result = toAbsUrl('/book/123.html');
    expect(result).toBe('http://m.biquge900.com/book/123.html');
  });

  it('相对路径补全 BASE + /', () => {
    expect(toAbsUrl('book/123.html')).toBe('http://m.biquge900.com/book/123.html');
    expect(toAbsUrl('./book/123.html')).toBe('http://m.biquge900.com/book/123.html');
  });

  it('空字符串返回空', () => {
    expect(toAbsUrl('')).toBe('');
  });
});
