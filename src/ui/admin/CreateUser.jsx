import React, { useState } from "react";
import { Container, Card, Form, Button, Alert, Row, Col, Spinner } from "react-bootstrap";
import { instance } from "../../utils/axios";
import { useNavigate } from "react-router-dom";

const CreateUser = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        userName: "",
        email: "",
        password: "",
        role: ""
    });
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        if (!formData.userName || !formData.email || !formData.password || !formData.role) {
            setError("Please fill in all fields");
            setIsLoading(false);
            return;
        }

        try {
            const checkRes = await instance.get(`users?userName=${formData.userName}`);
            if (checkRes.data.length > 0) {
                setError("Username already exists!");
                setIsLoading(false);
                return;
            }

            await instance.post("users", formData);

            alert("Create user successfully!");
            navigate("/admin/dashboard");

        } catch (err) {
            setError(err.response?.data?.message || err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Container fluid className="p-5">
            <Card className="p-4 mx-auto" style={{ borderRadius: 20, maxWidth: "600px" }}>
                <h3 className="text-center text-primary fw-bold mb-4">Create New User</h3>

                {error && <Alert variant="danger">{error}</Alert>}

                <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-3">
                        <Form.Label>Username</Form.Label>
                        <Form.Control
                            type="text"
                            name="userName"
                            value={formData.userName}
                            onChange={handleChange}
                            placeholder="Enter user name"
                        />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Email</Form.Label>
                        <Form.Control
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="Enter email"
                        />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Password</Form.Label>
                        <Form.Control
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="Enter password"
                        />
                    </Form.Group>

                    <Form.Group className="mb-4">
                        <Form.Label>Role</Form.Label>
                        <Form.Select
                            name="role"
                            value={formData.role}
                            onChange={handleChange}
                        >
                            <option value="">-- Select Role --</option>
                            <option value="admin">Admin</option>
                            <option value="manager">Manager</option>
                            <option value="reader">Reader</option>
                        </Form.Select>
                    </Form.Group>

                    <div className="d-flex gap-2 justify-content-end">
                        <Button variant="secondary" onClick={() => navigate("/admin/dashboard")}>
                            Cancel
                        </Button>
                        <Button variant="success" type="submit" disabled={isLoading}>
                            {isLoading ? <Spinner size="sm" animation="border" /> : "Create User"}
                        </Button>
                    </div>
                </Form>
            </Card>
        </Container>
    );
};

export default CreateUser;