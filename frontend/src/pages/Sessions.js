import React, { useEffect, useState } from 'react';
import { communicationAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Button from '../components/Button';

const Sessions = () => {
  const [sessions, setSessions] = useState([]);
  const { isStudent, isMentor } = useAuth();

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      const response = await communicationAPI.getSessions();
      setSessions(response.data.sessions);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const updateSession = async (sessionId, status) => {
    try {
      await communicationAPI.updateSession(sessionId, { status });
      fetchSessions();
    } catch (error) {
      alert('Error updating session');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">Sessions</h1>
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {sessions.length > 0 ? (
            <div className="divide-y">
              {sessions.map((session) => (
                <div key={session.id} className="p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {isStudent ? `With: ${session.mentor_name}` : `With: ${session.student_name}`}
                      </h3>
                      <p className="text-gray-600 mt-1">{new Date(session.date_time).toLocaleString()}</p>
                      {session.notes && <p className="text-sm text-gray-500 mt-2">Notes: {session.notes}</p>}
                    </div>
                    <div className="flex flex-col items-end space-y-2">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(session.status)}`}>
                        {session.status}
                      </span>
                      {isMentor && session.status === 'pending' && (
                        <div className="flex space-x-2">
                          <Button size="sm" onClick={() => updateSession(session.id, 'scheduled')}>Approve</Button>
                          <Button size="sm" variant="danger" onClick={() => updateSession(session.id, 'cancelled')}>Reject</Button>
                        </div>
                      )}
                      {isMentor && session.status === 'scheduled' && (
                        <Button size="sm" variant="success" onClick={() => updateSession(session.id, 'completed')}>Mark Complete</Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center text-gray-500">No sessions scheduled</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sessions;
