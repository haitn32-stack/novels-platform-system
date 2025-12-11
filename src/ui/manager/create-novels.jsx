import React, { useState, useEffect } from "react";
import { Container, Row, Col, Form, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { authActions } from "../../feature/auth/authSlice";
import { useDispatch } from "react-redux";

const CreateNovel = () => {
  const [novelName, setNovelName] = useState("");
  const [img, setImg] = useState("");
  const [description, setDescription] = useState("");
  const [rate, setRate] = useState(0);
  const [genres, setGenres] = useState([]);

  const [allGenres, setAllGenres] = useState([]);

  const navigate = useNavigate();
  const dispatch = useDispatch();
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newNovel = {
      id: crypto.randomUUID(),
      novelName,
      img,
      description,
      rate: Number(rate),
      genres,
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

            {/* Img */}
            <Form.Group className="mb-3">
              <Form.Label>Image URL</Form.Label>
              <Form.Control
                value={img}
                onChange={(e) => setImg(e.target.value)}
                required
              />
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
              <Form.Label>Rate</Form.Label>
              <Form.Control
                type="number"
                value={rate}
                min={0}
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
