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
    <nav className="sticky top-0 z-50 backdrop-blur-md bg-dark-card/80 border-b border-dark-border shadow-soft">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo / Brand */}
          <Link to={currentUser ? "/dashboard" : "/"} className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-accent-primary via-accent-secondary to-accent-cyan 
                          flex items-center justify-center font-bold text-white
                          shadow-lg shadow-accent-primary/30
                          group-hover:shadow-glow group-hover:scale-105
                          transition-all duration-300">
              T
            </div>
            <div className="text-xl font-bold bg-gradient-to-r from-accent-primary to-accent-cyan bg-clip-text text-transparent">
              Trackify
            </div>
          </Link>

          {/* Links */}
          <div className="flex items-center gap-6">
            {currentUser && (
              <>
                <Link 
                  to="/dashboard" 
                  className="text-sm font-medium text-text-secondary hover:text-text-primary transition-colors duration-200"
                >
                  Dashboard
                </Link>
                <Link 
                  to="/feed" 
                  className="text-sm font-medium text-text-secondary hover:text-text-primary transition-colors duration-200"
                >
                  Feed
                </Link>
              </>
            )}

            {currentUser ? (
              <div className="flex items-center gap-3">
                {/* My Profile */}
                <Link
                  to={`/profile/${currentUser.id}`}
                  className="px-4 py-2 rounded-lg bg-dark-hover text-sm font-medium text-text-secondary 
                           hover:text-text-primary hover:bg-dark-card border border-dark-border
                           transition-all duration-200"
                >
                  Profile
                </Link>

                {/* Sign out */}
                <button
                  className="btn-primary px-4 py-2 text-sm"
                  onClick={logout}
                >
                  Sign out
                </button>
              </div>
            ) : (
              <div className="flex gap-3">
                <Link
                  to="/signin"
                  className="btn-ghost"
                >
                  Sign in
                </Link>
                <Link
                  to="/signup"
                  className="btn-primary px-4 py-2 text-sm"
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
