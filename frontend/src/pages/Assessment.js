import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { studentAPI } from '../services/api';
import Button from '../components/Button';

const Assessment = () => {
  const navigate = useNavigate();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});

  const questions = [
    { id: 1, text: 'What subjects interest you the most?', type: 'text' },
    { id: 2, text: 'Do you prefer working with people or data?', type: 'choice', options: ['People', 'Data', 'Both'] },
    { id: 3, text: 'What are your strongest skills?', type: 'text' },
    { id: 4, text: 'Where do you see yourself in 5 years?', type: 'text' },
    { id: 5, text: 'What type of work environment do you prefer?', type: 'choice', options: ['Office', 'Remote', 'Hybrid', 'Outdoor'] },
  ];

  const handleAnswer = (value) => {
    setAnswers({ ...answers, [questions[currentQuestion].id]: value });
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      submitAssessment();
    }
  };

  const submitAssessment = async () => {
    try {
      const recommendations = generateRecommendations(answers);
      await studentAPI.createAssessment({
        questionnaire: questions,
        results: answers,
        recommendations: recommendations
      });
      alert('Assessment completed! Check your dashboard for recommendations.');
      navigate('/dashboard');
    } catch (error) {
      alert('Error submitting assessment');
    }
  };

  const generateRecommendations = (answers) => {
    const recs = [];
    if (answers[2]?.toLowerCase().includes('people')) {
      recs.push('Human Resources', 'Teaching', 'Sales');
    }
    if (answers[2]?.toLowerCase().includes('data')) {
      recs.push('Data Science', 'Analytics', 'Research');
    }
    if (recs.length === 0) {
      recs.push('Business Management', 'Marketing', 'Consulting');
    }
    return recs;
  };

  const question = questions[currentQuestion];

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="mb-6">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Question {currentQuestion + 1} of {questions.length}</span>
              <span>{Math.round(((currentQuestion + 1) / questions.length) * 100)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-primary-600 h-2 rounded-full transition-all" style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}></div>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-6">{question.text}</h2>

          {question.type === 'text' && (
            <textarea
              value={answers[question.id] || ''}
              onChange={(e) => handleAnswer(e.target.value)}
              rows="4"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Your answer..."
            />
          )}

          {question.type === 'choice' && (
            <div className="space-y-3">
              {question.options.map((option) => (
                <button
                  key={option}
                  onClick={() => handleAnswer(option)}
                  className={`w-full px-4 py-3 text-left border-2 rounded-lg transition-colors ${
                    answers[question.id] === option
                      ? 'border-primary-600 bg-primary-50'
                      : 'border-gray-300 hover:border-primary-300'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          )}

          <div className="mt-8 flex justify-between">
            <Button
              onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
              variant="secondary"
              disabled={currentQuestion === 0}
            >
              Previous
            </Button>
            <Button
              onClick={handleNext}
              disabled={!answers[question.id]}
            >
              {currentQuestion === questions.length - 1 ? 'Submit' : 'Next'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Assessment;
