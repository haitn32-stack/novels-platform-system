import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Navbar from "./nvarbar";
import { useSelector } from "react-redux";

export default function Profile() {
    const navigate = useNavigate();
    const reduxUser = useSelector((s) => s.auth?.currentUser || null);

    const [currentUser, setCurrentUser] = useState(null);
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [avatar, setAvatar] = useState("");
    const [password, setPassword] = useState("");

    const [novels, setNovels] = useState([]);
    const [favorites, setFavorites] = useState([]);

    const [saving, setSaving] = useState(false);
    const [msg, setMsg] = useState(null);

    useEffect(() => {
        if (reduxUser) {
            loadUserFromRedux(reduxUser);
        } else {
            loadUserFromStorage();
        }
        fetchNovels();
        // eslint-disable-next-line
    }, [reduxUser]);

    function loadUserFromRedux(user) {
        setCurrentUser(user);
        setUsername(user.userName || "");
        setEmail(user.email || "");
        setAvatar(user.avatar || "");
        setPassword(user.pwd || "");
        const favs = Array.isArray(user.favourites)
            ? user.favourites
            : Array.isArray(user.favorites)
                ? user.favorites
                : [];
        setFavorites(favs);
    }

    function loadUserFromStorage() {
        try {
            const u = JSON.parse(localStorage.getItem("currentUser"));
            if (u) {
                loadUserFromRedux(u);
            } else {
                setCurrentUser(null);
                setFavorites([]);
            }
        } catch (e) {
            console.warn("Invalid currentUser in storage", e);
            setCurrentUser(null);
            setFavorites([]);
        }
    }

    async function fetchNovels() {
        try {
            const r = await fetch("http://localhost:9999/novels");
            if (!r.ok) throw new Error("Novels fetch failed");
            const data = await r.json();
            setNovels(data || []);
        } catch (e) {
            console.warn("Cannot fetch novels (server may be down)", e);
            setNovels([]);
        }
    }

    function getAvatarSrc(user) {
        const raw = avatar || user?.avatar || user?.img || user?.avatarUrl || "";
        const ui = `https://ui-avatar.com/api/?name=${encodeURIComponent(
            user?.userName || "User"
        )}&background=0D6EFD&color=fff&size=64`;
        if (!raw) return ui;
        if (/^https?:\/\//i.test(raw)) return raw;
        if (raw.startsWith("/")) return raw;
        return `${process.env.PUBLIC_URL}/${raw}`.replace(/([^:]\/)\/+/g, "$1");
    }

    function saveToLocalStorage(updated) {
        try {
            localStorage.setItem("currentUser", JSON.stringify(updated));
            setCurrentUser(updated);
            const favs = Array.isArray(updated.favourites)
                ? updated.favourites
                : Array.isArray(updated.favorites)
                    ? updated.favorites
                    : [];
            setFavorites(favs);
        } catch (e) {
            console.warn("Failed to save currentUser to localStorage", e);
        }
    }

    async function saveToServerIfPossible(updatedUser) {
        const base = "http://localhost:9999/users"; // users endpoint
        try {
            if (!updatedUser.id) {
                console.warn("Missing user id, cannot save");
                return false;
            }

            // PATCH trực tiếp theo id
            const patch = await fetch(`${base}/${updatedUser.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updatedUser),
            });

            if (patch.ok) {
                return true;
            }

            // Nếu PATCH fail (user chưa tồn tại) → POST tạo mới
            const post = await fetch(base, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updatedUser),
            });
            return post.ok;
        } catch (err) {
            console.warn("Server save error:", err);
            return false;
        }
    }



    async function handleSave(e) {
        e.preventDefault();
        if (!username.trim()) {
            setMsg({ type: "danger", text: "Username cannot be empty." });
            return;
        }

        setSaving(true);
        setMsg(null);

        const updated = {
            ...currentUser,
            userName: username,
            email: email,
            avatar ,
            pwd: password,
            favourites: favorites,
            favorites: favorites,
        };

        saveToLocalStorage(updated);

        try {
            const ok = await saveToServerIfPossible(updated);
            if (ok) {
                setMsg({ type: "success", text: "Saved to server successfully." });
            } else {
                setMsg({
                    type: "warning",
                    text: "Saved locally. Server not reachable or no matching API.",
                });
            }
        } catch (err) {
            console.error(err);
            setMsg({ type: "danger", text: "Save failed." });
        } finally {
            setSaving(false);
            setTimeout(() => setMsg(null), 3000);
        }
    }

    function handleLogout() {
        localStorage.removeItem("currentUser");
        setCurrentUser(null);
        navigate("/login");
    }

    async function removeFavorite(novelId) {
        const next = favorites.filter((f) => f !== novelId);
        setFavorites(next);

        try {
            const cur = JSON.parse(localStorage.getItem("currentUser")) || {};
            cur.favourites = next;
            cur.favorites = next;
            localStorage.setItem("currentUser", JSON.stringify(cur));
            setCurrentUser(cur);
            setMsg({ type: "success", text: "Removed from favorites." });
        } catch (e) {
            console.warn(e);
            setMsg({ type: "danger", text: "Failed to update local storage." });
        }

        try {
            const updatedUser = { ...(currentUser || {}), favourites: next, favorites: next };
            await saveToServerIfPossible(updatedUser);
        } catch (e) { }
        setTimeout(() => setMsg(null), 2000);
    }

    const uploaded = novels.filter((n) => {
        const uploader = n.uploadBy || n.uploadedBy || n.authorId || "";
        return currentUser && (uploader === currentUser.userId || uploader === currentUser.userName);
    });

    if (!currentUser) {
        return (
            <>
                <Navbar
                    query=""
                    setQuery={() => { }}
                    showOnlyFavorites={false}
                    setShowOnlyFavorites={() => { }}
                    currentUser={currentUser}
                    computeAvatarSrc={getAvatarSrc}
                    goToProfile={() => navigate("/profile")}
                    handleLogout={handleLogout}
                />
                <div className="container py-5">
                    <div className="alert alert-warning">
                        You are not logged in. Please <Link to="/login">Login</Link>.
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <Navbar currentUser={currentUser} />

            <div className="container py-4">
                <h1>User Profile</h1>

                {msg && (
                    <div className={`alert alert-${msg.type} mt-3`} role="alert">
                        {msg.text}
                    </div>
                )}

                <div className="row g-4 mt-3">
                    <div className="col-md-4">
                        <div className="card p-3 text-center">
                            <img
                                src={getAvatarSrc(currentUser)}
                                alt="avatar"
                                style={{ width: 120, height: 120, borderRadius: "50%", objectFit: "cover" }}
                                onError={(e) => {
                                    e.currentTarget.onerror = null;
                                    e.currentTarget.src = `https://ui-avatar.com/api/?name=${encodeURIComponent(
                                        currentUser.userName || "U"
                                    )}&background=0D6EFD&color=fff&size=64`;
                                }}
                            />
                            <h5 className="mt-3">{currentUser.userName}</h5>
                            <p className="text-muted mb-1">{currentUser.email}</p>
                            <p className="small text-muted">
                                Role: <strong>{currentUser.role || currentUser.roles || "user"}</strong>
                            </p>

                            <div className="d-grid gap-2 mt-3">

                                <button className="btn btn-outline-secondary" type="button" onClick={() => navigate(-1)}>
                                    Back
                                </button>
                            </div>
                        </div>

                        <div className="card mt-3 p-3">
                            <h6>Favorites ({favorites.length})</h6>
                            {favorites.length === 0 && <p className="text-muted">No favorite novels yet.</p>}
                            <ul className="list-group">
                                {favorites.map((favId) => {
                                    const novel = novels.find((n) => n.novelId === favId || n.id === favId);
                                    return (
                                        <li key={favId} className="list-group-item d-flex justify-content-between align-items-center">
                                            <div>
                                                {novel ? (
                                                    <Link to={`/novel/${novel.novelId}`}>{novel.novelName}</Link>
                                                ) : (
                                                    <span className="text-muted">{favId}</span>
                                                )}
                                            </div>
                                            <div>
                                                <button className="btn btn-sm btn-outline-danger" onClick={() => removeFavorite(favId)}>
                                                    Remove
                                                </button>
                                            </div>
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                    </div>

                    <div className="col-md-8">
                        <div className="card p-3">
                            <h5>Edit Information</h5>

                            <form onSubmit={handleSave}>
                                <div className="mb-3">
                                    <label className="form-label">Username</label>
                                    <input className="form-control" value={username} onChange={(e) => setUsername(e.target.value)} />
                                </div>

                                <div className="mb-3">
                                    <label className="form-label">Email</label>
                                    <input type="email" className="form-control" value={email} onChange={(e) => setEmail(e.target.value)} />
                                </div>

                                <div className="mb-3">
                                    <label className="form-label">Avatar (URL or path)</label>
                                    <input className="form-control" value={avatar} onChange={(e) => setAvatar(e.target.value)} />
                                    <div className="form-text">You may use "image/R.png" (public folder) or a full URL.</div>
                                </div>

                                <div className="mb-3">
                                    <label className="form-label">Password (mock)</label>
                                    <input type="password" className="form-control" value={password} onChange={(e) => setPassword(e.target.value)} />
                                    <div className="form-text">Password is stored locally for demo only.</div>
                                </div>

                                <div className="d-flex gap-2">
                                    <button className="btn btn-success" type="submit" disabled={saving}>
                                        {saving ? "Saving..." : "Save changes"}
                                    </button>
                                    <button className="btn btn-secondary" type="button" onClick={loadUserFromStorage}>
                                        Reset
                                    </button>
                                </div>
                            </form>
                        </div>

                        <div className="card p-3 mt-3">
                            <h5>Novels you uploaded ({uploaded.length})</h5>
                            {uploaded.length === 0 && <p className="text-muted">You haven't uploaded any novels.</p>}
                            <ul className="list-group">
                                {uploaded.map((n) => (
                                    <li key={n.novelId} className="list-group-item d-flex justify-content-between align-items-center">
                                        <div>
                                            <Link to={`/novel/${n.novelId}`} className="fw-bold">
                                                {n.novelName}
                                            </Link>
                                            <div className="text-muted small">{n.genres?.join(", ")}</div>
                                        </div>
                                        <div>
                                            <Link to={`/manager/edit/${n.novelId}`} className="btn btn-sm btn-outline-primary me-2">
                                                Edit
                                            </Link>
                                            <button
                                                className="btn btn-sm btn-outline-danger"
                                                onClick={() => {
                                                    if (!window.confirm("Delete this novel locally?")) return;
                                                    setNovels((prev) => prev.filter((x) => x.novelId !== n.novelId));
                                                    setMsg({ type: "success", text: "Deleted locally." });
                                                    setTimeout(() => setMsg(null), 2000);
                                                }}
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
