# Client Call Management Software (CallCRM)

A modern, professional CRM web application for managing client calls, built with React, Node.js, and MongoDB.

## Features
- **Dashboard**: High-level statistics and activity charts.
- **Client Directory**: Interactive table with search and filtering.
- **Client Management**: Add, edit, and delete client records.
- **Data Export**: Export records to Excel, CSV, and PDF.
- **Authentication**: Admin login system.
- **Dark Mode**: Sleek dark mode support.
- **Responsive**: Fully optimized for mobile and desktop.

## Tech Stack
- **Frontend**: React (Vite), Tailwind CSS, Lucide Icons, Recharts, Framer Motion.
- **Backend**: Node.js, Express, MongoDB (Mongoose).
- **Libraries**: ExcelJS, json2csv, jsPDF.

## Installation & Setup

### Prerequisites
- Node.js installed.
- MongoDB installed and running (or a MongoDB Atlas URI).

### 1. Backend Setup
```bash
cd server
npm install
```
Create a `.env` file in the `server` directory:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/client-crm
JWT_SECRET=your_secret_key
```

### 2. Frontend Setup
```bash
cd client
npm install
```

### 3. Run the Application
Start the backend:
```bash
cd server
npm run dev
```
(Make sure you add `"dev": "nodemon index.js"` to your server `package.json` scripts)

Start the frontend:
```bash
cd client
npm run dev
```

### 4. Initial Admin Setup
Once the backend is running, you can create the initial admin account by sending a POST request to:
`http://localhost:5000/api/auth/setup`

**Default Credentials:**
- Email: `admin@crm.com`
- Password: `adminpassword`

## Bonus: Mobile Conversion
To convert this into a mobile app:
1. **React Native**: Since the business logic is already in React, you can reuse the API integration and state management. You would replace the Tailwind/HTML components with React Native components (`View`, `Text`, `FlatList`).
2. **Capacitor**: You can wrap this web app using Ionic Capacitor to deploy it as a native iOS/Android app with minimal changes to the UI code.
