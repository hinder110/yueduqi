import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import SearchPage from './pages/SearchPage';
import ChaptersPage from './pages/ChaptersPage';
import ReaderPage from './pages/ReaderPage';
import LoginPage from './pages/LoginPage';
import BookshelfPage from './pages/BookshelfPage';

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<SearchPage />} />
        <Route path="/chapters" element={<ChaptersPage />} />
        <Route path="/reader" element={<ReaderPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/bookshelf" element={<BookshelfPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}
