import axios from "axios";

const API_BASE = "http://localhost:5000/api/auth";

export const signup = async (data) => {
    const response = await axios.post(`${API_BASE}/signup`, data);
    if (response.data.token) {
        localStorage.setItem("user", JSON.stringify(response.data));
    }
    return response.data;
};

export const login = async (data) => {
    const response = await axios.post(`${API_BASE}/login`, data);
    if (response.data.token) {
        localStorage.setItem("user", JSON.stringify(response.data));
    }
    return response.data;
};

export const logout = () => {
    localStorage.removeItem("user");
};
