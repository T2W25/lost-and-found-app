// Component for managing user contact preferences. Allows user to update their notification preferences (email, push, sms).

import React, { useState } from 'react';
import { Formik, Form, Field } from 'formik';

const ContactPreferencesTab = ({ profile, onUpdate }) => {
  const [updateStatus, setUpdateStatus] = useState({ message: '', type: '' });

  // Handle form submission
  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      const result = await onUpdate({
        notificationPreferences: {
          email: values.emailNotifications,
          push: values.pushNotifications,
          sms: values.smsNotifications,
        },
      });

      if (result.success) {
        setUpdateStatus({
          message: 'Preferences updated successfully!',
          type: 'success',
        });
      } else {
        setUpdateStatus({
          message: result.error || 'Failed to update preferences.',
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
  
  // Set initial notification preferences
  const initialNotificationPrefs = profile?.notificationPreferences || {
    email: true,
    push: true,
    sms: false,
  };
  
  return (
    <div className="contact-preferences-tab">
      <h2>Contact Preferences</h2>

      {updateStatus.message && (
        <div
          className={`alert ${
            updateStatus.type === 'success' ? 'alert-success' : 'alert-danger'
          }`}
        >
          {updateStatus.message}
        </div>
      )}
      
      <Formik
        initialValues={{
          emailNotifications: initialNotificationPrefs.email,
          pushNotifications: initialNotificationPrefs.push,
          smsNotifications: initialNotificationPrefs.sms,
        }}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting }) => (
          <Form className="preferences-form">
            <div className="form-section">
              <h3>Notification Settings</h3>
              <p className="section-description">
                Choose how you'd like to be notified about potential matches and
                account updates.
              </p>

              <div className="checkbox-group">
                <label className="checkbox-container">
                  <Field type="checkbox" name="emailNotifications" />
                  <span className="checkbox-label">Email Notifications</span>
                  <p className="checkbox-description">
                    Receive notifications about potential matches via email
                  </p>
                </label>
              </div>

              <div className="checkbox-group">
                <label className="checkbox-container">
                  <Field type="checkbox" name="pushNotifications" />
                  <span className="checkbox-label">Push Notifications</span>
                  <p className="checkbox-description">
                    Receive in-app notifications
                  </p>
                </label>
              </div>

              <div className="checkbox-group">
                <label className="checkbox-container">
                  <Field type="checkbox" name="smsNotifications" />
                  <span className="checkbox-label">SMS Notifications</span>
                  <p className="checkbox-description">
                    Receive text messages for important updates (requires phone
                    number)
                  </p>
                </label>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : 'Save Preferences'}
            </button>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default ContactPreferencesTab;