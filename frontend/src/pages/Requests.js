import React, { useEffect, useState } from 'react';
import { mentorAPI } from '../services/api';
import Button from '../components/Button';

const Requests = () => {
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const response = await mentorAPI.getMentorshipRequests();
      setRequests(response.data.requests);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleResponse = async (requestId, status) => {
    try {
      await mentorAPI.respondToRequest(requestId, status);
      fetchRequests();
    } catch (error) {
      alert('Error responding to request');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">Mentorship Requests</h1>
        <div className="bg-white rounded-lg shadow">
          {requests.length > 0 ? (
            <div className="divide-y">
              {requests.map((req) => (
                <div key={req.id} className="p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{req.student_user.name}</h3>
                      <p className="text-sm text-gray-600">{req.student_user.email}</p>
                      {req.message && <p className="mt-2 text-gray-700">{req.message}</p>}
                      <p className="text-xs text-gray-500 mt-2">Requested: {new Date(req.created_at).toLocaleString()}</p>
                    </div>
                    <div className="flex flex-col items-end space-y-2">
                      <span className={`px-3 py-1 rounded-full text-sm ${
                        req.status === 'approved' ? 'bg-green-100 text-green-800' :
                        req.status === 'rejected' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {req.status}
                      </span>
                      {req.status === 'pending' && (
                        <div className="flex space-x-2">
                          <Button size="sm" onClick={() => handleResponse(req.id, 'approved')}>Approve</Button>
                          <Button size="sm" variant="danger" onClick={() => handleResponse(req.id, 'rejected')}>Reject</Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center text-gray-500">No requests yet</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Requests;
