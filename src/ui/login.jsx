import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import {Link, useNavigate} from 'react-router-dom';
import { Container, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { authActions, selectAuth } from '../feature/auth/authSlice';
import { instance } from '../utils/axios';
import { validateLogin } from '../utils/validators';

const Login = ({ title }) => {
    const [formData, setFormData] = useState({ userName: '', pwd: '' });

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { currentUser, isLoading, error } = useSelector(selectAuth);

    useEffect(() => {
        if (currentUser) {
            if (currentUser.role === 'admin') navigate('/admin/dashboard');
            else if (currentUser.role === 'manager') navigate('/manager/dashboard');
            else navigate('/');
        }
    }, [currentUser, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate
        const valMsg = validateLogin(formData.userName, formData.pwd);
        if (valMsg) {
            dispatch(authActions.loginFailed(valMsg));
            return;
        }

        dispatch(authActions.loginStart());

        try {
            const res = await instance.get('users', {
                params: {
                    userName: formData.userName,
                    pwd: formData.pwd
                }
            });

            const data = res.data;

            if (data.length > 0) {
                dispatch(authActions.loginSuccess(data[0]));
                console.log(data);
            } else {
                dispatch(authActions.loginFailed('Sai tên đăng nhập hoặc mật khẩu'));
            }
        } catch (err) {
            dispatch(authActions.loginFailed(err.message));
        }
    };

    return (
        <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
            <Card style={{ width: '400px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}>
                <Card.Header className="bg-primary text-white text-center">
                    <h4>{title}</h4>
                </Card.Header>

                <Card.Body>
                    {/* Hiển thị lỗi bằng Alert */}
                    {error && <Alert variant="danger">{error}</Alert>}

                    <Form onSubmit={handleSubmit}>
                        <Form.Group className="mb-3" controlId="formUsername">
                            <Form.Label>Username</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Enter username"
                                value={formData.userName}
                                onChange={(e) => setFormData({...formData, userName: e.target.value})}
                            />
                        </Form.Group>

                        <Form.Group className="mb-4" controlId="formPassword">
                            <Form.Label>Password</Form.Label>
                            <Form.Control
                                type="password"
                                placeholder="Password"
                                value={formData.pwd}
                                onChange={(e) => setFormData({...formData, pwd: e.target.value})}
                            />
                        </Form.Group>

                        <div className="d-grid gap-2">
                            <Button variant="primary" type="submit" disabled={isLoading}>
                                {isLoading ? (
                                    <>
                                        <Spinner
                                            as="span"
                                            animation="border"
                                            size="sm"
                                            role="status"
                                            aria-hidden="true"
                                        /> Loading...
                                    </>
                                ) : (
                                    'Đăng nhập'
                                )}
                            </Button>
                        </div>
                    </Form>
                </Card.Body>
                <Card.Footer className="text-center">
                    Chưa có tài khoản? <Link to="/register">Đăng ký ngay</Link>
                </Card.Footer>
            </Card>
        </Container>
    );
};

Login.propTypes = {
    title: PropTypes.string,
};

Login.defaultProps = {
    title: 'Đăng nhập hệ thống',
};

export default Login;