import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

import Register from './ui/register';
import Login from './ui/login';
import Dashboard from "./ui/admin/dashboard";
import NovelManager from './ui/manager/manager-list';
import HomepageUser from './ui/user/homepageUser';
import SearchBook from './ui/user/searchBook';
import NovelDetail from './ui/user/novelDetail';

import Profile from './ui/user/profile';
import ChapterDetail from './ui/user/ChapterDetail';

const AdminRoute = ({ children }) => {
    const { currentUser } = useSelector((state) => state.auth);
    if (!currentUser) return <Navigate to="/login" />;
    if ((currentUser.role || currentUser.roles) !== 'admin') return <div style={{ color: 'red' }}>Bạn không có quyền truy cập trang này!</div>;
    return children;
};

const ManagerRoute = ({ children }) => {
    const { currentUser } = useSelector((state) => state.auth);
    if (!currentUser) return <Navigate to="/login" />;
    if ((currentUser.role || currentUser.roles) !== 'manager') return <div style={{ color: 'red' }}>Bạn không có quyền truy cập trang này!</div>;
    return children;
};

function App() {
    return (
        <BrowserRouter>
            <Routes>
                {/* Public */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/mana" element={<NovelManager />} />

                {/* Admin */}
                <Route path="/admin/*" element={
                    <AdminRoute>
                        <Routes>
                            <Route path="dashboard" element={<Dashboard />} />
                        </Routes>
                    </AdminRoute>
                } />

                {/* Manager */}
                <Route path="/manager/*" element={
                    <ManagerRoute>
                        <Routes>
                            <Route path="dashboard" element={<NovelManager />} />
                        </Routes>
                    </ManagerRoute>
                } />

                {/* User */}
                <Route path="/homepageUser" element={<HomepageUser />} />
                <Route path="/searchBook" element={<SearchBook />} />

                {/* Novel & Chapter */}
                <Route path="/novel/:novelId" element={<NovelDetail />} />
                <Route path="/chapter/:chapterId" element={<ChapterDetail />} />

                {/* Profile */}
                <Route path="/profile" element={<Profile />} />

                {/* Root redirect */}
                <Route path="/" element={<HomeRedirect />} />
            </Routes>
        </BrowserRouter>
    );
}

const HomeRedirect = () => {
    const { currentUser } = useSelector((state) => state.auth);
    if (!currentUser) return <Navigate to="/homepageUser" replace />;
    const role = (currentUser.role || currentUser.roles || '').toLowerCase();
    if (role === 'admin') return <Navigate to="/admin/dashboard" replace />;
    if (role === 'manager') return <Navigate to="/manager/dashboard" replace />;
    return <Navigate to="/homepageUser" replace />;
};

export default App;
