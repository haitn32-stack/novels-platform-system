import React from "react";
import { Outlet } from "react-router-dom";
import SideBar from "./SideBar";

const Layout = () => {
    return (
        <div style={{ display: "flex", width: "100%", minHeight: "100vh" }}>
            <SideBar />

            <div
                style={{
                    flexGrow: 1,
                    background: "#f0f2f5",
                    overflowX: "hidden"
                }}
            >
                <Outlet />
            </div>
        </div>
    );
};

export default Layout;