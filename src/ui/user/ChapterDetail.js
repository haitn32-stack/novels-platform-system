import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "./nvarbar";

export default function ChapterDetail() {
    const { chapterId } = useParams(); // e.g. "c004"
    const navigate = useNavigate();

    const [chapter, setChapter] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("http://localhost:9999/chapters")
            .then(r => r.json())
            .then(list => {
                const c = list.find(x => String(x.chapterId) === String(chapterId) || String(x.id) === String(chapterId));
                setChapter(c || null);
            })
            .catch(err => {
                console.error("Fetch chapters error", err);
            })
            .finally(() => setLoading(false));
    }, [chapterId]);

    if (loading) return <div className="p-4">Đang tải...</div>;
    if (!chapter) return <div className="p-4 text-danger">Không tìm thấy chương!</div>;

    return (
        <>
            <Navbar />
            <div className="container py-4">
                <h1>{chapter.title}</h1>
                <p><strong>Chapter:</strong> {chapter.chapterNumber}</p>
                <div style={{ background: "#f8f9fa", padding: 20, borderRadius: 8, marginTop: 12 }}>
                    {chapter.content}
                </div>

                <div className="mt-4">
                    {chapter.prevChapterId && <button className="btn btn-outline-primary me-2" onClick={() => navigate(`/chapter/${chapter.prevChapterId}`)}>Prev</button>}
                    {chapter.nextChapterId && <button className="btn btn-primary" onClick={() => navigate(`/chapter/${chapter.nextChapterId}`)}>Next</button>}
                    <button className="btn btn-secondary ms-2" onClick={() => navigate(-1)}>Back</button>
                </div>
            </div>
        </>
    );
}
