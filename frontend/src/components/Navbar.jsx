import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bell, X } from 'lucide-react';

export default function Navbar({ user, setUser }) {
  const navigate = useNavigate();
  const notificationRef = useRef(null);
  const navLinksRef = useRef(null);
  const underlineRef = useRef(null);
  
  // Notification state
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: 'social',
      message: 'Ananya started following you',
      timestamp: new Date(Date.now() - 3600000), // 1 hour ago
      read: false
    },
    {
      id: 2,
      type: 'reminder',
      message: 'Time for your "Morning Meditation" habit!',
      timestamp: new Date(Date.now() - 7200000), // 2 hours ago
      read: false
    },
    {
      id: 3,
      type: 'achievement',
      message: "You've reached a 7-day streak!",
      timestamp: new Date(Date.now() - 86400000), // 1 day ago
      read: true
    },
  ]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [hoveredLink, setHoveredLink] = useState(null);

  // Ensure we always have the latest user from localStorage
  const storedUser = JSON.parse(localStorage.getItem("user"));
  const currentUser = user || storedUser;

  // Scroll detection for glassmorphism effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Sliding underline animation
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!navLinksRef.current || !underlineRef.current) return;
      
      const links = navLinksRef.current.querySelectorAll('a');
      let targetLink = null;
      
      // Find which link the mouse is over
      links.forEach(link => {
        const rect = link.getBoundingClientRect();
        if (e.clientX >= rect.left && e.clientX <= rect.right &&
            e.clientY >= rect.top && e.clientY <= rect.bottom) {
          targetLink = link;
        }
      });
      
      if (targetLink) {
        const rect = targetLink.getBoundingClientRect();
        const containerRect = navLinksRef.current.getBoundingClientRect();
        
        underlineRef.current.style.left = `${rect.left - containerRect.left}px`;
        underlineRef.current.style.width = `${rect.width}px`;
        underlineRef.current.style.opacity = '1';
        setHoveredLink(targetLink);
      } else {
        underlineRef.current.style.opacity = '0';
        setHoveredLink(null);
      }
    };

    const handleMouseLeave = () => {
      if (underlineRef.current) {
        underlineRef.current.style.opacity = '0';
        setHoveredLink(null);
      }
    };

    if (navLinksRef.current) {
      navLinksRef.current.addEventListener('mousemove', handleMouseMove);
      navLinksRef.current.addEventListener('mouseleave', handleMouseLeave);
    }

    return () => {
      if (navLinksRef.current) {
        navLinksRef.current.removeEventListener('mousemove', handleMouseMove);
        navLinksRef.current.removeEventListener('mouseleave', handleMouseLeave);
      }
    };
  }, [currentUser]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };

    if (showNotifications) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showNotifications]);

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    navigate('/signin');
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (notificationId) => {
    setNotifications(prev =>
      prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
    );
  };

  const clearAll = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'social':
        return '👥';
      case 'reminder':
        return '⏰';
      case 'achievement':
        return '🏆';
      default:
        return '🔔';
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'social':
        return 'text-accent-cyan';
      case 'reminder':
        return 'text-accent-primary';
      case 'achievement':
        return 'text-yellow-400';
      default:
        return 'text-text-primary';
    }
  };

  return (
    <nav className={`sticky top-0 z-50 border-b border-dark-border transition-all duration-300 ${
      isScrolled 
        ? 'backdrop-blur-md bg-dark-card/80 shadow-soft' 
        : 'bg-transparent'
    }`}>
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

          {/* Links with Sliding Underline */}
          <div 
            ref={navLinksRef}
            className="flex items-center gap-6 relative"
            style={{ height: '100%' }}
          >
            {/* Sliding Underline */}
            <div
              ref={underlineRef}
              className="absolute bottom-2 h-0.5 bg-gradient-to-r from-accent-primary to-accent-cyan transition-all duration-300 ease-out pointer-events-none opacity-0 rounded-full"
              style={{
                transition: 'left 0.3s cubic-bezier(0.4, 0, 0.2, 1), width 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.2s ease-out',
                boxShadow: '0 0 8px rgba(99, 102, 241, 0.5)'
              }}
            />
            
            {currentUser && (
              <>
                <Link 
                  to="/dashboard" 
                  className="text-sm font-medium text-text-secondary hover:text-text-primary transition-colors duration-200 relative z-10 py-2"
                >
                  Dashboard
                </Link>
                <Link 
                  to="/feed" 
                  className="text-sm font-medium text-text-secondary hover:text-text-primary transition-colors duration-200 relative z-10 py-2"
                >
                  Feed
                </Link>
              </>
            )}

            {currentUser ? (
              <div className="flex items-center gap-3">
                {/* Notification Bell */}
                <div className="relative" ref={notificationRef}>
                  <button
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="relative p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-dark-hover transition-all duration-200"
                    aria-label="Notifications"
                  >
                    <Bell size={20} />
                    {unreadCount > 0 && (
                      <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center border-2 border-dark-card">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </button>

                  {/* Notifications Dropdown */}
                  {showNotifications && (
                    <div className="absolute right-0 mt-2 w-80 bg-dark-card/95 backdrop-blur-md border border-dark-border rounded-lg shadow-lg z-50 animate-fadeIn">
                      <div className="p-4 border-b border-dark-border flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-text-primary">Notifications</h3>
                        {unreadCount > 0 && (
                          <button
                            onClick={clearAll}
                            className="text-xs text-accent-primary hover:text-accent-cyan transition-colors"
                          >
                            Clear all
                          </button>
                        )}
                      </div>
                      <div className="max-h-96 overflow-y-auto">
                        {notifications.length === 0 ? (
                          <div className="p-8 text-center text-text-muted text-sm">
                            No notifications
                          </div>
                        ) : (
                          notifications.map((notification) => (
                            <div
                              key={notification.id}
                              className={`p-4 border-b border-dark-border hover:bg-dark-hover transition-colors ${
                                !notification.read ? 'bg-accent-primary/5' : ''
                              }`}
                            >
                              <div className="flex items-start gap-3">
                                <span className="text-xl flex-shrink-0">
                                  {getNotificationIcon(notification.type)}
                                </span>
                                <div className="flex-1 min-w-0">
                                  <p className={`text-sm ${getNotificationColor(notification.type)}`}>
                                    {notification.message}
                                  </p>
                                  <p className="text-xs text-text-muted mt-1">
                                    {new Date(notification.timestamp).toLocaleTimeString([], { 
                                      hour: '2-digit', 
                                      minute: '2-digit' 
                                    })}
                                  </p>
                                </div>
                                {!notification.read && (
                                  <button
                                    onClick={() => markAsRead(notification.id)}
                                    className="flex-shrink-0 text-xs text-accent-primary hover:text-accent-cyan transition-colors"
                                  >
                                    Mark as read
                                  </button>
                                )}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

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
