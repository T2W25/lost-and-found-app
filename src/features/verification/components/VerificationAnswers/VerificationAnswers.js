import React, { useState } from 'react';
import { submitVerificationAnswers } from '../../../services/firebase/claims';

const VerificationAnswers = ({ claimId, questions }) => {
  const initialAnswers = questions.map(() => '');
  const [answers, setAnswers] = useState(initialAnswers);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleAnswerChange = (index, value) => {
    const newAnswers = [...answers];
    newAnswers[index] = value;
    setAnswers(newAnswers);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate answers
    const emptyAnswers = answers.findIndex(a => a.trim() === '');
    if (emptyAnswers !== -1) {
      setError(`Please provide an answer for question ${emptyAnswers + 1}.`);
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      await submitVerificationAnswers(claimId, answers);
      setSuccess(true);
    } catch (error) {
      console.error('Error submitting verification answers:', error);
      setError('Failed to submit verification answers. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="verification-success">
        <div className="success-icon">✓</div>
        <h3>Answers Submitted Successfully!</h3>
        <p>Your answers have been sent to the item owner. You will be notified when they review your claim.</p>
      </div>
    );
  }

  return (
    <div className="verification-answers-form">
      <h3>Verification Questions</h3>
      <p>
        The owner has sent you the following questions to verify your ownership.
        Please answer them as accurately as possible.
      </p>
      
      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={handleSubmit}>
        {questions.map((question, index) => (
          <div key={index} className="answer-input">
            <label htmlFor={`answer-${index}`}>
              <strong>Question {index + 1}:</strong> {question}
            </label>
            <textarea
              id={`answer-${index}`}
              value={answers[index]}
              onChange={(e) => handleAnswerChange(index, e.target.value)}
              placeholder="Your answer..."
              className="form-control"
              rows={3}
            />
          </div>
        ))}
        
        <div className="form-actions">
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? 'Submitting...' : 'Submit Answers'}
          </button>
        </div>
      </form>
      
      <div className="verification-tips">
        <h4>Tips for Answering Verification Questions:</h4>
        <ul>
          <li>Be as specific and detailed as possible</li>
          <li>Include any unique identifying information you remember</li>
          <li>If you're not sure about an answer, provide your best guess but be honest</li>
          <li>Mention any additional details that might help verify your ownership</li>
        </ul>
      </div>
    </div>
  );
};

export default VerificationAnswers;