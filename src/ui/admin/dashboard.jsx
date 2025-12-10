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
    Alert
} from "react-bootstrap";
import { instance } from "../../utils/axios"; // Import axios instance

const Dashboard = () => {
    // 1. State lưu dữ liệu từ API
    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    // 2. State cho bộ lọc
    const [search, setSearch] = useState("");
    const [roleFilter, setRoleFilter] = useState("All");
    const [sort, setSort] = useState("id-asc");
    const [page, setPage] = useState(1);

    const perPage = 5; // Số user mỗi trang

    // 3. Gọi API lấy danh sách User khi component mount
    useEffect(() => {
        const fetchUsers = async () => {
            setIsLoading(true);
            try {
                const res = await instance.get("users");
                setUsers(res.data);
            } catch (err) {
                setError("Không thể tải danh sách người dùng: " + err.message);
            } finally {
                setIsLoading(false);
            }
        };
        fetchUsers();
    }, []);

    // 4. Xử lý Logic: Search -> Filter -> Sort (Dùng useMemo để tối ưu)
    const processedList = useMemo(() => {
        let result = [...users];

        // a. Search (theo userName hoặc email)
        if (search) {
            const lowerSearch = search.toLowerCase();
            result = result.filter(
                (u) =>
                    u.userName.toLowerCase().includes(lowerSearch) ||
                    u.email.toLowerCase().includes(lowerSearch)
            );
        }

        // b. Filter theo Role
        if (roleFilter !== "All") {
            result = result.filter((u) => u.roles === roleFilter);
        }

        // c. Sort
        switch (sort) {
            case "name-asc":
                result.sort((a, b) => a.userName.localeCompare(b.userName));
                break;
            case "name-desc":
                result.sort((a, b) => b.userName.localeCompare(a.userName));
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

    // 5. Pagination Logic
    const totalPages = Math.ceil(processedList.length / perPage);
    const displayList = processedList.slice((page - 1) * perPage, page * perPage);

    // Hàm render Badge cho Role đẹp hơn
    const renderRoleBadge = (role) => {
        let variant = "secondary";
        if (role === "admin") variant = "danger";
        else if (role === "manager") variant = "warning";
        else if (role === "reader") variant = "primary";

        return <Badge bg={variant}>{role.toUpperCase()}</Badge>;
    };

    return (
        <Container
            fluid // Dùng fluid để rộng hơn chút cho Dashboard
            className="p-5"
            style={{
                background: "linear-gradient(135deg, #e6f2ff, #ffffff)",
                minHeight: "100vh",
            }}
        >
            {/* --- HEADER & FILTERS --- */}
            <Card
                className="p-4 mb-4"
                style={{ borderRadius: 20, boxShadow: "0 5px 15px rgba(0,0,0,0.1)" }}
            >
                <h2 className="text-center text-primary fw-bold mb-4">
                    Admin User Management
                </h2>

                {error && <Alert variant="danger">{error}</Alert>}

                <Row className="g-3">
                    {/* Search Box */}
                    <Col md={4}>
                        <FormControl
                            placeholder="Search by username or email..."
                            value={search}
                            onChange={(e) => {
                                setSearch(e.target.value);
                                setPage(1); // Reset về trang 1 khi search
                            }}
                            className="rounded-pill"
                            style={{ borderColor: "#cbe1ff" }}
                        />
                    </Col>

                    {/* Filter Role */}
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

                    {/* Sort Options */}
                    <Col md={4}>
                        <Form.Select
                            className="rounded-pill"
                            style={{ borderColor: "#cbe1ff" }}
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

            {/* --- DATA TABLE --- */}
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
                                                {renderRoleBadge(user.roles)}
                                            </td>
                                            <td className="text-center">
                                                {/* Placeholder nút bấm */}
                                                <Badge bg="info" className="me-2" style={{ cursor: 'pointer' }}>Edit</Badge>
                                                <Badge bg="danger" style={{ cursor: 'pointer' }}>Delete</Badge>
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

                        {/* Pagination */}
                        {totalPages > 0 && (
                            <Pagination className="justify-content-center mt-3">
                                <Pagination.First onClick={() => setPage(1)} disabled={page === 1} />
                                <Pagination.Prev onClick={() => setPage(page - 1)} disabled={page === 1} />

                                {[...Array(totalPages)].map((_, i) => (
                                    <Pagination.Item
                                        key={i}
                                        active={page === i + 1}
                                        onClick={() => setPage(i + 1)}
                                        className="rounded-pill"
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
        </Container>
    );
}

export default Dashboard;