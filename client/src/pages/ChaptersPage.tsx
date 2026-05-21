import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { fetchChapters, fetchBookshelf, addToBookshelf } from '../api';
import { useAuth } from '../contexts/AuthContext';
import type { Book, Chapter, BookshelfItem } from '../types';

export default function ChaptersPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const book = location.state?.book as Book | undefined;
  const { user } = useAuth();

  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [addedToShelf, setAddedToShelf] = useState(false);
  const [shelfItem, setShelfItem] = useState<BookshelfItem | null>(null);

  useEffect(() => {
    if (!book) {
      navigate('/', { replace: true });
      return;
    }
    loadChapters();
    if (user) loadShelfInfo();
  }, []);

  async function loadChapters() {
    if (!book) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetchChapters(book.bookId, book.sourceKey, book.source, book.tab);
      if (res.success && res.data) {
        setChapters(res.data);
      } else {
        setError(res.error ?? '加载章节失败');
      }
    } catch (e) {
      setError('请求异常，请稍后重试');
    } finally {
      setLoading(false);
    }
  }

  async function loadShelfInfo() {
    if (!book || !user) return;
    try {
      const res = await fetchBookshelf();
      if (res.success && res.data) {
        const found = res.data.find((item) => item.bookId === book.bookId);
        if (found) {
          setShelfItem(found);
          setAddedToShelf(true);
        }
      }
    } catch {
      // 书架信息加载失败不影响章节浏览
    }
  }

  async function handleAddToShelf() {
    if (!book || !user) return;
    const res = await addToBookshelf({
      title: book.title,
      author: book.author,
      cover: book.cover,
      intro: book.intro,
      bookId: book.bookId,
      sourceKey: book.sourceKey,
    });
    if (res.success) {
      setAddedToShelf(true);
    }
  }

  if (!book) return null;

  return (
    <div className="page chapters-page">
      <header className="header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          ← 返回
        </button>
        <h1 className="header-title">{book.title}</h1>
        <span className="header-sub">{book.author}</span>
        {user && (
          <button
            className="header-btn"
            onClick={handleAddToShelf}
            disabled={addedToShelf}
          >
            {addedToShelf ? '已加入书架' : '加入书架'}
          </button>
        )}
      </header>

      {/* 书籍详情卡片 */}
      <div className="book-detail-card">
        {book.cover && (
          <img src={book.cover} alt={book.title} className="book-detail-cover" />
        )}
        <div className="book-detail-info">
          <h2 className="book-title">{book.title}</h2>
          {book.author && <span className="book-author">{book.author}</span>}
          {book.kind && <span className="book-kind">{book.kind}</span>}
          {shelfItem && shelfItem.chapterIndex > 0 && (
            <span className="progress-hint">上次读到第 {shelfItem.chapterIndex} 章</span>
          )}
          {book.intro && <p className="book-intro">{book.intro}</p>}
        </div>
      </div>

      {loading && <div className="message loading">加载中...</div>}
      {error && <div className="message error">{error}</div>}

      <div className="section-header">
        <span className="section-title">目录</span>
        <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
          共 {chapters.length} 章
        </span>
      </div>

      <div className="chapter-list">
        {chapters.map((ch, i) => (
          <div
            key={ch.itemId}
            className="chapter-item"
            onClick={() =>
              navigate('/reader', {
                state: {
                  book,
                  chapter: ch,
                  chapters,
                  currentIndex: i,
                },
              })
            }
          >
            <span className="chapter-index">{i + 1}</span>
            <span className="chapter-title">{ch.title}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
