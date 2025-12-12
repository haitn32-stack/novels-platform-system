import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux"; // THÊM REDUX
import Navbar from "./nvarbar";
import { authActions } from "../../feature/auth/authSlice"; // Sửa đường dẫn thực tế

export default function NovelDetail() {
    const { novelId } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch(); // Dùng cho Logout

    // SỬ DỤNG REDUX CHO TRẠNG THÁI NGƯỜI DÙNG
    const { currentUser: reduxUser } = useSelector((state) => state.auth);

    const [novel, setNovel] = useState(null);
    const [chapters, setChapters] = useState([]);
    const [loading, setLoading] = useState(true);

    // Favorites: Được tính toán từ Redux User, nếu có
    const [favorites, setFavorites] = useState([]);

    // Cảnh báo: currentUser, favorites ban đầu được thiết lập từ state cục bộ, 
    // nhưng giờ ta dùng Redux. Xóa logic khởi tạo Local Storage trong useEffect.

    useEffect(() => {
        // Cập nhật Favorites từ Redux User
        if (reduxUser) {
            const favs = reduxUser.favourites || reduxUser.favorites || [];
            setFavorites(favs);
        } else {
            setFavorites([]);
        }

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
    }, [novelId, reduxUser]); // Thêm reduxUser vào dependency array

    function toggleFavorite() {
        if (!reduxUser) {
            localStorage.setItem("afterLoginFavorite", JSON.stringify(novelId));
            navigate("/login");
            return;
        }

        setFavorites(prev => {
            const exists = prev.includes(novelId);
            const next = exists ? prev.filter(x => x !== novelId) : [...prev, novelId];

            // SỬ DỤNG KEY "user" ĐỒNG BỘ
            const updatedUser = { ...reduxUser, favourites: next, favorites: next };
            localStorage.setItem("user", JSON.stringify(updatedUser));

            // Cập nhật Redux store (để đồng bộ Navbar)
            dispatch(authActions.loginSuccess(updatedUser));

            return next;
        });
    }

    if (loading) return <div className="p-4">Loading...</div>;
    if (!novel) return <div className="p-4 text-danger">Not Found!</div>;

    const isFav = favorites.includes(novelId);

    // Hàm này không cần nữa vì Navbar tự xử lý avatar, nhưng tôi giữ lại goToProfile và handleLogout.
    function goToProfile() {
        navigate("/profile");
    }

    function handleLogout() {
        dispatch(authActions.logout());
        // Sử dụng navigate để loại bỏ cảnh báo ESLint
        navigate("/login");
    }

    return (
        <>
            <Navbar
                query=""
                setQuery={() => { }}
                showOnlyFavorites={false}
                setShowOnlyFavorites={() => { }}
                currentUser={reduxUser} // TRUYỀN REDUX USER
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