import axios from "axios";

const API_BASE = "http://localhost:5000/api/user";

// Helper to get token
const getToken = () => {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user).token : null;
};

export const getUserProfile = async () => {
    const token = getToken();
    const config = {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };
    const response = await axios.get(`${API_BASE}/profile`, config);
    return response.data;
};

export const updateUserProfile = async (formData) => {
    const token = getToken();
    const config = {
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
        },
    };
    const response = await axios.put(`${API_BASE}/profile`, formData, config);
    return response.data;
};
