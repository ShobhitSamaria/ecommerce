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
        throw error.response ? error.response.data : "Server Error";
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
        throw error.response ? error.response.data : "Invalid Credentials";
    }
};

