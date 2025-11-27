import React, { useEffect, useState } from 'react';
import { studentAPI } from '../services/api';
import Button from '../components/Button';

const Progress = () => {
  const [trackers, setTrackers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newGoal, setNewGoal] = useState('');
  const [goals, setGoals] = useState([]);

  useEffect(() => {
    fetchProgress();
  }, []);

  const fetchProgress = async () => {
    try {
      const response = await studentAPI.getProgress();
      setTrackers(response.data.trackers);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const createTracker = async () => {
    try {
      await studentAPI.createProgress({ goals: goals, milestones: [] });
      setShowModal(false);
      setGoals([]);
      fetchProgress();
    } catch (error) {
      alert('Error creating tracker');
    }
  };

  const addGoal = () => {
    if (newGoal.trim()) {
      setGoals([...goals, { text: newGoal, completed: false }]);
      setNewGoal('');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">My Progress</h1>
          <Button onClick={() => setShowModal(true)}>New Tracker</Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {trackers.map((tracker) => {
            const goalsList = JSON.parse(tracker.goals || '[]');
            return (
              <div key={tracker.id} className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold mb-4">Tracker {tracker.tracker_id.slice(0, 8)}</h3>
                <div className="space-y-2">
                  {goalsList.map((goal, idx) => (
                    <div key={idx} className="flex items-center">
                      <input type="checkbox" checked={goal.completed} readOnly className="mr-2" />
                      <span className={goal.completed ? 'line-through text-gray-500' : ''}>{goal.text}</span>
                    </div>
                  ))}
                </div>
                <p className="text-sm text-gray-500 mt-4">Created: {new Date(tracker.created_at).toLocaleDateString()}</p>
              </div>
            );
          })}
        </div>

        {trackers.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No progress trackers yet. Create one to get started!</p>
          </div>
        )}

        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <h2 className="text-xl font-bold mb-4">Create Progress Tracker</h2>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Add Goals</label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={newGoal}
                    onChange={(e) => setNewGoal(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addGoal()}
                    className="flex-1 px-3 py-2 border rounded-lg"
                    placeholder="Enter a goal..."
                  />
                  <Button onClick={addGoal}>Add</Button>
                </div>
                <div className="mt-3 space-y-2">
                  {goals.map((goal, idx) => (
                    <div key={idx} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                      <span>{goal.text}</span>
                      <button onClick={() => setGoals(goals.filter((_, i) => i !== idx))} className="text-red-600">×</button>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex space-x-3">
                <Button onClick={createTracker} fullWidth disabled={goals.length === 0}>Create</Button>
                <Button onClick={() => { setShowModal(false); setGoals([]); }} variant="secondary" fullWidth>Cancel</Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Progress;
