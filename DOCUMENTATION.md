Project Documentation
Approach

This project implements a habit-tracking web application called Trackify.
The stack used includes:

Frontend: React with TailwindCSS for styling and React Router for navigation

Backend: Node.js with Express.js

Database: MongoDB with Mongoose

Authentication: JWT-based authentication with middleware

Key features:

User registration and login

Dashboard for managing personal habits

Daily habit check-ins

Feed displaying check-ins of followed users

User profile page with follower/following details, habits, and recent activity

The application follows a client-server model, where the React frontend communicates with the Express backend using REST APIs.

Challenges

Profile Routing
Clicking "My Profile" initially redirected back to the dashboard or gave 404 errors. This was caused by missing React Router configuration and user IDs not being passed correctly.
Solution: Corrected the routes, ensured localStorage stored the logged-in user with _id, and updated the Navbar link to /profile/:id.

JWT Authentication
API requests failed with unauthorized errors because the token was not consistently included.
Solution: Added an Axios interceptor in the frontend that automatically attaches the JWT token from localStorage to every request.

Data Population
Fetching complete user information, including followers, following, habits, and recent check-ins, was not straightforward.
Solution: Used Mongoose populate() in the backend routes to fetch relational data properly.

Outcome

The final application successfully provides:

Secure authentication and protected routes

A dashboard for personal habit management

A feed of recent activities from followed users

A detailed profile page showing habits, check-ins, and social connections

The project demonstrates integration of authentication, database relations, and a user-friendly interface.