import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, Form, Button } from "react-bootstrap";
import SideBar from "./SideBarrr";

export default function CreateChapter() {
  const { id } = useParams(); // novelId
  const navigate = useNavigate();

  const [chapterNumber, setChapterNumber] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [lastChapter, setLastChapter] = useState(null);

  useEffect(() => {
    async function loadChapters() {
      const res = await fetch(`http://localhost:9999/chapters?novelId=${id}`);
      const data = await res.json();
      if (data.length > 0) {
        const sorted = data.sort((a, b) => b.chapterNumber - a.chapterNumber);
        setLastChapter(sorted[0]);
      }
    }
    loadChapters();
  }, [id]);

  async function handleSubmit(e) {
    e.preventDefault();

    const newId = "c" + Math.floor(Math.random() * 1000000);

    const newChapter = {
      id: newId,
      novelId: id,
      chapterNumber: Number(chapterNumber),
      title,
      content,
      views: 0,
      createdAt: new Date().toISOString().split("T")[0],
      prevChapterId: lastChapter ? lastChapter.id : null,
      nextChapterId: null
    };

    // update last chapter nextChapterId
    if (lastChapter) {
      await fetch(`http://localhost:9999/chapters/${lastChapter.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nextChapterId: newId })
      });
    }

    await fetch(`http://localhost:9999/chapters`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newChapter)
    });

    alert("Chapter created successfully!");

    navigate(`/manager/novel/${id}`);
  }

  return (
    <div className="d-flex" style={{ minHeight: "100vh" }}>
      <SideBar
              onNavigate={(page) => navigate(`/manager/${page}`)}
              currentPage="createchapter"
            />

      <div className="flex-grow-1 p-5">
        <Card className="p-4" style={{ maxWidth: 700, margin: "0 auto" }}>
          <h2 className="text-center text-primary fw-bold mb-4">
            Create New Chapter
          </h2>

          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Chapter Number</Form.Label>
              <Form.Control
                type="number"
                value={chapterNumber}
                onChange={(e) => setChapterNumber(e.target.value)}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Chapter Title</Form.Label>
              <Form.Control
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Content</Form.Label>
              <Form.Control
                as="textarea"
                rows={8}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
              />
            </Form.Group>

            <Button
              type="submit"
              className="w-100 mt-3"
              variant="success"
            >
              Create Chapter
            </Button>
          </Form>
        </Card>
      </div>
    </div>
  );
}
