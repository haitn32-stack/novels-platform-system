// eslint-disable-next-line
import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import Navbar from "./nvarbar";
import { authActions } from "../../feature/auth/authSlice";

const API_URL = "http://localhost:9999"; 

export default function ChapterDetail() {
    const { chapterId } = useParams();
    const navigate = useNavigate();
    const { currentUser: reduxUser } = useSelector((state) => state.auth);
    const dispatch = useDispatch();

    const [allChapters, setAllChapters] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        fetch(`${API_URL}/chapters`)
            .then(r => r.json())
            .then(list => {
                setAllChapters(list || []);
            })
            .catch(err => {
                console.error("Fetch chapters error", err);
            })
            .finally(() => setLoading(false));
    }, []);

    const { currentChapter, parentNovelId } = useMemo(() => {
        if (!allChapters.length) return {};

        const current = allChapters.find(x => String(x.id) === String(chapterId));
        if (!current) return {};

        const novelId = current.novelId;
        const related = allChapters
            .filter(c => String(c.novelId) === String(novelId))
            .sort((a, b) => a.chapterNumber - b.chapterNumber);

        const currentIndex = related.findIndex(c => String(c.id) === String(chapterId));
        
        const prevChapter = related[currentIndex - 1];
        const nextChapter = related[currentIndex + 1];

        return {
            currentChapter: {
                ...current,
                prevChapterId: prevChapter ? prevChapter.id : null,
                nextChapterId: nextChapter ? nextChapter.id : null,
            },
            parentNovelId: novelId
        };
    }, [allChapters, chapterId]);

    function goToProfile() {
        navigate("/profile");
    }

    function handleLogout() {
        dispatch(authActions.logout());
        navigate("/login");
    }


    if (loading) return <div className="p-4 text-center">Đang tải nội dung chương...</div>;
    if (!currentChapter) return <div className="p-4 text-danger text-center">Không tìm thấy chương này (ID: {chapterId})!</div>;

    const chapter = currentChapter;

    return (
        <>
            <Navbar 
                currentUser={reduxUser}
                goToProfile={goToProfile}
                handleLogout={handleLogout}
            />
            <div className="container py-4" style={{ maxWidth: 800 }}>
                <h1 className="fw-bold">{chapter.title}</h1>
                <p className="text-muted"><strong>Chapter:</strong> {chapter.chapterNumber}</p>
                <hr/>
                <div style={{ background: "#f8f9fa", padding: 30, borderRadius: 8, marginTop: 12, lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>
                    {chapter.content}
                </div>

                <div className="mt-4 d-flex justify-content-between align-items-center">
                    
                    {chapter.prevChapterId ? (
                        <button className="btn btn-outline-primary" onClick={() => navigate(`/chapter/${chapter.prevChapterId}`)}>
                            ⬅ Chapter {chapter.chapterNumber - 1}
                        </button>
                    ) : (
                        <button className="btn btn-outline-secondary" disabled>
                            ⬅ First Chapter
                        </button>
                    )}
                    
                    {parentNovelId && (
                        <button className="btn btn-secondary" onClick={() => navigate(`/novel/${parentNovelId}`)}>
                            Return to Table of Contents
                        </button>
                    )}

                    {chapter.nextChapterId ? (
                        <button className="btn btn-primary" onClick={() => navigate(`/chapter/${chapter.nextChapterId}`)}>
                            Chapter {chapter.chapterNumber + 1} ➡
                        </button>
                    ) : (
                        <button className="btn btn-outline-secondary" disabled>
                            Last Chapter ➡
                        </button>
                    )}
                </div>
            </div>
        </>
    );
}