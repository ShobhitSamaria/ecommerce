import axios from 'axios';

// Backend URL (User Service)
const API_URL = "http://localhost:8081/api/users";

export const register = async (fullName, email, password) => {
    try {
        const response = await axios.post(`${API_URL}/register`, {
            fullName,
            email,
            password
        });
        return response.data;
    } catch (error) {
        // Handling negative test cases from backend
        const errorData = error.response?.data;
        // Extract message from response (could be string or object with "error" key)
        const message = errorData?.error || errorData?.message || errorData || "Server Error";
        throw message;
    }
};

export const login = async (email, password) => {
    try {
        const response = await axios.post(`${API_URL}/login`, {
            email,
            password
        });
        if (response.data.token) {
            // Saving token and user info in browser's storage
            localStorage.setItem("user", JSON.stringify(response.data));
        }
        return response.data;
    } catch (error) {
        const errorData = error.response?.data;
        const message = errorData?.error || errorData?.message || errorData || "Invalid Credentials";
        throw message;
    }
};

