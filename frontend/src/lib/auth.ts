import api from "./axios";

export interface User {
  id: number;
  name: string;
  email: string;
  role_id: number;
  role_name: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

interface LoginResponse {
  user: User;
  token: string;
  message: string;
}

class AuthService {
  private readonly TOKEN_KEY = "clinic_auth_token";

  // Get stored token
  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  // Store token
  setToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  // Remove token
  removeToken(): void {
    localStorage.removeItem(this.TOKEN_KEY);
  }

  async login(credentials: LoginCredentials): Promise<User> {
    try {
      const response = await api.post<LoginResponse>("/api/login", credentials);

      // Store token in localStorage
      this.setToken(response.data.token);

      // Set authorization header for future requests
      api.defaults.headers.common[
        "Authorization"
      ] = `Bearer ${response.data.token}`;

      return response.data.user;
    } catch (error) {
      // Remove any existing token on failed login
      this.removeToken();
      throw error;
    }
  }

  async me(): Promise<User> {
    try {
      // Ensure token is set in header
      const token = this.getToken();
      if (token) {
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      } else {
        throw new Error("No authentication token found");
      }

      const response = await api.get("/api/me");
      return response.data;
    } catch (error) {
      // If 401, clear token and re-throw
      if (error && typeof error === "object" && "response" in error) {
        const axiosError = error as { response?: { status?: number } };
        if (axiosError.response?.status === 401) {
          this.removeToken();
          delete api.defaults.headers.common["Authorization"];
        }
      }
      throw error;
    }
  }

  async logout(): Promise<void> {
    try {
      await api.post("/api/logout");
    } catch (error) {
      console.warn("Logout request failed:", error);
    } finally {
      // Always clear local token and header
      this.removeToken();
      delete api.defaults.headers.common["Authorization"];
    }
  }

  // Initialize token from localStorage on app start
  initializeAuth(): void {
    const token = this.getToken();
    if (token) {
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    }
  }
}

export const authService = new AuthService();
