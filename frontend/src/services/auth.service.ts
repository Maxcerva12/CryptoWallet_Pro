import api from "./api";

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  fullName: string;
  email: string;
  password: string;
  phone?: string;
}

export interface User {
  id: string;
  fullName: string;
  email: string;
  role: "user" | "merchant" | "admin";
  phone?: string;
  createdAt?: string;
  wallet?: {
    id: string;
    address: string;
    balance: string;
    currency: string;
  };
  merchant?: {
    id: string;
    businessName: string;
    category: string;
  };
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  token: string;
  user: User;
}

class AuthService {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>("/auth/login", credentials);
    if (response.data.success && response.data.token) {
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));
    }
    return response.data;
  }

  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>("/auth/register", data);
    if (response.data.success && response.data.token) {
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));
    }
    return response.data;
  }

  async updateProfile(data: { phone?: string }): Promise<any> {
    const response = await api.put("/auth/profile", data);
    if (response.data.success) {
      const updatedUser = response.data.user;
      localStorage.setItem("user", JSON.stringify(updatedUser));
    }
    return response.data;
  }

  logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  }

  getCurrentUser(): User | null {
    const userStr = localStorage.getItem("user");
    return userStr ? JSON.parse(userStr) : null;
  }

  async fetchCurrentUser(): Promise<{ success: boolean; user: User }> {
    const response = await api.get("/auth/me");
    return response.data;
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem("token");
  }

  getToken(): string | null {
    return localStorage.getItem("token");
  }
}

export default new AuthService();
