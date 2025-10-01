import axios from "axios";
import type { Assignment, AssignmentStatus, Submission } from "../redux/slices/assignmentSlice";

const API_BASE_URL =  "http://localhost:5000";

interface ValidationError {
  msg: string;
  param: string;
  location: string;
}

interface ApiErrorResponse {
  errors?: ValidationError[];
  message?: string;
  success?: boolean;
}

interface AssignmentsResponse {
  assignments: Assignment[];
  totalPages?: number;
  currentPage?: number;
  total?: number;
}

interface AssignmentSubmissionsResponse {
  assignment: {
    _id: string;
    title: string;
    description: string;
    status: AssignmentStatus;
  };
  submissions: Submission[];
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

export const createAssignment = async (data: {
  title: string;
  description: string;
  dueDate: string;
}): Promise<Assignment> => {
  try {
    const res = await api.post<Assignment>("/api/assignments", data);
    return res.data;
  } catch (error) {
    console.error("Error creating assignment:", error);
    
    if (axios.isAxiosError(error)) {
      if (error.response) {
        const errorData = error.response.data as ApiErrorResponse;
        if (errorData.errors) {
          const errorMessages = errorData.errors.map((err) => err.msg).join(", ");
          throw new Error(errorMessages);
        } else if (errorData.message) {
          throw new Error(errorData.message);
        } else if (error.response.status === 404) {
          throw new Error("API endpoint not found. Please check if the server is running.");
        } else if (error.response.status === 500) {
          throw new Error("Server error. Please try again later.");
        }
      } else if (error.request) {
        throw new Error("No response from server. Please check your connection.");
      }
    }
    
    throw new Error("Failed to create assignment. Please try again.");
  }
};

export const getAssignments = async (): Promise<Assignment[]> => {
  try {
    const res = await api.get<AssignmentsResponse>("/api/assignments");
    return res.data.assignments || [];
  } catch (error) {
    console.error("Error fetching assignments:", error);
    throw new Error("Failed to fetch assignments");
  }
};

export const updateAssignmentStatusService = async (
  id: string,
  status: AssignmentStatus
): Promise<Assignment> => {
  try {
    let endpoint = "";
    if (status === "published") {
      endpoint = `/api/assignments/${id}/publish`;
    } else if (status === "completed") {
      endpoint = `/api/assignments/${id}/complete`;
    } else {
      throw new Error("Invalid status");
    }

    const res = await api.patch<Assignment>(endpoint);
    return res.data;
  } catch (error) {
    console.error("Error updating assignment status:", error);
    
    if (axios.isAxiosError(error) && error.response?.data) {
      const errorData = error.response.data as ApiErrorResponse;
      if (errorData.message) {
        throw new Error(errorData.message);
      }
    }
    
    throw new Error("Failed to update assignment status");
  }
};

export const deleteAssignment = async (id: string): Promise<void> => {
  try {
    await api.delete(`/api/assignments/${id}`);
  } catch (error) {
    console.error("Error deleting assignment:", error);
    
    if (axios.isAxiosError(error) && error.response?.data) {
      const errorData = error.response.data as ApiErrorResponse;
      if (errorData.message) {
        throw new Error(errorData.message);
      }
    }
    
    throw new Error("Failed to delete assignment");
  }
};

export const getAssignmentSubmissionsService = async (
  id: string
): Promise<Submission[]> => {
  try {
    const res = await api.get<AssignmentSubmissionsResponse>(`/api/assignments/${id}/submissions`);
    console.log("Submissions API response:", res.data);
    return res.data.submissions || [];
  } catch (error) {
    console.error("Error fetching submissions:", error);
    
    if (axios.isAxiosError(error) && error.response?.data) {
      const errorData = error.response.data as ApiErrorResponse;
      if (errorData.message) {
        throw new Error(errorData.message);
      }
    }
    
    throw new Error("Failed to fetch submissions");
  }
};

export const reviewSubmissionService = async (
  assignmentId: string,
  submissionId: string
): Promise<Submission> => {
  try {
    const res = await api.patch<{ submission: Submission }>(
      `/api/assignments/${assignmentId}/submissions/${submissionId}/review`
    );
    return res.data.submission;
  } catch (error) {
    console.error("Error reviewing submission:", error);
    
    if (axios.isAxiosError(error) && error.response?.data) {
      const errorData = error.response.data as ApiErrorResponse;
      if (errorData.message) {
        throw new Error(errorData.message);
      }
    }
    
    throw new Error("Failed to review submission");
  }
};

export const updateAssignmentService = async (
  id: string,
  data: {
    title?: string;
    description?: string;
    dueDate?: string;
  }
): Promise<Assignment> => {
  try {
    const res = await api.put<Assignment>(`/api/assignments/${id}`, data);
    return res.data;
  } catch (error) {
    console.error("Error updating assignment:", error);
    
    if (axios.isAxiosError(error)) {
      if (error.response) {
        const errorData = error.response.data as ApiErrorResponse;
        if (error.response.status === 404) {
          throw new Error("Assignment not found or cannot be edited");
        } else if (errorData.message) {
          throw new Error(errorData.message);
        }
      } else if (error.request) {
        throw new Error("No response from server. Please check your connection.");
      }
    }
    
    throw new Error("Failed to update assignment");
  }
};