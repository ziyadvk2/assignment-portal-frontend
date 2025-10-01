export interface User {
  id: string;
  name: string;
  email: string;
  role: "teacher" | "student";
}

export interface AuthResponse {
  token: string;
  user: User;
}
