module.exports = {
  extends: ['react-app'],
  rules: {
    // Disable warnings for unused variables in specific files
    'no-unused-vars': 'warn'
  },
  overrides: [
    {
      files: [
        'src/services/firebase/auth.js',
        'src/services/firebase/decisionNotification.js',
        'src/services/firebase/notificationPreferences.js',
        'src/services/firebase/notifications.js',
        'src/services/notifications/claimNotifications/claimNotifications.js'
      ],
      rules: {
        'no-unused-vars': 'off'
      }
    }
  ]
};