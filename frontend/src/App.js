import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import Navbar from './components/Navbar';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import Dashboard from './pages/Dashboard';
import HabitForm from './pages/HabitForm';
import Feed from './pages/Feed';
import SearchUsers from './pages/SearchUsers';

import Profile from "./pages/Profile";

function App() {
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('user')) || null);

  useEffect(() => {
    const u = JSON.parse(localStorage.getItem('user'));
    if (u) setUser(u);
  }, []);

  const PrivateRoute = ({ children }) => (user ? children : <Navigate to="/signin" />);

  return (
    <>
      <Navbar user={user} setUser={setUser} />
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" />} />
        <Route path="/signin" element={<SignIn setUser={setUser} />} />
        <Route path="/signup" element={<SignUp setUser={setUser} />} />

        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/habit/new"
          element={
            <PrivateRoute>
              <HabitForm />
            </PrivateRoute>
          }
        />
        <Route
          path="/feed"
          element={
            <PrivateRoute>
              <Feed />
            </PrivateRoute>
          }
        />
        <Route
          path="/search-users"
          element={
            <PrivateRoute>
              <SearchUsers />
            </PrivateRoute>
          }
        />

        <Route
    path="/profile/:id"
    element={
      <PrivateRoute>
        <Profile />
      </PrivateRoute>
    }
  />


        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </>
  );
}

export default App;
