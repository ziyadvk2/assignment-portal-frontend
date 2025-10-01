import axios from "axios";
import type{ AuthResponse } from "../types/types";

const API_URL = "http://localhost:5000/api/auth";

export const loginUser = (email: string, password: string) => {
  return axios.post<AuthResponse>(`${API_URL}/login`, { email, password });
};

export const registerUser = (
  name: string,
  email: string,
  password: string,
  role: "teacher" | "student"
) => {
  return axios.post(`${API_URL}/register`, { name, email, password, role });
};
