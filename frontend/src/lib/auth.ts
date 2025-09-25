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

class AuthService {
  async getCsrfToken() {
    await api.get("/sanctum/csrf-cookie");
  }

  async login(credentials: LoginCredentials): Promise<User> {
    // First, get CSRF token
    await this.getCsrfToken();

    // Then login using API route (not web route)
    const response = await api.post("/api/login", credentials);

    // Return user data directly from login response
    return response.data.user;
  }

  async me(): Promise<User> {
    const response = await api.get("/api/me");
    return response.data;
  }

  async logout(): Promise<void> {
    await api.post("/api/logout");
  }
}

export const authService = new AuthService();
