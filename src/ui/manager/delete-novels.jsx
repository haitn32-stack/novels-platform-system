import React, { useEffect, useState } from "react";
import { Container, Button } from "react-bootstrap";
import { useParams, useNavigate } from "react-router-dom";
import Sidebar from "./sidebar";

export default function DeleteNovel() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [novel, setNovel] = useState(null);

  useEffect(() => {
    fetch(`http://localhost:9999/novels/${id}`)
      .then((res) => res.json())
      .then((data) => setNovel(data));
  }, [id]);

  if (!novel) return <h3>Loading...</h3>;

  const handleDelete = async () => {
    await fetch(`http://localhost:9999/novels/${id}`, {
      method: "DELETE",
    });

    alert("Deleted Successfully!");
    navigate("/manager/dashboard");
  };

  return (
    <div>
      {/* <Sidebar /> */}
      <Container className="p-5 text-center">
        <h2 className="text-danger fw-bold">Delete Novel</h2>
        <p>Are you sure you want to delete:</p>

        <h4 className="fw-bold">{novel.novelName}</h4>

        <div className="mt-4 d-flex justify-content-center gap-3">
          <Button
            variant="secondary"
            onClick={() => navigate("/manager/dashboard")}
          >
            Cancel
          </Button>

          <Button variant="danger" onClick={handleDelete}>
            Confirm Delete
          </Button>
        </div>
      </Container>
    </div>
  );
}
