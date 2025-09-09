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

  // Weekly activity helper
  const weeklyActivity = Array(7).fill(0).map((_, i) => ({
    day: ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"][i],
    count: habits.reduce((acc, h) => acc + (h.activityThisWeek?.[i] || 0), 0)
  }));

  // Habit categories
  const categories = [
    { name: "Health", count: habits.filter(h => h.category === "Health").length },
    { name: "Fitness", count: habits.filter(h => h.category === "Fitness").length },
    { name: "Productivity", count: habits.filter(h => h.category === "Productivity").length },
    { name: "Learning", count: habits.filter(h => h.category === "Learning").length },
  ];

  const getActivityColor = (count) => {
    if (count === 0) return "bg-gray-300";
    if (count <= 2) return "bg-orange-200";
    if (count <= 4) return "bg-orange-400";
    return "bg-orange-600 text-white";
  };

  if (loading) return <p className="text-center mt-10">Loading...</p>;
  if (error) return <p className="text-center mt-10 text-red-500">{error}</p>;
  if (!user) return <p className="text-center mt-10">User not found</p>;

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-orange-50 to-pink-50">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Profile Header Card */}
        <div className="bg-gradient-to-r from-orange-400 to-pink-500 p-6 rounded-2xl flex flex-col sm:flex-row items-center justify-between shadow-lg text-white">
          <div className="flex items-center space-x-6">
            {/* Avatar */}
            <div className="w-24 h-24 rounded-full bg-white text-orange-500 flex items-center justify-center text-4xl font-bold border-4 border-white">
              {user.username.charAt(0).toUpperCase()}
            </div>
            {/* User Info */}
            <div>
              <h1 className="text-3xl font-bold">{user.username}</h1>
              <p className="text-orange-200">{user.email}</p>
              <div className="flex mt-3 space-x-6">
                <div className="text-center">
                  <p className="text-xl font-bold">{habits.length}</p>
                  <p className="text-sm opacity-80">Active Habits</p>
                </div>
                <div className="text-center">
                  <p className="text-xl font-bold">
                    {habits.reduce((acc, h) => acc + (h.streak || 0), 0)}
                  </p>
                  <p className="text-sm opacity-80">Total Streak Days</p>
                </div>
                <div className="text-center">
                  <p className="text-xl font-bold">
                    {habits.reduce((acc, h) => acc + (h.completionRate || 0), 0)}
                  </p>
                  <p className="text-sm opacity-80">Total Completions</p>
                </div>
              </div>
            </div>
          </div>
          {/* Logout Button */}
          
        </div>

        {/* Weekly Activity Heatmap */}
        <div className="bg-white p-6 rounded-2xl shadow-md">
          <h2 className="text-xl font-semibold flex items-center gap-2 mb-4 text-gray-800">
            <Calendar size={20} /> This Week's Activity
          </h2>
          <div className="grid grid-cols-7 gap-3 justify-center">
            {weeklyActivity.map((day) => (
              <div
                key={day.day}
                className={`w-8 h-8 rounded-lg flex items-center justify-center font-medium text-sm transition-transform transform hover:scale-110 ${getActivityColor(day.count)}`}
              >
                {day.count > 0 ? day.count : ""}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-3 text-xs text-gray-500 mt-2">
            {weeklyActivity.map((day) => (
              <span key={day.day} className="text-center">
                {day.day}
              </span>
            ))}
          </div>
        </div>

        {/* Social Connections Card */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Followers */}
          <div className="bg-orange-50 p-6 rounded-2xl flex items-center justify-between shadow-md">
            <div className="flex items-center gap-4">
              <div className="bg-orange-200 p-3 rounded-full">
                <Users size={24} className="text-orange-600" />
              </div>
              <div>
                <p className="font-medium text-gray-800">Followers</p>
                <p className="text-gray-600 text-sm">People following you</p>
              </div>
            </div>
            <p className="text-2xl font-bold text-orange-600">{user.followers?.length || 0}</p>
          </div>
          {/* Following */}
          <div className="bg-pink-50 p-6 rounded-2xl flex items-center justify-between shadow-md">
            <div className="flex items-center gap-4">
              <div className="bg-pink-200 p-3 rounded-full">
                <User size={24} className="text-pink-600" />
              </div>
              <div>
                <p className="font-medium text-gray-800">Following</p>
                <p className="text-gray-600 text-sm">People you follow</p>
              </div>
            </div>
            <p className="text-2xl font-bold text-pink-600">{user.following?.length || 0}</p>
          </div>
        </div>

        {/* Habit Categories Breakdown */}
        <div className="bg-white p-6 rounded-2xl shadow-md">
          <h2 className="text-xl font-semibold flex items-center gap-2 mb-4 text-gray-800">
            <Target size={20} /> Habit Categories
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.map((cat) => (
              <div
                key={cat.name}
                className="bg-gradient-to-br from-orange-50 to-pink-50 p-4 rounded-lg border border-orange-200 flex flex-col items-center justify-center shadow-sm hover:shadow-lg transition"
              >
                <p className="text-orange-600 font-bold text-xl">{cat.count}</p>
                <p className="text-gray-600 text-sm mt-1">{cat.name}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
