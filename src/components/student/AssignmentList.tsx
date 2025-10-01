import { useState } from "react";
import type {
  Assignment,
  Submission,
} from "../../redux/slices/assignmentSlice";
import AssignmentCard from "./AssignmentCard";
import { FaEdit } from "react-icons/fa";

interface AssignmentListProps {
  assignments: Assignment[];
  submissions: Submission[];
  onAssignmentSubmitted: () => void;
}

export default function AssignmentList({
  assignments,
  submissions,
  onAssignmentSubmitted,
}: AssignmentListProps) {
  const [filter, setFilter] = useState<"all" | "submitted" | "pending">("all");

  const submittedAssignmentIds = new Set(
    submissions
      .filter((submission) => {
        const assignment = assignments.find(
          (a) => a._id === submission.assignmentId
        );
        return assignment && assignment.status === "published";
      })
      .map((submission) => submission.assignmentId)
  );

  const filteredAssignments = assignments.filter((assignment) => {
    if (assignment.status !== "published") {
      return false;
    }

    const isSubmitted = submittedAssignmentIds.has(assignment._id);

    switch (filter) {
      case "submitted":
        return isSubmitted;
      case "pending":
        return !isSubmitted;
      default:
        return true;
    }
  });
  const publishedAssignments = assignments.filter(
    (a) => a.status === "published"
  );
  const pendingCount = publishedAssignments.filter(
    (a) => !submittedAssignmentIds.has(a._id)
  ).length;
  const submittedCount = submittedAssignmentIds.size;

  return (
    <div>
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setFilter("all")}
          className={`px-4 py-2 rounded-lg transition-colors ${
            filter === "all"
              ? "bg-blue-500 text-white"
              : "bg-white text-gray-700 hover:bg-gray-100"
          }`}
        >
          All Assignments ({publishedAssignments.length})
        </button>
        <button
          onClick={() => setFilter("pending")}
          className={`px-4 py-2 rounded-lg transition-colors ${
            filter === "pending"
              ? "bg-orange-500 text-white"
              : "bg-white text-gray-700 hover:bg-gray-100"
          }`}
        >
          Pending ({pendingCount})
        </button>
        <button
          onClick={() => setFilter("submitted")}
          className={`px-4 py-2 rounded-lg transition-colors ${
            filter === "submitted"
              ? "bg-green-500 text-white"
              : "bg-white text-gray-700 hover:bg-gray-100"
          }`}
        >
          Submitted ({submittedCount})
        </button>
      </div>

      {filteredAssignments.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center py-16 bg-white rounded-xl shadow">
          <div className="text-gray-400 text-6xl mb-6">
            <FaEdit />
          </div>
          <h3 className="text-xl font-semibold text-gray-600 mb-3 max-w-md mx-auto">
            {filter === "submitted"
              ? "No submitted assignments yet"
              : filter === "pending"
              ? "No pending assignments"
              : "No assignments available"}
          </h3>
          <p className="text-gray-500 max-w-md mx-auto leading-relaxed">
            {filter === "submitted"
              ? "Submit your first assignment to see it here!"
              : filter === "pending"
              ? "All assignments have been submitted!"
              : "No published assignments available at the moment."}
          </p>
        </div>
      ) : (
        <div className="grid gap-6">
          {filteredAssignments.map((assignment) => {
            const submission = submissions.find(
              (sub) => sub.assignmentId === assignment._id
            );

            return (
              <AssignmentCard
                key={assignment._id}
                assignment={assignment}
                submission={submission}
                onAssignmentSubmitted={onAssignmentSubmitted}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
