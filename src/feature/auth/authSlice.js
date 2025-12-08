import { createSlice } from '@reduxjs/toolkit';

const authSlice = createSlice({
    name: 'auth',
    initialState: {
        currentUser: JSON.parse(localStorage.getItem('user')) || null,
        isLoading: false,
        error: null,
    },
    reducers: {
        // Call API -> Bật loading, xóa lỗi cũ
        loginStart: (state) => {
            state.isLoading = true;
            state.error = null;
        },

        // Success -> store user, tắt loading
        loginSuccess: (state, action) => {
            state.isLoading = false;
            state.currentUser = action.payload;
            state.error = null;
            localStorage.setItem('user', JSON.stringify(action.payload));
        },

        // Fail -> Lưu lỗi, tắt loading
        loginFailed: (state, action) => {
            state.isLoading = false;
            state.error = action.payload;
        },

        // Logout
        logout: (state) => {
            state.currentUser = null;
            state.error = null;
            localStorage.removeItem('user');
        }
    },
});

// Export actions
export const authActions = authSlice.actions;

// Export selector
export const selectAuth = (state) => state.auth;

// Export reducer
export default authSlice.reducer;