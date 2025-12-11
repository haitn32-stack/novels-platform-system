import React, { useState, useEffect } from "react";
import { Container, Form, Button, Image } from "react-bootstrap";
import { useParams, useNavigate } from "react-router-dom";
import SideBar from "./sidebar";

export default function UpdateNovel() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [novel, setNovel] = useState(null);
  const [genres, setGenres] = useState([]);

  const [allGenres, setAllGenres] = useState([]);

  useEffect(() => {
    fetch(`http://localhost:9999/novels/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setNovel(data);
        setGenres(data.genres);
      });

    fetch("http://localhost:9999/novels")
      .then((res) => res.json())
      .then((data) => {
        const unique = [...new Set(data.flatMap((n) => n.genres))];
        setAllGenres(unique);
      });
  }, [id]);

  if (!novel) return <h3>Loading...</h3>;

  const handleSubmit = async (e) => {
    e.preventDefault();

    const updated = {
      ...novel,
      genres,
    };

    await fetch(`http://localhost:9999/novels/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updated),
    });

    alert("Updated Successfully!");
    navigate("/manager/dashboard");
  };

  const toggleGenre = (g) => {
    if (genres.includes(g)) setGenres(genres.filter((x) => x !== g));
    else setGenres([...genres, g]);
  };

  console.log(genres);

  return (
    <div>
      {/* <SideBar/> */}
      <Container className="p-4">
        <h2 className="fw-bold text-primary">Update Novel</h2>

        <Form onSubmit={handleSubmit} className="mt-3">
          <Form.Group className="mb-3">
            <Form.Label>Novel Name</Form.Label>
            <Form.Control
              value={novel.novelName}
              onChange={(e) =>
                setNovel({ ...novel, novelName: e.target.value })
              }
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Image URL</Form.Label>
            <Form.Control
              value={novel.img}
              onChange={(e) => setNovel({ ...novel, img: e.target.value })}
            />
            <Image style={{ width: "100px" }} src={novel.img} />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Description</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={novel.description}
              onChange={(e) =>
                setNovel({ ...novel, description: e.target.value })
              }
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Rate</Form.Label>
            <Form.Control
              type="number"
              value={novel.rate}
              onChange={(e) =>
                setNovel({ ...novel, rate: Number(e.target.value) })
              }
            />
          </Form.Group>

          <Form.Group>
            <Form.Label>Genres</Form.Label>

            <div className="d-flex flex-wrap gap-3">
              {allGenres.map((g) => (
                <Form.Check
                  key={g}
                  type="checkbox"
                  label={g}
                  checked={genres.includes(g) || novel.genres.includes(g)}
                  onChange={() => toggleGenre(g)}
                />
              ))}
            </div>
          </Form.Group>

          <Button className="mt-4" type="submit" variant="success">
            Update
          </Button>
        </Form>
      </Container>
    </div>
  );
}
