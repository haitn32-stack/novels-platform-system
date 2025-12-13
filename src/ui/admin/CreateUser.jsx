import React, { useState } from "react";
import {
    Container, Card, Form, Button, Alert, Spinner
} from "react-bootstrap";
import { instance } from "../../utils/axios";
import { useNavigate } from "react-router-dom";
import { validateCreateUserForm } from "../../utils/validators";

const CreateUser = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        userName: "",
        email: "",
        password: "",
        role: ""
    });

    const [fieldErrors, setFieldErrors] = useState({});
    const [serverError, setServerError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        if (fieldErrors[name]) {
            setFieldErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setServerError("");
        setFieldErrors({});

        const errors = validateCreateUserForm(formData);

        if (Object.keys(errors).length > 0) {
            setFieldErrors(errors);
            return;
        }

        setIsLoading(true);

        try {
            const checkRes = await instance.get(`users?userName=${formData.userName}`);
            if (checkRes.data.length > 0) {
                setFieldErrors({ userName: 'Username already exists!' });
                setIsLoading(false);
                return;
            }

            await instance.post("users", {
                userName: formData.userName,
                email: formData.email,
                pwd: formData.password,
                role: formData.role
            });

            alert("Create user successfully!");
            navigate("/admin/dashboard");

        } catch (err) {
            setServerError(err.response?.data?.message || err.message || "Failed to create user.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Container fluid className="p-5">
            <Card className="p-4 mx-auto" style={{ borderRadius: 20, maxWidth: "600px" }}>
                <h3 className="text-center text-primary fw-bold mb-4">Create New User</h3>

                {serverError && <Alert variant="danger">{serverError}</Alert>}

                <Form onSubmit={handleSubmit} noValidate>

                    <Form.Group className="mb-3">
                        <Form.Label>Username</Form.Label>
                        <Form.Control
                            type="text"
                            name="userName"
                            value={formData.userName}
                            onChange={handleChange}
                            placeholder="Ex: manager01"
                            isInvalid={!!fieldErrors.userName}
                        />
                        <Form.Control.Feedback type="invalid">
                            {fieldErrors.userName}
                        </Form.Control.Feedback>
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Email</Form.Label>
                        <Form.Control
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="Ex: manager@gmail.com"
                            isInvalid={!!fieldErrors.email}
                        />
                        <Form.Control.Feedback type="invalid">
                            {fieldErrors.email}
                        </Form.Control.Feedback>
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Password</Form.Label>
                        <Form.Control
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="Min 6 characters"
                            isInvalid={!!fieldErrors.password}
                        />
                        <Form.Control.Feedback type="invalid">
                            {fieldErrors.password}
                        </Form.Control.Feedback>
                    </Form.Group>

                    <Form.Group className="mb-4">
                        <Form.Label>Role</Form.Label>
                        <Form.Select
                            name="role"
                            value={formData.role}
                            onChange={handleChange}
                            isInvalid={!!fieldErrors.role}
                        >
                            <option value="">-- Select Role --</option>
                            <option value="admin">Admin</option>
                            <option value="manager">Manager</option>
                            <option value="reader">Reader</option>
                        </Form.Select>
                        <Form.Control.Feedback type="invalid">
                            {fieldErrors.role}
                        </Form.Control.Feedback>
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