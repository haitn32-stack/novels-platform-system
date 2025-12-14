import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import Navbar from "./nvarbar";
import { authActions } from "../../feature/auth/authSlice";

const API_URL = "http://localhost:9999";

const FavoriteNovelCard = ({ novel, id, chapterCount, views, isFav, toggleFavorite }) => {
    const displayGenres = novel.genres ? novel.genres.slice(0, 2).join(', ') : 'Unknown';

    return (
        <div className="card h-100 shadow-sm" style={{ border: '1px solid #e0e0e0', borderRadius: '10px', transition: 'transform 0.2s', overflow: 'hidden' }}>
            <div style={{ position: "relative" }}>
                <img
                    src={novel.imgLink || novel.img || "https://via.placeholder.com/300x400?text=No+Image"}
                    className="card-img-top"
                    alt={novel.novelName}
                    style={{ height: 250, objectFit: "cover", borderBottom: '1px solid #eee' }}
                />
                <div style={{ position: "absolute", left: 8, top: 8, display: "flex", gap: 8 }}>
                    <span className="badge bg-danger" title="Rating">⭐ {novel.rate ?? 0}</span>
                    <span className="badge bg-dark" title="Views">👁️ {views}</span>
                </div>

                <button
                    onClick={() => toggleFavorite(novel)}
                    className={`btn btn-sm ${isFav ? "btn-warning" : "btn-outline-light"}`}
                    style={{ position: "absolute", right: 8, top: 8, border: 'none', opacity: 0.9 }}
                    title={isFav ? "Remove from favorites" : "Add to favorites"}
                >
                    {isFav ? "★" : "☆"}
                </button>
            </div>

            <div className="card-body d-flex flex-column" style={{ padding: '15px' }}>
                <h5 className="card-title" style={{ minHeight: 48, fontSize: '1.1rem', fontWeight: 'bold' }}>
                    <Link to={`/novel/${id ?? novel.novelId}`} style={{ textDecoration: 'none', color: '#333' }}>
                        {novel.novelName}
                    </Link>
                </h5>
                <p className="card-text text-muted" style={{ fontSize: 13, flexGrow: 1, marginBottom: '10px' }}>
                    {novel.description?.length > 70 ? `${novel.description.substring(0, 70)}...` : novel.description}
                </p>

                <div className="mb-2" style={{ fontSize: 13, borderTop: '1px dotted #eee', paddingTop: '10px' }}>
                    <p className="m-0 text-secondary text-truncate">
                        <small>{displayGenres}</small>
                    </p>
                    <span className="me-3 text-primary">📚 {chapterCount} chap</span>
                    <span className="text-secondary">👤 {novel.author || "Unknown"}</span>
                </div>

                <Link className="btn btn-sm btn-primary mt-2" to={`/novel/${id ?? novel.novelId}`}>
                    Read Detail
                </Link>
            </div>
        </div>
    );
};


export default function FavoritePage() {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { currentUser } = useSelector((state) => state.auth);

    const [novels, setNovels] = useState([]);
    const [chapters, setChapters] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [favorites, setFavorites] = useState(
        Array.isArray(currentUser?.favourites)
            ? currentUser.favourites
            : Array.isArray(currentUser?.favorites)
                ? currentUser.favorites
                : []
    );

    useEffect(() => {
        setLoading(true);
        setError(null);

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
                setError(err.message || "Fetch error");
            })
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        setFavorites(
            Array.isArray(currentUser?.favourites)
                ? currentUser.favourites
                : Array.isArray(currentUser?.favorites)
                    ? currentUser.favorites
                    : []
        );
    }, [currentUser]);

    const getNovelId = useCallback((novel) => {
        return novel?.id ?? novel?.novelId ?? null;
    }, []);

    const toggleFavorite = (novel) => {
        const id = getNovelId(novel);
        if (!id) return;

        if (!currentUser) {
            localStorage.setItem("afterLoginFavorite", JSON.stringify(id));
            navigate("/login");
            return;
        }

        setFavorites(prev => {
            const exists = prev.includes(id);
            const next = exists ? prev.filter(x => x !== id) : [...prev, id];

            try {
                const updatedUser = { ...currentUser, favourites: next, favorites: next };
                
                // Đồng bộ LocalStorage
                localStorage.setItem("user", JSON.stringify(updatedUser));
                
                // Cập nhật Redux store
                dispatch(authActions.loginSuccess(updatedUser)); 
            } catch (e) {
                console.warn("Cannot update user data in localStorage", e);
            }

            return next;
        });
    };

    const favoriteNovels = useMemo(() => {
        return novels.filter(n => favorites.includes(getNovelId(n)));
    }, [novels, favorites, getNovelId]);


    function getChapterCount(novel) {
        if (novel.totalChapters != null) return novel.totalChapters;
        const id = getNovelId(novel);
        return chapters.filter(c => c.novelId === id || c.novelId === novel.novelId).length;
    }

    function getViews(novel) {
        if (novel.views != null) return novel.views;
        const id = getNovelId(novel);
        const related = chapters.filter(c => c.novelId === id || c.novelId === novel.novelId);
        return related.reduce((s, c) => s + (Number(c.views) || 0), 0);
    }

    // ĐỊNH NGHĨA CÁC HÀM BỊ THIẾU
    function handleLogout() {
        dispatch(authActions.logout());
        navigate("/login");
    }

    function goToProfile() {
        navigate("/profile");
    }

    if (loading) return <div className="p-5 text-center">Loading data...</div>;
    if (error) return <div className="p-5 text-danger text-center">Error: {error}</div>;

    if (!currentUser) {
        return <div className="p-5 text-center">
            <p>Please log in to view your favorites.</p>
            <button className="btn btn-primary" onClick={() => navigate("/login")}>Go to Login</button>
        </div>
    }

    return (
        <>
            <Navbar
                currentUser={currentUser}
                goToProfile={goToProfile}
                handleLogout={handleLogout}
            />

            <div className="container py-5">
                <h1 className="mb-4 fw-bold" style={{ color: '#ff6347', borderBottom: '3px solid #ff6347', paddingBottom: '10px' }}>
                    ★ My Favorite Novels ({favoriteNovels.length})
                </h1>

                {favoriteNovels.length === 0 ? (
                    <div className="alert alert-info text-center p-4">
                        You have not added any novels to your favorites yet.
                        <p className="mt-2">
                            <Link to="/homepageUser" className="btn btn-sm btn-primary">Discover Novels</Link>
                        </p>
                    </div>
                ) : (
                    <div className="row g-4">
                        {favoriteNovels.map(novel => {
                            const id = getNovelId(novel);
                            const chapterCount = getChapterCount(novel);
                            const views = getViews(novel);
                            const isFav = true;

                            return (
                                <div key={id} className="col-12 col-sm-6 col-md-4 col-lg-3">
                                    <FavoriteNovelCard
                                        novel={novel}
                                        id={id}
                                        chapterCount={chapterCount}
                                        views={views}
                                        isFav={isFav}
                                        toggleFavorite={toggleFavorite}
                                    />
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </>
    );
}