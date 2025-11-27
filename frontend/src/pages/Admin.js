import React, { useEffect, useState } from 'react';
import { adminAPI } from '../services/api';
import Button from '../components/Button';

const Admin = () => {
  const [stats, setStats] = useState({});
  const [pendingMentors, setPendingMentors] = useState([]);
  const [users, setUsers] = useState([]);
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const statsRes = await adminAPI.getDashboardStats();
      setStats(statsRes.data.stats);
      
      const mentorsRes = await adminAPI.getPendingMentors();
      setPendingMentors(mentorsRes.data.mentors);
      
      const usersRes = await adminAPI.getUsers();
      setUsers(usersRes.data.users);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const verifyMentor = async (mentorId, status) => {
    try {
      await adminAPI.verifyMentor(mentorId, status);
      fetchDashboardData();
    } catch (error) {
      alert('Error verifying mentor');
    }
  };

  const deleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await adminAPI.deleteUser(userId);
        fetchDashboardData();
      } catch (error) {
        alert('Error deleting user');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

        <div className="mb-6 flex space-x-4 border-b">
          <button onClick={() => setActiveTab('dashboard')} className={`px-4 py-2 ${activeTab === 'dashboard' ? 'border-b-2 border-primary-600 text-primary-600' : 'text-gray-600'}`}>Dashboard</button>
          <button onClick={() => setActiveTab('mentors')} className={`px-4 py-2 ${activeTab === 'mentors' ? 'border-b-2 border-primary-600 text-primary-600' : 'text-gray-600'}`}>Pending Mentors</button>
          <button onClick={() => setActiveTab('users')} className={`px-4 py-2 ${activeTab === 'users' ? 'border-b-2 border-primary-600 text-primary-600' : 'text-gray-600'}`}>Users</button>
        </div>

        {activeTab === 'dashboard' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-gray-600 text-sm mb-2">Total Users</h3>
              <p className="text-3xl font-bold text-primary-600">{stats.total_users || 0}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-gray-600 text-sm mb-2">Students</h3>
              <p className="text-3xl font-bold text-blue-600">{stats.total_students || 0}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-gray-600 text-sm mb-2">Verified Mentors</h3>
              <p className="text-3xl font-bold text-green-600">{stats.verified_mentors || 0}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-gray-600 text-sm mb-2">Pending Mentors</h3>
              <p className="text-3xl font-bold text-yellow-600">{stats.pending_mentors || 0}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-gray-600 text-sm mb-2">Total Sessions</h3>
              <p className="text-3xl font-bold text-purple-600">{stats.total_sessions || 0}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-gray-600 text-sm mb-2">Completed Sessions</h3>
              <p className="text-3xl font-bold text-green-600">{stats.completed_sessions || 0}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-gray-600 text-sm mb-2">Total Messages</h3>
              <p className="text-3xl font-bold text-blue-600">{stats.total_messages || 0}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-gray-600 text-sm mb-2">Pending Requests</h3>
              <p className="text-3xl font-bold text-orange-600">{stats.pending_requests || 0}</p>
            </div>
          </div>
        )}

        {activeTab === 'mentors' && (
          <div className="bg-white rounded-lg shadow">
            {pendingMentors.length > 0 ? (
              <div className="divide-y">
                {pendingMentors.map((mentor) => (
                  <div key={mentor.id} className="p-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-semibold">{mentor.user.name}</h3>
                        <p className="text-sm text-gray-600">{mentor.user.email}</p>
                        <p className="text-sm mt-2">Title: {mentor.professional_title}</p>
                        <p className="text-sm">Industry: {mentor.industry}</p>
                      </div>
                      <div className="flex space-x-2">
                        <Button size="sm" onClick={() => verifyMentor(mentor.id, 'verified')}>Verify</Button>
                        <Button size="sm" variant="danger" onClick={() => verifyMentor(mentor.id, 'rejected')}>Reject</Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center text-gray-500">No pending mentors</div>
            )}
          </div>
        )}

        {activeTab === 'users' && (
          <div className="bg-white rounded-lg shadow overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Joined</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {users.map((user) => (
                  <tr key={user.id}>
                    <td className="px-6 py-4 text-sm">{user.name}</td>
                    <td className="px-6 py-4 text-sm">{user.email}</td>
                    <td className="px-6 py-4 text-sm"><span className="px-2 py-1 bg-blue-100 text-blue-800 rounded">{user.role}</span></td>
                    <td className="px-6 py-4 text-sm">{new Date(user.created_at).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-sm">
                      {user.role !== 'admin' && (
                        <Button size="sm" variant="danger" onClick={() => deleteUser(user.id)}>Delete</Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;
