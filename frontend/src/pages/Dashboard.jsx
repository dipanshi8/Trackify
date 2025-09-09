import React, { useEffect, useState } from "react";
import { Plus, Target, Calendar, Flame, Circle, CheckCircle2, Edit3, Trash2 } from "lucide-react";
import { getHabits, createHabit, editHabit } from "../services/api";
import HabitCard from "../components/HabitCard";
import HabitForm from "./HabitForm";

export default function Dashboard() {
  const [habits, setHabits] = useState([]);
  const [editingHabit, setEditingHabit] = useState(null);

  useEffect(() => {
    loadHabits();
  }, []);

  async function loadHabits() {
    const data = await getHabits();
    setHabits(data);
  }

  async function handleCreate(newHabit) {
    await createHabit(newHabit);
    loadHabits();
  }

  async function handleUpdate(updatedHabit) {
    await editHabit(editingHabit._id, updatedHabit);
    setEditingHabit(null);
    loadHabits();
  }

  const totalHabits = habits.length;
  const activeStreaks = habits.filter((h) => h.streak && h.streak > 0).length;

  const recentActivity = habits.slice(0, 3);
  const topStreaks = [...habits].sort((a, b) => (b.streak || 0) - (a.streak || 0)).slice(0, 3);

  return (
    <div className="relative min-h-screen overflow-x-hidden overflow-y-auto bg-gray-100 p-8">

      <div className="relative max-w-7xl mx-auto space-y-12">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-4xl font-extrabold text-gray-800">Welcome back! 👋</h1>
          
        </div>

        {/* Stats Bento Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          <div className="relative rounded-2xl p-6 text-white bg-gradient-to-tr from-orange-400 to-pink-500 overflow-hidden shadow-lg transform hover:scale-105 transition-all duration-500">
            <Target className="absolute right-4 top-4 text-white/20 w-16 h-16" />
            <p className="text-2xl font-bold">{totalHabits}</p>
            <p className="mt-2 text-sm">Active Habits</p>
          </div>
          <div className="relative rounded-2xl p-6 text-white bg-gradient-to-tr from-green-400 to-emerald-500 overflow-hidden shadow-lg transform hover:scale-105 transition-all duration-500">
            <Calendar className="absolute right-4 top-4 text-white/20 w-16 h-16" />
            <p className="text-2xl font-bold">{activeStreaks}</p>
            <p className="mt-2 text-sm">Active Streaks</p>
          </div>
          <div className="relative rounded-2xl p-6 text-white bg-gradient-to-tr from-purple-500 to-indigo-500 overflow-hidden shadow-lg transform hover:scale-105 transition-all duration-500">
            <Flame className="absolute right-4 top-4 text-white/20 w-16 h-16" />
            <p className="text-2xl font-bold">
              {totalHabits ? `${Math.round((activeStreaks / totalHabits) * 100)}%` : "0%"}
            </p>
            <p className="mt-2 text-sm">Completion Rate</p>
          </div>
        </div>

        {/* Habit Form */}
        <div className="bg-white p-6 rounded-2xl shadow-md hover:shadow-xl transform transition-all duration-500">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">
            {editingHabit ? "Edit Habit" : "Create a New Habit"}
          </h2>
          {editingHabit ? (
            <HabitForm initialData={editingHabit} onSubmit={handleUpdate} onCancel={() => setEditingHabit(null)} />
          ) : (
            <HabitForm onSubmit={handleCreate} />
          )}
        </div>

        {/* Habits and Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Habit Cards Grid */}
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold mb-4">Your Habits</h2>
            {habits.length > 0 ? (
              <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                {habits.map((h) => (
                  <div key={h._id} className="transform hover:scale-105 transition-all duration-500">
                    <HabitCard
                      habit={h}
                      onEdit={() => setEditingHabit(h)}
                      onUpdated={loadHabits}
                      styleClass="bg-white/60 backdrop-blur-sm border border-gray-200 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300"
                    />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 mt-4">No habits yet. Create your first one above!</p>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Recent Activity */}
            <div className="bg-white p-6 rounded-2xl shadow-md hover:shadow-xl transition-all duration-500">
              <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
              {recentActivity.length > 0 ? (
                <ul className="space-y-3">
                  {recentActivity.map((h) => (
                    <li key={h._id} className="flex items-center justify-between text-sm">
                      <span>{h.name}</span>
                      <span className="text-green-600 font-bold">✔ Today</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-500">No recent check-ins</p>
              )}
            </div>

            {/* Top Streaks */}
            <div className="bg-white p-6 rounded-2xl shadow-md hover:shadow-xl transition-all duration-500">
              <h3 className="text-lg font-semibold mb-4">Top Streaks 🔥</h3>
              {topStreaks.length > 0 ? (
                <ul className="space-y-3">
                  {topStreaks.map((h, i) => (
                    <li key={h._id} className="flex justify-between text-sm">
                      <span>#{i + 1} {h.name}</span>
                      <span className="font-bold text-orange-600">{h.streak} days</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-500">No streaks yet</p>
              )}
            </div>

            {/* Motivational Quote */}
            <div className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white p-6 rounded-2xl shadow-lg ">
              <p className="italic">“Small daily improvements over time lead to stunning results.”</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
