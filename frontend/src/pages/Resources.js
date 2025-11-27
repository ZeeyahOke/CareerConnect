import React, { useEffect, useState } from 'react';
import { mentorAPI } from '../services/api';
import Button from '../components/Button';
import Input from '../components/Input';

const Resources = () => {
  const [resources, setResources] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ title: '', description: '', file_type: '', file_url: '' });

  useEffect(() => {
    fetchResources();
  }, []);

  const fetchResources = async () => {
    try {
      const response = await mentorAPI.getResources();
      setResources(response.data.resources);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await mentorAPI.uploadResource(formData);
      setShowModal(false);
      setFormData({ title: '', description: '', file_type: '', file_url: '' });
      fetchResources();
    } catch (error) {
      alert('Error uploading resource');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">My Resources</h1>
          <Button onClick={() => setShowModal(true)}>Add Resource</Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {resources.map((resource) => (
            <div key={resource.id} className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{resource.title}</h3>
              <p className="text-sm text-gray-600 mb-2">{resource.description}</p>
              <div className="flex justify-between items-center text-xs text-gray-500">
                <span>{resource.file_type}</span>
                <span>{new Date(resource.upload_date).toLocaleDateString()}</span>
              </div>
              {resource.file_url && (
                <a href={resource.file_url} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline text-sm mt-2 block">
                  View Resource →
                </a>
              )}
            </div>
          ))}
        </div>

        {resources.length === 0 && (
          <div className="text-center py-12 text-gray-500">No resources yet. Add one to share with students!</div>
        )}

        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <h2 className="text-xl font-bold mb-4">Add Resource</h2>
              <form onSubmit={handleSubmit}>
                <Input label="Title" name="title" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required />
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea name="description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows="3" className="w-full px-3 py-2 border rounded-lg" />
                </div>
                <Input label="File Type" name="file_type" value={formData.file_type} onChange={(e) => setFormData({ ...formData, file_type: e.target.value })} placeholder="e.g., PDF, Video" />
                <Input label="File URL" name="file_url" value={formData.file_url} onChange={(e) => setFormData({ ...formData, file_url: e.target.value })} placeholder="https://..." />
                <div className="flex space-x-3">
                  <Button type="submit" fullWidth>Add</Button>
                  <Button onClick={() => setShowModal(false)} variant="secondary" fullWidth>Cancel</Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Resources;
