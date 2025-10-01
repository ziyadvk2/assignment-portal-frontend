import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export type AssignmentStatus = "draft" | "published" | "completed";

export interface Submission {
  _id: string;
  assignmentId: string;
  assignmentTitle?: string;
  studentName: string;
  answer: string;
  submittedDate: string;
  reviewed: boolean;
  reviewedAt?: string;
  studentId?: string;
}

export interface Assignment {
  _id: string;
  title: string;
  description: string;
  dueDate: string;
  status: AssignmentStatus;
  submissions: Submission[];
  teacher: string;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  completedAt?: string;
}

interface AssignmentState {
  assignments: Assignment[];
  loading: boolean;
  error: string | null;
}

const initialState: AssignmentState = {
  assignments: [],
  loading: false,
  error: null,
};

const assignmentSlice = createSlice({
  name: "assignments",
  initialState,
  reducers: {
    setAssignments(state, action: PayloadAction<Assignment[]>) {
      state.assignments = action.payload || [];
      state.loading = false;
      state.error = null;
    },
    addAssignment(state, action: PayloadAction<Assignment>) {
      state.assignments.unshift(action.payload);
    },
    updateAssignmentStatus(
      state,
      action: PayloadAction<{
        id: string;
        status: AssignmentStatus;
        publishedAt?: string;
        completedAt?: string;
      }>
    ) {
      const index = state.assignments.findIndex(
        (a) => a._id === action.payload.id
      );
      if (index !== -1) {
        state.assignments[index].status = action.payload.status;
        if (action.payload.publishedAt) {
          state.assignments[index].publishedAt = action.payload.publishedAt;
        }
        if (action.payload.completedAt) {
          state.assignments[index].completedAt = action.payload.completedAt;
        }
      }
    },
    removeAssignment(state, action: PayloadAction<string>) {
      state.assignments = state.assignments.filter(
        (a) => a._id !== action.payload
      );
    },
    updateAssignment(state, action: PayloadAction<Assignment>) {
      const index = state.assignments.findIndex(
        (a) => a._id === action.payload._id
      );
      if (index !== -1) {
        state.assignments[index] = action.payload;
      }
    },
    updateSubmissionReviewStatus(
      state,
      action: PayloadAction<{
        assignmentId: string;
        submissionId: string;
        reviewed: boolean;
        reviewedAt?: string;
      }>
    ) {
      const assignment = state.assignments.find(
        (a) => a._id === action.payload.assignmentId
      );
      if (assignment) {
        const submission = assignment.submissions.find(
          (s) => s._id === action.payload.submissionId
        );
        if (submission) {
          submission.reviewed = action.payload.reviewed;
          if (action.payload.reviewedAt) {
            submission.reviewedAt = action.payload.reviewedAt;
          }
        }
      }
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
    setError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
      state.loading = false;
    },
    clearError(state) {
      state.error = null;
    },
  },
});

export const {
  setAssignments,
  addAssignment,
  updateAssignment,
  updateAssignmentStatus,
  removeAssignment,
  updateSubmissionReviewStatus,
  setLoading,
  setError,
  clearError,
} = assignmentSlice.actions;

export default assignmentSlice.reducer;
