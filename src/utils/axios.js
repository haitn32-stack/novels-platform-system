import axios from "axios";

const baseURL = "http://localhost:9999/";

export const instance = axios.create({
    baseURL: baseURL
});