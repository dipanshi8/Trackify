// frontend/src/pages/Profile.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  getUserById,
  getUserHabits,
} from "../services/api";
import { LogOut, Calendar, Users, User, Target } from "lucide-react";

export default function Profile() {
  const { id } = useParams(); // userId from URL
  const [user, setUser] = useState(null);
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const currentUser = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    loadProfile();
    // eslint-disable-next-line
  }, [id]);

  async function loadProfile() {
    try {
      setLoading(true);
      setError(null);

      const userData = await getUserById(id);
      setUser(userData);

      const habitData = await getUserHabits(id);
      setHabits(habitData);
    } catch (err) {
      console.error("Error loading profile:", err);
      setError("Could not load profile. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  // Get today's day of week (0 = Sunday, 1 = Monday, etc.)
  const getTodayIndex = () => {
    const today = new Date().getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    // Convert to Monday = 0, Tuesday = 1, ..., Sunday = 6
    return today === 0 ? 6 : today - 1;
  };

  const todayIndex = getTodayIndex();
  const dayNames = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];

  // Weekly activity helper
  const weeklyActivity = Array(7).fill(0).map((_, i) => ({
    day: dayNames[i],
    count: habits.reduce((acc, h) => acc + (h.activityThisWeek?.[i] || 0), 0),
    isToday: i === todayIndex
  }));

  // Habit categories
  const categories = [
    { name: "Health", count: habits.filter(h => h.category === "Health").length },
    { name: "Fitness", count: habits.filter(h => h.category === "Fitness").length },
    { name: "Productivity", count: habits.filter(h => h.category === "Productivity").length },
    { name: "Learning", count: habits.filter(h => h.category === "Learning").length },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-accent-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-text-muted">Loading...</p>
        </div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <p className="text-red-400">{error}</p>
      </div>
    );
  }
  if (!user) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <p className="text-text-muted">User not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-bg py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Profile Header Card */}
        <div className="card-gradient relative overflow-hidden animate-slideUp" style={{ animationDelay: '0ms', animationFillMode: 'both' }}>
          <div className="relative z-10 p-8">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
              {/* Avatar */}
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-accent-primary via-accent-secondary to-accent-cyan flex items-center justify-center text-4xl font-bold text-white shadow-glow flex-shrink-0">
                {user.username.charAt(0).toUpperCase()}
              </div>
              {/* User Info */}
              <div className="flex-1 text-center sm:text-left">
                <h1 className="text-3xl font-bold text-text-primary mb-1">{user.username}</h1>
                <p className="text-text-muted mb-6">{user.email}</p>
                <div className="flex flex-wrap justify-center sm:justify-start gap-6">
                  <div className="text-center sm:text-left">
                    <p className="text-2xl font-bold text-text-primary">{habits.length}</p>
                    <p className="text-sm text-text-muted">Active Habits</p>
                  </div>
                  <div className="text-center sm:text-left">
                    <p className="text-2xl font-bold text-accent-cyan">
                      {habits.reduce((acc, h) => acc + (h.streak || 0), 0)}
                    </p>
                    <p className="text-sm text-text-muted">Total Streak Days</p>
                  </div>
                  <div className="text-center sm:text-left">
                    <p className="text-2xl font-bold text-accent-primary">
                      {habits.reduce((acc, h) => acc + (h.completionRate || 0), 0)}%
                    </p>
                    <p className="text-sm text-text-muted">Avg Completion</p>
                  </div>
                </div>
                {/* Contextual microcopy */}
                <p className="text-sm text-text-muted/80 mt-6 italic">
                  Your consistency will show here once you start
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Weekly Activity Heatmap */}
        <div className="card animate-slideUp" style={{ animationDelay: '200ms', animationFillMode: 'both' }}>
          <h2 className="text-xl font-semibold flex items-center gap-2 mb-6 text-text-primary">
            <Calendar size={20} className="text-accent-primary" />
            This Week's Activity
          </h2>
          <div className="grid grid-cols-7 gap-3 justify-center mb-3">
            {weeklyActivity.map((day) => {
              const intensity = day.count;
              const isToday = day.isToday;
              const bgClass = intensity === 0 
                ? "bg-dark-hover border-dark-border" 
                : intensity <= 2 
                ? "bg-accent-primary/30 border-accent-primary/50" 
                : intensity <= 4 
                ? "bg-accent-primary/50 border-accent-primary/70" 
                : "bg-accent-primary border-accent-primary";
              
              // Today gets special styling
              const todayClass = isToday 
                ? "border-2 border-accent-primary ring-2 ring-accent-primary/50 animate-pulse-today" 
                : "";
              
              const tooltipText = intensity > 0 
                ? `${day.day}: Habit completed` 
                : `${day.day}: No habit logged`;
              
              return (
                <div
                  key={day.day}
                  className={`w-10 h-10 rounded-lg flex items-center justify-center font-medium text-sm border transition-all hover:scale-110 relative group ${bgClass} ${todayClass} ${
                    intensity > 0 ? "text-text-primary" : "text-text-muted"
                  }`}
                  title={tooltipText}
                >
                  {day.count > 0 ? day.count : ""}
                  {/* Tooltip */}
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-dark-card border border-dark-border rounded text-xs text-text-primary whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10 shadow-soft">
                    {tooltipText}
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-px">
                      <div className="border-4 border-transparent border-t-dark-card"></div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="grid grid-cols-7 gap-3 text-xs text-text-muted">
            {weeklyActivity.map((day) => (
              <span key={day.day} className={`text-center ${day.isToday ? "text-accent-primary font-semibold" : ""}`}>
                {day.day}
              </span>
            ))}
          </div>
        </div>

        {/* Social Connections Card */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 animate-slideUp" style={{ animationDelay: '100ms', animationFillMode: 'both' }}>
          {/* Followers */}
          <div className="card group hover:border-accent-primary/50 transition-all">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-accent-primary/20 border border-accent-primary/30">
                  <Users size={24} className="text-accent-primary" />
                </div>
                <div>
                  <p className="font-semibold text-text-primary">Followers</p>
                  <p className="text-sm text-text-muted">People following you</p>
                </div>
              </div>
              <p className="text-3xl font-bold text-accent-primary">{user.followers?.length || 0}</p>
            </div>
          </div>
          {/* Following */}
          <div className="card group hover:border-accent-cyan/50 transition-all">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-accent-cyan/20 border border-accent-cyan/30">
                  <User size={24} className="text-accent-cyan" />
                </div>
                <div>
                  <p className="font-semibold text-text-primary">Following</p>
                  <p className="text-sm text-text-muted">People you follow</p>
                </div>
              </div>
              <p className="text-3xl font-bold text-accent-cyan">{user.following?.length || 0}</p>
            </div>
          </div>
        </div>

        {/* Habit Categories Breakdown */}
        <div className="card animate-slideUp" style={{ animationDelay: '300ms', animationFillMode: 'both' }}>
          <h2 className="text-xl font-semibold flex items-center gap-2 mb-6 text-text-primary">
            <Target size={20} className="text-accent-primary" />
            Habit Categories
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.map((cat) => (
              <div
                key={cat.name}
                className="card-gradient text-center py-6 hover:scale-105 transition-all"
              >
                <p className="text-3xl font-bold text-text-primary mb-2">{cat.count}</p>
                <p className="text-sm text-text-muted">{cat.name}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
