# Community Lost and Found Application

A web-based platform that helps community members report, find, and claim lost items more efficiently.

## Project Overview

The Community Lost and Found application is a web-based platform designed to help community members report, find, and claim lost items more efficiently.
## Features

- **Item Reporting**: Users can report found items by providing detailed descriptions, uploading images, and specifying the location where the item was found.
- **Search Functionality**: The application offers a search engine that allows users to find lost items based on keywords, categories, date ranges, and location.
- **User Authentication**: A secure user authentication system allows users to create accounts, log in, and manage their profiles.
- **Item Management**: Users can track the status of reported and claimed items, receiving updates as the claiming process progresses.
- **Notifications**: The application sends notifications to users when matching items are found, claims are submitted, or claims are approved.
- **Claim Verification**: Administrators can verify claims by reviewing the item details, contacting the reporter and claimant, and requesting additional information or evidence.
- **Admin Dashboard**: An admin dashboard provides administrators with a centralized interface for managing users, items, claims, and application settings.

## Technology Stack

- **Frontend**
  - React.js
  - React Router for navigation
  - Formik & Yup for form handling and validation
  - React Bootstrap for UI components
  - React Icons for iconography
  - Date-fns for date handling
  - ProtectedRoute for route protection
  - CSS Modules for styling

- **Backend Services (Firebase)**
  - Firebase Authentication: Manages user authentication and authorization.
  - Cloud Firestore: Provides a NoSQL database for storing application data.
  - Firebase Storage: Stores images and other files uploaded by users.
  - Firebase Hosting: Hosts the application's static assets.
  - Firebase Functions: Enables server-side logic and event handling.
  - src/services/firebase/auth.js, src/services/firebase/items.js, src/services/firebase/users.js, src/services/firebase/claims.js, src/services/firebase/claimLinking.js, src/services/firebase/claimSubmission.js: Contains the Firebase service implementations.

## Getting Started

### Prerequisites

Before you can run the application, you will need to install the following software:

- **Node.js**: Version 14 or higher is required. You can download it from [nodejs.org](https://nodejs.org/).
- **npm** or **yarn**: These are package managers for JavaScript. npm is included with Node.js, but you can also use yarn if you prefer. You can download yarn from [yarnpkg.com](https://yarnpkg.com/).
- **Firebase Account**: You will need a Firebase account to use the backend services. You can create a free account at [firebase.google.com](https://firebase.google.com/).

### Configuration

1.  Clone the repository:
    ```bash
    git clone https://github.com/username/lost-and-found-app.git
    cd lost-and-found-app
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Create a `.env` file in the root directory with your Firebase configuration:
    ```
    REACT_APP_FIREBASE_API_KEY=your_api_key
    REACT_APP_FIREBASE_AUTH_DOMAIN=your_auth_domain
    REACT_APP_FIREBASE_PROJECT_ID=your_project_id
    REACT_APP_FIREBASE_STORAGE_BUCKET=your_storage_bucket
    REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
    REACT_APP_FIREBASE_APP_ID=your_app_id
    ```
    You can find your Firebase configuration in the Firebase console.
4.  Start the development server:
    ```bash
    npm start
    ```
5.  Open your browser and navigate to `http://localhost:3001` to view the application.

## Project Status

The project is under active development. Key features such as user authentication, item reporting, search, claim verification, and admin dashboard are implemented and functional.
