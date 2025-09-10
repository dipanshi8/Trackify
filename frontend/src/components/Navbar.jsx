import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function Navbar({ user, setUser }) {
  const navigate = useNavigate();

  // Ensure we always have the latest user from localStorage
  const storedUser = JSON.parse(localStorage.getItem("user"));
  const currentUser = user || storedUser;

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    navigate('/signin');
  };

  return (
    <div className="flex items-center justify-between p-4 bg-white border-b shadow-sm">
      {/* Logo / Brand */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded bg-brandRed text-white flex items-center justify-center font-bold">
          T
        </div>
        <div className="text-lg font-semibold">Trackify</div>
      </div>

      {/* Links */}
      <div className="flex items-center gap-4">
        <Link to="/dashboard" className="text-sm hover:text-brandRed transition">
          Dashboard
        </Link>
        <Link to="/feed" className="text-sm hover:text-brandRed transition">
          Feed
        </Link>

        {currentUser ? (
          <div className="flex items-center gap-3">
            {/* My Profile */}
            <Link
              to={`/profile/${currentUser.id}`}
              className="px-3 py-1 rounded bg-gray-100 text-sm hover:bg-gray-200 transition"
            >
              My Profile
            </Link>

            {/* Sign out */}
            <button
              className="btn-brand px-3 py-1 text-sm"
              onClick={logout}
            >
              Sign out
            </button>
          </div>
        ) : (
          <div className="flex gap-2">
            <Link
              to="/signin"
              className="px-3 py-1 border rounded hover:bg-gray-100 text-sm"
            >
              Sign in
            </Link>
            <Link
              to="/signup"
              className="btn-brand text-sm"
            >
              Sign up
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
