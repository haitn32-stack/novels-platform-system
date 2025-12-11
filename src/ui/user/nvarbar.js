import React from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Navbar({
    query = "",
    setQuery = () => { },
    showOnlyFavorites = false,
    setShowOnlyFavorites = () => { },
    currentUser = null,
    computeAvatarSrc = () => "",
    goToProfile = () => { },
    handleLogout = () => { },
}) {
    const navigate = useNavigate();

    // Tự xử lý avatar tại đây — không còn phụ thuộc Profile
    function getAvatar(user) {
        if (!user) return defaultAvatar("User");

        const raw =
            user.avatar ||
            user.img ||
            user.avatarUrl ||
            "";

        if (!raw) return defaultAvatar(user.userName);

        // nếu là URL
        if (/^https?:\/\//i.test(raw)) return raw;

        // nếu là /path trong public
        if (raw.startsWith("/")) return raw;

        // nếu là path tương đối -> đưa vào public
        return `${process.env.PUBLIC_URL}/${raw}`.replace(/([^:]\/)\/+/g, "$1");
    }

    function defaultAvatar(name) {
        return `https://ui-avatars.com/api/?name=${encodeURIComponent(
            name
        )}&background=0D6EFD&color=fff&size=64`;
    }

    return (
        <>
            {/* TOP NAV */}
            <nav className="navbar navbar-expand-lg bg-body-tertiary px-4">
                <div className="container-fluid">

                    <Link className="navbar-brand" to="/">Novel App</Link>

                    {/* SEARCH */}
                    <form className="d-flex mx-auto w-50" onSubmit={(e) => e.preventDefault()}>
                        <input
                            className="form-control me-2"
                            type="search"
                            placeholder="Search Novel..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                        />
                        <button className="btn btn-outline-success" type="submit">Search</button>
                    </form>

                    {/* RIGHT SIDE */}
                    <div className="d-flex ms-auto align-items-center">

                        {/* Favorites toggle */}
                        <div className="me-3 form-check form-switch">
                            <input
                                id="onlyFavs"
                                className="form-check-input"
                                type="checkbox"
                                checked={showOnlyFavorites}
                                onChange={() => setShowOnlyFavorites(s => !s)}
                            />
                            <label className="form-check-label" htmlFor="onlyFavs" style={{ fontSize: 13 }}>
                                Favorites
                            </label>
                        </div>

                        {/* If NOT logged in */}
                        {!currentUser && (
                            <>
                                <Link className="btn btn-primary me-2" to="/login">Login</Link>
                                <Link className="btn btn-secondary" to="/register">Register</Link>
                            </>
                        )}

                        {/* If LOGGED IN */}
                        {currentUser && (
                            <div className="dropdown">
                                <button
                                    className="btn d-flex align-items-center gap-2 dropdown-toggle"
                                    data-bs-toggle="dropdown"
                                    style={{ background: "transparent", border: "none" }}
                                >
                                    <img
                                        src={getAvatar(currentUser)}
                                        alt="avatar"
                                        style={{
                                            width: 40,
                                            height: 40,
                                            borderRadius: "50%",
                                            objectFit: "cover",
                                            border: "2px solid #fff"
                                        }}
                                        onError={(e) => {
                                            e.currentTarget.onerror = null;
                                            e.currentTarget.src = defaultAvatar(currentUser.userName);
                                        }}
                                    />
                                    <span className="text-primary fw-bold">{currentUser.userName}</span>
                                </button>

                                <ul className="dropdown-menu dropdown-menu-end">
                                    <li>
                                        <button className="dropdown-item" onClick={() => navigate("/profile")}>
                                            User Profile
                                        </button>
                                    </li>
                                    <li><Link className="dropdown-item" to="/favorites">Favorites</Link></li>
                                    <li><hr className="dropdown-divider" /></li>
                                    <li>
                                        <button className="dropdown-item text-danger" onClick={handleLogout}>
                                            Logout
                                        </button>
                                    </li>
                                </ul>
                            </div>
                        )}

                    </div>
                </div>
            </nav>

            {/* BOTTOM MENU */}
            <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
                <div className="container">
                    <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                        <span className="navbar-toggler-icon"></span>
                    </button>

                    <div className="collapse navbar-collapse justify-content-center" id="navbarNav">
                        <ul className="navbar-nav gap-4">
                            <li className="nav-item"><Link className="nav-link active" to="/">Home</Link></li>
                            <li className="nav-item"><Link className="nav-link" to="/favorites">Favorite</Link></li>
                            <li className="nav-item"><Link className="nav-link" to="/leaderboard">Leaderboard</Link></li>
                            <li className="nav-item"><Link className="nav-link" to="/searchBook">Search</Link></li>
                        </ul>
                    </div>
                </div>
            </nav>
        </>
    );
}
