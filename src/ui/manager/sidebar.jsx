import React from "react";
import { useDispatch } from "react-redux";
import { authActions } from "../../feature/auth/authSlice";
import { useNavigate } from "react-router-dom";
export default function SideBar (){
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(authActions.logout());
    navigate("/login");
  };
  return (
    <div>
      <div
        style={{
          width: 240,
          background:
            "linear-gradient(180deg,rgb(77, 124, 196) 0%,rgb(60, 115, 178) 100%)",
          color: "white",
          padding: 20,
          display: "flex",
          flexDirection: "column",
          minHeight: "100vh",
        }}
      >
        <h4 className="fw-bold mb-4 text-center">Dashboard</h4>

        <button
          className="btn btn-outline-light mb-2 text-start"
          onClick={() => navigate("/manager/dashboard")}
        >
          Home
        </button>

        <button
          className="btn btn-outline-light mb-2 text-start"
          onClick={() => navigate("/manager/create")}
        >
          Novels
        </button>

        <div style={{ flexGrow: 1 }} />

        <button className="btn btn-danger" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </div>
  );
};
