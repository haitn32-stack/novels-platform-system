import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Link, useNavigate, Outlet } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import Navbar from "./nvarbar";
import { authActions } from "../../feature/auth/authSlice";

const NovelCard = ({ novel, id, chapterCount, views, isFav, toggleFavorite }) => {
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

const RankingSection = ({ novels, getNovelId, getChapterCount, limit = 6, title }) => {
    const topNovels = novels
        .filter(n => n.rate > 0)
        .sort((a, b) => (b.rate || 0) - (a.rate || 0))
        .slice(0, limit);

    if (topNovels.length === 0) return null;

    return (
        <div className="card shadow-sm mb-4" style={{ borderRadius: '12px', border: '1px solid #f0f0f0', overflow: 'hidden' }}>
            <div style={{ padding: '20px 20px 15px' }}>
                <h3 className="mb-0 text-dark" style={{ borderBottom: '2px solid #ff6347', paddingBottom: '8px', fontSize: '1.3rem', fontWeight: '600' }}>
                    {title}
                </h3>
            </div>
            <div>
                {topNovels.map((novel, index) => {
                    const id = getNovelId(novel);
                    const chapterCount = getChapterCount(novel);

                    return (
                        <Link 
                            key={id} 
                            to={`/novel/${id}`} 
                            className="d-flex align-items-center text-decoration-none text-dark"
                            style={{
                                padding: '12px 20px',
                                borderBottom: index < topNovels.length - 1 ? '1px solid #f5f5f5' : 'none',
                                transition: 'background-color 0.2s',
                                backgroundColor: index < 3 ? '#fffaf5' : 'transparent'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = index < 3 ? '#fffaf5' : 'transparent'}
                        >
                            <div style={{ fontSize: '1.1rem', fontWeight: '700', minWidth: '28px', color: index < 3 ? '#ff6347' : '#aaa' }}>
                                {index + 1}.
                            </div>
                            <img
                                src={novel.imgLink || novel.img || "https://via.placeholder.com/60x90?text=No+Image"}
                                alt={novel.novelName}
                                style={{ 
                                    width: 48, 
                                    height: 70, 
                                    objectFit: 'cover', 
                                    borderRadius: '6px', 
                                    margin: '0 12px',
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                }}
                            />
                            <div style={{ flexGrow: 1, minWidth: 0 }}>
                                <h6 className="m-0 text-truncate" style={{ color: '#333', fontSize: '0.95rem', fontWeight: '600', marginBottom: '4px' }}>
                                    {novel.novelName} {index < 3 && '⭐'}
                                </h6>
                                <div style={{ fontSize: '0.8rem', color: '#888' }}>
                                    <span className="text-truncate d-inline-block" style={{ maxWidth: '120px' }}>{novel.author || "Unknown"}</span>
                                    <span> | 📚 {chapterCount}</span>
                                </div>
                            </div>
                            <div style={{ fontSize: '0.95rem', color: '#ff6347', fontWeight: '600', marginLeft: '8px' }}>
                                {novel.rate ?? 0}
                            </div>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
};


export default function HomepageUser() {
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

    const [query, setQuery] = useState("");
    const [selectedGenre, setSelectedGenre] = useState("All");
    const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);

    const fetchNovels = () => fetch("http://localhost:9999/novels").then(r => r.json());
    const fetchChapters = () => fetch("http://localhost:9999/chapters").then(r => r.json());

    useEffect(() => {
        setLoading(true);
        setError(null);

        Promise.all([fetchNovels(), fetchChapters()])
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

    const allGenres = useMemo(() => {
        const s = new Set();
        novels.forEach(n => n.genres?.forEach(g => s.add(g)));
        return ["All", ...s];
    }, [novels]);

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

                localStorage.setItem("user", JSON.stringify(updatedUser));

                dispatch(authActions.loginSuccess(updatedUser));

            } catch (e) {
                console.warn("Cannot update user data in localStorage", e);
            }

            return next;
        });
    };

    const filteredNovels = useMemo(() => {
        return novels
            .filter(n => {
                const id = getNovelId(n);
                if (showOnlyFavorites && !favorites.includes(id)) return false;

                const name = (n.novelName || n.name || "").toString().toLowerCase();
                const desc = (n.description || "").toString().toLowerCase();
                const q = query.toLowerCase();

                const matchQuery = q === "" || name.includes(q) || desc.includes(q);
                const matchGenre = selectedGenre === "All" || n.genres?.includes(selectedGenre);

                return matchQuery && matchGenre;
            })
            .sort((a, b) => (b.rate || 0) - (a.rate || 0));
    }, [novels, query, selectedGenre, favorites, showOnlyFavorites, getNovelId]);

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

    function handleLogout() {
        dispatch(authActions.logout());
        navigate("/login");
    }

    function goToProfile() {
        navigate("/profile");
    }

    const featuredNovel = useMemo(() => {
        const novelsWithStats = novels.map(n => ({
            ...n,
            views: getViews(n),
            chapterCount: getChapterCount(n)
        }));

        const qualifiedNovels = novelsWithStats.filter(n => n.views > 0 && n.chapterCount > 0);

        if (qualifiedNovels.length > 0) {
            return qualifiedNovels.sort((a, b) => {
                if (b.rate !== a.rate) {
                    return (b.rate || 0) - (a.rate || 0);
                }
                return (b.views || 0) - (a.views || 0);
            })[0];
        }

        return null;
        // eslint-disable-next-line
    }, [novels, chapters]);

    if (loading) return <div className="p-5 text-center">Loading data...</div>;
    if (error) return <div className="p-5 text-danger text-center">Error: {error}</div>;


    return (
        <>
            <Navbar
                query={query}
                setQuery={setQuery}
                showOnlyFavorites={showOnlyFavorites}
                setShowOnlyFavorites={setShowOnlyFavorites}
                currentUser={currentUser}
                goToProfile={goToProfile}
                handleLogout={handleLogout}
            />

            <div className="container py-4">

                {featuredNovel && (
                    <div className="p-5 mb-4 text-white rounded shadow-lg"
                        style={{
                            backgroundImage: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.7)), url(${featuredNovel.imgLink || 'https://via.placeholder.com/1200x300?text=Featured+Novel'})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            borderRadius: '12px'
                        }}>
                        <h1 className="display-5 fw-bold">{featuredNovel.novelName}</h1>
                        <p className="lead">{featuredNovel.description?.substring(0, 150)}...</p>
                        <Link to={`/novel/${getNovelId(featuredNovel)}`} className="btn btn-warning btn-lg">Read Now</Link>
                    </div>
                )}


                <div className="row g-4">

                    <div className="col-lg-3 order-lg-last">
                        <RankingSection
                            novels={novels}
                            getNovelId={getNovelId}
                            getChapterCount={getChapterCount}
                            title="Top Rated Novels"
                            limit={6}
                        />

                        <RankingSection
                            novels={novels}
                            getNovelId={getNovelId}
                            getChapterCount={getChapterCount}
                            title="Latest Releases"
                            limit={6}
                        />
                    </div>

                    <div className="col-lg-9 order-lg-first">
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <h2 className="m-0" style={{ color: '#444' }}>
                                {showOnlyFavorites ? "My Favorites" : "All Novels"}
                            </h2>

                            <div className="d-flex align-items-center gap-3">
                                <label className="m-0 text-muted small">Filter by Genre:</label>
                                <select
                                    className="form-select"
                                    value={selectedGenre}
                                    onChange={(e) => setSelectedGenre(e.target.value)}
                                    style={{ minWidth: 160, borderRadius: '8px' }}
                                >
                                    {allGenres.map(g => <option key={g} value={g}>{g}</option>)}
                                </select>
                            </div>
                        </div>

                        <div className="row g-4">
                            {filteredNovels.map(novel => {
                                const id = getNovelId(novel);
                                const chapterCount = getChapterCount(novel);
                                const views = getViews(novel);
                                const isFav = id ? favorites.includes(id) : false;

                                return (
                                    <div key={id ?? novel.novelId} className="col-12 col-sm-6 col-md-4 col-lg-3">
                                        <NovelCard
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

                            {filteredNovels.length === 0 && (
                                <div className="col-12">
                                    <div className="alert alert-info">No novels found matching criteria.</div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            <Outlet />
        </>
    );
}