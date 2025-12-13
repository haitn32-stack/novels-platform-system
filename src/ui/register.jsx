import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Container, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { instance } from '../utils/axios';
import { validateRegisterForm } from '../utils/validators';

const Register = ({ title }) => {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        userName: '',
        email: '',
        pwd: '',
        confirmPwd: ''
    });

    const [fieldErrors, setFieldErrors] = useState({});
    const [serverError, setServerError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        if (fieldErrors[e.target.name]) {
            setFieldErrors({ ...fieldErrors, [e.target.name]: null });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setServerError('');
        setFieldErrors({});

        const errors = validateRegisterForm(formData);

        if (Object.keys(errors).length > 0) {
            setFieldErrors(errors);
            return;
        }

        setIsLoading(true);

        try {
            const checkRes = await instance.get('users', {
                params: { userName: formData.userName }
            });

            if (checkRes.data.length > 0) {
                setFieldErrors({ userName: 'Username already exists!' });
                setIsLoading(false);
                return;
            }

            await instance.post('users', {
                userName: formData.userName,
                email: formData.email,
                pwd: formData.pwd,
                role: 'reader'
            });

            alert('Registration successful! Please log in.');
            navigate('/login');

        } catch (err) {
            setServerError('An error occurred: ' + err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
            <Card style={{ width: '450px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}>
                <Card.Header className="bg-success text-white text-center">
                    <h4>{title}</h4>
                </Card.Header>

                <Card.Body>
                    {serverError && <Alert variant="danger">{serverError}</Alert>}

                    <Form onSubmit={handleSubmit}>
                        <Form.Group className="mb-3">
                            <Form.Label>Username</Form.Label>
                            <Form.Control
                                type="text"
                                name="userName"
                                placeholder="Choose a username"
                                value={formData.userName}
                                onChange={handleChange}
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
                                placeholder="enter@email.com"
                                value={formData.email}
                                onChange={handleChange}
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
                                name="pwd"
                                placeholder="Min 6 characters"
                                value={formData.pwd}
                                onChange={handleChange}
                                isInvalid={!!fieldErrors.pwd}
                            />
                            <Form.Control.Feedback type="invalid">
                                {fieldErrors.pwd}
                            </Form.Control.Feedback>
                        </Form.Group>

                        <Form.Group className="mb-4">
                            <Form.Label>Confirm Password</Form.Label>
                            <Form.Control
                                type="password"
                                name="confirmPwd"
                                placeholder="Re-enter password"
                                value={formData.confirmPwd}
                                onChange={handleChange}
                                isInvalid={!!fieldErrors.confirmPwd}
                            />
                            <Form.Control.Feedback type="invalid">
                                {fieldErrors.confirmPwd}
                            </Form.Control.Feedback>
                        </Form.Group>

                        <div className="d-grid gap-2">
                            <Button variant="success" type="submit" disabled={isLoading}>
                                {isLoading ? <Spinner size="sm" animation="border" /> : 'Register Now'}
                            </Button>
                        </div>
                    </Form>
                </Card.Body>

                <Card.Footer className="text-center">
                    Already have an account? <Link to="/login">Log in here</Link>
                </Card.Footer>
            </Card>
        </Container>
    );
};

Register.propTypes = { title: PropTypes.string };
Register.defaultProps = { title: 'Register Account' };

export default Register;