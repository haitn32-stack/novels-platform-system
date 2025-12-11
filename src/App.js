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

// Component bảo vệ Route Admin
const AdminRoute = ({ children }) => {
  const { currentUser } = useSelector((state) => state.auth);

  if (!currentUser) return <Navigate to="/login" />;
  if (currentUser.role !== "admin")
    return (
      <div style={{ color: "red" }}>Bạn không có quyền truy cập trang này!</div>
    );

  return children;
};
const ManagerRoute = ({ children }) => {
  const { currentUser } = useSelector((state) => state.auth);
  console.log(currentUser);
  
  if (!currentUser) return <Navigate to="/login" />;
  if (currentUser.role !== "manager")
    return (
      <div style={{ color: "red" }}>Bạn không có quyền truy cập trang này!</div>
    );
  return children;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login title="Đăng nhập" />} />
        <Route path="/register" element={<Register title="Đăng ký" />} />
        <Route path="/mana" element={<NovelManager title="Quản Lý" />} />

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
                <Route path="/update/:id" element={<UpdateNovel />} />
                <Route path="/delete/:id" element={<DeleteNovel />} />
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
