import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, Button, Table } from "react-bootstrap";
import SideBar from "./SideBarrr";

export default function ManagerNovelDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [novel, setNovel] = useState(null);
  const [chapters, setChapters] = useState([]);

  useEffect(() => {
    async function fetchData() {
      const nRes = await fetch(`http://localhost:9999/novels/${id}`);
      const nData = await nRes.json();
      setNovel(nData);

      const cRes = await fetch(`http://localhost:9999/chapters?novelId=${id}`);
      const cData = await cRes.json();
      setChapters(cData.sort((a, b) => a.chapterNumber - b.chapterNumber));
    }

    fetchData();
  }, [id]);

  if (!novel)
    return <h3 className="text-center mt-5 text-primary">Loading...</h3>;

  return (
    <div className="d-flex" style={{ minHeight: "100vh" }}>
      <SideBar
              onNavigate={(page) => navigate(`/manager/${page}`)}
              currentPage="noveldetail"
            />

      <div className="p-4 flex-grow-1">
        <Card className="p-4 mb-4">
          <h2 className="text-primary fw-bold">{novel.novelName}</h2>
          <p><b>Author:</b> {novel.author}</p>
          <p><b>Genres:</b> {novel.genres.join(", ")}</p>
          <p><b>Description:</b> {novel.description}</p>

          <Button
            variant="success"
            className="mt-3"
            onClick={() => navigate(`/manager/novel/${id}/add`)}
          >
            ➕ Add Chapter
          </Button>
        </Card>

        <Card className="p-3">
          <h4 className="fw-bold text-secondary mb-3">Chapters</h4>

          <Table bordered hover>
            <thead>
              <tr>
                <th>#</th>
                <th>Chapter Title</th>
                <th>Views</th>
              </tr>
            </thead>
            <tbody>
              {chapters.map((c) => (
                <tr key={c.id}>
                  <td>{c.chapterNumber}</td>
                  <td>{c.title}</td>
                  <td>{c.views}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card>
      </div>
    </div>
  );
}
