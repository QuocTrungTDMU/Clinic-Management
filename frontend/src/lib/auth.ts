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
  private readonly USER_KEY = "clinic_auth_user";

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

  // Get cached user from localStorage
  getCachedUser(): User | null {
    try {
      const cached = localStorage.getItem(this.USER_KEY);
      if (cached) {
        return JSON.parse(cached);
      }
    } catch (error) {
      console.error("Failed to parse cached user:", error);
      localStorage.removeItem(this.USER_KEY);
    }
    return null;
  }

  // Store user in localStorage
  setCachedUser(user: User): void {
    try {
      localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    } catch (error) {
      console.error("Failed to cache user:", error);
    }
  }

  // Remove cached user
  removeCachedUser(): void {
    localStorage.removeItem(this.USER_KEY);
  }

  async login(credentials: LoginCredentials): Promise<User> {
    try {
      const response = await api.post<LoginResponse>("/login", credentials);

      // Store token in localStorage
      this.setToken(response.data.token);

      // Cache user data in localStorage
      this.setCachedUser(response.data.user);

      // Set authorization header for future requests
      api.defaults.headers.common[
        "Authorization"
      ] = `Bearer ${response.data.token}`;

      return response.data.user;
    } catch (error) {
      // Remove any existing token on failed login
      this.removeToken();
      this.removeCachedUser();
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

      const response = await api.get("/me");

      // Cache the fresh user data
      this.setCachedUser(response.data);

      return response.data;
    } catch (error) {
      // If 401, clear token and re-throw
      if (error && typeof error === "object" && "response" in error) {
        const axiosError = error as { response?: { status?: number } };
        if (axiosError.response?.status === 401) {
          this.removeToken();
          this.removeCachedUser();
          delete api.defaults.headers.common["Authorization"];
        }
      }
      throw error;
    }
  }

  async logout(): Promise<void> {
    try {
      await api.post("/logout");
    } catch (error) {
      console.warn("Logout request failed:", error);
    } finally {
      // Always clear local token, cached user, and header
      this.removeToken();
      this.removeCachedUser();
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
