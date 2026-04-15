import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

/**
 * Authentication service for managing user login, signup, and JWT tokens
 */
const authService = {
  /**
   * Register a new user
   */
  signup: async (username, email, password, password2) => {
    try {
      const response = await axios.post(`${API_URL}/register/`, {
        username,
        email,
        password,
        password2,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { detail: 'Signup failed' };
    }
  },

  /**
   * Login user and get tokens
   */
  login: async (username, password) => {
    try {
      const response = await axios.post(`${API_URL}/token/`, {
        username,
        password,
      });
      
      if (response.data.access) {
        localStorage.setItem('access_token', response.data.access);
        localStorage.setItem('refresh_token', response.data.refresh);
      }
      
      return response.data;
    } catch (error) {
      throw error.response?.data || { detail: 'Login failed' };
    }
  },

  /**
   * Logout user (clear tokens)
   */
  logout: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated: () => {
    return !!localStorage.getItem('access_token');
  },

  /**
   * Get current auth token
   */
  getAccessToken: () => {
    return localStorage.getItem('access_token');
  },

  /**
   * Get authorization headers for API calls
   */
  getAuthHeaders: () => {
    const token = localStorage.getItem('access_token');
    if (token) {
      return {
        Authorization: `Bearer ${token}`,
      };
    }
    return {};
  },

  /**
   * Refresh access token
   */
  refreshToken: async () => {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await axios.post(`${API_URL}/token/refresh/`, {
        refresh: refreshToken,
      });

      if (response.data.access) {
        localStorage.setItem('access_token', response.data.access);
      }

      return response.data;
    } catch (error) {
      authService.logout();
      throw error;
    }
  },
};

export default authService;
