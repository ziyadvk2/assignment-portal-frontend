import type { Submission } from "../../redux/slices/assignmentSlice";
import { FaCheckCircle, FaUpload } from "react-icons/fa";

interface SubmissionListProps {
  submissions: Submission[];
}

export default function SubmissionList({ submissions }: SubmissionListProps) {
  const sortedSubmissions = [...submissions].sort(
    (a, b) =>
      new Date(b.submittedDate).getTime() - new Date(a.submittedDate).getTime()
  );

  if (submissions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-center py-12 bg-white rounded-xl shadow">
        <div className="text-gray-400 text-6xl mb-6 flex justify-center">
          <FaUpload size={64} />
        </div>
        <h3 className="text-xl font-semibold text-gray-600 mb-3">
          No Submissions Yet
        </h3>
        <p className="text-gray-500 max-w-xs mx-auto">
          Submit your first assignment to see it here!
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-6">
      {sortedSubmissions.map((submission) => (
        <div
          key={submission._id}
          className="bg-white rounded-xl shadow-lg border border-gray-200 p-6"
        >
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-1">
                {submission.assignmentTitle || "Assignment"}
              </h3>
              <p className="text-gray-600 text-sm">
                Submitted on{" "}
                {new Date(submission.submittedDate).toLocaleString()}
              </p>
            </div>
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                submission.reviewed
                  ? "bg-green-100 text-green-800"
                  : "bg-yellow-100 text-yellow-800"
              }`}
            >
              {submission.reviewed ? "Reviewed" : "Pending Review"}
            </span>
          </div>

          <div className="mb-4">
            <h4 className="font-semibold text-gray-700 mb-2">Your Answer:</h4>
            <div className="p-4 bg-gray-50 rounded-lg border">
              <p className="text-gray-700 whitespace-pre-wrap">
                {submission.answer}
              </p>
            </div>
          </div>

          {submission.reviewed && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-800 font-medium flex items-center gap-2">
                <FaCheckCircle
                  size={18}
                  className="text-green-600 flex-shrink-0"
                />
                Your submission has been reviewed by the teacher
              </p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
