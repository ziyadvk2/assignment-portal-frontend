import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import type { RootState } from "../redux/store";
import { logout } from "../redux/slices/userSlice";
import { setAssignments, setError } from "../redux/slices/assignmentSlice";
import { getAssignments } from "../services/assignmentService";
import AssignmentForm from "../components/teacher/AssignmentForm";
import AssignmentCard from "../components/teacher/AssignmentCard";
import { useNavigate } from "react-router-dom";
import type { AssignmentStatus } from "../redux/slices/assignmentSlice";
import {
  FaTimes,
  FaEdit,
  FaUpload,
  FaCheck,
  FaBook,
} from "react-icons/fa";

type FilterStatus = "all" | AssignmentStatus;

export default function TeacherDashboard() {
  const { user } = useSelector((state: RootState) => state.user);
  const { assignments, error: assignmentError } = useSelector(
    (state: RootState) => state.assignments
  );
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterStatus>("all");

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        setLoading(true);
        const data = await getAssignments();
        dispatch(setAssignments(data));
      } catch (err) {
        console.error("Error fetching assignments:", err);
        const errorMessage =
          err instanceof Error ? err.message : "Failed to fetch assignments";
        dispatch(setError(errorMessage));
      } finally {
        setLoading(false);
      }
    };

    fetchAssignments();
  }, [dispatch]);

  const filteredAssignments = assignments.filter((assignment) => {
    if (filter === "all") return true;
    return assignment.status === filter;
  });

  const statusCounts = {
    all: assignments.length,
    draft: assignments.filter((a) => a.status === "draft").length,
    published: assignments.filter((a) => a.status === "published").length,
    completed: assignments.filter((a) => a.status === "completed").length,
  };

  if (!user)
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  if (user.role !== "teacher")
    return (
      <div className="min-h-screen flex items-center justify-center">
        Unauthorized
      </div>
    );

  return (
    <div className="min-h-screen p-6 bg-gray-100">
      <header className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Teacher Dashboard</h1>
          <p className="text-gray-600">
            Manage your assignments and view student submissions
          </p>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-gray-700">
            {user.name} ({user.role})
          </span>
          <button
            onClick={() => {
              dispatch(logout());
              navigate("/");
            }}
            className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition-colors"
          >
            Logout
          </button>
        </div>
      </header>

      {assignmentError && (
        <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          <div className="flex justify-between items-center">
            <span>{assignmentError}</span>
            <button
              onClick={() => dispatch(setError(null))}
              className="text-red-700 hover:text-red-900 transition-colors"
            >
              <FaTimes size={18} />
            </button>
          </div>
        </div>
      )}

      <AssignmentForm />

      <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
        <h2 className="text-lg font-semibold mb-3">Filter Assignments</h2>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilter("all")}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filter === "all"
                ? "bg-blue-500 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            All ({statusCounts.all})
          </button>
          <button
            onClick={() => setFilter("draft")}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filter === "draft"
                ? "bg-yellow-500 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Draft ({statusCounts.draft})
          </button>
          <button
            onClick={() => setFilter("published")}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filter === "published"
                ? "bg-green-500 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Published ({statusCounts.published})
          </button>
          <button
            onClick={() => setFilter("completed")}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filter === "completed"
                ? "bg-blue-500 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Completed ({statusCounts.completed})
          </button>
        </div>
      </div>

      <section>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">
            {filter === "all"
              ? "All Assignments"
              : filter === "draft"
              ? "Draft Assignments"
              : filter === "published"
              ? "Published Assignments"
              : "Completed Assignments"}
          </h2>
          <span className="text-sm text-gray-500">
            Showing {filteredAssignments.length} of {assignments.length}{" "}
            assignments
          </span>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            <p className="mt-4 text-gray-600">Loading assignments...</p>
          </div>
        ) : filteredAssignments.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-12 bg-white rounded-lg shadow">
            <div className="text-gray-400 text-6xl mb-6 flex justify-center">
              {filter === "draft" ? (
                <FaEdit size={64} />
              ) : filter === "published" ? (
                <FaUpload size={64} />
              ) : filter === "completed" ? (
                <FaCheck size={64} />
              ) : (
                <FaBook size={64} />
              )}
            </div>
            <h3 className="text-xl font-semibold text-gray-600 mb-3">
              {filter === "all"
                ? "No assignments created yet"
                : filter === "draft"
                ? "No draft assignments"
                : filter === "published"
                ? "No published assignments"
                : "No completed assignments"}
            </h3>
            <p className="text-gray-500 max-w-md mx-auto">
              {filter === "all"
                ? "Create your first assignment using the form above."
                : filter === "draft"
                ? "Assignments in draft status will appear here."
                : filter === "published"
                ? "Published assignments will appear here for students to submit."
                : "Completed assignments will appear here after review."}
            </p>
          </div>
        ) : (
          <div className="grid gap-6">
            {filteredAssignments.map((assignment) => (
              <AssignmentCard key={assignment._id} assignment={assignment} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
