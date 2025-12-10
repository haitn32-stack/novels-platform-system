import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Register from './ui/register';
import Login from './ui/login';
import Dashboard from "./ui/admin/dashboard";
import NovelManager from './ui/manager/manager-list';

// Component bảo vệ Route Admin
const AdminRoute = ({ children }) => {
    const { currentUser } = useSelector((state) => state.auth);

    if (!currentUser) return <Navigate to="/login" />;
    if (currentUser.roles !== 'admin') return <div style={{ color: 'red' }}>Bạn không có quyền truy cập trang này!</div>;

    return children;
};
const ManagerRoute = ({ children }) => {
    const { currentUser } = useSelector((state) => state.auth);

    if (!currentUser) return <Navigate to="/login" />;
    if (currentUser.roles !== 'manager') return <div style={{ color: 'red' }}>Bạn không có quyền truy cập trang này!</div>;

    return children;
};

function App() {
    return (
        <BrowserRouter>
            <Routes>

                {/* Public routes */}
                <Route path="/login" element={<Login title="Đăng nhập" />} />
                <Route path="/register" element={<Register title="Đăng ký" />} />


                {/* Admin routes */}
                <Route
                    path="/admin/*"
                    element={
                        <AdminRoute>
                            <Routes>
                                <Route path="dashboard" element={<Dashboard />} />
                                {/* Thêm route quản lý user ở đây */}
                            </Routes>
                        </AdminRoute>
                    }
                />
                <Route
                    path="/manager/*"
                    element={
                        <ManagerRoute>
                            <Routes>
                                <Route path="dashboard" element={<NovelManager />} />
                            </Routes>
                        </ManagerRoute>
                    }
                />

                <Route path="/" element={<div>Trang chủ cho Reader</div>} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;