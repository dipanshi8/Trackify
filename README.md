Trackify – Habit Tracker

A full-stack habit tracking web app that helps users build habits, stay consistent, and stay motivated.
With personal dashboards, daily check-ins, social features (follow/unfollow), and a live feed, Trackify turns self-improvement into a community experience.

🚀 Live Demo

🔗 Deployed App
 (replace with your actual deployed URL)

✨ Features

🔐 Authentication – Register/Login with JWT

✅ Habit Management – Create, edit, delete, and check-in habits

🔄 Daily Streaks – Track progress with streak counters

👥 Social Features – Follow/unfollow users

📰 Personalized Feed – See recent check-ins from people you follow

👤 Profile Page – View insights, habits, and recent activity

🛠️ Tech Stack

Frontend

React (Vite / CRA)

Tailwind CSS for styling

Axios for API calls

Backend

Node.js + Express

MongoDB (Mongoose ODM)

JWT for authentication

Deployment

Frontend → Netlify / Vercel

Backend → Render / Railway

Database → MongoDB Atlas

⚙️ Setup Instructions
1. Clone the Repository
git clone https://github.com/dipanshi8/trackify.git
cd trackify

2. Backend Setup
cd backend
npm install


Create a .env file in backend/:

PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
FRONTEND_URL=http://localhost:3000


Run backend:

npm start

3. Frontend Setup
cd frontend
npm install


Create a .env file in frontend/:

REACT_APP_API_URL=http://localhost:5000/api


Run frontend:

npm start

📦 API Endpoints
Auth

POST /api/auth/register → Register user

POST /api/auth/login → Login user

Habits

GET /api/habits → Get user habits

POST /api/habits → Create habit

PUT /api/habits/:id → Edit habit

DELETE /api/habits/:id → Delete habit

POST /api/habits/:id/checkin → Daily check-in

Users

GET /api/users/:id → Get user profile

GET /api/users/:id/habits → Get user’s habits

POST /api/users/:id/follow → Follow user

POST /api/users/:id/unfollow → Unfollow user

GET /api/users/feed → Get activity feed

