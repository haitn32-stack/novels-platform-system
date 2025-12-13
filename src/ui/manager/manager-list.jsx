import React, { useState, useEffect } from "react";
import {
    Container,
    Card,
    Row,
    Col,
    Form,
    FormControl,
    Table,
    Pagination,
} from "react-bootstrap";

import { useDispatch } from "react-redux";
import { authActions } from "../../feature/auth/authSlice";
import { useNavigate } from "react-router-dom";
import SideBar from "./SideBarrr";

export default function NovelManager() {
    const [search, setSearch] = useState("");
    const [genre, setGenre] = useState("All");
    const [sort, setSort] = useState("");
    const [page, setPage] = useState(1);
    const [showDelete, setShowDelete] = useState(false);
    const [selectedNovel, setSelectedNovel] = useState(null);
    const [loading, setLoading] = useState(true);

    const [origin, setOrigin] = useState([]);
    const [list, setList] = useState([]);

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const perPage = 5;

    const fetchData = () => {
        fetch("http://localhost:9999/novels")
            .then((res) => res.json())
            .then((data) => {
                setOrigin(data);
                setList(data);
                setLoading(false);
            })
            .catch((err) => {
                console.error(err);
                setLoading(false);
            });
    }

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        let result = [...origin];

        if (search) {
            result = result.filter((n) =>
                n.novelName.toLowerCase().includes(search.toLowerCase())
            );
        }

        if (genre !== "All") {
            result = result.filter((n) => n.genres.includes(genre));
        }

        if (sort === "views-desc") result.sort((a, b) => b.rate - a.rate);
        if (sort === "views-asc") result.sort((a, b) => a.rate - b.rate);
        if (sort === "") result.sort((a, b) => a.novelName.localeCompare(b.novelName));

        setList(result);
        setPage(1);
    }, [search, genre, sort, origin]);

    const totalPages = Math.ceil(list.length / perPage);
    const display = list.slice((page - 1) * perPage, page * perPage);

    const uniqueGenres = ["All", ...new Set(origin.flatMap((n) => n.genres))];

    // eslint-disable-next-line no-unused-vars
    const handleLogout = () => {
        dispatch(authActions.logout());
        navigate("/login");
    };

    const handleDelete = async () => {
        if (!selectedNovel) return;

        setLoading(true); 
        try {
            await fetch(
                `http://localhost:9999/novels/${selectedNovel.id}`,
                { method: "DELETE" }
            );
            
            fetchData(); 
            setShowDelete(false);
            alert("Deleted Successfully!");
        } catch (error) {
            console.error("Deletion failed:", error);
            setLoading(false);
            alert("Deletion failed!");
        }
    }

    if (loading)
        return (
            <h3 className="text-center mt-5 fw-bold text-primary">Loading...</h3>
        );

    return (
        <div className="d-flex" style={{ minHeight: "100vh" }}>
            <SideBar
                onNavigate={(page) => navigate(`/manager/${page}`)}
                currentPage="dashboard"
            />

            <Container
                fluid
                className="p-5 flex-grow-1"
                style={{
                    background: "linear-gradient(135deg, #e6f2ff, #ffffff)",
                }}
            >
                <Card
                    className="p-4 mb-4"
                    style={{ borderRadius: 20, boxShadow: "0 5px 15px rgba(0,0,0,0.1)" }}
                >
                    <h2 className="text-center text-primary fw-bold mb-4">
                        Novel Manager
                    </h2>

                    <Row className="g-3">
                        <Col md={4}>
                            <FormControl
                                placeholder="Search..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="rounded-pill"
                            />
                        </Col>

                        <Col md={4}>
                            <Form.Select
                                className="rounded-pill"
                                value={genre}
                                onChange={(e) => setGenre(e.target.value)}
                            >
                                {uniqueGenres.map((g, index) => (
                                    <option key={index} value={g}>
                                        {g}
                                    </option>
                                ))}
                            </Form.Select>
                        </Col>

                        <Col md={4}>
                            <Form.Select
                                className="rounded-pill"
                                value={sort}
                                onChange={(e) => setSort(e.target.value)}
                            >
                                <option value="">Sort by Rate</option>
                                <option value="views-desc">High Rate</option>
                                <option value="views-asc">Low Rate</option>
                            </Form.Select>
                        </Col>
                    </Row>
                </Card>

                <Card
                    className="p-3"
                    style={{ borderRadius: 20, boxShadow: "0 5px 15px rgba(0,0,0,0.1)" }}
                >
                    <Table hover bordered responsive>
                        <thead style={{ background: "#0d6efd", color: "white" }}>
                            <tr className="text-center">
                                <th>ID</th> 
                                <th>Title</th>
                                <th>Genres</th>
                                <th>Rate</th>
                                <th>Action</th>
                            </tr>
                        </thead>

                        <tbody>
                            {display.map((n, index) => (
                                <tr key={n.id}>
                                    <td className="text-center fw-bold">{(page - 1) * perPage + index + 1}</td> 
                                    <td>{n.novelName}</td>
                                    <td className="text-center">{n.genres.slice(0, 2).join(", ")}</td>
                                    <td className="text-center">{n.rate}</td>

                                    <td className="text-center">
                                        <button
                                            className="btn btn-sm btn-warning m-1"
                                            onClick={() => navigate(`/manager/update/${n.id}`)}
                                        >
                                            Update
                                        </button>

                                        <button
                                            className="btn btn-sm btn-danger"
                                            onClick={() => {
                                                setSelectedNovel(n);
                                                setShowDelete(true);
                                            }}
                                        >
                                            Delete
                                        </button>

                                        <button
                                            className="btn btn-sm btn-info m-1"
                                            onClick={() => navigate(`/manager/novel/${n.id}`)}
                                        >
                                            Detail
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {display.length === 0 && (
                                <tr>
                                    <td colSpan="5" className="text-center text-muted">No novels found matching the criteria.</td>
                                </tr>
                            )}
                        </tbody>
                    </Table>

                    <Pagination className="justify-content-center mt-3">
                        {[...Array(totalPages)].map((_, i) => (
                            <Pagination.Item
                                key={i}
                                active={page === i + 1}
                                onClick={() => setPage(i + 1)}
                            >
                                {i + 1}
                            </Pagination.Item>
                        ))}
                    </Pagination>
                </Card>

                {showDelete && (
                    <div
                        className="position-fixed top-0 start-0 w-100 h-100"
                        style={{
                            background: "rgba(0,0,0,0.5)",
                            zIndex: 1050,
                        }}
                    >
                        <div
                            className="bg-white p-4 rounded"
                            style={{
                                width: 400,
                                top: "30%",
                                left: "50%",
                                position: "absolute",
                                transform: "translateX(-50%)",
                            }}
                        >
                            <h4 className="text-danger fw-bold text-center">
                                Confirm Delete
                            </h4>

                            <p className="text-center">
                                Are you sure you want to delete: <br />
                                <b>{selectedNovel?.novelName}</b>
                            </p>

                            <div className="d-flex justify-content-center gap-3 mt-3">
                                <button
                                    className="btn btn-secondary"
                                    onClick={() => setShowDelete(false)}
                                >
                                    Cancel
                                </button>

                                <button
                                    className="btn btn-danger"
                                    onClick={handleDelete}
                                >
                                    Confirm Delete
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </Container>
        </div>
    );
}