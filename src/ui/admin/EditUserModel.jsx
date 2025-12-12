import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Alert } from "react-bootstrap";
import { instance } from "../../utils/axios";

const EditUserModal = ({ show, user, handleClose }) => {
    const [formData, setFormData] = useState({
        userName: "",
        email: "",
        role: "",
        password: ""
    });
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (user) {
            setFormData({
                userName: user.userName || "",
                email: user.email || "",
                role: user.role || "",
                password: "" 
            });
        }
    }, [user]);

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

        try {
            const updateData = {
                userName: formData.userName,
                email: formData.email,
                role: formData.role
            };

            if (formData.password.trim()) {
                updateData.password = formData.password;
            }

            const response = await instance.put(`users/${user.id}`, updateData);
            
            handleClose(response.data);
            
            alert("User information updated successfully!");
        } catch (err) {
            setError(err.response?.data?.message || "An error occurred while updating user");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Modal show={show} onHide={() => handleClose()} centered>
            <Modal.Header closeButton style={{ background: "#0d6efd", color: "white" }}>
                <Modal.Title>
                    <i className="bi bi-pencil-square me-2"></i>
                    Edit User
                </Modal.Title>
            </Modal.Header>

            <Modal.Body>
                {error && <Alert variant="danger">{error}</Alert>}

                <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-3">
                        <Form.Label>Username</Form.Label>
                        <Form.Control
                            type="text"
                            name="userName"
                            value={formData.userName}
                            onChange={handleChange}
                            required
                            placeholder="Enter username"
                        />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Email</Form.Label>
                        <Form.Control
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            placeholder="Enter email"
                        />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Role</Form.Label>
                        <Form.Select
                            name="role"
                            value={formData.role}
                            onChange={handleChange}
                            required
                        >
                            <option value="">-- Select Role --</option>
                            <option value="admin">Admin</option>
                            <option value="manager">Manager</option>
                            <option value="reader">Reader</option>
                        </Form.Select>
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>New Password (leave blank to keep current)</Form.Label>
                        <Form.Control
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="Enter new password"
                        />
                        <Form.Text className="text-muted">
                            Only enter if you want to change the password
                        </Form.Text>
                    </Form.Group>

                    <div className="d-flex justify-content-end gap-2">
                        <Button 
                            variant="secondary" 
                            onClick={() => handleClose()}
                            disabled={isLoading}
                        >
                            Cancel
                        </Button>
                        <Button 
                            variant="primary" 
                            type="submit"
                            disabled={isLoading}
                        >
                            {isLoading ? "Saving..." : "Save Changes"}
                        </Button>
                    </div>
                </Form>
            </Modal.Body>
        </Modal>
    );
};

export default EditUserModal;