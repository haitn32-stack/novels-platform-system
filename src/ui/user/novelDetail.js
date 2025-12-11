import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Navbar from "./nvarbar";

export default function NovelDetail() {
    const { novelId } = useParams(); // e.g. "n002"
    const navigate = useNavigate();

    const [novel, setNovel] = useState(null);
    const [chapters, setChapters] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState(null);
    const [favorites, setFavorites] = useState([]);

    useEffect(() => {
        // load currentUser (if any)
        try {
            const saved = JSON.parse(localStorage.getItem("currentUser"));
            if (saved) {
                setCurrentUser(saved);
                const favs = saved.favourites || saved.favorites || [];
                setFavorites(favs);
            }
        } catch (e) { /* ignore */ }

        // fetch novels + chapters from json-server
        Promise.all([
            fetch("http://localhost:9999/novels").then(r => r.json()),
            fetch("http://localhost:9999/chapters").then(r => r.json())
        ])
            .then(([novelList, chapterList]) => {
                const n = novelList.find(v => String(v.novelId) === String(novelId) || String(v.id) === String(novelId));
                setNovel(n || null);

                const ch = chapterList.filter(c => String(c.novelId) === String(novelId));
                setChapters(ch);
            })
            .catch(err => {
                console.error("Fetch error", err);
            })
            .finally(() => setLoading(false));
    }, [novelId]);

    function toggleFavorite() {
        if (!currentUser) {
            localStorage.setItem("afterLoginFavorite", JSON.stringify(novelId));
            navigate("/login");
            return;
        }

        setFavorites(prev => {
            const exists = prev.includes(novelId);
            const next = exists ? prev.filter(x => x !== novelId) : [...prev, novelId];

            const updatedUser = { ...currentUser, favourites: next, favorites: next };
            localStorage.setItem("currentUser", JSON.stringify(updatedUser));
            setCurrentUser(updatedUser);

            return next;
        });
    }

    if (loading) return <div className="p-4">Loading...</div>;
    if (!novel) return <div className="p-4 text-danger">Not Found!</div>;

    const isFav = favorites.includes(novelId);
    function computeAvatarSrc(user) {
        if (!user) return null;
        const raw = user.avatar || user.img || user.avatarUrl || "";
        const uiAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.userName || "User")}&background=0D6EFD&color=fff&size=64`;
        if (!raw) return uiAvatar;
        if (/^https?:\/\//i.test(raw)) return raw;
        if (raw.startsWith("/")) return raw;
        const publicBase = process.env.PUBLIC_URL || "";
        return `${publicBase}/${raw}`.replace(/([^:]\/)\/+/g, "$1");
    }

    function goToProfile() {
        navigate("/profile");
    }

    function handleLogout() {
        localStorage.removeItem("currentUser");
        setCurrentUser(null);
        setFavorites([]);
        navigate("/");
    }
    return (
        <>
            <Navbar
                query=""
                setQuery={() => { }}
                showOnlyFavorites={false}
                setShowOnlyFavorites={() => { }}
                currentUser={currentUser}
                computeAvatarSrc={computeAvatarSrc}
                goToProfile={goToProfile}
                handleLogout={handleLogout}
            />
            <div className="container py-4">
                <div className="d-flex justify-content-between align-items-center">
                    <h1>{novel.novelName}</h1>
                    <button
                        className={`btn ${isFav ? "btn-warning" : "btn-outline-primary"}`}
                        onClick={toggleFavorite}
                    >
                        {isFav ? "★ Liked" : "☆ Add to favorites"}
                    </button>
                </div>

                <div className="row mt-4">
                    <div className="col-md-4">
                        <img
                            src={novel.imgLink || "https://via.placeholder.com/300x400?text=No+Image"}
                            alt={novel.novelName}
                            style={{ width: "100%", borderRadius: 10, objectFit: "cover" }}
                        />
                    </div>

                    <div className="col-md-8">
                        <p><strong>Author:</strong> {novel.author}</p>
                        <p><strong>Category:</strong> {(novel.genres || []).join(", ")}</p>
                        <p><strong>Status:</strong> {novel.status}</p>
                        <p><strong>Rating:</strong> ⭐ {novel.rate}</p>
                        <p><strong>Views:</strong> 👁️ {novel.views}</p>

                        <h4>Description</h4>
                        <p style={{ fontSize: 16 }}>{novel.description}</p>
                    </div>
                </div>

                <hr />

                <h3 className="mt-4">Table of Contents</h3>
                {chapters.length === 0 ? (
                    <p className="text-muted">No chapters yet.</p>
                ) : (
                    <ul className="list-group mt-3">
                        {chapters.map(ch => (
                            <li key={ch.chapterId} className="list-group-item d-flex justify-content-between align-items-center">
                                <span><strong>Chapter {ch.chapterNumber}:</strong> {ch.title}</span>
                                <Link className="btn btn-primary btn-sm" to={`/chapter/${ch.chapterId}`}>Read</Link>
                            </li>
                        ))}
                    </ul>
                )}

                <button className="btn btn-secondary mt-4" onClick={() => navigate(-1)}>⬅ Back</button>
            </div>
        </>
    );
}
