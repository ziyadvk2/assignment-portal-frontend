import { useState } from "react";
import type {
  Assignment,
  Submission,
} from "../../redux/slices/assignmentSlice";
import { submitAssignment } from "../../services/studentService";
import { FaTimes, FaExclamationTriangle, FaCheckCircle } from "react-icons/fa";

interface AssignmentCardProps {
  assignment: Assignment;
  submission?: Submission;
  onAssignmentSubmitted: () => void;
}

export default function AssignmentCard({
  assignment,
  submission,
  onAssignmentSubmitted,
}: AssignmentCardProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSubmissionForm, setShowSubmissionForm] = useState(false);
  const [answer, setAnswer] = useState("");
  const [error, setError] = useState<string | null>(null);

  const hasSubmitted = !!submission;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!answer.trim()) {
      setError("Please write your answer before submitting");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await submitAssignment(assignment._id, answer.trim());
      setShowSubmissionForm(false);
      setAnswer("");
      onAssignmentSubmitted();
    } catch (err) {
      console.error("Submission error:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Failed to submit assignment";
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDueDate = (dueDate: string) => {
    const date = new Date(dueDate);
    const now = new Date();
    const timeDiff = date.getTime() - now.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));

    if (daysDiff < 0) {
      return <span className="text-red-600 font-semibold">Overdue</span>;
    } else if (daysDiff === 0) {
      return <span className="text-orange-600 font-semibold">Due today</span>;
    } else if (daysDiff === 1) {
      return <span className="text-orange-500">Due tomorrow</span>;
    } else {
      return `Due in ${daysDiff} days`;
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              {assignment.title}
            </h3>
            <p className="text-gray-600 mb-3">{assignment.description}</p>
          </div>
          <div className="flex flex-col items-end gap-2 ml-4">
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                hasSubmitted
                  ? "bg-green-100 text-green-800"
                  : "bg-blue-100 text-blue-800"
              }`}
            >
              {hasSubmitted ? "Submitted" : "Not Submitted"}
            </span>
            <span className="text-sm text-gray-500">
              {formatDueDate(assignment.dueDate)}
            </span>
          </div>
        </div>

        <div className="flex justify-between items-center text-sm text-gray-500 mb-4">
          <span>Due: {new Date(assignment.dueDate).toLocaleDateString()}</span>
          <span>{assignment.submissions?.length || 0} submissions</span>
        </div>
        {hasSubmitted && submission && (
          <div className="mb-4 p-4 bg-gray-50 rounded-lg border">
            <h4 className="font-semibold text-gray-700 mb-2">
              Your Submission:
            </h4>
            <p className="text-gray-600 whitespace-pre-wrap">
              {submission.answer}
            </p>
            <div className="flex justify-between items-center mt-2 text-sm text-gray-500">
              <span>
                Submitted: {new Date(submission.submittedDate).toLocaleString()}
              </span>
              <span
                className={`px-2 py-1 rounded ${
                  submission.reviewed
                    ? "bg-green-100 text-green-800"
                    : "bg-yellow-100 text-yellow-800"
                }`}
              >
                {submission.reviewed ? "Reviewed" : "Pending Review"}
              </span>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <FaExclamationTriangle className="text-red-600" />
                <span>{error}</span>
              </div>
              <button
                onClick={() => setError(null)}
                className="text-red-700 font-bold hover:text-red-800 transition-colors"
              >
                <FaTimes />
              </button>
            </div>
          </div>
        )}

        {!hasSubmitted ? (
          <div className="flex gap-3">
            {!showSubmissionForm ? (
              <button
                onClick={() => setShowSubmissionForm(true)}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Submit Answer
              </button>
            ) : (
              <button
                onClick={() => {
                  setShowSubmissionForm(false);
                  setAnswer("");
                  setError(null);
                }}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-2 text-green-600 font-medium">
            <FaCheckCircle className="text-green-500" />
            <span>You have already submitted this assignment</span>
          </div>
        )}

        {showSubmissionForm && !hasSubmitted && (
          <form
            onSubmit={handleSubmit}
            className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200"
          >
            <h4 className="font-semibold text-gray-700 mb-3">
              Submit Your Answer
            </h4>
            <textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Write your answer here..."
              className="w-full h-32 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              required
              disabled={isSubmitting}
            />
            <div className="flex justify-between items-center mt-3">
              <p className="text-sm text-gray-600">
                Note: You can only submit once per assignment
              </p>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-green-300 transition-colors"
              >
                {isSubmitting ? (
                  <span className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Submitting...
                  </span>
                ) : (
                  "Submit Answer"
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
