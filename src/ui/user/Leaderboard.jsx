import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Table, Dropdown, ButtonGroup, Container } from "react-bootstrap";
import Navbar from "./nvarbar";
import { authActions } from "../../feature/auth/authSlice";

const API_URL = "http://localhost:9999";

export default function Leaderboard() {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { currentUser } = useSelector((state) => state.auth);

    const [novels, setNovels] = useState([]);
    const [chapters, setChapters] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sortBy, setSortBy] = useState('views');

    useEffect(() => {
        setLoading(true);
        Promise.all([
            fetch(`${API_URL}/novels`).then(r => r.json()),
            fetch(`${API_URL}/chapters`).then(r => r.json())
        ])
            .then(([novelsData, chaptersData]) => {
                setNovels(novelsData || []);
                setChapters(chaptersData || []);
            })
            .catch(err => {
                console.error("Fetch error", err);
            })
            .finally(() => setLoading(false));
    }, []);

    const getNovelId = useCallback((novel) => {
        return novel?.id ?? novel?.novelId ?? null;
    }, []);

    const getViews = useCallback((novel) => {
        if (novel.views != null) return novel.views;
        const id = getNovelId(novel);
        const related = chapters.filter(c => c.novelId === id || c.novelId === novel.novelId);
        return related.reduce((s, c) => s + (Number(c.views) || 0), 0);
    }, [chapters, getNovelId]);

    const getChapterCount = useCallback((novel) => {
        if (novel.totalChapters != null) return novel.totalChapters;
        const id = getNovelId(novel);
        return chapters.filter(c => c.novelId === id || c.novelId === novel.novelId).length;
    }, [chapters, getNovelId]);


    const rankedNovels = useMemo(() => {
        const novelsWithStats = novels.map(n => ({
            ...n,
            views: getViews(n), 
            chapterCount: getChapterCount(n)
        }));

        const qualifiedNovels = novelsWithStats.filter(n => n.rate > 0 || n.views > 100);

        const sortedList = qualifiedNovels.sort((a, b) => {
            if (sortBy === 'rate') {
                return (b.rate || 0) - (a.rate || 0);
            }
            if (sortBy === 'chapters') {
                return (b.chapterCount || 0) - (a.chapterCount || 0);
            }
            return (b.views || 0) - (a.views || 0);
        });

        return sortedList.slice(0, 10);
    }, [novels, sortBy, getViews, getChapterCount]);


    const getTitle = () => {
        if (sortBy === 'rate') return 'Top 10 - Highest Rated';
        if (sortBy === 'chapters') return 'Top 10 - Most Chapters';
        return 'Top 10 - Trending (Views)';
    }

    function handleLogout() {
        dispatch(authActions.logout());
        navigate("/login");
    }

    function goToProfile() {
        navigate("/profile");
    }

    if (loading) return <div className="p-5 text-center">Loading Leaderboard...</div>;

    return (
        <>
            <Navbar 
                currentUser={currentUser}
                goToProfile={goToProfile}
                handleLogout={handleLogout}
            />
            <Container className="py-5" style={{ maxWidth: 1000 }}>
                <h1 className="fw-bold mb-4" style={{ color: '#0d6efd' }}>
                    🏆 {getTitle()}
                </h1>

                <div className="d-flex justify-content-end mb-3">
                    <Dropdown as={ButtonGroup}>
                        <Dropdown.Toggle variant="secondary" id="dropdown-split-basic">
                            Sort By: {sortBy.charAt(0).toUpperCase() + sortBy.slice(1)}
                        </Dropdown.Toggle>

                        <Dropdown.Menu>
                            <Dropdown.Item onClick={() => setSortBy('views')}>Views / Trending</Dropdown.Item>
                            <Dropdown.Item onClick={() => setSortBy('rate')}>Rating</Dropdown.Item>
                            <Dropdown.Item onClick={() => setSortBy('chapters')}>Total Chapters</Dropdown.Item>
                        </Dropdown.Menu>
                    </Dropdown>
                </div>

                <Table striped bordered hover responsive className="shadow-sm">
                    <thead className="table-dark">
                        <tr className="text-center">
                            <th>Rank</th>
                            <th className="text-start">Novel Title</th>
                            <th>Author</th>
                            <th>Rating</th>
                            <th>Views</th>
                            <th>Chapters</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rankedNovels.map((n, index) => (
                            <tr key={n.id} style={{ backgroundColor: index < 3 ? '#fff3cd' : 'white' }}>
                                <td className="text-center fw-bold" 
                                    style={{ color: index === 0 ? '#ffc107' : index === 1 ? '#adb5bd' : index === 2 ? '#cd7f32' : 'inherit', fontSize: index < 3 ? '1.1em' : 'inherit' }}
                                >
                                    {index + 1}
                                </td>
                                <td>
                                    <Link to={`/novel/${n.id}`} className="fw-bold" style={{ textDecoration: 'none', color: '#444' }}>
                                        {n.novelName}
                                    </Link>
                                </td>
                                <td>{n.author}</td>
                                <td className="text-center">⭐ {n.rate}</td>
                                <td className="text-center">👁️ {n.views.toLocaleString()}</td>
                                <td className="text-center">📚 {n.chapterCount}</td>
                                <td className="text-center">
                                    <Link to={`/novel/${n.id}`} className="btn btn-sm btn-info">
                                        Detail
                                    </Link>
                                </td>
                            </tr>
                        ))}
                        {rankedNovels.length === 0 && (
                            <tr>
                                <td colSpan="7" className="text-center text-muted">No novels data available for ranking.</td>
                            </tr>
                        )}
                    </tbody>
                </Table>
            </Container>
        </>
    );
}