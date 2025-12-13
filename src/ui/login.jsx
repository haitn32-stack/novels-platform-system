import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
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
                dispatch(authActions.loginFailed('Invalid username or password'));
            }
        } catch (err) {
            dispatch(authActions.loginFailed(err.message));
        }
    };

    return (
        <div
            style={{
                // Nền mô phỏng thư viện/sách
                backgroundImage: 'url("https://images.unsplash.com/photo-1549495039-44f248e3549c?q=80&w=1920&h=1080&auto=format&fit=crop")',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                minHeight: '100vh',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                padding: '20px'
            }}
        >
            <Card
                style={{
                    width: '400px',
                    // Card trong suốt, nổi bật
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    borderRadius: '15px',
                    boxShadow: '0 8px 30px rgba(0,0,0,0.3)',
                    border: '1px solid #ddd'
                }}
            >
                <Card.Header className="text-center" style={{ background: 'none', borderBottom: 'none', padding: '20px 0 0' }}>
                    {/* Logo/Icon truyện */}
                    <div className="mb-2" style={{ fontSize: '3rem', color: '#ff6347' }}>
                        📖
                    </div>
                    <h4 style={{ color: '#444', marginBottom: '10px' }}>{title}</h4>
                    <p className="text-muted" style={{ fontSize: '0.9rem' }}>
                        Read your next story.
                    </p>
                </Card.Header>

                <Card.Body style={{ paddingTop: 0 }}>
                    {error && <Alert variant="danger">{error}</Alert>}

                    <Form onSubmit={handleSubmit}>
                        <Form.Group className="mb-3" controlId="formUsername">
                            <Form.Label>Username</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Enter username"
                                value={formData.userName}
                                onChange={(e) => setFormData({ ...formData, userName: e.target.value })}
                                style={{ borderRadius: '8px' }}
                            />
                        </Form.Group>

                        <Form.Group className="mb-4" controlId="formPassword">
                            <Form.Label>Password</Form.Label>
                            <Form.Control
                                type="password"
                                placeholder="Password"
                                value={formData.pwd}
                                onChange={(e) => setFormData({ ...formData, pwd: e.target.value })}
                                style={{ borderRadius: '8px' }}
                            />
                        </Form.Group>

                        <div className="d-grid gap-2">
                            <Button
                                variant="primary"
                                type="submit"
                                disabled={isLoading}
                                style={{ background: '#ff6347', borderColor: '#ff6347', borderRadius: '8px' }} // Màu cam/đỏ tươi
                            >
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
                                    'Login'
                                )}
                            </Button>
                        </div>
                    </Form>
                </Card.Body>
                <Card.Footer className="text-center" style={{ background: 'none', borderTop: '1px solid #eee', fontSize: '0.9rem' }}>
                    Don't have an account yet? <Link to="/register" style={{ color: '#ff6347', fontWeight: 'bold' }}>Register now</Link>
                </Card.Footer>
            </Card>
        </div>
    );
};

Login.propTypes = {
    title: PropTypes.string,
};

Login.defaultProps = {
    title: 'Welcome to Novel App', // Đổi tiêu đề mặc định
};

export default Login;