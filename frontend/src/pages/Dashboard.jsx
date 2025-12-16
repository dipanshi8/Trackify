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
    <div className="min-h-screen bg-dark-bg py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-accent-primary to-accent-cyan bg-clip-text text-transparent">
              Welcome back! 👋
            </h1>
            <p className="text-text-muted">Track your progress and build better habits</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="card-gradient group hover:scale-[1.02] transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold text-text-primary mb-1">{totalHabits}</p>
                <p className="text-text-muted text-sm">Active Habits</p>
              </div>
              <Target className="w-12 h-12 text-accent-primary opacity-50 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>
          
          <div className="card-gradient group hover:scale-[1.02] transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold text-text-primary mb-1">{activeStreaks}</p>
                <p className="text-text-muted text-sm">Active Streaks</p>
              </div>
              <Calendar className="w-12 h-12 text-accent-cyan opacity-50 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>
          
          <div className="card-gradient group hover:scale-[1.02] transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold text-text-primary mb-1">
                  {totalHabits ? `${Math.round((activeStreaks / totalHabits) * 100)}%` : "0%"}
                </p>
                <p className="text-text-muted text-sm">Completion Rate</p>
              </div>
              <Flame className="w-12 h-12 text-accent-secondary opacity-50 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>
        </div>

        {/* Habit Form */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-6 text-text-primary">
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
            <h2 className="text-2xl font-bold mb-6 text-text-primary">Your Habits</h2>
            {habits.length > 0 ? (
              <div className="grid gap-6 grid-cols-1 sm:grid-cols-2">
                {habits.map((h) => (
                  <HabitCard
                    key={h._id}
                    habit={h}
                    onEdit={() => setEditingHabit(h)}
                    onUpdated={loadHabits}
                  />
                ))}
              </div>
            ) : (
              <div className="card text-center py-12">
                <Target className="w-16 h-16 text-text-muted mx-auto mb-4 opacity-50" />
                <p className="text-text-muted">No habits yet. Create your first one above!</p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Recent Activity */}
            <div className="card">
              <h3 className="text-lg font-semibold mb-4 text-text-primary">Recent Activity</h3>
              {recentActivity.length > 0 ? (
                <ul className="space-y-3">
                  {recentActivity.map((h) => (
                    <li key={h._id} className="flex items-center justify-between text-sm py-2 border-b border-dark-border last:border-0">
                      <span className="text-text-secondary">{h.name}</span>
                      <span className="text-green-400 font-semibold flex items-center gap-1">
                        <CheckCircle2 size={14} />
                        Today
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-text-muted">No recent check-ins</p>
              )}
            </div>

            {/* Top Streaks */}
            <div className="card">
              <h3 className="text-lg font-semibold mb-4 text-text-primary flex items-center gap-2">
                <Flame className="text-accent-primary" size={20} />
                Top Streaks
              </h3>
              {topStreaks.length > 0 ? (
                <ul className="space-y-3">
                  {topStreaks.map((h, i) => (
                    <li key={h._id} className="flex justify-between items-center text-sm py-2">
                      <span className="text-text-secondary">
                        <span className="text-accent-primary font-bold">#{i + 1}</span> {h.name}
                      </span>
                      <span className="font-bold text-accent-cyan">{h.streak} days</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-text-muted">No streaks yet</p>
              )}
            </div>

            {/* Motivational Quote */}
            <div className="card-gradient">
              <p className="italic text-text-primary leading-relaxed">
                "Small daily improvements over time lead to stunning results."
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
