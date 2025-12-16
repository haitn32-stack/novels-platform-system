  import React, { useState, useEffect } from "react";
  import { Container, Row, Col, Form, Button } from "react-bootstrap";
  import { useNavigate } from "react-router-dom";
  import { useSelector } from "react-redux";
  import SideBar from "./SideBarrr";

  const CreateNovel = () => {
    const [novelName, setNovelName] = useState("");
    const [imgLink, setImgLink] = useState("");
    const [description, setDescription] = useState("");
    const [rate, setRate] = useState(0);
    const [genres, setGenres] = useState([]);
    const [author, setAuthor] = useState("");
    const [status, setStatus] = useState("ongoing");

    const [allGenres, setAllGenres] = useState([]);
    const [novels, setNovels] = useState([]);
    const [nameError, setNameError] = useState("");

    const navigate = useNavigate();
    const currentUser = useSelector((state) => state.auth.user);

    useEffect(() => {
      fetch("http://localhost:9999/novels")
        .then((res) => res.json())
        .then((data) => {
          setNovels(data);
          const uniqueGenres = [...new Set(data.flatMap((n) => n.genres))];
          setAllGenres(uniqueGenres);
        });
    }, []);

    useEffect(() => {
      if (!novelName.trim()) {
        setNameError("Novel name is required");
        return;
      }

      const isDuplicate = novels.some(
        (n) =>
          n.novelName.trim().toLowerCase() ===
          novelName.trim().toLowerCase()
      );

      if (isDuplicate) {
        setNameError("Novel name already exists");
      } else {
        setNameError("");
      }
    }, [novelName, novels]);

    const handleGenreChange = (g) => {
      setGenres((prev) =>
        prev.includes(g) ? prev.filter((i) => i !== g) : [...prev, g]
      );
    };

    const generateNovelId = () => {
      const random = Math.floor(Math.random() * 900) + 100;
      return "n" + random;
    };

    const handleSubmit = async (e) => {
      e.preventDefault();

      if (nameError) return;

      const date = new Date().toISOString().slice(0, 10);

      const newNovel = {
        novelId: generateNovelId(),
        novelName: novelName.trim(),
        description,
        imgLink,
        genres,
        author,
        status,
        rate: Number(rate),
        views: 0,
        totalChapters: 0,
        uploadBy: currentUser?.userId || "u002",
        createdAt: date,
        updatedAt: date,
      };

      await fetch("http://localhost:9999/novels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newNovel),
      });

      alert("Created Successfully!");
      navigate("/manager/dashboard");
    };

    return (
      <div className="d-flex" style={{ minHeight: "100vh" }}>
        <SideBar
          onNavigate={(page) => navigate(`/manager/${page}`)}
          currentPage="create"
        />

        <Container
          fluid
          className="p-5 flex-grow-1"
          style={{
            background: "linear-gradient(135deg, #e6f2ff, #ffffff)",
          }}
        >
          <div
            className="p-4"
            style={{
              background: "white",
              borderRadius: 20,
              boxShadow: "0 5px 15px rgba(0,0,0,0.1)",
            }}
          >
            <h3 className="mb-4 text-primary fw-bold text-center">
              Create New Novel
            </h3>

            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>Novel Name</Form.Label>
                <Form.Control
                  value={novelName}
                  onChange={(e) => setNovelName(e.target.value)}
                  className={`rounded-pill ${nameError ? "is-invalid" : ""}`}
                />
                {nameError && (
                  <div className="text-danger mt-1">{nameError}</div>
                )}
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Image Link</Form.Label>
                <Form.Control
                  value={imgLink}
                  onChange={(e) => setImgLink(e.target.value)}
                  required
                  className="rounded-pill"
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Author</Form.Label>
                <Form.Control
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  required
                  className="rounded-pill"
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Status</Form.Label>
                <Form.Select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="rounded-pill"
                >
                  <option value="ongoing">Ongoing</option>
                  <option value="completed">Completed</option>
                  <option value="hiatus">Hiatus</option>
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Description</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  style={{ borderRadius: 15 }}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Rate (0 - 5)</Form.Label>
                <Form.Control
                  type="number"
                  min={0}
                  max={5}
                  step={0.1}
                  value={rate}
                  onChange={(e) => setRate(e.target.value)}
                  className="rounded-pill"
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Genres</Form.Label>
                <Row>
                  {allGenres.map((g) => (
                    <Col md={4} key={g} className="mb-2">
                      <Form.Check
                        type="checkbox"
                        label={g}
                        checked={genres.includes(g)}
                        onChange={() => handleGenreChange(g)}
                      />
                    </Col>
                  ))}
                </Row>
              </Form.Group>

              <div className="text-center mt-4">
                <Button
                  type="submit"
                  className="px-5 py-2"
                  variant="success"
                  disabled={!!nameError}
                >
                  Create Novel
                </Button>
              </div>
            </Form>
          </div>
        </Container>
      </div>
    );
  };

  export default CreateNovel;
