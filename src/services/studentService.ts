import axios from "axios";
import type { Assignment, Submission } from "../redux/slices/assignmentSlice";

const API_BASE_URL =  "http://localhost:5000";

interface ApiErrorResponse {
  errors?: Array<{ msg: string }>;
  message?: string;
  success?: boolean;
}

interface SubmitAssignmentResponse {
  submission: Submission;
  message: string;
  success: boolean;
}

interface StudentSubmissionsResponse {
  submissions: Submission[];
  success: boolean;
}

interface PublishedAssignmentsResponse {
  assignments: Assignment[];
  success: boolean;
}

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export const getPublishedAssignments = async (): Promise<Assignment[]> => {
  try {
    const res = await api.get<PublishedAssignmentsResponse>("/api/student/assignments");
    if (res.data.success) {
      return res.data.assignments || [];
    } else {
      throw new Error("Failed to fetch assignments");
    }
  } catch (error) {
    console.error("Error fetching published assignments:", error);
    
    if (axios.isAxiosError(error)) {
      if (error.response) {
        const errorData = error.response.data as ApiErrorResponse;
        if (error.response.status === 404) {
          throw new Error("Student routes not configured on server");
        } else if (errorData.message) {
          throw new Error(errorData.message);
        }
      } else if (error.request) {
        throw new Error("No response from server. Please check if the backend is running.");
      }
    }
    
    throw new Error("Failed to fetch assignments. Please try again later.");
  }
};

export const getStudentSubmissions = async (): Promise<Submission[]> => {
  try {
    const res = await api.get<StudentSubmissionsResponse>("/api/student/submissions");
    if (res.data.success) {
      return res.data.submissions || [];
    } else {
      throw new Error("Failed to fetch submissions");
    }
  } catch (error) {
    console.error("Error fetching student submissions:", error);
    
    if (axios.isAxiosError(error) && error.response?.data) {
      const errorData = error.response.data as ApiErrorResponse;
      if (errorData.message) {
        throw new Error(errorData.message);
      }
    }
    
    throw new Error("Failed to fetch submissions");
  }
};

export const submitAssignment = async (
  assignmentId: string, 
  answer: string
): Promise<Submission> => {
  try {
    const res = await api.post<SubmitAssignmentResponse>(
      `/api/student/assignments/${assignmentId}/submit`,
      { answer }
    );
    if (res.data.success) {
      return res.data.submission;
    } else {
      throw new Error("Failed to submit assignment");
    }
  } catch (error) {
    console.error("Error submitting assignment:", error);
    
    if (axios.isAxiosError(error)) {
      if (error.response) {
        const errorData = error.response.data as ApiErrorResponse;
        if (error.response.status === 400) {
          throw new Error(errorData.message || "You have already submitted this assignment");
        } else if (error.response.status === 404) {
          throw new Error("Assignment not found or not available for submission");
        } else if (errorData.message) {
          throw new Error(errorData.message);
        }
      } else if (error.request) {
        throw new Error("No response from server. Please check your connection.");
      }
    }
    
    throw new Error("Failed to submit assignment");
  }
};

