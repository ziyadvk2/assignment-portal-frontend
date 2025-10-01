import { useState, useEffect } from "react";
import {
  getAssignmentSubmissionsService,
  reviewSubmissionService,
} from "../../services/assignmentService";
import type { Submission } from "../../redux/slices/assignmentSlice";
import {
  FaEdit,
  FaCheck,
  FaClock,
  FaInfoCircle,
  FaTimes,
} from "react-icons/fa";

interface SubmissionsModalProps {
  assignmentId: string;
  assignmentTitle: string;
  submissions: Submission[];
  assignmentStatus: string;
  onClose: () => void;
  onSubmissionsUpdate: () => void;
}

export default function SubmissionsModal({
  assignmentId,
  assignmentTitle,
  submissions: initialSubmissions,
  assignmentStatus,
  onClose,
}: SubmissionsModalProps) {
  const [submissions, setSubmissions] =
    useState<Submission[]>(initialSubmissions);
  const [loading, setLoading] = useState(false);
  const [reviewing, setReviewing] = useState<string | null>(null);

  useEffect(() => {
    const fetchSubmissions = async () => {
      setLoading(true);
      try {
        const data = await getAssignmentSubmissionsService(assignmentId);
        console.log("Fetched submissions:", data);
        setSubmissions(data);
      } catch (err) {
        console.error("Error fetching submissions:", err);
        alert("Failed to load submissions");
      } finally {
        setLoading(false);
      }
    };

    fetchSubmissions();
  }, [assignmentId]);

  const handleMarkAsReviewed = async (submissionId: string) => {
    setReviewing(submissionId);
    try {
      const updatedSubmission = await reviewSubmissionService(
        assignmentId,
        submissionId
      );

      const updatedSubmissions = submissions.map((sub) =>
        sub._id === submissionId ? updatedSubmission : sub
      );
      setSubmissions(updatedSubmissions);
    } catch (err) {
      console.error("Error marking as reviewed:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Failed to mark as reviewed";
      alert(errorMessage);
    } finally {
      setReviewing(null);
    }
  };

  const getReviewStatusStats = () => {
    const total = submissions.length;
    const reviewed = submissions.filter((sub) => sub.reviewed).length;
    const pending = total - reviewed;

    return { total, reviewed, pending };
  };

  const stats = getReviewStatusStats();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4 z-50">
      <div className="bg-white p-6 rounded-lg w-full max-w-6xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-xl font-semibold">
              Submissions for: {assignmentTitle}
            </h2>
            <p className="text-gray-600 text-sm mt-1">
              Status:{" "}
              <span
                className={`font-medium ${
                  assignmentStatus === "published"
                    ? "text-green-600"
                    : assignmentStatus === "completed"
                    ? "text-blue-600"
                    : "text-gray-600"
                }`}
              >
                {assignmentStatus?.toUpperCase()}
              </span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 p-1 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <FaTimes size={24} />
          </button>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-blue-600">
              {stats.total}
            </div>
            <div className="text-sm text-blue-600">Total Submissions</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-green-600">
              {stats.reviewed}
            </div>
            <div className="text-sm text-green-600">Reviewed</div>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {stats.pending}
            </div>
            <div className="text-sm text-yellow-600">Pending Review</div>
          </div>
        </div>

        {assignmentStatus === "completed" && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center">
              <FaInfoCircle className="w-5 h-5 text-blue-600 mr-2" />
              <span className="text-blue-800 font-medium">
                This assignment is completed. No further submissions are
                allowed.
              </span>
            </div>
          </div>
        )}

        {loading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <p className="mt-2 text-gray-600">Loading submissions...</p>
          </div>
        ) : submissions.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-10 text-gray-500">
            <div className="flex justify-center text-6xl mb-5 text-gray-400">
              <FaEdit size={64} />
            </div>
            <h3 className="text-lg font-semibold mb-3">No submissions yet</h3>
            <p className="max-w-md mx-auto">
              Students haven't submitted any answers for this assignment.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {submissions.map((submission, index) => (
              <div
                key={submission._id || `submission-${index}`}
                className="border rounded-lg p-6 bg-white shadow-sm"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-semibold text-lg text-gray-800">
                      {submission.studentName || `Student ${index + 1}`}
                    </h3>
                    <p className="text-sm text-gray-500">
                      Submitted:{" "}
                      {submission.submittedDate
                        ? new Date(submission.submittedDate).toLocaleString('en-GB')
                        : "Unknown date"}
                    </p>
                    {submission.reviewedAt && (
                      <p className="text-sm text-green-600">
                        Reviewed:{" "}
                        {new Date(submission.reviewedAt).toLocaleString('en-GB')}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1.5 ${
                        submission.reviewed
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {submission.reviewed ? (
                        <>
                          <FaCheck size={14} />
                          Reviewed
                        </>
                      ) : (
                        <>
                          <FaClock size={14} />
                          Pending Review
                        </>
                      )}
                    </span>

                    {!submission.reviewed && (
                      <button
                        onClick={() => handleMarkAsReviewed(submission._id)}
                        disabled={reviewing === submission._id}
                        className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 disabled:bg-blue-300 transition-colors"
                      >
                        {reviewing === submission._id
                          ? "Marking..."
                          : "Mark Reviewed"}
                      </button>
                    )}
                  </div>
                </div>

                <div className="mb-4">
                  <h4 className="font-semibold text-gray-700 mb-2">
                    Student's Answer:
                  </h4>
                  <div className="p-4 bg-gray-50 rounded-lg border">
                    <p className="text-gray-700 whitespace-pre-wrap">
                      {submission.answer || "No answer provided"}
                    </p>
                  </div>
                </div>

                {submission.reviewed && (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center mb-2">
                      <svg
                        className="w-4 h-4 text-green-600 mr-2"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="text-green-800 font-medium">
                        Reviewed by Teacher
                      </span>
                    </div>
                    <p className="text-green-700 text-sm">
                      This submission has been reviewed and approved.
                      {submission.reviewedAt &&
                        ` (Reviewed on ${new Date(
                          submission.reviewedAt
                        ).toLocaleDateString()})`}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
