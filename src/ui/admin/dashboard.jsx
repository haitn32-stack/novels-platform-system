import React, { useState, useEffect, useMemo } from "react";
import {
    Container,
    Card,
    Row,
    Col,
    Form,
    FormControl,
    Table,
    Pagination,
    Spinner,
    Badge,
    Alert,
    Button,
    Navbar,
} from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { instance } from "../../utils/axios";
import EditUserModal from "./EditUserModel";

const Dashboard = () => {
    const dispatch = useDispatch();
    const { currentUser } = useSelector((state) => state.auth);

    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [search, setSearch] = useState("");
    const [roleFilter, setRoleFilter] = useState("All");
    const [sort, setSort] = useState("id-asc");
    const [page, setPage] = useState(1);
    const perPage = 5;

    const [isEditing, setIsEditing] = useState(false);
    const [currentEditUser, setCurrentEditUser] = useState(null);

    const fetchUsers = async () => {
        setIsLoading(true);
        try {
            const res = await instance.get("users");
            setUsers(res.data);
            setError(null);
        } catch (err) {
            setError("Failed to load user list: " + err.message);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleLogout = () => {
        if (window.confirm("Are you sure you want to logout?")) {
            localStorage.removeItem("token");
            localStorage.removeItem("user");

            // CRITICAL FIX: Rely on AdminRoute to navigate
            dispatch({ type: "auth/logout" }); 
        }
    };

    const handleDeleteUser = async (userId) => {
        if (!window.confirm(`Are you sure you want to delete user ID ${userId}?`)) {
            return;
        }

        try {
            await instance.delete(`users/${userId}`);

            setUsers((prevUsers) => {
                const updated = prevUsers.filter((u) => u.id !== userId);

                const start = (page - 1) * perPage;
                const end = page * perPage;
                if (updated.slice(start, end).length === 0 && page > 1) {
                    setPage((p) => p - 1);
                }

                return updated;
            });
        } catch (err) {
            alert(`Error deleting user ID ${userId}: ${err.message}`);
        }
    };

    const handleEditUser = (user) => {
        setCurrentEditUser(user);
        setIsEditing(true);
    };

    const handleCloseEdit = (updatedUser = null) => {
        setIsEditing(false);
        setCurrentEditUser(null);
        if (updatedUser) {
            setUsers(users.map(u => u.id === updatedUser.id ? updatedUser : u));
        }
    };

    const renderRoleBadge = (role) => {
        if (!role) {
            return <Badge bg="secondary">N/A</Badge>;
        }

        let variant = "secondary";
        if (role === "admin") variant = "danger";
        else if (role === "manager") variant = "warning";
        else if (role === "reader") variant = "primary";

        return <Badge bg={variant}>{role.toUpperCase()}</Badge>;
    };

    const processedList = useMemo(() => {
        let result = [...users];

        if (search) {
            const lowerSearch = search.toLowerCase();
            result = result.filter(
                (u) =>
                    u.userName?.toLowerCase().includes(lowerSearch) ||
                    u.email?.toLowerCase().includes(lowerSearch)
            );
        }

        if (roleFilter !== "All") {
            result = result.filter((u) => u.role === roleFilter);
        }

        switch (sort) {
            case "name-asc":
                result.sort((a, b) => (a.userName || "").localeCompare(b.userName || ""));
                break;
            case "name-desc":
                result.sort((a, b) => (b.userName || "").localeCompare(a.userName || ""));
                break;
            case "id-desc":
                result.sort((a, b) => Number(b.id) - Number(a.id));
                break;
            case "id-asc":
            default:
                result.sort((a, b) => Number(a.id) - Number(b.id));
                break;
        }

        return result;
    }, [users, search, roleFilter, sort]);

    const totalPages = Math.ceil(processedList.length / perPage);
    const displayList = processedList.slice((page - 1) * perPage, page * perPage);

    return (
        <>
            <Navbar
                bg="primary"
                variant="dark"
                className="px-4 py-3 shadow-sm"
                style={{ position: 'sticky', top: 0, zIndex: 1000 }}
            >
                <Container fluid>
                    <Navbar.Brand className="fw-bold">
                        <i className="bi bi-speedometer2 me-2"></i>
                        Admin Dashboard
                    </Navbar.Brand>
                    <div className="d-flex align-items-center gap-3">
                        <div className="text-white">
                            <small>Welcome, </small>
                            <strong>{currentUser?.userName || "Admin"}</strong>
                            <Badge bg="danger" className="ms-2">
                                {currentUser?.role?.toUpperCase() || "ADMIN"}
                            </Badge>
                        </div>
                        <Button
                            variant="light"
                            size="sm"
                            onClick={handleLogout}
                            className="rounded-pill px-3"
                        >
                            <i className="bi bi-box-arrow-right me-1"></i>
                            Logout
                        </Button>
                    </div>
                </Container>
            </Navbar>

            <Container
                fluid
                className="p-5"
                style={{
                    background: "linear-gradient(135deg, #e6f2ff, #ffffff)",
                    minHeight: "100vh",
                }}
            >
                <Card
                    className="p-4 mb-4"
                    style={{ borderRadius: 20, boxShadow: "0 5px 15px rgba(0,0,0,0.1)" }}
                >
                    <h2 className="text-center text-primary fw-bold mb-4">
                        User Management
                    </h2>

                    {error && <Alert variant="danger">{error}</Alert>}

                    <Row className="g-3">
                        <Col md={4}>
                            <FormControl
                                placeholder="Search by username or email..."
                                value={search}
                                onChange={(e) => {
                                    setSearch(e.target.value);
                                    setPage(1);
                                }}
                                className="rounded-pill"
                                style={{ borderColor: "#cbe1ff" }}
                            />
                        </Col>

                        <Col md={4}>
                            <Form.Select
                                className="rounded-pill"
                                style={{ borderColor: "#cbe1ff" }}
                                value={roleFilter}
                                onChange={(e) => {
                                    setRoleFilter(e.target.value);
                                    setPage(1);
                                }}
                            >
                                <option value="All">All Roles</option>
                                <option value="admin">Admin</option>
                                <option value="manager">Manager</option>
                                <option value="reader">Reader</option>
                            </Form.Select>
                        </Col>

                        <Col md={4}>
                            <Form.Select
                                className="rounded-pill"
                                style={{ borderColor: "#cbe1ff" }}
                                value={sort}
                                onChange={(e) => setSort(e.target.value)}
                            >
                                <option value="id-asc">Sort by ID (Ascending)</option>
                                <option value="id-desc">Sort by ID (Descending)</option>
                                <option value="name-asc">Name (A-Z)</option>
                                <option value="name-desc">Name (Z-A)</option>
                            </Form.Select>
                        </Col>
                    </Row>
                </Card>

                <Card
                    className="p-3"
                    style={{ borderRadius: 20, boxShadow: "0 5px 15px rgba(0,0,0,0.1)" }}
                >
                    {isLoading ? (
                        <div className="text-center py-5">
                            <Spinner animation="border" variant="primary" />
                            <p className="mt-2 text-muted">Loading data...</p>
                        </div>
                    ) : (
                        <>
                            <Table hover bordered responsive className="align-middle">
                                <thead style={{ background: "#0d6efd", color: "white" }}>
                                    <tr className="text-center">
                                        <th>ID</th>
                                        <th>Username</th>
                                        <th>Email</th>
                                        <th>Role</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {displayList.length > 0 ? (
                                        displayList.map((user) => (
                                            <tr
                                                key={user.id}
                                                style={{ cursor: "pointer", transition: "0.2s" }}
                                                onMouseEnter={(e) =>
                                                    (e.currentTarget.style.background = "#eaf4ff")
                                                }
                                                onMouseLeave={(e) =>
                                                    (e.currentTarget.style.background = "white")
                                                }
                                            >
                                                <td className="text-center fw-bold">{user.id}</td>
                                                <td>{user.userName}</td>
                                                <td>{user.email}</td>
                                                <td className="text-center">
                                                    {renderRoleBadge(user.role)}
                                                </td>
                                                <td className="text-center">
                                                    <Badge
                                                        bg="info"
                                                        className="me-2"
                                                        style={{ cursor: 'pointer' }}
                                                        onClick={() => handleEditUser(user)}
                                                    >
                                                        <i className="bi bi-pencil-square me-1"></i>
                                                        Edit
                                                    </Badge>
                                                    <Badge
                                                        bg="danger"
                                                        style={{ cursor: 'pointer' }}
                                                        onClick={() => handleDeleteUser(user.id)}
                                                    >
                                                        <i className="bi bi-trash me-1"></i>
                                                        Delete
                                                    </Badge>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="5" className="text-center text-muted py-4">
                                                No users found.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </Table>

                            {totalPages > 0 && (
                                <Pagination className="justify-content-center mt-3">
                                    <Pagination.First onClick={() => setPage(1)} disabled={page === 1} />
                                    <Pagination.Prev onClick={() => setPage(page - 1)} disabled={page === 1} />

                                    {[...Array(totalPages)].map((_, i) => (
                                        <Pagination.Item
                                            key={i}
                                            active={page === i + 1}
                                            onClick={() => setPage(i + 1)}
                                        >
                                            {i + 1}
                                        </Pagination.Item>
                                    ))}

                                    <Pagination.Next onClick={() => setPage(page + 1)} disabled={page === totalPages} />
                                    <Pagination.Last onClick={() => setPage(totalPages)} disabled={page === totalPages} />
                                </Pagination>
                            )}
                        </>
                    )}
                </Card>

                {currentEditUser && (
                    <EditUserModal
                        show={isEditing}
                        user={currentEditUser}
                        handleClose={handleCloseEdit}
                    />
                )}
            </Container>
        </>
    );
}

export default Dashboard;