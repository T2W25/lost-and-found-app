# Community Lost and Found Application

A web-based platform that helps community members report, find, and claim lost items more efficiently.

## Project Overview

The Community Lost and Found application serves as a centralized hub where users can:
- Report items they've found
- Search for items they've lost
- Manage the claiming process for lost items
- Connect with other community members

## Features

- **Item Reporting**: Easily report found items with descriptions and images
- **Search Functionality**: Find lost items through filters and categories
- **User Authentication**: Secure login and registration system
- **Item Management**: Track the status of reported and claimed items
- **Notifications**: Receive updates when matching items are found

## Technology Stack

- **Frontend**
  - React.js
  - React Router for navigation
  - Formik & Yup for form handling and validation
  - React Bootstrap for UI components
  - React Icons for iconography
  - Date-fns for date handling

- **Backend Services (Firebase)**
  - Firebase Authentication for user management
  - Cloud Firestore for database
  - Firebase Storage for image uploads
  - Firebase Hosting for deployment

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone https://github.com/username/lost-and-found-app.git
cd lost-and-found-app
```

2. Install dependencies
```bash
npm install
```

3. Create a `.env` file in the root directory with your Firebase configuration:
   ```
   REACT_APP_FIREBASE_API_KEY=your_api_key
   REACT_APP_FIREBASE_AUTH_DOMAIN=your_auth_domain
   REACT_APP_FIREBASE_PROJECT_ID=your_project_id
   REACT_APP_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   REACT_APP_FIREBASE_APP_ID=your_app_id
   ```

4. Start the development server:
   ```bash
   npm start
   ```

5. Open your browser and navigate to `http://localhost:3000`

## Project Status

This project is currently under development. The initial UI framework has been set up, and core functionality is being implemented.
