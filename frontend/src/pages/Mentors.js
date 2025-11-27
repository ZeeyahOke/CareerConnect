import React, { useEffect, useState } from 'react';
import { mentorAPI } from '../services/api';
import Button from '../components/Button';

const Mentors = () => {
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMentor, setSelectedMentor] = useState(null);
  const [requestMessage, setRequestMessage] = useState('');
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchMentors();
  }, []);

  const fetchMentors = async () => {
    try {
      const response = await mentorAPI.searchMentors({});
      setMentors(response.data.mentors);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRequest = async () => {
    try {
      await mentorAPI.requestMentorship({ mentor_id: selectedMentor.id, message: requestMessage });
      alert('Request sent!');
      setShowModal(false);
    } catch (error) {
      alert(error.response?.data?.error || 'Failed');
    }
  };

  if (loading) return <div className="flex justify-center items-center min-h-screen">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">Find Mentors</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mentors.map((m) => (
            <div key={m.id} className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold">{m.user.name}</h3>
              <p className="text-sm text-gray-600">{m.professional_title}</p>
              <p className="text-sm mt-2">Industry: {m.industry}</p>
              <Button onClick={() => { setSelectedMentor(m); setShowModal(true); }} className="mt-4" fullWidth>Request</Button>
            </div>
          ))}
        </div>
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <h2 className="text-xl font-bold mb-4">Request from {selectedMentor?.user.name}</h2>
              <textarea value={requestMessage} onChange={(e) => setRequestMessage(e.target.value)} rows="4" className="w-full px-3 py-2 border rounded-lg mb-4" />
              <div className="flex space-x-3">
                <Button onClick={handleRequest} fullWidth>Send</Button>
                <Button onClick={() => setShowModal(false)} variant="secondary" fullWidth>Cancel</Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Mentors;
