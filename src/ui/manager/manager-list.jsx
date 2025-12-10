import React, { useState, useMemo } from "react";
import {
  Container,
  Card,
  Row,
  Col,
  Form,
  FormControl,
  Table,
  Pagination,
} from "react-bootstrap";
import { useDispatch } from "react-redux";
import { authActions } from "../../feature/auth/authSlice";
import { useNavigate } from "react-router-dom";

// fake data
const data = [
  { id: 1, title: "Shadow Emperor", genre: "Action", views: 12000 },
  { id: 2, title: "Reborn to Rule", genre: "Fantasy", views: 9800 },
  { id: 3, title: "Love in the Mist", genre: "Romance", views: 5500 },
  { id: 4, title: "Villain's Return", genre: "Action", views: 17800 },
  { id: 5, title: "The Mage's Path", genre: "Fantasy", views: 7600 },
  { id: 6, title: "Last Winter", genre: "Romance", views: 3100 },
  { id: 7, title: "Dragon Spirit", genre: "Fantasy", views: 14300 },
  { id: 8, title: "Urban Chaos", genre: "Action", views: 8400 },
  { id: 9, title: "Sweet Promise", genre: "Romance", views: 9200 },
  { id: 10, title: "Hero's Testament", genre: "Action", views: 15000 },
];

export default function NovelManager() {
  const [search, setSearch] = useState("");
  const [genre, setGenre] = useState("All");
  const [sort, setSort] = useState("");
  const [page, setPage] = useState(1);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const perPage = 5;

  const list = useMemo(() => {
    let result = [...data];

    if (search) {
      result = result.filter((n) =>
        n.title.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (genre !== "All") {
      result = result.filter((n) => n.genre === genre);
    }

    if (sort === "views-desc") result.sort((a, b) => b.views - a.views);
    if (sort === "views-asc") result.sort((a, b) => a.views - b.views);

    return result;
  }, [search, genre, sort]);

  const totalPages = Math.ceil(list.length / perPage);
  const display = list.slice((page - 1) * perPage, page * perPage);

  const handleLogout = () => {
    dispatch(authActions.logout());
    navigate("/login");
  };

  return (
    <div className="d-flex" style={{ minHeight: "100vh" }}>
      <div
        style={{
          width: 240,
          background: "linear-gradient(180deg,rgb(77, 124, 196) 0%,rgb(60, 115, 178) 100%)",
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
          style={{ transition: "0.2s" }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.background = "rgba(255,255,255,0.2)")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.background = "transparent")
          }
          onClick={() => navigate("/manager/dashboard")}
        >
          Home
        </button>

        <button
          className="btn btn-outline-light mb-2 text-start"
          style={{ transition: "0.2s" }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.background = "rgba(255,255,255,0.2)")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.background = "transparent")
          }
          onClick={() => navigate("/manager/dashboard")}
        >
          Home
        </button>

        <div style={{ flexGrow: 1 }} />

        <button className="btn btn-danger" onClick={handleLogout}>
          Logout
        </button>
      </div>

      <Container
        className="p-5 flex-grow-1"
        style={{
          background: "linear-gradient(135deg, #e6f2ff, #ffffff)",
        }}
      >
        <Card
          className="p-4 mb-4"
          style={{ borderRadius: 20, boxShadow: "0 5px 15px rgba(0,0,0,0.1)" }}
        >
          <h2 className="text-center text-primary fw-bold mb-4">
            Novel Manager
          </h2>

          <Row className="g-3">
            <Col md={4}>
              <FormControl
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="rounded-pill"
                style={{ borderColor: "#cbe1ff" }}
              />
            </Col>

            <Col md={4}>
              <Form.Select
                className="rounded-pill"
                style={{ borderColor: "#cbe1ff" }}
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
              >
                <option value="All">All Genres</option>
                <option value="Action">Action</option>
                <option value="Fantasy">Fantasy</option>
                <option value="Romance">Romance</option>
              </Form.Select>
            </Col>

            <Col md={4}>
              <Form.Select
                className="rounded-pill"
                style={{ borderColor: "#cbe1ff" }}
                value={sort}
                onChange={(e) => setSort(e.target.value)}
              >
                <option value="">Sort by Views</option>
                <option value="views-desc">Most Viewed</option>
                <option value="views-asc">Least Viewed</option>
              </Form.Select>
            </Col>
          </Row>
        </Card>

        <Card
          className="p-3"
          style={{ borderRadius: 20, boxShadow: "0 5px 15px rgba(0,0,0,0.1)" }}
        >
          <Table hover bordered responsive>
            <thead style={{ background: "#0d6efd", color: "white" }}>
              <tr className="text-center">
                <th>ID</th>
                <th>Title</th>
                <th>Genre</th>
                <th>Views</th>
              </tr>
            </thead>

            <tbody>
              {display.map((n) => (
                <tr
                  key={n.id}
                  style={{ cursor: "pointer", transition: "0.2s" }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "#eaf4ff")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "white")
                  }
                >
                  <td className="text-center fw-bold">{n.id}</td>
                  <td>{n.title}</td>
                  <td className="text-center">{n.genre}</td>
                  <td className="text-center">{n.views.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </Table>

          <Pagination className="justify-content-center mt-3">
            {[...Array(totalPages)].map((_, i) => (
              <Pagination.Item
                key={i}
                active={page === i + 1}
                onClick={() => setPage(i + 1)}
                className="rounded-pill"
              >
                {i + 1}
              </Pagination.Item>
            ))}
          </Pagination>
        </Card>
      </Container>
    </div>
  );
}
