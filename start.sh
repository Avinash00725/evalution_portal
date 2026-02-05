#!/bin/bash

echo "🚀 Starting AI Summit Evaluation Platform..."
echo ""
echo "✅ Using MongoDB Atlas (Cloud Database)"
echo ""

# Start backend
echo "📦 Starting Backend Server..."
cd backend
npm install --silent 2>/dev/null
npm run dev &
BACKEND_PID=$!
cd ..

# Wait for backend to start
sleep 3

# Start frontend
echo "🎨 Starting Frontend Server..."
cd frontend
npm install --silent 2>/dev/null
npm run dev &
FRONTEND_PID=$!
cd ..

echo ""
echo "✅ Application is starting!"
echo ""
echo "📍 Frontend: http://localhost:3000"
echo "📍 Backend:  http://localhost:5000"
echo ""
echo "👨‍💼 Admin Login:"
echo "   Email: admin@aisummit.com"
echo "   Password: admin123"
echo ""
echo "Press Ctrl+C to stop all servers"
echo ""

# Wait for Ctrl+C
trap "echo ''; echo '🛑 Stopping servers...'; kill $BACKEND_PID $FRONTEND_PID; exit" INT
wait
