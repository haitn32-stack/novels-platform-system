import React from "react";
import { useDispatch } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import { authActions } from "../../feature/auth/authSlice";

export default function SideBar() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        dispatch(authActions.logout());
        navigate("/login");
    };

    const isActive = (path) => location.pathname === path;
    const getBtnClass = (path) =>
        `btn ${isActive(path) ? 'btn-light text-primary fw-bold' : 'btn-outline-light'} mb-2 text-start`;

    return (
        <div
            style={{
                width: 260,
                background: "linear-gradient(180deg,rgb(77, 124, 196) 0%,rgb(60, 115, 178) 100%)",
                color: "white",
                padding: 20,
                display: "flex",
                flexDirection: "column",
                minHeight: "100vh",
                position: "sticky",
                top: 0
            }}
        >
            <div className="text-center mb-5 mt-2">
                <h4 className="fw-bold m-0">ADMIN PANEL</h4>
                <small style={{ opacity: 0.8 }}>Novel Platform System</small>
            </div>

            <button
                className={getBtnClass("/admin/dashboard")}
                onClick={() => navigate("/admin/dashboard")}
            >
                <i className="bi bi-people-fill me-2"></i> User Management
            </button>

            <button
                className={getBtnClass("/admin/creation")}
                onClick={() => navigate("/admin/creation")}
            >
                <i className="bi bi-plus-circle-fill me-2"></i> Create User
            </button>

            <div style={{ flexGrow: 1 }} />

            <div className="border-top pt-3 mt-3" style={{ borderColor: 'rgba(255,255,255,0.2)' }}>
                <button className="btn btn-danger w-100" onClick={handleLogout}>
                    <i className="bi bi-box-arrow-right me-2"></i> Logout
                </button>
            </div>
        </div>
    );
};