// SearchBook.jsx (ví dụ)
import React, { useState } from "react";
import Navbar from "./nvarbar";

export default function SearchBook() {
    const [query, setQuery] = useState("");
    const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);

    // currentUser, computeAvatarSrc, goToProfile, handleLogout...
    const currentUser = JSON.parse(localStorage.getItem("currentUser")) || null;
    const computeAvatarSrc = (u) => u?.avatar || "";

    function goToProfile() { /* navigate to profile */ }
    function handleLogout() { /* logout logic */ }

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
            <div className="container">
                <h1 style={{ textAlign: "center" }}>Search Novel online</h1>
                <div style={{ border: '1px solid black',padding:'10px' }}>All types of novel</div>
            </div>

        </>
    );
}
