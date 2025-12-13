export const isValidEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
};

export const isValidPassword = (password) => {
    return password && password.length >= 6;
};

export const isValidUsername = (username) => {
    const regex = /^[a-zA-Z0-9]{3,}$/;
    return regex.test(username);
};

export const validateLogin = (userName, pwd) => {
    if (!userName || userName.trim() === '') return 'Username is required';
    if (!pwd || pwd.trim() === '') return 'Password is required';
    return null;
};

export const validateRegisterForm = (data) => {
    const errors = {};

    if (!data.userName) {
        errors.userName = 'Username is required';
    } else if (!isValidUsername(data.userName)) {
        errors.userName = 'Username must be at least 3 characters and contain no special symbols/spaces.';
    }

    if (!data.email) {
        errors.email = 'Email is required';
    } else if (!isValidEmail(data.email)) {
        errors.email = 'Invalid email address format.';
    }

    if (!data.pwd) {
        errors.pwd = 'Password is required';
    } else if (!isValidPassword(data.pwd)) {
        errors.pwd = 'Password must be at least 6 characters.';
    }

    if (data.confirmPwd !== data.pwd) {
        errors.confirmPwd = 'Passwords do not match.';
    }

    return errors;
};

export const validateCreateUserForm = (data) => {
    const errors = {};

    if (!data.userName) {
        errors.userName = 'Username is required';
    } else if (data.userName.length < 3) {
        errors.userName = 'Username must be at least 3 characters.';
    }

    if (!data.email) {
        errors.email = 'Email is required';
    } else if (!isValidEmail(data.email)) {
        errors.email = 'Invalid email address format.';
    }

    if (!data.password) {
        errors.password = 'Password is required';
    } else if (data.password.length < 6) {
        errors.password = 'Password must be at least 6 characters.';
    }

    if (!data.role) {
        errors.role = 'Role must be selected.';
    }

    return errors;
};