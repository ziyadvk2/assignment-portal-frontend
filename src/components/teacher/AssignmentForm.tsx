import { useState } from "react";
import { useDispatch } from "react-redux";
import { addAssignment } from "../../redux/slices/assignmentSlice";
import { createAssignment } from "../../services/assignmentService";
import { FaTimes } from "react-icons/fa";
import { FaCalendarAlt } from 'react-icons/fa';

interface FormError {
  message: string;
}

export default function AssignmentForm() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<FormError | null>(null);
  const dispatch = useDispatch();
  const [isOpen, setIsOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const newAssignment = await createAssignment({
        title,
        description,
        dueDate,
      });
      dispatch(addAssignment(newAssignment));
      setTitle("");
      setDescription("");
      setDueDate("");
    } catch (err) {
      console.error("Assignment creation error:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Failed to create assignment";
      setError({ message: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => setError(null);

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow mb-6">
      <h2 className="text-xl font-semibold mb-4">Create Assignment</h2>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          <div className="flex justify-between items-center">
            <span>{error.message}</span>
            <button
              type="button"
              onClick={clearError}
              className="text-red-700 hover:text-red-900 transition-colors p-1"
            >
              <FaTimes size={16} />
            </button>
          </div>
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label
            htmlFor="title"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Title *
          </label>
          <input
            id="title"
            type="text"
            placeholder="Enter assignment title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border p-3 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
            disabled={loading}
          />
        </div>

        <div>
          <label
            htmlFor="description"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Description *
          </label>
          <textarea
            id="description"
            placeholder="Enter assignment description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full border p-3 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={4}
            required
            disabled={loading}
          />
        </div>
        <div className="relative">
          <div
            className="flex items-center gap-3 p-3 border border-gray-300 rounded-lg bg-white hover:border-blue-400 transition-colors cursor-pointer"
            onClick={() => setIsOpen(!isOpen)}
          >
            <FaCalendarAlt className="text-gray-400" />
            <span className="text-gray-700">
              {dueDate ? new Date(dueDate).toLocaleDateString() : "Select date"}
            </span>
          </div>

          {isOpen && (
            <div className="absolute top-full left-0 mt-2 p-4 bg-white border border-gray-200 rounded-lg shadow-xl z-10">
              <input
                type="date"
                value={dueDate}
                onChange={(e) => {
                  setDueDate(e.target.value);
                  setIsOpen(false);
                }}
                className="w-full p-2 border border-gray-300 rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
              />
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="bg-blue-500 text-white px-6 py-3 rounded hover:bg-blue-600 disabled:bg-blue-300 w-full"
        >
          {loading ? "Creating Assignment..." : "Create Assignment"}
        </button>
      </div>
    </form>
  );
}
