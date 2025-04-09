// Importing necessary modules from React
import React, { useState } from 'react';

// Importing React Router components for navigation and accessing location state
import { Link, useNavigate, useLocation } from 'react-router-dom';

// Importing Formik for handling forms, Form for structure, Field for input fields, and ErrorMessage for validation
import { Formik, Form, Field, ErrorMessage } from 'formik';

// Importing Yup for form validation
import * as Yup from 'yup';

// Importing the function to authenticate users using Firebase
import { signInUser } from '../../../services/firebase/auth';

// Importing a function to generate a CSRF token for security purposes
import { generateCsrfToken } from '../../../utils/security';

// Importing external CSS file for styling the authentication page
import '../../../assets/styles/Auth.css';

// Defining the validation schema for the login form using Yup
const LoginSchema = Yup.object().shape({
  // Validation for email: Must be a valid email format and is required
  email: Yup.string().email('Invalid email').required('Required'),

  // Validation for password: Required field
  password: Yup.string().required('Required'),
});

// LoginPage functional component
const LoginPage = () => {
  // State to store error messages in case of login failure
  const [error, setError] = useState('');

  // Hook for programmatic navigation (redirecting users after login)
  const navigate = useNavigate();

  // Hook to access the current location's state (useful for messages from other pages)
  const location = useLocation();

  // Generating a CSRF token for security
  const [csrfToken] = useState(generateCsrfToken());

  // Extracting a message from the location state (e.g., a success message after registration)
  const message = location.state?.message;

  // Function to handle form submission
  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      // Clear any previous errors
      setError('');

      // Authenticate the user using Firebase login service
      await signInUser(values.email, values.password);

      // Redirect the user to the home page after successful login
      navigate('/');
    } catch (error) {
      // Log and display an error message if login fails
      console.error('Login error:', error);
      setError('Failed to log in. Please check your credentials.');
    } finally {
      // Ensure the form submission state is reset
      setSubmitting(false);
    }
  };

  // JSX structure for the login page UI
  return (
    <div className="auth-page">
      <div className="auth-container">
        <h1>Welcome Back</h1>
        <p className="auth-subtext">
          Log in to access your lost and found items.
        </p>

        {/* Display a success message if one exists (e.g., after registration) */}
        {message && <div className="alert alert-success">{message}</div>}

        {/* Display error message if there is a login error */}
        {error && <div className="alert alert-danger">{error}</div>}

        {/* Formik form for user login */}
        <Formik
          initialValues={{ email: '', password: '' }} // Initial form values
          validationSchema={LoginSchema} // Apply Yup validation schema
          onSubmit={handleSubmit} // Call handleSubmit on form submission
        >
          {({ isSubmitting }) => (
            <Form className="auth-form">
              {/* Hidden CSRF token field for security */}
              <input type="hidden" name="csrfToken" value={csrfToken} />

              {/* Email Address Input Field */}
              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <Field type="email" name="email" id="email" className="form-control" />
                <ErrorMessage name="email" component="div" className="error-message" />
              </div>

              {/* Password Input Field */}
              <div className="form-group">
                <label htmlFor="password">Password</label>
                <Field type="password" name="password" id="password" className="form-control" />
                <ErrorMessage name="password" component="div" className="error-message" />
              </div>

              {/* Forgot Password Link */}
              <div className="form-options">
                <Link to="/forgot-password" className="forgot-password">
                  Forgot Password?
                </Link>
              </div>

              {/* Submit Button */}
              <button type="submit" className="btn btn-primary auth-btn" disabled={isSubmitting}>
                {isSubmitting ? 'Logging in...' : 'Login'}
              </button>

              {/* Link to Registration Page */}
              <div className="auth-footer">
                Don't have an account? <Link to="/register">Register</Link>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

// Export the LoginPage component so it can be used in other parts of the application
export default LoginPage;
