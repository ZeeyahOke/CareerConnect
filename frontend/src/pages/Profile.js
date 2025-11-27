import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { studentAPI, mentorAPI, adminAPI } from '../services/api';
import Input from '../components/Input';
import Button from '../components/Button';

const Profile = () => {
  const { user, profile, isStudent, isMentor, isAdmin, updateUserProfile, updateUser } = useAuth();
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [messageType, setMessageType] = useState('');

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        phone_number: user.phone_number || '',
        ...(profile || {})
      });
    }
  }, [user, profile]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Determine which API to call based on role.
      if (isAdmin) {
        // Call admin endpoint to update basic user fields
        const response = await adminAPI.updateProfile(formData);
        if (response.data && response.data.user) {
          // Update context without reloading
          updateUser(response.data.user, null);
          setMessage('Admin profile updated successfully');
          setMessageType('success');
          setTimeout(() => setMessage(null), 3000);
        }
        setLoading(false);
        return;
      }

      const api = isStudent ? studentAPI : (isMentor ? mentorAPI : null);
      if (!api) {
        alert('Profile update not supported for your role.');
        setLoading(false);
        return;
      }

      const response = await api.updateProfile(formData);
      updateUserProfile(response.data.profile);
      setMessage('Profile updated successfully');
      setMessageType('success');
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error(error);
      setMessage(error.response?.data?.error || 'Error updating profile');
      setMessageType('error');
      setTimeout(() => setMessage(null), 5000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">My Profile</h1>
        <div className="bg-white rounded-lg shadow p-8">
          {message && (
            <div className={`mb-4 px-4 py-3 rounded ${messageType === 'success' ? 'bg-green-50 border border-green-200 text-green-800' : 'bg-red-50 border border-red-200 text-red-800'}`}>
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <Input label="Full Name" name="name" value={formData.name || ''} onChange={handleChange} required />
            <Input label="Email" type="email" value={user?.email || ''} disabled />
            <Input label="Phone Number" name="phone_number" value={formData.phone_number || ''} onChange={handleChange} />

            {isStudent && (
              <>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Educational Background</label>
                  <textarea name="educational_background" value={formData.educational_background || ''} onChange={handleChange} rows="3" className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500" />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Career Interests</label>
                  <textarea name="career_interests" value={formData.career_interests || ''} onChange={handleChange} rows="3" className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500" />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Goals</label>
                  <textarea name="goals" value={formData.goals || ''} onChange={handleChange} rows="3" className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500" />
                </div>
              </>
            )}

            {isMentor && (
              <>
                <Input label="Professional Title" name="professional_title" value={formData.professional_title || ''} onChange={handleChange} />
                <Input label="Industry" name="industry" value={formData.industry || ''} onChange={handleChange} />
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                  <textarea name="bio" value={formData.bio || ''} onChange={handleChange} rows="3" className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500" />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Expertise</label>
                  <textarea name="expertise" value={formData.expertise || ''} onChange={handleChange} rows="3" className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500" />
                </div>
                {profile?.verification_status && (
                  <div className="mb-4">
                    <span className={`px-3 py-1 rounded-full text-sm ${
                      profile.verification_status === 'verified' ? 'bg-green-100 text-green-800' :
                      profile.verification_status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      Status: {profile.verification_status}
                    </span>
                  </div>
                )}
              </>
            )}

            <Button type="submit" fullWidth disabled={loading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;
