# AI Summit Evaluation Platform

A comprehensive evaluation platform for AI Summit hackathon with three types of events: Poster Presentation, Paper Presentation, and Startup Expo.

## Features

### Admin Features
- Create and manage teams
- Add/remove judges and assign them to events
- View team leaderboard and evaluation marks
- View detailed analytics and download PDF reports
- Cannot modify marks (view-only for evaluations)

### Judge Features
- View all teams and their details
- Mark teams for assigned events only
- Two-round evaluation system (5 questions per round, 1-10 marks each)
- Add remarks for teams
- Update/edit previous evaluations
- View leaderboard for all events
- View team analytics and download PDF reports

## Tech Stack

- **Frontend**: React, TailwindCSS, Vite
- **Backend**: Node.js, Express
- **Database**: MongoDB
- **PDF Generation**: jsPDF

## Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (running locally or MongoDB Atlas URI)

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
Edit `.env` file and update MongoDB URI if needed:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/aisummit
JWT_SECRET=your_jwt_secret_key_change_in_production
NODE_ENV=development
```

4. Start the backend server:
```bash
npm run dev
```

The backend will run on http://localhost:5000

5. Create initial admin account (one-time setup):
```bash
curl -X POST http://localhost:5000/api/auth/setup/initial-admin
```

### Frontend Setup

1. Navigate to frontend directory (in a new terminal):
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
Edit `.env` file if needed (default should work):
```
VITE_API_URL=http://localhost:5000/api
```

4. Start the development server:
```bash
npm run dev
```

The frontend will run on http://localhost:3000

## Usage

### Admin Login
1. Go to http://localhost:3000
2. Select "Admin Login"
3. Use default credentials:
   - Email: `admin@aisummit.com`
   - Password: `admin123`

### Creating Judges
1. Login as admin
2. Go to "Judges" tab
3. Click "Add Judge"
4. Fill in judge details and assign an event
5. Judge credentials will be: email and password you set

### Creating Teams
1. Login as admin
2. Go to "Teams" tab
3. Click "Add Team"
4. Fill in team details and add members
5. Select event type

### Judge Evaluation
1. Login as judge using credentials created by admin
2. Go to "Marking" tab
3. Click on a team to evaluate
4. Fill in scores for Round 1 (5 questions, 1-10 marks each)
5. Fill in scores for Round 2 (5 questions, 1-10 marks each)
6. Add remarks (optional)
7. Submit evaluation

### Viewing Leaderboard
- Both admin and judges can view leaderboards
- Switch between events to see rankings
- Click "View Analytics" to see detailed evaluation breakdown
- Download PDF reports for individual teams

## Project Structure

```
AiSummit/
├── backend/
│   ├── config/
│   │   └── database.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── adminController.js
│   │   └── judgeController.js
│   ├── middleware/
│   │   └── auth.js
│   ├── models/
│   │   ├── Admin.js
│   │   ├── Judge.js
│   │   ├── Team.js
│   │   └── Evaluation.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── adminRoutes.js
│   │   └── judgeRoutes.js
│   ├── utils/
│   │   └── generateToken.js
│   ├── .env
│   ├── package.json
│   └── server.js
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── Admin/
    │   │   │   ├── TeamManagement.jsx
    │   │   │   ├── JudgeManagement.jsx
    │   │   │   └── AdminLeaderboard.jsx
    │   │   ├── Judge/
    │   │   │   ├── TeamsView.jsx
    │   │   │   ├── MarkingSection.jsx
    │   │   │   └── JudgeLeaderboard.jsx
    │   │   ├── Navbar.jsx
    │   │   ├── Modal.jsx
    │   │   ├── Loader.jsx
    │   │   └── ProtectedRoute.jsx
    │   ├── context/
    │   │   └── AuthContext.jsx
    │   ├── pages/
    │   │   ├── Login.jsx
    │   │   ├── AdminDashboard.jsx
    │   │   └── JudgeDashboard.jsx
    │   ├── services/
    │   │   ├── api.js
    │   │   ├── authService.js
    │   │   ├── adminService.js
    │   │   └── judgeService.js
    │   ├── utils/
    │   │   └── helpers.js
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css
    ├── .env
    ├── package.json
    ├── vite.config.js
    ├── tailwind.config.js
    └── index.html
```

## Key Features

### Responsive Design
- Mobile-first approach
- Optimized for all screen sizes
- Touch-friendly interface

### Professional UI
- Clean and modern design
- Intuitive navigation
- Visual feedback for all actions

### Modular Code
- Component-based architecture
- Reusable components
- Separation of concerns
- Easy to maintain and extend

### Security
- JWT-based authentication
- Role-based access control
- Password hashing with bcrypt
- Protected routes

## Event Types

1. **Poster Presentation**
2. **Paper Presentation**
3. **Startup Expo**

Each event has separate judges and leaderboards.

## Evaluation System

- **Round 1**: 5 questions × 10 marks = 50 marks
- **Round 2**: 5 questions × 10 marks = 50 marks
- **Total**: 100 marks per judge
- Judges can update their evaluations
- Leaderboard shows aggregate scores from all judges

## Notes

- Make sure MongoDB is running before starting the backend
- Default admin credentials should be changed in production
- JWT secret should be changed in production
- The application uses local storage for authentication
