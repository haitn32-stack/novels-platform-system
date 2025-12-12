import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Link, useNavigate, Outlet } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import Navbar from "./nvarbar";
import { authActions } from "../../feature/auth/authSlice";
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
        const cur = JSON.parse(localStorage.getItem("user")) || {};
        cur.favourites = next;
        cur.favorites = next;
        localStorage.setItem("user", JSON.stringify(cur));
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

  // Đã XÓA HÀM computeAvatarSrc

  if (loading) return <div className="p-10">Loading data...</div>;
  if (error) return <div className="p-10 text-danger">Error: {error}</div>;

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

      <div className="container p-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h2 className="m-0">Novel List</h2>

          <div>
            <select
              className="form-select"
              value={selectedGenre}
              onChange={(e) => setSelectedGenre(e.target.value)}
              style={{ minWidth: 160 }}
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
                <div className="card h-100 shadow-sm">
                  <div style={{ position: "relative" }}>
                    <img
                      src={novel.imgLink || novel.img || "https://via.placeholder.com/300x400?text=No+Image"}
                      className="card-img-top"
                      alt={novel.novelName}
                      style={{ height: 250, objectFit: "cover" }}
                    />
                    <div style={{ position: "absolute", left: 8, top: 8, display: "flex", gap: 8 }}>
                      <span className="badge bg-primary" title="Rating">⭐ {novel.rate ?? 0}</span>
                      <span className="badge bg-success" title="Views">👁️ {views}</span>
                    </div>

                    <button
                      onClick={() => toggleFavorite(novel)}
                      className={`btn btn-sm ${isFav ? "btn-warning" : "btn-outline-light"}`}
                      style={{ position: "absolute", right: 8, top: 8 }}
                      title={isFav ? "Remove from favorites" : "Add to favorites"}
                    >
                      {isFav ? "★" : "☆"}
                    </button>
                  </div>

                  <div className="card-body d-flex flex-column">
                    <h5 className="card-title" style={{ minHeight: 48 }}>{novel.novelName}</h5>
                    <p className="card-text text-muted" style={{ fontSize: 14 }}>
                      {novel.description?.length > 120 ? `${novel.description.substring(0, 120)}...` : novel.description}
                    </p>

                    <div className="mt-3 d-flex justify-content-between align-items-center">
                      <div style={{ fontSize: 13 }}>
                        <span className="me-3">📚 {chapterCount} chap</span>
                        <span className="text-muted">👤 {novel.author || "Unknown"}</span>
                      </div>

                      <div className="d-flex align-items-center gap-2">
                        <Link className="btn btn-sm btn-primary" to={`/novel/${id ?? novel.novelId}`}>Read</Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {filteredNovels.length === 0 && (
            <div className="col-12">
              <div className="alert alert-info">No novels found.</div>
            </div>
          )}
        </div>
      </div>
      <Outlet />
    </>
  );
}