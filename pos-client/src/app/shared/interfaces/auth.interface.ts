export interface User {
  id: string;
  email: string;
  name: string;
  role: {
    id: string;
    name: string;
    label?: string | null;
  };
  isActive: boolean;
  createdAt: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}
