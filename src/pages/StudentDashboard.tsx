import { useEffect, useState, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import type { RootState } from "../redux/store";
import { logout } from "../redux/slices/userSlice";
import { useNavigate } from "react-router-dom";
import { getPublishedAssignments, getStudentSubmissions } from "../services/studentService";
import type { Assignment, Submission } from "../redux/slices/assignmentSlice";
import AssignmentList from "../components/student/AssignmentList";
import SubmissionList from "../components/student/SubmissionList";

type ViewMode = "assignments" | "submissions";

export default function StudentDashboard() {
  const { user } = useSelector((state: RootState) => state.user);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("assignments");
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const fetchAllData = useCallback(async () => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    try {
      console.log("Fetching all data for student:", user.id);
      
      const [assignmentsData, submissionsData] = await Promise.all([
        getPublishedAssignments(),
        getStudentSubmissions()
      ]);
      
      console.log("Assignments:", assignmentsData);
      console.log("Submissions:", submissionsData);
      
      setAssignments(assignmentsData);
      setSubmissions(submissionsData);
    } catch (err) {
      console.error("Error fetching data:", err);
      const errorMessage = err instanceof Error ? err.message : "Failed to load data";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/");
  };

  const handleAssignmentSubmitted = useCallback(() => {
    console.log("Assignment submitted, refreshing data...");
    
    setLoading(true);
    Promise.all([getPublishedAssignments(), getStudentSubmissions()])
      .then(([assignmentsData, submissionsData]) => {       
        setAssignments(assignmentsData);
        setSubmissions(submissionsData);
        setViewMode("submissions"); 
      })
      .catch(err => {
        console.error("Error refreshing data:", err);
        setError("Failed to refresh data after submission");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const handleRetry = useCallback(() => {
    setError(null);
    fetchAllData();
  }, [fetchAllData]);

  if (!user) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-xl">Loading user information...</div>
      </div>
    );
  }

  if (user.role !== "student") {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-xl text-red-600 font-semibold">Unauthorized – Students only</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <header className="bg-white shadow rounded-xl p-4 mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Student Dashboard</h1>
          <p className="text-gray-600">Welcome back, {user.name}!</p>
        </div>
        <div className="flex items-center gap-4">
          <span className="font-medium bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
            {user.role}
          </span>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-xl shadow mb-6">
        <div className="flex border-b">
          <button
            onClick={() => setViewMode("assignments")}
            className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${
              viewMode === "assignments"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-600 hover:text-gray-800"
            }`}
          >
            Available Assignments
            <span className="ml-2 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
              {assignments.length}
            </span>
          </button>
          <button
            onClick={() => setViewMode("submissions")}
            className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${
              viewMode === "submissions"
                ? "text-green-600 border-b-2 border-green-600"
                : "text-gray-600 hover:text-gray-800"
            }`}
          >
            My Submissions
            <span className="ml-2 bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
              {submissions.length}
            </span>
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          <div className="flex justify-between items-center">
            <div className="flex-1">
              <span className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                {error}
              </span>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={handleRetry}
                className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
              >
                Retry
              </button>
              <button 
                onClick={() => setError(null)}
                className="text-red-700 font-bold text-lg hover:text-red-800"
              >
                ×
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            <p className="mt-4 text-gray-600">Loading {viewMode}...</p>
          </div>
        </div>
      ) : viewMode === "assignments" ? (
        <AssignmentList 
          assignments={assignments} 
          submissions={submissions}
          onAssignmentSubmitted={handleAssignmentSubmitted}
        />
      ) : (
        <SubmissionList submissions={submissions} />
      )}
    </div>
  );
}