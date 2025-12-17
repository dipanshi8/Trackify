import React, { useEffect, useState, useRef } from "react";
import { Plus, Flame, X } from "lucide-react";
import { getHabits, createHabit, editHabit } from "../services/api";
import HabitCard from "../components/HabitCard";
import HabitForm from "./HabitForm";

export default function Dashboard() {
  const [habits, setHabits] = useState([]);
  const [editingHabit, setEditingHabit] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isClosingModal, setIsClosingModal] = useState(false);
  const [animatedCompleted, setAnimatedCompleted] = useState(0);
  const prevCompletedRef = useRef(0);

  useEffect(() => {
    loadHabits();
  }, []);

  async function loadHabits() {
    const data = await getHabits();
    setHabits(data);
  }

  async function handleCreate(newHabit) {
    await createHabit(newHabit);
    closeCreateModal();
    loadHabits();
  }

  async function handleUpdate(updatedHabit) {
    await editHabit(editingHabit._id, updatedHabit);
    closeEditModal();
    loadHabits();
  }

  const closeCreateModal = () => {
    setIsClosingModal(true);
    setTimeout(() => {
      setShowCreateModal(false);
      setIsClosingModal(false);
    }, 200);
  };

  const closeEditModal = () => {
    setIsClosingModal(true);
    setTimeout(() => {
      setEditingHabit(null);
      setIsClosingModal(false);
    }, 200);
  };

  // Get user name from localStorage
  const user = JSON.parse(localStorage.getItem('user'));
  const userName = user?.name || user?.username || "there";

  // Calculate today's habits
  const totalHabits = habits.length;
  const completedHabits = habits.filter(h => h.completedToday).length;
  const remainingHabits = totalHabits - completedHabits;

  // Animate completed count
  useEffect(() => {
    if (completedHabits !== prevCompletedRef.current) {
      const duration = 400;
      const startTime = Date.now();
      const startValue = prevCompletedRef.current;
      const endValue = completedHabits;
      
      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        const currentValue = Math.round(startValue + (endValue - startValue) * eased);
        
        setAnimatedCompleted(currentValue);
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          prevCompletedRef.current = endValue;
        }
      };
      
      requestAnimationFrame(animate);
    }
  }, [completedHabits]);

  // Calculate weekly streak summary
  const weeklyStreakTotal = habits.reduce((sum, h) => sum + (h.streak || 0), 0);

  // Get time-based greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  // Calculate progress percentage
  const progressPercentage = totalHabits > 0 ? (completedHabits / totalHabits) * 100 : 0;

  return (
    <div className="min-h-screen bg-dark-bg py-8 px-4 sm:px-6 lg:px-8 pb-24">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* TOP SECTION — TODAY */}
        <div className="space-y-4 animate-slideUp" style={{ animationDelay: '0ms', animationFillMode: 'both' }}>
          <h1 className="text-4xl font-bold text-text-primary">
            {getGreeting()}, {userName} 👋
          </h1>
          <div className="space-y-2">
            <p className="text-lg text-text-muted">
              {remainingHabits === 0 && totalHabits > 0 
                ? "All done for today 🎉"
                : remainingHabits === 1 
                  ? "1 habit left today"
                  : `${remainingHabits} habits left today`}
            </p>
            
            {/* Progress Bar */}
            {totalHabits > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-text-muted">Today's Progress</span>
                  <span className="font-semibold text-text-primary">
                    <span className="inline-block animate-numberChange">
                      {animatedCompleted}
                    </span>
                    {' / '}
                    {totalHabits}
                  </span>
                </div>
                <div className="w-full h-2 bg-dark-border rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-accent-primary to-accent-cyan transition-all duration-500 ease-out"
                    style={{
                      width: `${progressPercentage}%`,
                      transition: 'width 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* MAIN CONTENT GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* HABIT CARDS — CENTER STAGE */}
          <div className="lg:col-span-2">
            {habits.length > 0 ? (
              <div className="grid gap-6 grid-cols-1 sm:grid-cols-2">
                {habits.map((h, index) => (
                  <div
                    key={h._id}
                    className="animate-slideUp"
                    style={{
                      animationDelay: `${100 + index * 50}ms`,
                      animationFillMode: 'both',
                    }}
                  >
                    <HabitCard
                      habit={h}
                      onUpdated={loadHabits}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-6">
                {/* Empty State Header */}
                <div className="text-center space-y-2">
                  <h2 className="text-2xl font-bold text-text-primary">
                    Here's how your habits will look once you start
                  </h2>
                  <p className="text-text-muted">
                    Start with one small habit. Consistency beats intensity.
                  </p>
                </div>

                {/* Demo Habit Cards */}
                <div className="grid gap-6 grid-cols-1 sm:grid-cols-2">
                  <div className="animate-slideUp" style={{ animationDelay: '0ms', animationFillMode: 'both' }}>
                    <HabitCard
                      habit={{
                        _id: 'demo-1',
                        name: 'Drink Water',
                        category: 'Health',
                        completedToday: false,
                        streak: 0
                      }}
                      demo={true}
                      demoProgress={40}
                    />
                  </div>
                  <div className="animate-slideUp" style={{ animationDelay: '50ms', animationFillMode: 'both' }}>
                    <HabitCard
                      habit={{
                        _id: 'demo-2',
                        name: 'Read 10 pages',
                        category: 'Learning',
                        completedToday: false,
                        streak: 0
                      }}
                      demo={true}
                      demoProgress={70}
                    />
                  </div>
                  <div className="animate-slideUp sm:col-span-2" style={{ animationDelay: '100ms', animationFillMode: 'both' }}>
                    <HabitCard
                      habit={{
                        _id: 'demo-3',
                        name: 'Morning Walk',
                        category: 'Fitness',
                        completedToday: false,
                        streak: 0
                      }}
                      demo={true}
                      demoProgress={55}
                    />
                  </div>
                </div>

                {/* CTA Button */}
                <div className="text-center pt-4">
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="btn-primary"
                  >
                    Start with one small habit
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* SIDEBAR */}
          <div className="space-y-6">
            {/* Weekly Streak Summary */}
            <div className="card transition-all duration-250 ease-out hover:border-accent-primary/40 hover:shadow-glow/50 animate-slideUp" style={{ animationDelay: '150ms', animationFillMode: 'both' }}>
              <h3 className="text-lg font-semibold mb-4 text-text-primary flex items-center gap-2">
                <Flame className="text-accent-primary" size={20} />
                Weekly Streak Summary
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-text-secondary">Total Streak Days</span>
                  <span className="font-bold text-text-primary">{weeklyStreakTotal}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-text-secondary">Active Streaks</span>
                  <span className="font-bold text-text-primary">
                    {habits.filter(h => h.streak && h.streak > 0).length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-text-secondary">Completed Today</span>
                  <span className="font-bold text-text-primary">
                    <span className="inline-block animate-numberChange">
                      {animatedCompleted}
                    </span>
                    {' / '}
                    {totalHabits}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FLOATING ADD HABIT BUTTON */}
      <button
        onClick={() => setShowCreateModal(true)}
        className="fixed bottom-8 right-8 w-16 h-16 rounded-full bg-gradient-to-r from-accent-primary via-accent-secondary to-accent-cyan text-white flex items-center justify-center z-50 transition-all duration-250 ease-out hover:scale-110 hover:shadow-xl hover:shadow-accent-primary/60 active:scale-95 animate-pulse-soft"
        aria-label="Add Habit"
      >
        <Plus size={28} />
      </button>

      {/* CREATE HABIT MODAL */}
      {showCreateModal && (
        <div 
          className={`fixed inset-0 z-50 p-4 flex items-center justify-center ${
            isClosingModal ? 'animate-fadeScaleOut' : 'animate-fadeScaleIn'
          }`}
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
          }}
          onClick={closeCreateModal}
        >
          <div
            className="card max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
            style={{
              animation: isClosingModal ? 'fadeScaleOut 0.2s ease-in' : 'fadeScaleIn 0.3s ease-out',
            }}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-text-primary">Create New Habit</h2>
              <button
                onClick={closeCreateModal}
                className="text-text-muted hover:text-text-primary transition-colors"
                aria-label="Close"
              >
                <X size={24} />
              </button>
            </div>
            <HabitForm 
              onSubmit={handleCreate} 
              onCancel={closeCreateModal}
            />
          </div>
        </div>
      )}

      {/* EDIT HABIT MODAL */}
      {editingHabit && (
        <div 
          className={`fixed inset-0 z-50 p-4 flex items-center justify-center ${
            isClosingModal ? 'animate-fadeScaleOut' : 'animate-fadeScaleIn'
          }`}
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
          }}
          onClick={closeEditModal}
        >
          <div
            className="card max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
            style={{
              animation: isClosingModal ? 'fadeScaleOut 0.2s ease-in' : 'fadeScaleIn 0.3s ease-out',
            }}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-text-primary">Edit Habit</h2>
              <button
                onClick={closeEditModal}
                className="text-text-muted hover:text-text-primary transition-colors"
                aria-label="Close"
              >
                <X size={24} />
              </button>
            </div>
            <HabitForm
              initialData={editingHabit}
              onSubmit={handleUpdate}
              onCancel={closeEditModal}
            />
          </div>
        </div>
      )}
    </div>
  );
}
