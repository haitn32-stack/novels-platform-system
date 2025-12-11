import { useState } from "react";
import { Nav, Button, Offcanvas } from "react-bootstrap";
import { FiBarChart2, FiUser, FiLogOut, FiMenu } from "react-icons/fi";
import "./SideBar.css";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { authActions } from "../../feature/auth/authSlice";

export default function SideBar({ onNavigate, currentPage }) {
  const [show, setShow] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const routes = [
    { id: "dashboard", label: "Dashboard", icon: <FiBarChart2 size={20} /> },
    { id: "create", label: "Create", icon: <FiUser size={20} /> },
  ];

  const handleNavigation = (pageId) => {
    onNavigate(pageId);
    setShow(false);
  };

  const handleLogout = () => {
    dispatch(authActions.logout());
    navigate("/login");
  };
  return (
    <>
      <Button
        variant="light"
        className="d-lg-none position-fixed top-3 start-3 z-3 sidebar-toggle"
        onClick={() => setShow(true)}
      >
        <FiMenu size={24} />
      </Button>

      <div className="sidebar-desktop d-none d-lg-flex flex-column">
        <div className="sidebar-header text-center py-2 px-2 border-bottom border-light">
          <h5 className="fw-bold text-dark mb-0 font-quintessential">Novels</h5>
        </div>

        <Nav className="flex-column flex-grow-1 p-3 gap-2">
          {routes.map((route) => (
            <Nav.Link
              key={route.id}
              onClick={() => handleNavigation(route.id)}
              className={`nav-item-custom d-flex align-items-center gap-3 px-3 py-3 rounded-3 ${
                currentPage === route.id ? "active" : ""
              }`}
            >
              <span className="icon-wrapper">{route.icon}</span>
              <span className="fw-500">{route.label}</span>
            </Nav.Link>
          ))}
        </Nav>

        <div className="sidebar-footer p-3 border-top border-light">
          <Button
            onClick={handleLogout}
            className="w-100 d-flex align-items-center justify-content-center gap-2 logout-btn fw-500"
            style={{ padding: "10px 0" }}
          >
            <FiLogOut size={18} />
            Logout
          </Button>
        </div>
      </div>

      <Offcanvas
        show={show}
        onHide={() => setShow(false)}
        placement="start"
        className="sidebar-mobile"
      >
        <Offcanvas.Header closeButton className="border-bottom">
          <Offcanvas.Title className="fw-bold">Menu</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body className="d-flex flex-column p-0">
          <Nav className="flex-column flex-grow-1 p-3 gap-2">
            {routes.map((route) => (
              <Nav.Link
                key={route.id}
                onClick={() => handleNavigation(route.id)}
                className={`nav-item-custom d-flex align-items-center gap-3 px-3 py-3 rounded-3 ${
                  currentPage === route.id ? "active" : ""
                }`}
              >
                <span className="icon-wrapper">{route.icon}</span>
                <span className="fw-500">{route.label}</span>
              </Nav.Link>
            ))}
          </Nav>

          <div className="p-3 border-top mt-auto">
            <Button
              onClick={handleLogout}
              className="w-100 d-flex align-items-center justify-content-center gap-2 logout-btn fw-500"
              style={{ padding: "10px 0" }}
            >
              <FiLogOut size={18} />
              Logout
            </Button>
          </div>
        </Offcanvas.Body>
      </Offcanvas>
    </>
  );
}
