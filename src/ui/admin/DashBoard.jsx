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
import EditUserModal from "./EditUserModal";

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
            dispatch({ type: "auth/logout" });
        }
    };

    const handleDeleteUser = async (userId) => {
        if (!window.confirm(`Are you sure you want to delete user ID ${userId}?`)) return;

        try {
            await instance.delete(`users/${userId}`);

            setUsers((prev) => {
                const updated = prev.filter((u) => u.id !== userId);

                const start = (page - 1) * perPage;
                if (updated.slice(start).length === 0 && page > 1) {
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
            setUsers((prev) =>
                prev.map((u) => (u.id === updatedUser.id ? updatedUser : u))
            );
        }
    };

    const renderRoleBadge = (role) => {
        if (!role) return <Badge bg="secondary">N/A</Badge>;

        let variant = "secondary";
        if (role === "admin") variant = "danger";
        else if (role === "manager") variant = "warning";
        else if (role === "reader") variant = "primary";

        return <Badge bg={variant}>{role.toUpperCase()}</Badge>;
    };

    const processedList = useMemo(() => {
        let result = [...users];

        if (search) {
            const lower = search.toLowerCase();
            result = result.filter(
                (u) =>
                    u.userName?.toLowerCase().includes(lower) ||
                    u.email?.toLowerCase().includes(lower)
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
        }

        return result;
    }, [users, search, roleFilter, sort]);

    const totalPages = Math.ceil(processedList.length / perPage);
    const displayList = processedList.slice((page - 1) * perPage, page * perPage);

    return (
        <>
            <Container fluid className="p-5">
                <Card className="p-4 mb-4" style={{ borderRadius: 20 }}>
                    <h2 className="text-center text-primary fw-bold mb-4">User Management</h2>

                    {error && <Alert variant="danger">{error}</Alert>}

                    <Row className="g-3">
                        <Col md={4}>
                            <FormControl
                                placeholder="Search..."
                                value={search}
                                onChange={(e) => {
                                    setSearch(e.target.value);
                                    setPage(1);
                                }}
                                className="rounded-pill"
                            />
                        </Col>

                        <Col md={4}>
                            <Form.Select
                                className="rounded-pill"
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
                                value={sort}
                                onChange={(e) => setSort(e.target.value)}
                            >
                                <option value="id-asc">Sort by ID (Asc)</option>
                                <option value="id-desc">Sort by ID (Desc)</option>
                                <option value="name-asc">Name (A-Z)</option>
                                <option value="name-desc">Name (Z-A)</option>
                            </Form.Select>
                        </Col>
                    </Row>
                </Card>

                <Card className="p-3" style={{ borderRadius: 20 }}>
                    {isLoading ? (
                        <div className="text-center py-5">
                            <Spinner animation="border" />
                        </div>
                    ) : (
                        <>
                            <Table hover bordered responsive>
                                <thead className="bg-primary text-white">
                                <tr className="text-center">
                                    <th>ID</th>
                                    <th>Username</th>
                                    <th>Email</th>
                                    <th>Role</th>
                                    <th>Actions</th>
                                </tr>
                                </thead>
                                <tbody>
                                {displayList.length ? (
                                    displayList.map((u) => (
                                        <tr key={u.id}>
                                            <td className="text-center fw-bold">{u.id}</td>
                                            <td>{u.userName}</td>
                                            <td>{u.email}</td>
                                            <td className="text-center">
                                                {renderRoleBadge(u.role)}
                                            </td>
                                            <td className="text-center">
                                                <Badge
                                                    bg="info"
                                                    className="me-2"
                                                    style={{ cursor: "pointer" }}
                                                    onClick={() => handleEditUser(u)}
                                                >
                                                    Edit
                                                </Badge>
                                                <Badge
                                                    bg="danger"
                                                    style={{ cursor: "pointer" }}
                                                    onClick={() => handleDeleteUser(u.id)}
                                                >
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

                            {totalPages > 1 && (
                                <Pagination className="justify-content-center mt-3">
                                    <Pagination.First onClick={() => setPage(1)} />
                                    <Pagination.Prev
                                        onClick={() => setPage(page - 1)}
                                        disabled={page === 1}
                                    />

                                    {Array.from({ length: totalPages }, (_, i) => (
                                        <Pagination.Item
                                            key={i}
                                            active={page === i + 1}
                                            onClick={() => setPage(i + 1)}
                                        >
                                            {i + 1}
                                        </Pagination.Item>
                                    ))}

                                    <Pagination.Next
                                        onClick={() => setPage(page + 1)}
                                        disabled={page === totalPages}
                                    />
                                    <Pagination.Last
                                        onClick={() => setPage(totalPages)}
                                        disabled={page === totalPages}
                                    />
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
};

export default Dashboard;