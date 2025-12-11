import React, { useState, useEffect } from "react";
import { Container, Row, Col, Form, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { authActions } from "../../feature/auth/authSlice";
import { useDispatch, useSelector } from "react-redux";

const CreateNovel = () => {
  const [novelName, setNovelName] = useState("");
  const [imgLink, setImgLink] = useState("");
  const [description, setDescription] = useState("");
  const [rate, setRate] = useState(0);
  const [genres, setGenres] = useState([]);
  const [author, setAuthor] = useState("");
  const [status, setStatus] = useState("ongoing");

  const [allGenres, setAllGenres] = useState([]);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  // lấy user đang đăng nhập
  const currentUser = useSelector((state) => state.auth.user);

  // load genres từ database mới
  useEffect(() => {
    fetch("http://localhost:9999/novels")
      .then((res) => res.json())
      .then((data) => {
        const unique = [...new Set(data.flatMap((n) => n.genres))];
        setAllGenres(unique);
      });
  }, []);

  const handleLogout = () => {
    dispatch(authActions.logout());
    navigate("/login");
  };

  const handleGenreChange = (g) => {
    if (genres.includes(g)) {
      setGenres(genres.filter((i) => i !== g));
    } else {
      setGenres([...genres, g]);
    }
  };

  const generateNovelId = () => {
    const random = Math.floor(Math.random() * 900) + 100;
    return "n" + random;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const date = new Date().toISOString().slice(0, 10);

    const newNovel = {
      novelId: generateNovelId(),
      novelName,
      description,
      imgLink,
      genres,
      author,
      status, // ongoing | completed | hiatus
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
    <Row className="m-0">
      <Col md={2} className="p-0">
        <div
          style={{
            width: 240,
            background:
              "linear-gradient(180deg,rgb(77, 124, 196) 0%,rgb(60, 115, 178) 100%)",
            color: "white",
            padding: 20,
            display: "flex",
            flexDirection: "column",
            minHeight: "100vh",
          }}
        >
          <h4 className="fw-bold mb-4 text-center">Dashboard</h4>

          <button
            className="btn btn-outline-light mb-2 text-start"
            onClick={() => navigate("/manager/dashboard")}
          >
            Home
          </button>

          <button
            className="btn btn-outline-light mb-2 text-start"
            onClick={() => navigate("/manager/novels")}
          >
            Novels
          </button>

          <div style={{ flexGrow: 1 }} />

          <button className="btn btn-danger" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </Col>

      <Col md={10}>
        <Container className="p-4">
          <h3 className="mb-3 text-primary fw-bold">Create New Novel</h3>

          <Form onSubmit={handleSubmit}>
            {/* Name */}
            <Form.Group className="mb-3">
              <Form.Label>Novel Name</Form.Label>
              <Form.Control
                value={novelName}
                onChange={(e) => setNovelName(e.target.value)}
                required
              />
            </Form.Group>

            {/* Image */}
            <Form.Group className="mb-3">
              <Form.Label>Image Link</Form.Label>
              <Form.Control
                value={imgLink}
                onChange={(e) => setImgLink(e.target.value)}
                required
              />
            </Form.Group>

            {/* Author */}
            <Form.Group className="mb-3">
              <Form.Label>Author</Form.Label>
              <Form.Control
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                required
              />
            </Form.Group>

            {/* Status */}
            <Form.Group className="mb-3">
              <Form.Label>Status</Form.Label>
              <Form.Select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="ongoing">Ongoing</option>
                <option value="completed">Completed</option>
                <option value="hiatus">Hiatus</option>
              </Form.Select>
            </Form.Group>

            {/* Description */}
            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </Form.Group>

            {/* Rate */}
            <Form.Group className="mb-3">
              <Form.Label>Rate (0 - 5)</Form.Label>
              <Form.Control
                type="number"
                value={rate}
                min={0}
                max={5}
                step={0.1}
                onChange={(e) => setRate(e.target.value)}
              />
            </Form.Group>

            {/* Genres */}
            <Form.Group className="mb-3">
              <Form.Label>Genres</Form.Label>

              <Row>
                {allGenres.map((g) => (
                  <Col md={4} key={g}>
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

            <Button type="submit" className="mt-2" variant="success">
              Create Novel
            </Button>
          </Form>
        </Container>
      </Col>
    </Row>
  );
};

export default CreateNovel;
