import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Container, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { instance } from '../utils/axios';

const Register = ({ title }) => {
    const navigate = useNavigate();

    // Local state cho form
    const [formData, setFormData] = useState({
        userName: '',
        email: '',
        pwd: '',
        confirmPwd: ''
    });

    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // 1. Validate cơ bản
        if (!formData.userName || !formData.pwd || !formData.email) {
            setError('Vui lòng điền đầy đủ thông tin');
            return;
        }
        if (formData.pwd !== formData.confirmPwd) {
            setError('Mật khẩu xác nhận không khớp');
            return;
        }

        setIsLoading(true);

        try {
            // 2. Check tồn tại (Gọi API)
            const checkRes = await instance.get('users', {
                params: { userName: formData.userName }
            });

            if (checkRes.data.length > 0) {
                setError('Tên đăng nhập đã tồn tại!');
                setIsLoading(false);
                return;
            }

            // 3. Tạo user mới (Mặc định role reader)
            await instance.post('users', {
                userName: formData.userName,
                email: formData.email,
                pwd: formData.pwd,
                roles: 'reader' // Role mặc định
            });

            // 4. Thành công -> Chuyển về login
            alert('Đăng ký thành công! Vui lòng đăng nhập.');
            navigate('/login');

        } catch (err) {
            setError('Có lỗi xảy ra: ' + err.message);
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
                    {error && <Alert variant="danger">{error}</Alert>}

                    <Form onSubmit={handleSubmit}>
                        <Form.Group className="mb-3">
                            <Form.Label>Username</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Chọn tên đăng nhập"
                                value={formData.userName}
                                onChange={(e) => setFormData({ ...formData, userName: e.target.value })}
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Email</Form.Label>
                            <Form.Control
                                type="email"
                                placeholder="nhap@email.com"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Password</Form.Label>
                            <Form.Control
                                type="password"
                                placeholder="Mật khẩu"
                                value={formData.pwd}
                                onChange={(e) => setFormData({ ...formData, pwd: e.target.value })}
                            />
                        </Form.Group>

                        <Form.Group className="mb-4">
                            <Form.Label>Confirm Password</Form.Label>
                            <Form.Control
                                type="password"
                                placeholder="Nhập lại mật khẩu"
                                value={formData.confirmPwd}
                                onChange={(e) => setFormData({ ...formData, confirmPwd: e.target.value })}
                            />
                        </Form.Group>

                        <div className="d-grid gap-2">
                            <Button variant="success" type="submit" disabled={isLoading}>
                                {isLoading ? <Spinner size="sm" animation="border" /> : 'Đăng ký ngay'}
                            </Button>
                        </div>
                    </Form>
                </Card.Body>

                {/* Footer chuyển hướng sang Login */}
                <Card.Footer className="text-center">
                    Đã có tài khoản? <Link to="/login">Đăng nhập tại đây</Link>
                </Card.Footer>
            </Card>
        </Container>
    );
};

// Sử dụng PropTypes để validate props đầu vào
Register.propTypes = {
    title: PropTypes.string
};

Register.defaultProps = {
    title: 'Đăng ký tài khoản'
};

export default Register;