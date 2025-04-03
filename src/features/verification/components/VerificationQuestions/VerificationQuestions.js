import React, { useState } from 'react';
import { addVerificationQuestions } from '../../../services/firebase/claims';

const VerificationQuestions = ({ claimId }) => {
  const [questions, setQuestions] = useState(['', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleQuestionChange = (index, value) => {
    const newQuestions = [...questions];
    newQuestions[index] = value;
    setQuestions(newQuestions);
  };

  const addQuestion = () => {
    setQuestions([...questions, '']);
  };

  const removeQuestion = (index) => {
    if (questions.length <= 1) {
      return;
    }
    
    const newQuestions = [...questions];
    newQuestions.splice(index, 1);
    setQuestions(newQuestions);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate questions
    const validQuestions = questions.filter(q => q.trim() !== '');
    if (validQuestions.length === 0) {
      setError('Please add at least one verification question.');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      await addVerificationQuestions(claimId, validQuestions);
      setSuccess(true);
    } catch (error) {
      console.error('Error submitting verification questions:', error);
      setError('Failed to submit verification questions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="verification-success">
        <div className="success-icon">✓</div>
        <h3>Verification Questions Sent!</h3>
        <p>Your questions have been sent to the claimant. You will be notified when they respond.</p>
        <div className="questions-list">
          <h4>Your Questions:</h4>
          <ol>
            {questions.filter(q => q.trim() !== '').map((question, index) => (
              <li key={index}>{question}</li>
            ))}
          </ol>
        </div>
      </div>
    );
  }

  return (
    <div className="verification-questions-form">
      <h3>Create Verification Questions</h3>
      <p>
        Ask questions that only the true owner of the item would know. 
        These questions will help verify if the claimant is the rightful owner.
      </p>
      
      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={handleSubmit}>
        {questions.map((question, index) => (
          <div key={index} className="question-input">
            <label htmlFor={`question-${index}`}>Question {index + 1}:</label>
            <div className="input-with-button">
              <input
                type="text"
                id={`question-${index}`}
                value={question}
                onChange={(e) => handleQuestionChange(index, e.target.value)}
                placeholder="e.g., What color was the inside lining of the bag?"
                className="form-control"
              />
              <button
                type="button"
                className="btn btn-danger btn-sm"
                onClick={() => removeQuestion(index)}
                disabled={questions.length <= 1}
              >
                Remove
              </button>
            </div>
          </div>
        ))}
        
        <div className="form-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={addQuestion}
          >
            Add Another Question
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? 'Sending...' : 'Send Questions'}
          </button>
        </div>
      </form>
      
      <div className="verification-tips">
        <h4>Tips for Good Verification Questions:</h4>
        <ul>
          <li>Ask about specific details that aren't visible in photos</li>
          <li>Ask about unique identifying marks or features</li>
          <li>Ask about the contents if it's a bag or container</li>
          <li>Ask about when or where the item was purchased</li>
          <li>Avoid questions that can be easily guessed</li>
        </ul>
      </div>
    </div>
  );
};

export default VerificationQuestions;