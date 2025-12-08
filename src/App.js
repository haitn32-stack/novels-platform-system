import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Register from './ui/register';
import Login from './ui/login';
import Dashboard from "./ui/admin/dashboard";

// Component bảo vệ Route Admin
const AdminRoute = ({ children }) => {
    const { currentUser } = useSelector((state) => state.auth);

    if (!currentUser) return <Navigate to="/login" />;
    if (currentUser.roles !== 'admin') return <div style={{ color: 'red' }}>Bạn không có quyền truy cập trang này!</div>;

    return children;
};

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={<Login title="Đăng nhập" />} />
                <Route path="/register" element={<Register title="Đăng ký" />} />


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

                <Route path="/" element={<div>Trang chủ cho Reader</div>} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;