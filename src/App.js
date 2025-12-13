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
import CreateChapter from "./ui/manager/CreateChapter";
import ManagerNovelDetail from "./ui/manager/NovelDetail";

import HomepageUser from "./ui/user/homepageUser";
import SearchBook from "./ui/user/searchBook";
import NovelDetail from "./ui/user/novelDetail";
import Profile from "./ui/user/profile";
import ChapterDetail from "./ui/user/ChapterDetail";

const AdminRoute = ({ children }) => {
    const { currentUser } = useSelector((state) => state.auth);
    const role = currentUser?.role?.toLowerCase();

    if (!currentUser) return <Navigate to="/login" replace />;
    if (role !== "admin")
        return <div style={{ color: "red", padding: 20 }}>Bạn không có quyền truy cập (Admin only)</div>;

    return children;
};

const ManagerRoute = ({ children }) => {
    const { currentUser } = useSelector((state) => state.auth);
    const role = currentUser?.role?.toLowerCase();

    if (!currentUser) return <Navigate to="/login" replace />;
    if (role !== "manager")
        return <div style={{ color: "red", padding: 20 }}>Bạn không có quyền truy cập (Manager only)</div>;

    return children;
};

const HomeRedirect = () => {
    const { currentUser } = useSelector((state) => state.auth);
    const role = currentUser?.role?.toLowerCase();

    if (!currentUser) return <Navigate to="/homepageUser" replace />;
    if (role === "admin") return <Navigate to="/admin/dashboard" replace />;
    if (role === "manager") return <Navigate to="/manager/dashboard" replace />;

    return <Navigate to="/homepageUser" replace />;
};

function App() {
    return (
        <BrowserRouter>
            <Routes>

                <Route path="/login" element={<Login title="Login" />} />
                <Route path="/register" element={<Register title="Register" />} />

                <Route path="/homepageUser" element={<HomepageUser />} />
                <Route path="/searchBook" element={<SearchBook />} />
                <Route path="/novel/:novelId" element={<NovelDetail />} />
                <Route path="/chapter/:chapterId" element={<ChapterDetail />} />
                <Route path="/profile" element={<Profile />} />

                <Route
                    path="/admin"
                    element={
                        <AdminRoute>
                            <AdminLayout />
                        </AdminRoute>
                    }
                >
                    <Route index element={<Navigate to="dashboard" replace />} />
                    <Route path="dashboard" element={<DashBoard />} />
                </Route>

                <Route
                    path="/manager/dashboard"
                    element={<ManagerRoute><NovelManager /></ManagerRoute>}
                />
                <Route
                    path="/manager/create"
                    element={<ManagerRoute><CreateNovel /></ManagerRoute>}
                />
                <Route
                    path="/manager/update/:id"
                    element={<ManagerRoute><UpdateNovel /></ManagerRoute>}
                />
                <Route
                    path="/manager/delete/:id"
                    element={<ManagerRoute><DeleteNovel /></ManagerRoute>}
                />
                <Route
                    path="/manager/novel/:id"
                    element={<ManagerRoute><ManagerNovelDetail /></ManagerRoute>}
                />
                <Route
                    path="/manager/novel/:id/add"
                    element={<ManagerRoute><CreateChapter /></ManagerRoute>}
                />

                <Route path="/" element={<HomeRedirect />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;