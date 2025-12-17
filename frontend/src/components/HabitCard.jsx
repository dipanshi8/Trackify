import { useState, useEffect, useRef } from "react";
import { CheckCircle2, Flame, Eye } from "lucide-react";
import { checkinHabit } from "../services/api";

function HabitCard({ habit, onUpdated, demo = false, demoProgress = 0 }) {
  const [loading, setLoading] = useState(false);
  const [justCompleted, setJustCompleted] = useState(false);
  const [showGlow, setShowGlow] = useState(false);
  const [showMessage, setShowMessage] = useState(false);
  const [animatedProgress, setAnimatedProgress] = useState(demo ? demoProgress : 0);
  const progressCircleRef = useRef(null);
  const wasCompletedRef = useRef(habit.completedToday);

  const handleMarkDone = async () => {
    if (demo) return; // Disable interactions in demo mode
    
    try {
      setLoading(true);
      await checkinHabit(habit._id);
      
      // Trigger completion animation sequence
      setJustCompleted(true);
      setShowGlow(true);
      setShowMessage(true);
      
      // Reset animations after completion
      setTimeout(() => setShowGlow(false), 800);
      setTimeout(() => setShowMessage(false), 2500); // Message stays longer
      setTimeout(() => setJustCompleted(false), 900);
      
      if (onUpdated) onUpdated();
    } catch (err) {
      console.error("Error checking in:", err);
    } finally {
      setLoading(false);
    }
  };

  const completed = demo ? false : habit.completedToday;
  const streak = habit.streak || 0;
  const hasStreakBadge = streak > 3;

  // Calculate progress
  const progress = demo ? demoProgress : (completed ? 100 : 0);
  const circumference = 2 * Math.PI * 28;
  const offset = circumference - (animatedProgress / 100) * circumference;

  // Animate progress ring on mount and when completed changes
  useEffect(() => {
    if (demo) {
      // Demo mode: animate from 0 to target progress
      const duration = 600;
      const startTime = Date.now();
      
      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progressRatio = Math.min(elapsed / duration, 1);
        // Ease out cubic for smooth motion
        const eased = 1 - Math.pow(1 - progressRatio, 3);
        const newProgress = demoProgress * eased;
        
        setAnimatedProgress(newProgress);
        
        if (progressRatio < 1) {
          requestAnimationFrame(animate);
        }
      };
      
      requestAnimationFrame(animate);
      return;
    }
    
    if (completed && !wasCompletedRef.current) {
      // Just completed - animate to 100% with smooth easing
      const duration = 750; // Longer, smoother animation
      const startTime = Date.now();
      const startProgress = animatedProgress;
      
      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progressRatio = Math.min(elapsed / duration, 1);
        // Custom ease-out curve for premium feel
        const eased = 1 - Math.pow(1 - progressRatio, 2.5);
        const newProgress = startProgress + (100 - startProgress) * eased;
        
        setAnimatedProgress(newProgress);
        
        if (progressRatio < 1) {
          requestAnimationFrame(animate);
        }
      };
      
      requestAnimationFrame(animate);
      wasCompletedRef.current = true;
    } else if (!completed) {
      wasCompletedRef.current = false;
      setAnimatedProgress(0);
    }
  }, [completed, demo, demoProgress]);

  // Initial mount animation (for real cards only)
  useEffect(() => {
    if (demo) return; // Demo cards handled in previous effect
    
    if (progress > 0 && animatedProgress === 0) {
      const duration = 400;
      const startTime = Date.now();
      
      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progressRatio = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progressRatio, 3);
        const newProgress = progress * eased;
        
        setAnimatedProgress(newProgress);
        
        if (progressRatio < 1) {
          requestAnimationFrame(animate);
        }
      };
      
      requestAnimationFrame(animate);
    } else if (progress === 0) {
      setAnimatedProgress(0);
    }
  }, []);

  return (
    <div
      className={`card relative ${
        completed
          ? "border-green-500/30"
          : demo
          ? "border-dashed border-2 border-accent-primary/30 bg-dark-card/80 backdrop-blur-sm"
          : "border-dark-border"
      } ${
        demo 
          ? "cursor-not-allowed hover:border-accent-primary/50 hover:shadow-glow/30" 
          : "hover:-translate-y-2 hover:shadow-glow active:scale-[0.98]"
      } ${showGlow ? "animate-glow-burst" : ""}`}
      style={{
        background: completed 
          ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(6, 182, 212, 0.1) 100%)'
          : demo
          ? undefined
          : undefined,
        transition: demo 
          ? 'border-color 0.25s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.25s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.25s ease-out'
          : 'transform 0.25s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.8s cubic-bezier(0.4, 0, 0.2, 1), background 0.8s cubic-bezier(0.4, 0, 0.2, 1), border-color 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
        opacity: demo ? 0.75 : 1,
      }}
    >
      {/* Preview Badge */}
      {demo && (
        <div className="absolute top-3 right-3 z-10">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-accent-primary/20 border border-accent-primary/40 backdrop-blur-sm">
            <Eye size={12} className="text-accent-primary" />
            <span className="text-xs font-semibold text-accent-primary">Preview</span>
          </div>
        </div>
      )}

      <div className="flex items-start justify-between mb-4">
        {/* LEFT SECTION */}
        <div className="flex-1 min-w-0">
          <h3 className={`text-lg font-semibold mb-2 ${demo ? "text-text-primary/80" : "text-text-primary"}`}>
            {habit.name}
          </h3>
          {habit.category && (
            <span className={`inline-block px-3 py-1 text-xs font-semibold rounded-full border ${
              demo 
                ? "bg-accent-primary/10 text-accent-primary/70 border-accent-primary/20" 
                : "bg-accent-primary/20 text-accent-primary border-accent-primary/30"
            }`}>
              {habit.category}
            </span>
          )}
        </div>

        {/* RIGHT SECTION — Circular Progress */}
        <div className="flex-shrink-0 ml-4">
          <div className="relative w-16 h-16">
            <svg className="transform -rotate-90 w-16 h-16" ref={progressCircleRef}>
              {/* Background circle */}
              <circle
                cx="32"
                cy="32"
                r="28"
                stroke="#1f2937"
                strokeWidth="4"
                fill="none"
              />
              {/* Progress circle */}
              <circle
                cx="32"
                cy="32"
                r="28"
                stroke={completed ? "#10b981" : "#6366f1"}
                strokeWidth="4"
                fill="none"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                strokeLinecap="round"
                style={{
                  transition: 'stroke-dashoffset 0.75s cubic-bezier(0.4, 0, 0.2, 1), stroke 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span 
                className={`text-sm font-bold ${demo ? "text-text-primary/70" : "text-text-primary"}`}
                style={{
                  transition: 'transform 0.2s ease',
                }}
              >
                {Math.round(animatedProgress)}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* STREAK BADGE */}
      {hasStreakBadge && (
        <div 
          className="mb-4 flex items-center gap-2 animate-fadeIn"
          style={{
            animation: 'fadeIn 0.4s ease-out',
          }}
        >
          <Flame className="text-accent-primary" size={16} />
          <span className="text-sm font-medium text-accent-primary">
            {streak} day streak
          </span>
        </div>
      )}

      {/* BOTTOM SECTION — Primary CTA */}
      <button
        onClick={handleMarkDone}
        disabled={loading || completed || demo}
        className={`w-full py-3 px-4 rounded-lg font-semibold relative overflow-hidden ${
          completed
            ? "bg-green-500/20 text-green-400 border border-green-500/30 cursor-not-allowed flex items-center justify-center"
            : demo
            ? "bg-dark-hover/60 text-text-muted border border-dashed border-dark-border cursor-not-allowed"
            : "text-white hover:shadow-lg hover:shadow-accent-primary/50 focus:ring-2 focus:ring-accent-primary focus:ring-offset-2 focus:ring-offset-dark-card"
        } transition-all duration-300 ${loading ? "opacity-70 cursor-wait" : ""} ${
          justCompleted ? "animate-pop" : ""
        }`}
        style={!completed && !loading && !demo ? {
          background: 'linear-gradient(90deg, #6366f1 0%, #8b5cf6 50%, #06b6d4 100%)',
          backgroundSize: '200% 100%',
          backgroundPosition: '0% 50%',
        } : {}}
        onMouseEnter={(e) => {
          if (!completed && !loading && !demo) {
            e.currentTarget.style.backgroundPosition = '100% 50%';
          }
        }}
        onMouseLeave={(e) => {
          if (!completed && !loading && !demo) {
            e.currentTarget.style.backgroundPosition = '0% 50%';
          }
        }}
      >
        {loading ? (
          <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
        ) : completed ? (
          <div className="flex flex-col items-center gap-2">
            <CheckCircle2 
              size={28} 
              className={justCompleted ? "animate-spring-in" : ""}
              style={{
                color: '#10b981',
              }}
            />
            {showMessage && (
              <p 
                className="text-xs font-medium text-green-400"
                style={{ 
                  animation: 'fadeIn 0.4s ease-out 0.3s both',
                  opacity: showMessage ? 1 : 0,
                  transition: 'opacity 0.3s ease-out',
                }}
              >
                Nice work. Streaks are built like this 🔥
              </p>
            )}
          </div>
        ) : (
          "Mark as Done"
        )}
      </button>
    </div>
  );
}

export default HabitCard;
