import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider, App as AntApp } from 'antd';
import viVN from 'antd/locale/vi_VN';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Home from './pages/Home';
import AdminDashboard from './pages/Admin/Dashboard';
import CategoriesPage from './pages/Admin/Categories';
import GenresPage from './pages/Admin/Genres';
import PublishersPage from './pages/Admin/Publishers';
import AuthorsPage from './pages/Admin/Authors';
import BooksPage from './pages/Admin/Books';
import BookForm from './pages/Admin/BookForm';
import ReadersPage from './pages/Admin/Readers';
import SystemConfig from './pages/Admin/SystemConfig';
import BorrowsPage from './pages/Admin/Borrows';
import FinesPage from './pages/Admin/Fines';
import ReviewsPage from './pages/Admin/Reviews';
import BookDetail from './pages/BookDetail';
import MyBorrows from './pages/MyBorrows';
import MyReservations from './pages/MyReservations';
import AiChatPage from './pages/AiChat';
import MyFines from './pages/MyFines';
import SearchPage from './pages/SearchPage';
import ProfilePage from './pages/Profile';
import LoginPage from './pages/Auth/LoginPage';
import RegisterPage from './pages/Auth/RegisterPage';
import ArticlesPage from './pages/Admin/Articles/ArticlesPage';
import BlogPage from './pages/Client/BlogPage';
import BlogDetail from './pages/Client/BlogDetail';
import ContactPage from './pages/Client/ContactPage';
import ContactsPage from './pages/Admin/Contacts/ContactsPage';
import ReportsPage from './pages/Admin/ReportsPage';
import './index.css';

// Helper
const getRedirectPath = (user) => {
    if (!user) return '/login';
    if (user.role === 'admin') return '/admin';
    if (user.role === 'librarian') return '/staff';
    return '/';
};

// Guard: chuyển về trang chủ/dashboard nếu đã đăng nhập
const GuestRoute = ({ children }) => {
    const { user, loading } = useAuth();
    if (loading) return null;
    return user ? <Navigate to={getRedirectPath(user)} replace /> : children;
};

// Guard: Chỉ Admin
const AdminRoute = ({ children }) => {
    const { user, loading } = useAuth();
    if (loading) return null;
    if (!user || user.role !== 'admin') return <Navigate to={getRedirectPath(user)} replace />;
    return children;
};

// Guard: Chỉ Staff
const StaffRoute = ({ children }) => {
    const { user, loading } = useAuth();
    if (loading) return null;
    if (!user || user.role !== 'librarian') return <Navigate to={getRedirectPath(user)} replace />;
    return children;
};

// Guard: Chỉ Độc giả (đã đăng nhập)
const ReaderRoute = ({ children }) => {
    const { user, loading } = useAuth();
    if (loading) return null;
    if (!user || user.role !== 'reader') return <Navigate to={getRedirectPath(user)} replace />;
    return children;
};

// Guard: Dành cho Guest và Reader
const PublicRoute = ({ children }) => {
    const { user, loading } = useAuth();
    if (loading) return null;
    if (user && ['admin', 'librarian'].includes(user.role)) return <Navigate to={getRedirectPath(user)} replace />;
    return children;
};

function AppRoutes() {
    return (
        <Routes>
            {/* Public */}
            <Route path="/" element={<PublicRoute><Home /></PublicRoute>} />
            <Route path="/books/:id" element={<PublicRoute><BookDetail /></PublicRoute>} />
            <Route path="/search" element={<PublicRoute><SearchPage /></PublicRoute>} />
            <Route path="/ai-chat" element={<PublicRoute><AiChatPage /></PublicRoute>} />
            <Route path="/articles" element={<PublicRoute><BlogPage /></PublicRoute>} />
            <Route path="/articles/:slug" element={<PublicRoute><BlogDetail /></PublicRoute>} />
            <Route path="/contact" element={<PublicRoute><ContactPage /></PublicRoute>} />

            {/* Reader (Private) */}
            <Route path="/my/borrows" element={<ReaderRoute><MyBorrows /></ReaderRoute>} />
            <Route path="/my/reservations" element={<ReaderRoute><MyReservations /></ReaderRoute>} />
            <Route path="/my/fines" element={<ReaderRoute><MyFines /></ReaderRoute>} />
            <Route path="/profile" element={<ReaderRoute><ProfilePage /></ReaderRoute>} />

            {/* Guest only */}
            <Route
                path="/login"
                element={
                    <GuestRoute>
                        <LoginPage />
                    </GuestRoute>
                }
            />
            <Route
                path="/register"
                element={
                    <GuestRoute>
                        <RegisterPage />
                    </GuestRoute>
                }
            />

            {/* Admin / Staff */}
            <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
            <Route path="/admin/categories" element={<AdminRoute><CategoriesPage /></AdminRoute>} />
            <Route path="/admin/genres" element={<AdminRoute><GenresPage /></AdminRoute>} />
            <Route path="/admin/publishers" element={<AdminRoute><PublishersPage /></AdminRoute>} />
            <Route path="/admin/authors" element={<AdminRoute><AuthorsPage /></AdminRoute>} />
            <Route path="/admin/books" element={<AdminRoute><BooksPage /></AdminRoute>} />
            <Route path="/admin/books/new" element={<AdminRoute><BookForm /></AdminRoute>} />
            <Route path="/admin/books/:id/edit" element={<AdminRoute><BookForm /></AdminRoute>} />
            <Route path="/admin/readers" element={<AdminRoute><ReadersPage /></AdminRoute>} />
            <Route path="/admin/configs" element={<AdminRoute><SystemConfig /></AdminRoute>} />
            <Route path="/admin/borrows" element={<AdminRoute><BorrowsPage /></AdminRoute>} />
            <Route path="/admin/fines" element={<AdminRoute><FinesPage /></AdminRoute>} />
            <Route path="/admin/reviews" element={<AdminRoute><ReviewsPage /></AdminRoute>} />
            <Route path="/admin/articles" element={<AdminRoute><ArticlesPage /></AdminRoute>} />
            <Route path="/admin/contacts" element={<AdminRoute><ContactsPage /></AdminRoute>} />
            <Route path="/admin/reports" element={<AdminRoute><ReportsPage /></AdminRoute>} />

            {/* Staff Routes (Librarian) */}
            <Route path="/staff" element={<StaffRoute><AdminDashboard /></StaffRoute>} />
            <Route path="/staff/categories" element={<StaffRoute><CategoriesPage /></StaffRoute>} />
            <Route path="/staff/genres" element={<StaffRoute><GenresPage /></StaffRoute>} />
            <Route path="/staff/publishers" element={<StaffRoute><PublishersPage /></StaffRoute>} />
            <Route path="/staff/authors" element={<StaffRoute><AuthorsPage /></StaffRoute>} />
            <Route path="/staff/books" element={<StaffRoute><BooksPage /></StaffRoute>} />
            <Route path="/staff/books/new" element={<StaffRoute><BookForm /></StaffRoute>} />
            <Route path="/staff/books/:id/edit" element={<StaffRoute><BookForm /></StaffRoute>} />
            <Route path="/staff/readers" element={<StaffRoute><ReadersPage /></StaffRoute>} />
            <Route path="/staff/borrows" element={<StaffRoute><BorrowsPage /></StaffRoute>} />
            <Route path="/staff/fines" element={<StaffRoute><FinesPage /></StaffRoute>} />
            <Route path="/staff/reviews" element={<StaffRoute><ReviewsPage /></StaffRoute>} />
            <Route path="/staff/articles" element={<StaffRoute><ArticlesPage /></StaffRoute>} />
            <Route path="/staff/contacts" element={<StaffRoute><ContactsPage /></StaffRoute>} />
            <Route path="/staff/reports" element={<StaffRoute><ReportsPage /></StaffRoute>} />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}

function App() {
    return (
        <ConfigProvider
            locale={viVN}
            theme={{
                token: {
                    colorPrimary: '#a30014',
                    fontFamily: '"Inter", "Be Vietnam Pro", sans-serif',
                    borderRadius: 8,
                    colorBgContainer: '#ffffff',
                },
                components: {
                    Button: {
                        colorPrimary: '#a30014',
                        algorithm: true,
                    },
                    Input: {
                        colorPrimary: '#a30014',
                    },
                },
            }}
        >
            <AntApp>
                <BrowserRouter>
                    <AuthProvider>
                        <AppRoutes />
                    </AuthProvider>
                </BrowserRouter>
            </AntApp>
        </ConfigProvider>
    );
}

export default App;
