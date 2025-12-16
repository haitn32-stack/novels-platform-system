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

  const [chapters, setChapters] = useState([]);
  const [lastChapter, setLastChapter] = useState(null);

  const [numberError, setNumberError] = useState("");
  const [titleError, setTitleError] = useState("");

  useEffect(() => {
    async function loadChapters() {
      const res = await fetch(
        `http://localhost:9999/chapters?novelId=${id}`
      );
      const data = await res.json();
      setChapters(data);

      if (data.length > 0) {
        const sorted = [...data].sort(
          (a, b) => b.chapterNumber - a.chapterNumber
        );
        setLastChapter(sorted[0]);
      }
    }
    loadChapters();
  }, [id]);

  useEffect(() => {
    if (!chapterNumber) {
      setNumberError("Chapter number is required");
      return;
    }

    const duplicate = chapters.some(
      (c) => c.chapterNumber === Number(chapterNumber)
    );

    if (duplicate) {
      setNumberError("Chapter number already exists");
    } else {
      setNumberError("");
    }
  }, [chapterNumber, chapters]);

  useEffect(() => {
    if (!title.trim()) {
      setTitleError("Chapter title is required");
      return;
    }

    const duplicate = chapters.some(
      (c) =>
        c.title.trim().toLowerCase() === title.trim().toLowerCase()
    );

    if (duplicate) {
      setTitleError("Chapter title already exists");
    } else {
      setTitleError("");
    }
  }, [title, chapters]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (numberError || titleError) return;

    const newId = "c" + Math.floor(Math.random() * 1000000);

    const newChapter = {
      id: newId,
      novelId: id,
      chapterNumber: Number(chapterNumber),
      title: title.trim(),
      content,
      views: 0,
      createdAt: new Date().toISOString().split("T")[0],
      prevChapterId: lastChapter ? lastChapter.id : null,
      nextChapterId: null,
    };

    if (lastChapter) {
      await fetch(`http://localhost:9999/chapters/${lastChapter.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nextChapterId: newId }),
      });
    }

    await fetch("http://localhost:9999/chapters", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newChapter),
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
                className={numberError ? "is-invalid" : ""}
              />
              {numberError && (
                <div className="text-danger mt-1">{numberError}</div>
              )}
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Chapter Title</Form.Label>
              <Form.Control
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className={titleError ? "is-invalid" : ""}
              />
              {titleError && (
                <div className="text-danger mt-1">{titleError}</div>
              )}
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
              disabled={!!numberError || !!titleError}
            >
              Create Chapter
            </Button>
          </Form>
        </Card>
      </div>
    </div>
  );
}
