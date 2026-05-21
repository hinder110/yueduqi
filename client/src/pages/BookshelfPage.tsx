import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchBookshelf, removeFromBookshelf } from '../api';
import { useAuth } from '../contexts/AuthContext';
import type { BookshelfItem } from '../types';

export default function BookshelfPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState<BookshelfItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/login', { replace: true });
      return;
    }
    loadShelf();
  }, []);

  async function loadShelf() {
    setLoading(true);
    setError('');
    const res = await fetchBookshelf();
    if (res.success && res.data) {
      setItems(res.data);
    } else {
      setError(res.error ?? '加载书架失败');
    }
    setLoading(false);
  }

  async function handleRemove(bookId: number) {
    const res = await removeFromBookshelf(bookId);
    if (res.success) {
      setItems((prev) => prev.filter((b) => b.id !== bookId));
    }
  }

  function handleOpen(book: BookshelfItem) {
    navigate('/chapters', {
      state: {
        book: {
          bookId: book.bookId,
          title: book.title,
          author: book.author,
          cover: book.cover,
          intro: book.intro,
          sourceKey: book.sourceKey,
          source: '番茄',
          tab: '小说',
        },
      },
    });
  }

  if (!user) return null;

  return (
    <div className="page bookshelf-page">
      <header className="header">
        <button className="back-btn" onClick={() => navigate(-1)}>← 返回</button>
        <h1>我的书架</h1>
      </header>

      {loading && <div className="message loading">加载中...</div>}
      {error && <div className="message error">{error}</div>}

      {!loading && items.length === 0 && (
        <div className="message empty">书架空空如也，去搜索页面添加书籍吧</div>
      )}

      <div className="bookshelf-grid">
        {items.map((book) => (
          <div key={book.id} className="bookshelf-card">
            <button
              className="bookshelf-remove-btn"
              onClick={(e) => { e.stopPropagation(); handleRemove(book.id); }}
            >
              ✕
            </button>
            <div className="bookshelf-card-inner" onClick={() => handleOpen(book)}>
              {book.cover ? (
                <img src={book.cover} alt={book.title} className="bookshelf-card-cover" />
              ) : (
                <div className="bookshelf-card-cover bookshelf-card-cover--placeholder" />
              )}
              <h3 className="bookshelf-card-title">{book.title}</h3>
              {book.author && (
                <span className="bookshelf-card-author">{book.author}</span>
              )}
              {book.chapterIndex > 0 && (
                <span className="progress-hint">已读至第 {book.chapterIndex} 章</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
