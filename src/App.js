import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import Register from "./ui/register";
import Login from "./ui/login";
import AdminLayout from "./ui/admin/Layout";
import DashBoard from "./ui/admin/DashBoard";
import NovelManager from "./ui/manager/manager-list";
import CreateNovel from "./ui/manager/create-novels";
import UpdateNovel from "./ui/manager/update-novels";
import DeleteNovel from "./ui/manager/delete-novels";

// Protected admin routes
const AdminRoute = ({ children }) => {
    const { currentUser } = useSelector((state) => state.auth);

    if (!currentUser) return <Navigate to="/login" />;
    if (currentUser.role !== "admin")
        return (
            <div className="text-danger p-3">
                Bạn không có quyền truy cập trang này!
            </div>
        );

    return children;
};

// Protected manager routes
const ManagerRoute = ({ children }) => {
    const { currentUser } = useSelector((state) => state.auth);

    if (!currentUser) return <Navigate to="/login" />;
    if (currentUser.role !== "manager")
        return (
            <div className="text-danger p-3">
                Bạn không có quyền truy cập trang này!
            </div>
        );

    return children;
};

function App() {
    return (
        <BrowserRouter>
            <Routes>
                {/* Public Routes */}
                <Route path="/login" element={<Login title="Đăng nhập" />} />
                <Route path="/register" element={<Register title="Đăng ký" />} />

                <Route path="/" element={<div>Trang chủ cho Reader</div>} />

                {/*Admin Routes*/}
                <Route
                    path="/admin"
                    element={
                        <AdminRoute>
                            <AdminLayout /> {/* Layout chứa Outlet */}
                        </AdminRoute>
                    }
                >
                    <Route index element={<Navigate to="dashboard" replace />} />

                    <Route path="dashboard" element={<DashBoard />} />

                </Route>

                {/*Manager Routes*/}
                <Route
                    path="/manager/*"
                    element={
                        <ManagerRoute>
                            <Routes>
                                {/* Cách viết lồng Routes cũ vẫn chạy được nhưng khó dùng Layout chung */}
                                <Route path="dashboard" element={<NovelManager />} />
                                <Route path="create" element={<CreateNovel />} />
                                <Route path="update/:id" element={<UpdateNovel />} />
                                <Route path="delete/:id" element={<DeleteNovel />} />
                            </Routes>
                        </ManagerRoute>
                    }
                />
            </Routes>
        </BrowserRouter>
    );
}

export default App;