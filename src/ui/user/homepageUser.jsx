import React, { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "./nvarbar";
import { Outlet } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";

export default function HomepageUser() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // get redux user if available
  const reduxUser = useSelector((s) => s.auth && s.auth.currentUser ? s.auth.currentUser : null);

  // dữ liệu chính
  const [novels, setNovels] = useState([]);
  const [chapters, setChapters] = useState([]);

  // trạng thái UI
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // user + favourites
  const [currentUser, setCurrentUser] = useState(null);
  const [favorites, setFavorites] = useState([]);

  // filters / search
  const [query, setQuery] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("All");
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);

  // helpers fetch (only novels + chapters)
  const fetchNovels = () => fetch("http://localhost:9999/novels").then(r => r.json());
  const fetchChapters = () => fetch("http://localhost:9999/chapters").then(r => r.json());

  // --- initial load ---
  useEffect(() => {
    setLoading(true);
    setError(null);

    Promise.all([fetchNovels(), fetchChapters()])
      .then(([novelsData, chaptersData]) => {
        setNovels(novelsData || []);
        setChapters(chaptersData || []);
        // read currentUser from redux or localStorage at mount
        readCurrentUserFromStorage();
      })
      .catch(err => {
        console.error("Fetch error", err);
        setError(err.message || "Fetch error");
      })
      .finally(() => setLoading(false));
    // eslint-disable-next-line
  }, []);

  // keep component user in sync with reduxUser (if present)
  useEffect(() => {
    if (reduxUser) {
      setCurrentUser(reduxUser);
      const favs = Array.isArray(reduxUser.favourites)
        ? reduxUser.favourites
        : Array.isArray(reduxUser.favorites)
          ? reduxUser.favorites
          : [];
      setFavorites(favs);
    } else {
      // fallback to localStorage (backwards compatibility)
      const saved = (() => {
        try {
          return JSON.parse(localStorage.getItem("currentUser"));
        } catch { return null; }
      })();
      if (saved) {
        setCurrentUser(saved);
        const favs = Array.isArray(saved.favourites) ? saved.favourites :
          Array.isArray(saved.favorites) ? saved.favorites : [];
        setFavorites(favs);
      } else {
        setCurrentUser(null);
        setFavorites([]);
      }
    }
  }, [reduxUser]);

  function readCurrentUserFromStorage() {
    // prefer reduxUser (already handled in effect) but keep for manual refresh
    if (reduxUser) return;
    try {
      const savedUser = JSON.parse(localStorage.getItem("currentUser"));
      if (savedUser) {
        setCurrentUser(savedUser);
        const favs = Array.isArray(savedUser.favourites)
          ? savedUser.favourites
          : Array.isArray(savedUser.favorites)
            ? savedUser.favorites
            : [];
        setFavorites(favs);
      } else {
        setCurrentUser(null);
        setFavorites([]);
      }
    } catch (e) {
      console.warn("Invalid currentUser in localStorage", e);
      setCurrentUser(null);
      setFavorites([]);
    }
  }

  // --- listen to localStorage changes (other tab) and focus/visibility changes ---
  useEffect(() => {
    function onStorage(e) {
      if (e.key === "currentUser" || e.key === "user") readCurrentUserFromStorage();
    }
    function onVisibility() {
      if (!document.hidden) readCurrentUserFromStorage();
    }
    window.addEventListener("storage", onStorage);
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("focus", readCurrentUserFromStorage);

    return () => {
      window.removeEventListener("storage", onStorage);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("focus", readCurrentUserFromStorage);
    };
  }, []);

  // danh sách genres
  const allGenres = useMemo(() => {
    const s = new Set();
    novels.forEach(n => n.genres?.forEach(g => s.add(g)));
    return ["All", ...s];
  }, [novels]);

  // helper lấy id chuẩn của novel
  function getNovelId(novel) {
    return novel?.id ?? novel?.novelId ?? null;
  }

  // toggle favorite: chỉ cho phép khi đã đăng nhập
  function toggleFavorite(novel) {
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

      // cập nhật currentUser trong localStorage (mock)
      try {
        // build updated user object (keep userId if exists)
        const cur = JSON.parse(localStorage.getItem("currentUser")) || currentUser || {};
        cur.favourites = next;
        cur.favorites = next;
        // save local copy (backwards compat)
        localStorage.setItem("currentUser", JSON.stringify(cur));
        setCurrentUser(cur);

        // Update Redux store as well (use loginSuccess action type to keep slice behavior)
        // We dispatch the same action type that authSlice handles for loginSuccess.
        // This will update Redux state and also cause authSlice to write to localStorage under its key.
        dispatch({ type: "auth/loginSuccess", payload: cur });
      } catch (e) {
        console.warn("Cannot update currentUser in localStorage/redux", e);
      }

      // TODO: nếu có API thực, gọi POST/DELETE ở đây

      return next;
    });
  }

  // Filter novels
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
  }, [novels, query, selectedGenre, favorites, showOnlyFavorites]);

  // chapter count & views helpers
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

  // handlers for dropdown actions
  function handleLogout() {
    // dispatch logout action (authSlice listens to type 'auth/logout')
    dispatch({ type: "auth/logout" });
    // Also clear local currentUser used by legacy code
    localStorage.removeItem("currentUser");
    setCurrentUser(null);
    setFavorites([]);
    navigate("/");
  }

  function goToProfile() {
    navigate("/profile");
  }

  // compute avatar src from currentUser.avatar (supports multiple cases)
  function computeAvatarSrc(user) {
    if (!user) return null;
    const raw = user.avatar || user.img || user.avatarUrl || "";
    const uiAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.userName || "User")}&background=0D6EFD&color=fff&size=64`;

    if (!raw) return uiAvatar;
    if (/^https?:\/\//i.test(raw)) return raw;
    if (raw.startsWith("/")) return raw;

    const apiBase = process.env.REACT_APP_API_URL || "";
    if (apiBase) {
      return `${apiBase.replace(/\/$/, "")}/${raw.replace(/^\//, "")}`;
    }
    const publicBase = process.env.PUBLIC_URL || "";
    return `${publicBase}/${raw}`.replace(/([^:]\/)\/+/g, "$1");
  }

  // UI states
  if (loading) return <div className="p-10">Đang tải dữ liệu...</div>;
  if (error) return <div className="p-10 text-danger">Lỗi: {error}</div>;

  return (
    <>

      <Navbar
        query={query}
        setQuery={setQuery}
        showOnlyFavorites={showOnlyFavorites}
        setShowOnlyFavorites={setShowOnlyFavorites}
        currentUser={currentUser}
        computeAvatarSrc={computeAvatarSrc}
        goToProfile={goToProfile}
        handleLogout={handleLogout}
      />

      {/* Content */}
      <div className="container p-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h2 className="m-0">List Novel</h2>

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
                      title={isFav ? "Bỏ yêu thích" : "Thêm yêu thích"}
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
              <div className="alert alert-info">Không tìm thấy truyện nào.</div>
            </div>
          )}
        </div>
      </div>
      <Outlet />
    </>
  );
}
