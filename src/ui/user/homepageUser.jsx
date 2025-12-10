import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";

export default function HomepageUser() {
  const [users, setUsers] = useState([]);
  const [novels, setNovels] = useState([]);
  const [chapters, setChapters] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);


  const [currentUser, setCurrentUser] = useState(null);

  const [query, setQuery] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("All");
  const [selectedNovel, setSelectedNovel] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);

  const fetchUsers = () => fetch('http://localhost:9999/users').then(r => r.json());
  const fetchNovels = () => fetch('http://localhost:9999/novels').then(r => r.json());
  const fetchChapters = () => fetch('http://localhost:9999/chapters').then(r => r.json());

  useEffect(() => {
    setLoading(true);
    setError(null);

    Promise.all([fetchUsers(), fetchNovels(), fetchChapters()])
      .then(([usersData, novelsData, chaptersData]) => {
        setUsers(usersData || []);
        setNovels(novelsData || []);
        setChapters(chaptersData || []);


        const savedUser = JSON.parse(localStorage.getItem("currentUser"));
        if (savedUser) {
          setCurrentUser(savedUser);
        } else {
          setCurrentUser(null);
        }
      })
      .catch(err => {
        console.error('Fetch error', err);
        setError(err.message || 'Fetch error');
      })
      .finally(() => setLoading(false));
  }, []);


  const allGenres = useMemo(() => {
    const set = new Set();
    novels.forEach(n => n.genres?.forEach(g => set.add(g)));
    return ["All", ...set];
  }, [novels]);
  function openNovel(novel) {
    setSelectedNovel(novel);
  }

  function closeNovel() {
    setSelectedNovel(null);
  }

  function toggleFavorite(novelId) {
    setFavorites(prev => (prev.includes(novelId) ? prev.filter(id => id !== novelId) : [...prev, novelId]));
  }
  // Filter novels
  const filteredNovels = useMemo(() => {
    return novels
      .filter(n => {
        if (showOnlyFavorites && !favorites.includes(n.id)) return false;
        const matchQuery =
          n.novelName.toLowerCase().includes(query.toLowerCase()) ||
          n.description.toLowerCase().includes(query.toLowerCase());

        const matchGenre =
          selectedGenre === "All" || n.genres?.includes(selectedGenre);

        return matchQuery && matchGenre;
      })
      .sort((a, b) => (b.rate || 0) - (a.rate || 0));
  }, [novels, query, selectedGenre, favorites, showOnlyFavorites]);

  if (loading) return <div className="p-10">Đang tải dữ liệu...</div>;
  if (error) return <div className="p-10 text-red-500">Lỗi: {error}</div>;

  return (
    <>

      <nav className="navbar navbar-expand-lg bg-body-tertiary px-4">
        <div className="container-fluid">

        
          <Link className="navbar-brand" to="/">Novel App</Link>

      
          <form
            className="d-flex mx-auto w-50"
            onSubmit={(e) => e.preventDefault()}
          >
            <input
              className="form-control me-2"
              type="search"
              placeholder="Tìm truyện..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <button className="btn btn-outline-success" type="submit">
              Search
            </button>
          </form>

      
          <div className="d-flex ms-auto">

            {currentUser ? (
              <>
                <span className="me-3 fw-bold text-primary">
                  👤 {currentUser.userName}
                </span>
                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => {
                    localStorage.removeItem("currentUser");
                    setCurrentUser(null);
                  }}
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link className="btn btn-primary me-2" to="/login">Login</Link>
                <Link className="btn btn-secondary" to="/register">Register</Link>
              </>
            )}

          </div>
        </div>
      </nav>



      <div className="container p-4">
        <h2>Danh sách truyện</h2>
        <div className="mt-4">
          <div className="row g-4">

            {filteredNovels.map(novel => (
              <div key={novel.id} className="col-12 col-sm-6 col-md-4 col-lg-3">

                <div className="card h-100 shadow-sm">
                  <img
                    src={novel.img || "https://via.placeholder.com/200x250"}
                    className="card-img-top"
                    alt={novel.novelName}
                    style={{ height: "250px", objectFit: "cover" }}
                  />

                  <div className="card-body d-flex flex-column">
                    <h5 className="card-title">{novel.novelName}</h5>
                    <p className="card-text text-muted" style={{ fontSize: "14px" }}>
                      {novel.description?.substring(0, 60)}...
                    </p>

                    <div className="mt-auto d-flex justify-content-between align-items-center">
                      <span className="badge bg-primary">
                        ⭐ {novel.rate || 0}
                      </span>

                      <button
                        className="btn btn-sm btn-outline-primary"
                        onClick={() => openNovel(novel)}
                      >
                        Xem chi tiết
                      </button>
                    </div>
                  </div>

                </div>
              </div>
            ))}

          </div>
        </div>

      </div>
    </>
  );
}
