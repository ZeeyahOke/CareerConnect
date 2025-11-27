import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { communicationAPI, studentAPI, mentorAPI } from "../services/api";

const Dashboard = () => {
  const { user, isStudent, isMentor, profile } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [messages, setMessages] = useState([]);
  const [assessments, setAssessments] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const sessionsRes = await communicationAPI.getSessions();
        setSessions(sessionsRes.data.sessions.slice(0, 5));

        const messagesRes = await communicationAPI.getMessages();
        setMessages(messagesRes.data.messages.slice(0, 5));

        if (isStudent) {
          const assessmentsRes = await studentAPI.getAssessments();
          setAssessments(assessmentsRes.data.assessments.slice(0, 3));
        }

        if (isMentor) {
          const requestsRes = await mentorAPI.getMentorshipRequests();
          setRequests(
            requestsRes.data.requests
              .filter((r) => r.status === "pending")
              .slice(0, 5)
          );
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [isStudent, isMentor]); // include any external values used inside

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.name}!
          </h1>
          <p className="mt-2 text-gray-600">
            {isStudent && "Continue your career development journey"}
            {isMentor &&
              profile?.verification_status === "verified" &&
              "Help students achieve their career goals"}
            {isMentor &&
              profile?.verification_status === "pending" &&
              "Your mentor profile is pending verification"}
          </p>
        </div>

        {isMentor && profile?.verification_status === "pending" && (
          <div className="mb-6 bg-yellow-50 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
            Your mentor profile is under review. You'll be notified once it's
            verified.
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {isStudent && (
            <>
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Career Assessment
                </h3>
                <p className="text-gray-600 mb-4">Discover your career path</p>
                <Link
                  to="/assessment"
                  className="text-primary-600 hover:text-primary-700 font-medium"
                >
                  Take Assessment →
                </Link>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Find Mentors
                </h3>
                <p className="text-gray-600 mb-4">
                  Connect with industry professionals
                </p>
                <Link
                  to="/mentors"
                  className="text-primary-600 hover:text-primary-700 font-medium"
                >
                  Browse Mentors →
                </Link>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Track Progress
                </h3>
                <p className="text-gray-600 mb-4">Monitor your career goals</p>
                <Link
                  to="/progress"
                  className="text-primary-600 hover:text-primary-700 font-medium"
                >
                  View Progress →
                </Link>
              </div>
            </>
          )}

          {isMentor && (
            <>
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Pending Requests
                </h3>
                <p className="text-3xl font-bold text-primary-600 mb-4">
                  {requests.length}
                </p>
                <Link
                  to="/requests"
                  className="text-primary-600 hover:text-primary-700 font-medium"
                >
                  View Requests →
                </Link>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Resources
                </h3>
                <p className="text-gray-600 mb-4">
                  Share knowledge with students
                </p>
                <Link
                  to="/resources"
                  className="text-primary-600 hover:text-primary-700 font-medium"
                >
                  Manage Resources →
                </Link>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Sessions
                </h3>
                <p className="text-3xl font-bold text-primary-600 mb-4">
                  {sessions.length}
                </p>
                <Link
                  to="/sessions"
                  className="text-primary-600 hover:text-primary-700 font-medium"
                >
                  View Sessions →
                </Link>
              </div>
            </>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Sessions */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                Recent Sessions
              </h2>
            </div>
            <div className="p-6">
              {sessions.length > 0 ? (
                <div className="space-y-4">
                  {sessions.map((session) => (
                    <div
                      key={session.id}
                      className="border-l-4 border-primary-500 pl-4"
                    >
                      <p className="font-medium text-gray-900">
                        {isStudent ? session.mentor_name : session.student_name}
                      </p>
                      <p className="text-sm text-gray-600">
                        {new Date(session.date_time).toLocaleString()}
                      </p>
                      <span
                        className={`inline-block mt-1 px-2 py-1 text-xs rounded ${
                          session.status === "completed"
                            ? "bg-green-100 text-green-800"
                            : session.status === "scheduled"
                            ? "bg-blue-100 text-blue-800"
                            : session.status === "pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {session.status}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No sessions yet</p>
              )}
              <Link
                to="/sessions"
                className="block mt-4 text-primary-600 hover:text-primary-700 font-medium"
              >
                View all sessions →
              </Link>
            </div>
          </div>

          {/* Recent Messages */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                Recent Messages
              </h2>
            </div>
            <div className="p-6">
              {messages.length > 0 ? (
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className="border-l-4 border-primary-500 pl-4"
                    >
                      <p className="font-medium text-gray-900">
                        {isStudent
                          ? message.receiver_name
                          : message.sender_name}
                      </p>
                      <p className="text-sm text-gray-600 truncate">
                        {message.content}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(message.timestamp).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No messages yet</p>
              )}
              <Link
                to="/messages"
                className="block mt-4 text-primary-600 hover:text-primary-700 font-medium"
              >
                View all messages →
              </Link>
            </div>
          </div>
        </div>

        {isStudent && assessments.length > 0 && (
          <div className="mt-6 bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                Recent Assessments
              </h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {assessments.map((assessment) => (
                  <div
                    key={assessment.id}
                    className="border-l-4 border-green-500 pl-4"
                  >
                    <p className="font-medium text-gray-900">
                      Assessment {assessment.assessment_id}
                    </p>
                    <p className="text-sm text-gray-600">
                      Completed on{" "}
                      {new Date(assessment.created_at).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
