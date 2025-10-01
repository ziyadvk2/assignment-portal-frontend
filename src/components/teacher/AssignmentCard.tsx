import { useState } from "react";
import { useDispatch } from "react-redux";
import {
  updateAssignmentStatus,
  removeAssignment,
  updateAssignment,
} from "../../redux/slices/assignmentSlice";
import {
  updateAssignmentStatusService,
  deleteAssignment,
  updateAssignmentService,
} from "../../services/assignmentService";
import SubmissionsModal from "./SubmissionsModal";
import type { Assignment } from "../../redux/slices/assignmentSlice";
import { FaEdit, FaUpload, FaCheck, FaFileAlt } from "react-icons/fa";

export default function AssignmentCard({
  assignment,
}: {
  assignment: Assignment;
}) {
  const dispatch = useDispatch();
  const [showSubmissions, setShowSubmissions] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [editData, setEditData] = useState({
    title: assignment.title,
    description: assignment.description,
    dueDate: assignment.dueDate.split("T")[0],
  });

  const handlePublish = async () => {
    setLoading("publish");
    setError(null);
    try {
      const updated = await updateAssignmentStatusService(
        assignment._id,
        "published"
      );
      dispatch(
        updateAssignmentStatus({
          id: updated._id,
          status: updated.status,
          publishedAt: updated.publishedAt,
        })
      );
    } catch (err) {
      console.error("Publish error:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Failed to publish assignment";
      setError(errorMessage);
    } finally {
      setLoading(null);
    }
  };

  const handleComplete = async () => {
    setLoading("complete");
    setError(null);
    try {
      const updated = await updateAssignmentStatusService(
        assignment._id,
        "completed"
      );
      dispatch(
        updateAssignmentStatus({
          id: updated._id,
          status: updated.status,
          completedAt: updated.completedAt,
        })
      );
    } catch (err) {
      console.error("Complete error:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Failed to complete assignment";
      setError(errorMessage);
    } finally {
      setLoading(null);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this assignment?"))
      return;

    setLoading("delete");
    setError(null);
    try {
      await deleteAssignment(assignment._id);
      dispatch(removeAssignment(assignment._id));
    } catch (err) {
      console.error("Delete error:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Failed to delete assignment";
      setError(errorMessage);
    } finally {
      setLoading(null);
    }
  };

  const handleEdit = async () => {
    setLoading("edit");
    setError(null);
    try {
      const updated = await updateAssignmentService(assignment._id, {
        title: editData.title.trim(),
        description: editData.description.trim(),
        dueDate: editData.dueDate,
      });
      dispatch(updateAssignment(updated));
      setShowEditForm(false);
    } catch (err) {
      console.error("Edit error:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Failed to update assignment";
      setError(errorMessage);
    } finally {
      setLoading(null);
    }
  };

  const handleCancelEdit = () => {
    setEditData({
      title: assignment.title,
      description: assignment.description,
      dueDate: assignment.dueDate.split("T")[0],
    });
    setShowEditForm(false);
    setError(null);
  };

  const handleSubmissionsUpdate = () => {
    console.log("Submissions were updated, refreshing data...");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "draft":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "published":
        return "bg-green-100 text-green-800 border-green-200";
      case "completed":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "draft":
        return <FaEdit className="text-gray-500" />;
      case "published":
        return <FaUpload className="text-blue-500" />;
      case "completed":
        return <FaCheck className="text-green-500" />;
      default:
        return <FaFileAlt className="text-gray-400" />;
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
      {error && (
        <div className="bg-red-50 border-b border-red-200 p-3">
          <div className="flex justify-between items-center">
            <span className="text-red-700 text-sm">{error}</span>
            <button
              onClick={() => setError(null)}
              className="text-red-700 font-bold hover:text-red-800"
            >
              ×
            </button>
          </div>
        </div>
      )}

      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">
                {getStatusIcon(assignment.status)}
              </span>
              {!showEditForm ? (
                <h3 className="text-xl font-semibold text-gray-800">
                  {assignment.title}
                </h3>
              ) : (
                <input
                  type="text"
                  value={editData.title}
                  onChange={(e) =>
                    setEditData({ ...editData, title: e.target.value })
                  }
                  className="text-xl font-semibold text-gray-800 border border-gray-300 rounded px-3 py-1 w-full"
                  placeholder="Assignment title"
                />
              )}
            </div>
            {!showEditForm ? (
              <p className="text-gray-600 mb-3">{assignment.description}</p>
            ) : (
              <textarea
                value={editData.description}
                onChange={(e) =>
                  setEditData({ ...editData, description: e.target.value })
                }
                className="text-gray-600 mb-3 border border-gray-300 rounded px-3 py-2 w-full h-32 resize-none"
                placeholder="Assignment description"
              />
            )}
          </div>
          <div className="flex flex-col items-end gap-2 ml-4">
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(
                assignment.status
              )}`}
            >
              {assignment.status.charAt(0).toUpperCase() +
                assignment.status.slice(1)}
            </span>
            {!showEditForm ? (
              <span className="text-sm text-gray-500">
                Due: {new Date(assignment.dueDate).toLocaleDateString()}
              </span>
            ) : (
              <input
                type="date"
                value={editData.dueDate}
                onChange={(e) =>
                  setEditData({ ...editData, dueDate: e.target.value })
                }
                className="text-sm text-gray-500 border border-gray-300 rounded px-2 py-1"
                min={new Date().toISOString().split("T")[0]}
              />
            )}
          </div>
        </div>

        <div className="flex justify-between items-center text-sm text-gray-500 mb-6">
          <div className="flex items-center gap-4">
            <span>
              Created:{" "}
              {new Date(assignment.createdAt).toLocaleDateString("en-GB")}
            </span>
            {assignment.publishedAt && (
              <span>
                Published:{" "}
                {new Date(assignment.publishedAt).toLocaleDateString("en-GB")}
              </span>
            )}
            {assignment.completedAt && (
              <span>
                Completed:{" "}
                {new Date(assignment.completedAt).toLocaleDateString("en-GB")}
              </span>
            )}
          </div>
          <span className="font-medium">
            {assignment.submissions?.length || 0} submissions
          </span>
        </div>

        <div className="flex gap-3 flex-wrap">
          {assignment.status === "draft" && (
            <>
              {!showEditForm ? (
                <>
                  <button
                    onClick={handlePublish}
                    disabled={loading !== null}
                    className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-green-300 transition-colors"
                  >
                    {loading === "publish" ? (
                      <span className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Publishing...
                      </span>
                    ) : (
                      "Publish Assignment"
                    )}
                  </button>
                  <button
                    onClick={() => setShowEditForm(true)}
                    disabled={loading !== null}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-blue-300 transition-colors"
                  >
                    Edit Assignment
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={loading !== null}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:bg-red-300 transition-colors"
                  >
                    {loading === "delete" ? "Deleting..." : "Delete Draft"}
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={handleEdit}
                    disabled={loading !== null}
                    className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-green-300 transition-colors"
                  >
                    {loading === "edit" ? (
                      <span className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Saving...
                      </span>
                    ) : (
                      "Save Changes"
                    )}
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    disabled={loading !== null}
                    className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 disabled:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                </>
              )}
            </>
          )}

          {assignment.status === "published" && (
            <>
              <button
                onClick={handleComplete}
                disabled={loading !== null}
                className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:bg-purple-300 transition-colors"
              >
                {loading === "complete" ? (
                  <span className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Completing...
                  </span>
                ) : (
                  "Mark as Completed"
                )}
              </button>
              <button
                onClick={() => setShowSubmissions(true)}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                View Submissions ({assignment.submissions?.length || 0})
              </button>
            </>
          )}

          {assignment.status === "completed" && (
            <button
              onClick={() => setShowSubmissions(true)}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              View Submissions ({assignment.submissions?.length || 0})
            </button>
          )}
        </div>
      </div>

      {showSubmissions && (
        <SubmissionsModal
          assignmentId={assignment._id}
          assignmentTitle={assignment.title}
          submissions={assignment.submissions || []}
          assignmentStatus={assignment.status}
          onClose={() => setShowSubmissions(false)}
          onSubmissionsUpdate={handleSubmissionsUpdate}
        />
      )}
    </div>
  );
}
