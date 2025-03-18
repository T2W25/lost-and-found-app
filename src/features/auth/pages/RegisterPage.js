// Importing necessary modules from React
import React, { useState } from 'react';

// Importing Link for navigation and useNavigate for programmatic navigation
import { Link, useNavigate } from 'react-router-dom';

// Importing Formik for handling forms, Form for form structure, 
// Field for input fields, and ErrorMessage for validation messages
import { Formik, Form, Field, ErrorMessage } from 'formik';

// Importing Yup for form validation
import * as Yup from 'yup';

// Importing the registerUser function to handle user registration with Firebase
import { registerUser } from '../../../services/firebase/auth';

// Importing utility functions for password security and input sanitization
import { checkPasswordStrength, sanitizeInput } from '../../../utils/security';

// Importing external CSS file for styling the authentication page
import '../../../assets/styles/Auth.css';

// Defining the validation schema for the registration form using Yup
const RegisterSchema = Yup.object().shape({
  // Validation for name: Minimum 2 characters, Maximum 50 characters, Required field
  name: Yup.string()
    .min(2, 'Too Short!')
    .max(50, 'Too Long!')
    .required('Required'),

  // Validation for email: Must be a valid email format and is required
  email: Yup.string().email('Invalid email').required('Required'),

  // Validation for password: Minimum 8 characters, Required field
  password: Yup.string()
    .min(8, 'Password must be at least 8 characters')
    .required('Required'),

  // Validation for confirm password: Must match the password field and is required
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password'), null], 'Passwords must match')
    .required('Required'),
});

// RegisterPage functional component
const RegisterPage = () => {
  // State to track password strength
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0, // Numeric strength score
    feedback: '', // Feedback message based on strength
  });

  // State to store error messages in case of registration failure
  const [error, setError] = useState('');

  // Hook for programmatic navigation (redirecting users)
  const navigate = useNavigate();

  // Function to handle password change and check its strength
  const handlePasswordChange = (e, handleChange) => {
    // Call Formik's built-in handleChange function to update state
    handleChange(e);

    // Analyze the password strength using an external utility function
    const strength = checkPasswordStrength(e.target.value);

    // Update password strength state
    setPasswordStrength(strength);
  };

  // Function to handle form submission
  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      // Clear any previous errors
      setError('');

      // Sanitize user input to prevent malicious input
      const sanitizedName = sanitizeInput(values.name);

      // Register user using Firebase authentication service
      await registerUser(values.email, values.password, sanitizedName);

      // Redirect user to the login page with a success message
      navigate('/login', {
        state: { message: 'Registration successful! You can now log in.' },
      });
    } catch (error) {
      // Log and display any registration errors
      console.error('Registration error:', error);
      setError('Failed to register. ' + error.message);
    } finally {
      // Ensure the form submission state is reset
      setSubmitting(false);
    }
  };

  // JSX structure for the registration page UI
  return (
    <div className="auth-page">
      <div className="auth-container">
        <h1>Create an Account</h1>
        <p className="auth-subtext">
          Join our lost and found community to report lost items or help others
          find their belongings.
        </p>

        {/* Display error message if there is an error */}
        {error && <div className="alert alert-danger">{error}</div>}

        {/* Formik form for user registration */}
        <Formik
          initialValues={{
            name: '',
            email: '',
            password: '',
            confirmPassword: '',
          }}
          validationSchema={RegisterSchema} // Apply Yup validation schema
          onSubmit={handleSubmit} // Call handleSubmit on form submission
        >
          {({ isSubmitting, handleChange }) => (
            <Form className="auth-form">
              {/* Full Name Input Field */}
              <div className="form-group">
                <label htmlFor="name">Full Name</label>
                <Field type="text" name="name" id="name" className="form-control" />
                <ErrorMessage name="name" component="div" className="error-message" />
              </div>

              {/* Email Address Input Field */}
              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <Field type="email" name="email" id="email" className="form-control" />
                <ErrorMessage name="email" component="div" className="error-message" />
              </div>

              {/* Password Input Field */}
              <div className="form-group">
                <label htmlFor="password">Password</label>
                <Field
                  type="password"
                  name="password"
                  id="password"
                  className="form-control"
                  onChange={(e) => handlePasswordChange(e, handleChange)} // Handle password strength check
                />
                <ErrorMessage name="password" component="div" className="error-message" />

                {/* Display password strength feedback */}
                {passwordStrength.feedback && (
                  <div className={`password-strength strength-${passwordStrength.score}`}>
                    {passwordStrength.feedback}
                  </div>
                )}
              </div>

              {/* Confirm Password Input Field */}
              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm Password</label>
                <Field type="password" name="confirmPassword" id="confirmPassword" className="form-control" />
                <ErrorMessage name="confirmPassword" component="div" className="error-message" />
              </div>

              {/* Submit Button */}
              <button type="submit" className="btn btn-primary auth-btn" disabled={isSubmitting}>
                {isSubmitting ? 'Registering...' : 'Register'}
              </button>

              {/* Link to Login Page */}
              <div className="auth-footer">
                Already have an account? <Link to="/login">Login</Link>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

// Export the RegisterPage component so it can be used in other parts of the application
export default RegisterPage;
