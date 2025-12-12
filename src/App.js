import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import Register from "./ui/register";
import Login from "./ui/login";
import Dashboard from "./ui/admin/dashboard";
import NovelManager from "./ui/manager/manager-list";
import CreateNovel from "./ui/manager/create-novels";
import UpdateNovel from "./ui/manager/update-novels";
import DeleteNovel from "./ui/manager/delete-novels";
import HomepageUser from "./ui/user/homepageUser";
import SearchBook from "./ui/user/searchBook";
import NovelDetail from "./ui/user/novelDetail";
import Profile from "./ui/user/profile";
import ChapterDetail from "./ui/user/ChapterDetail";
import CreateChapter from "./ui/manager/CreateChapter";
import ManagerNovelDetail from "./ui/manager/NovelDetail";

const AdminRoute = ({ children }) => {
    const { currentUser } = useSelector((state) => state.auth);
    const userRole = currentUser?.role?.toLowerCase();

    if (!currentUser) return <Navigate to="/login" replace />;
    
    if (userRole !== "admin")
        return (
            <div style={{ color: "red", padding: "20px", textAlign: "center" }}>
                You do not have permission to access this page! (Admin role required)
            </div>
        );
    return children;
};

const ManagerRoute = ({ children }) => {
    const { currentUser } = useSelector((state) => state.auth);
    const userRole = currentUser?.role?.toLowerCase();

    if (!currentUser) return <Navigate to="/login" replace />;
    
    if (userRole !== "manager")
        return (
            <div style={{ color: "red", padding: "20px", textAlign: "center" }}>
                You do not have permission to access this page! (Manager role required)
            </div>
        );
    return children;
};

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={<Login title="Login" />} />
                <Route path="/register" element={<Register title="Register" />} />
                <Route path="/mana" element={<NovelManager title="Management" />} />

                <Route
                    path="/admin/*"
                    element={
                        <AdminRoute>
                            <Routes>
                                <Route path="dashboard" element={<Dashboard />} />
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
                                <Route path="create" element={<CreateNovel />} />
                                <Route path="update/:id" element={<UpdateNovel />} />
                                <Route path="delete/:id" element={<DeleteNovel />} />
                                <Route path="novel/:id" element={<ManagerNovelDetail />} />
                                <Route
                                    path="novel/:id/add"
                                    element={<CreateChapter />}
                                />
                            </Routes>
                        </ManagerRoute>
                    }
                />
                
                {/* User Routes */}
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
    const role = (currentUser?.role || "").toLowerCase();
    
    if (!currentUser) return <Navigate to="/homepageUser" replace />;
    if (role === "admin") return <Navigate to="/admin/dashboard" replace />;
    if (role === "manager") return <Navigate to="/manager/dashboard" replace />;
    return <Navigate to="/homepageUser" replace />;
};

export default App;