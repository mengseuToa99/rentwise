// Base URL (adjust based on environment)
export const API_BASE_URL =
    process.env.REACT_APP_API_URL || "http://localhost:8000/api/rentwise";

// Endpoints
export const API_ENDPOINTS = {
    POSTS: `${API_BASE_URL}/posts`,
    USERS: `${API_BASE_URL}/create-user`,
    LOGIN: `${API_BASE_URL}/login`,
};
