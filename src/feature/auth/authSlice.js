import { createSlice } from '@reduxjs/toolkit';

const authSlice = createSlice({
    name: 'auth',
    initialState: {
        currentUser: JSON.parse(localStorage.getItem('user')) || null,
        isLoading: false,
        error: null,
    },
    reducers: {
        loginStart: (state) => {
            state.isLoading = true;
            state.error = null;
        },

        loginSuccess: (state, action) => {
            state.isLoading = false;
            state.currentUser = action.payload;
            state.error = null;
            localStorage.setItem('user', JSON.stringify(action.payload));
        },

        loginFailed: (state, action) => {
            state.isLoading = false;
            state.error = action.payload;
        },

        logout: (state) => {
            state.currentUser = null;
            state.error = null;
            localStorage.removeItem('user');
            localStorage.removeItem('token'); // Thêm xóa token ở đây
        }
    },
});

export const authActions = authSlice.actions;

export const selectAuth = (state) => state.auth;

export default authSlice.reducer;