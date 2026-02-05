# AI Summit Evaluation Platform - Quick Reference

## 🚀 Quick Start

### Option 1: Automated Start (Recommended)
```bash
cd /home/sumith/Desktop/projects/AiSummit
./start.sh
```

### Option 2: Manual Start

**Terminal 1 - Backend:**
```bash
cd backend
npm install
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm install
npm run dev
```

**Terminal 3 - Setup Admin:**
```bash
curl -X POST http://localhost:5000/api/auth/setup/initial-admin
```

## 🔑 Default Credentials

**Admin:**
- Email: `admin1@aisummit.com`
- Password: `admin123`

**Judge:** Created by admin through the platform

## 📱 Application URLs

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5000

## 🎯 Application Flow

### Admin Workflow:
1. Login as admin
2. Create judges and assign events
3. Create teams and add members
4. View leaderboards and analytics
5. Download PDF reports

### Judge Workflow:
1. Login with credentials
2. View all teams (All Teams tab)
3. Mark assigned teams (Marking tab)
   - Round 1: 5 questions (1-10 marks each)
   - Round 2: 5 questions (1-10 marks each)
   - Add remarks
4. View leaderboards (Leaderboard tab)
5. Download team analytics as PDF

## 🏆 Events

1. **Poster Presentation**
2. **Paper Presentation**
3. **Startup Expo**

## ✨ Key Features

### ✅ Responsive Design
- Mobile-first development
- Works on all devices
- Touch-optimized

### ✅ Professional UI
- Clean interface
- Intuitive navigation
- Real-time updates

### ✅ Modular Code
- Component-based
- Easy to maintain
- Scalable architecture

### ✅ Security
- JWT authentication
- Role-based access
- Password encryption

## 📊 Evaluation System

- **Each Round:** 5 questions × 10 marks = 50 marks
- **Total per Judge:** 100 marks
- **Multiple Judges:** Scores are aggregated
- **Leaderboard:** Sorted by total marks (highest first)
- **Rankings:** Top 3 teams highlighted (🥇🥈🥉)

## 🔧 Tech Stack

**Frontend:**
- React 18
- TailwindCSS
- React Router
- Axios
- jsPDF

**Backend:**
- Node.js
- Express
- MongoDB
- JWT
- Bcrypt

## 📁 Project Structure

```
AiSummit/
├── backend/          # Node.js Express API
│   ├── config/       # Database configuration
│   ├── controllers/  # Business logic
│   ├── middleware/   # Auth & validation
│   ├── models/       # MongoDB schemas
│   ├── routes/       # API endpoints
│   └── server.js     # Entry point
│
├── frontend/         # React application
│   ├── src/
│   │   ├── components/  # Reusable components
│   │   ├── pages/       # Page components
│   │   ├── services/    # API calls
│   │   ├── context/     # Global state
│   │   └── utils/       # Helper functions
│   └── public/
│
├── SETUP.md          # Detailed setup guide
└── start.sh          # Quick start script
```

## 🐛 Troubleshooting

### MongoDB not running:
```bash
# Linux
sudo systemctl start mongod

# macOS
brew services start mongodb-community
```

### Port already in use:
```bash
# Kill process on port 5000
lsof -ti:5000 | xargs kill -9

# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
```

### Clear MongoDB data:
```bash
mongosh
use aisummit
db.dropDatabase()
```

## 📞 Support

For issues or questions, refer to [SETUP.md](SETUP.md) for detailed documentation.

---

**Built for AI Summit Hackathon 2026** 🎉
