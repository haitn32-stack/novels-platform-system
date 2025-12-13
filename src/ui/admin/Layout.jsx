import React from "react";
import { Outlet } from "react-router-dom";
import SideBar from "./SideBar";

const Layout = () => {
    return (
        <div style={{ display: "flex", width: "100%", minHeight: "100vh" }}>
            {/* 1. Sidebar cố định bên trái */}
            <SideBar />

            {/* 2. Phần nội dung chính bên phải */}
            <div
                style={{
                    flexGrow: 1,
                    background: "#f0f2f5", // Màu nền xám nhẹ cho nội dung nổi bật
                    overflowX: "hidden"    // Tránh thanh cuộn ngang
                }}
            >
                {/* Outlet là nơi React Router render các component con (DashBoard, Settings...) */}
                <Outlet />
            </div>
        </div>
    );
};

export default Layout;