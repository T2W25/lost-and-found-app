// Component for managing user personal information
import React, { useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { sanitizeInput } from '../../../utils/security';

// Validation schema
const PersonalInfoSchema = Yup.object().shape({
  displayName: Yup.string()
    .min(2, 'Too Short!')
    .max(50, 'Too Long!')
    .required('Required'),
  phoneNumber: Yup.string().matches(
    /^[0-9+\s-]{8,15}$/,
    'Invalid phone number'
  ),
});

// Component for managing user personal information
// This component is used in the ProfilePage component to display and update user personal information
const PersonalInfoTab = ({ profile, onUpdate }) => {
  const [updateStatus, setUpdateStatus] = useState({ message: '', type: '' });
  // Function to handle form submission and update user profile data
  // This function is called when the form is submitted
  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      // Sanitize inputs
      const sanitizedData = {
        displayName: sanitizeInput(values.displayName),
        phoneNumber: sanitizeInput(values.phoneNumber),
        location: sanitizeInput(values.location),
        bio: sanitizeInput(values.bio),
      };
      
      // Call the onUpdate function to update the user profile data
      const result = await onUpdate(sanitizedData);

      // Set the update status message based on the result
      if (result.success) {
        setUpdateStatus({
          message: 'Profile updated successfully!',
          type: 'success',
        });
      } else {
        setUpdateStatus({
          message: result.error || 'Failed to update profile.',
          type: 'error',
        });
      }
    } catch (error) {
      setUpdateStatus({
        message: 'An error occurred. Please try again.',
        type: 'error',
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Render the personal information form
  // This form allows users to update their personal information
  return (
    <div className="personal-info-tab">
      <h2>Personal Information</h2>

      {updateStatus.message && (
        <div
          className={`alert ${
            updateStatus.type === 'success' ? 'alert-success' : 'alert-danger'
          }`}
        >
          {updateStatus.message}
        </div>
      )}

      // Formik form for updating user personal information
      <Formik
        initialValues={{
          displayName: profile?.displayName || '',
          phoneNumber: profile?.phoneNumber || '',
          location: profile?.location || '',
          bio: profile?.bio || '',
        }}
        validationSchema={PersonalInfoSchema}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting }) => (
          <Form className="profile-form">
            <div className="form-group">
              <label htmlFor="displayName">Full Name</label>
              <Field
                type="text"
                name="displayName"
                id="displayName"
                className="form-control"
              />
              <ErrorMessage
                name="displayName"
                component="div"
                className="error-message"
              />
            </div>

            <div className="form-group">
              <label htmlFor="phoneNumber">Phone Number (Optional)</label>
              <Field
                type="text"
                name="phoneNumber"
                id="phoneNumber"
                className="form-control"
              />
              <ErrorMessage
                name="phoneNumber"
                component="div"
                className="error-message"
              />
            </div>

            <div className="form-group">
              <label htmlFor="location">Location (Optional)</label>
              <Field
                type="text"
                name="location"
                id="location"
                className="form-control"
              />
            </div>

            <div className="form-group">
              <label htmlFor="bio">Bio (Optional)</label>
              <Field
                as="textarea"
                name="bio"
                id="bio"
                className="form-control"
                rows="3"
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default PersonalInfoTab;