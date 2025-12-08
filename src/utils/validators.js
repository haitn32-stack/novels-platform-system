export const validateLogin = (userName, pwd) => {
    if (!userName || userName.trim() === '') return 'Vui lòng nhập tên đăng nhập';
    if (!pwd || pwd.length < 3) return 'Mật khẩu phải từ 3 ký tự';
    return null;
};