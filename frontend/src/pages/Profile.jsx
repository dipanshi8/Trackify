// frontend/src/pages/Profile.jsx
import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useParams } from "react-router-dom";
import {
  getUserById,
  getUserHabits,
  getUserCheckins,
} from "../services/api";
import { useHabitData } from "../hooks/useHabitData";
import { LogOut, Calendar, Users, User, Target, CheckCircle2 } from "lucide-react";
import CalendarHeatmap from "react-calendar-heatmap";
import { format, subDays, subMonths, isSameDay, startOfWeek, endOfWeek, eachDayOfInterval, startOfDay, endOfDay } from "date-fns";
import ProfileSkeleton from "../components/ProfileSkeleton";
import "react-calendar-heatmap/dist/styles.css";

export default function Profile() {
  const { id } = useParams(); // userId from URL
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const currentUser = JSON.parse(localStorage.getItem("user"));
  const isOwnProfile = currentUser && (currentUser._id === id || currentUser.id === id);
  
  // Use global state for own profile, local state for others
  const globalHabitData = useHabitData();
  const [localHabits, setLocalHabits] = useState([]);
  const [localCheckins, setLocalCheckins] = useState([]);
  
  // Use global state if viewing own profile, otherwise use local state
  const habits = isOwnProfile ? globalHabitData.habits : localHabits;
  const checkins = isOwnProfile ? globalHabitData.checkins : localCheckins;
  const formatDate = isOwnProfile ? globalHabitData.formatDate : null;

  // Helper function to format date to YYYY-MM-DD (for non-own profiles)
  const localFormatDate = useCallback((date) => {
    if (!date) return null;
    
    // If it's already a string in YYYY-MM-DD format
    if (typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return date;
    }
    
    // If it's a string (ISO format), extract the date part
    if (typeof date === 'string') {
      const datePart = date.split('T')[0];
      if (/^\d{4}-\d{2}-\d{2}$/.test(datePart)) {
        return datePart;
      }
      // Try to parse it
      const parsed = new Date(date);
      if (!isNaN(parsed.getTime())) {
        return format(startOfDay(parsed), "yyyy-MM-dd");
      }
      return null;
    }
    
    // If it's a Date object
    if (date instanceof Date) {
      if (isNaN(date.getTime())) return null;
      return format(startOfDay(date), "yyyy-MM-dd");
    }
    
    return null;
  }, []);

  // Refresh checkins function - normalizes dates on fetch (for non-own profiles)
  const refreshCheckins = useCallback(async () => {
    if (isOwnProfile) {
      // For own profile, reload from global state
      await globalHabitData.loadCheckins(id);
      return;
    }
    
    try {
      const checkinData = await getUserCheckins(id);
      
      // Debug: Log raw data
      console.log("🔍 [Profile] Raw Checkins Data:", checkinData);
      
      // Normalize all checkins - ensure every entry has a normalized date
      const normalizedCheckins = checkinData.map((checkin) => {
        const normalizedDate = localFormatDate(checkin.date || checkin.timestamp);
        return {
          ...checkin,
          date: normalizedDate, // Always use normalized date
          timestamp: checkin.timestamp, // Keep original timestamp for reference
        };
      }).filter((checkin) => checkin.date !== null); // Remove invalid entries
      
      // Debug: Log formatted data
      console.log("✅ [Profile] Formatted Checkins Data:", normalizedCheckins);
      console.log("📊 [Profile] Total checkins:", normalizedCheckins.length);
      
      setLocalCheckins(normalizedCheckins);
    } catch (checkinErr) {
      console.warn("Could not load checkins:", checkinErr);
      setLocalCheckins([]);
    }
  }, [id, isOwnProfile, localFormatDate, globalHabitData]);

  useEffect(() => {
    loadProfile();
    // eslint-disable-next-line
  }, [id]);

  // The 'Invisible State' Fix: Fresh Fetch every time Profile is viewed
  // This ensures completionLogs are fetched inside a useEffect that triggers every time the page is viewed
  useEffect(() => {
    // Perform a 'Fresh Fetch' of the logs specifically for the current week
    const freshFetch = async () => {
      if (isOwnProfile) {
        // Refresh global state - force fresh fetch
        console.log("🔄 [Profile] Fresh Fetch - Loading checkins for own profile");
        await globalHabitData.loadCheckins(id).catch(console.error);
        await globalHabitData.loadHabits().catch(console.error);
      } else {
        // Refresh local data - force fresh fetch
        console.log("🔄 [Profile] Fresh Fetch - Loading checkins for other profile");
        await refreshCheckins().catch(console.error);
      }
    };

    // Fresh fetch on mount
    freshFetch();

    // Fresh fetch when window regains focus (user comes back from Dashboard)
    const handleFocus = () => {
      console.log("🔄 [Profile] Window focused - Fresh Fetch triggered");
      freshFetch();
    };

    window.addEventListener('focus', handleFocus);

    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, [id, isOwnProfile, globalHabitData, refreshCheckins]);

  // Set-State Dependency: Ensure Heatmap and Weekly rings use the fetched logs as their primary data source
  // If the logs are empty on load, they must re-render the moment the logs arrive from the database
  useEffect(() => {
    // This effect forces re-render when checkins change
    if (isOwnProfile) {
      console.log("🔄 [Profile] Global Logs Updated - Profile will recalculate");
      console.log("✅ [Profile Sync Data] completionLogs:", globalHabitData.checkins);
      console.log("✅ [Profile Sync Data] Total checkins:", globalHabitData.checkins.length);
      
      // Debugging the Date Key: Log search date and available log dates
      const todayDateStr = new Date().toLocaleDateString('en-CA');
      const availableLogDates = globalHabitData.checkins.map(l => l.date).filter(Boolean);
      console.log('🔍 [Profile] Search Date:', todayDateStr);
      console.log('🔍 [Profile] Available Log Dates:', availableLogDates);
      console.log('🔍 [Profile] Date Match Check:', availableLogDates.includes(todayDateStr));
    } else {
      console.log("✅ [Profile Sync Data] completionLogs:", checkins);
      console.log("✅ [Profile Sync Data] Total checkins:", checkins.length);
      
      // Debugging the Date Key: Log search date and available log dates
      const todayDateStr = new Date().toLocaleDateString('en-CA');
      const availableLogDates = checkins.map(l => l.date).filter(Boolean);
      console.log('🔍 [Profile] Search Date:', todayDateStr);
      console.log('🔍 [Profile] Available Log Dates:', availableLogDates);
      console.log('🔍 [Profile] Date Match Check:', availableLogDates.includes(todayDateStr));
    }
    
    // Force re-render by updating a state that triggers recalculation
    // The useMemo hooks will automatically recalculate when checkins change
  }, [isOwnProfile, globalHabitData.checkins, checkins]);

  async function loadProfile() {
    try {
      setError(null);
      setLoading(true);
      
      // Always set loading to true initially to prevent flicker
      // This ensures skeleton shows while we fetch user data

      // Fetch user data first - this is critical to prevent "User Not Found" flicker
      const userData = await getUserById(id);
      
      // Only set user after we have data - prevents flicker
      if (userData) {
        setUser(userData);
      } else {
        // Explicitly set to null only after fetch completes
        setUser(null);
      }

      if (isOwnProfile) {
        // For own profile, use global state
        // Refresh in background but don't block
        await Promise.all([
          globalHabitData.loadHabits().catch(console.error),
          globalHabitData.loadCheckins(id).catch(console.error),
        ]);
      } else {
        // For other profiles, load locally
        const habitData = await getUserHabits(id);
        setLocalHabits(habitData);
        await refreshCheckins();
      }
    } catch (err) {
      console.error("Error loading profile:", err);
      // Only set error if it's a real error, not just missing user
      if (err.response?.status === 404) {
        setUser(null); // Explicitly set to null for 404
      } else {
        setError("Could not load profile. Please try again.");
      }
    } finally {
      // Only set loading to false after everything is complete
      setLoading(false);
    }
  }

  // Transform checkins into heatmap format - values array: [{ date: '2025-12-18', count: 5 }]
  // Use checkins (completionLogs) as dependency to force re-calculation
  // CRITICAL: Count is the total number of UNIQUE habits completed on that day, not just checkins
  const heatmapData = useMemo(() => {
    if (!checkins || checkins.length === 0) {
      console.log("📊 [Heatmap] No checkins data available");
      return [];
    }

    // Group checkins by date (YYYY-MM-DD) - use local time for consistency
    // This matches the format used in markHabitDone (toLocaleDateString('en-CA'))
    // Local time ensures 11 PM Thursday shows as Thursday, not Friday
    const dateHabitMap = {}; // Map of date -> Set of unique habitIds
    
    checkins.forEach((checkin) => {
      // Data Object Structure Check: Ensure date is a string, not a timestamp object
      // The checkin object should look like { date: '2025-12-18', habitId: '...' }
      let dateStr;
      
      if (checkin.date) {
        // If date is already a string in YYYY-MM-DD format, use it directly
        if (typeof checkin.date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(checkin.date)) {
          dateStr = checkin.date;
        } else if (typeof checkin.date === 'string') {
          // Try to parse if it's a string but not in YYYY-MM-DD format
          const date = new Date(checkin.date);
          if (!isNaN(date.getTime())) {
            dateStr = date.toLocaleDateString('en-CA');
          } else {
            console.warn("⚠️ [Heatmap] Invalid date string:", checkin.date);
            return; // Skip invalid checkins
          }
        } else {
          // If date is not a string (e.g., Date object or timestamp), convert it
          console.warn("⚠️ [Heatmap] Date is not a string, converting:", checkin.date, typeof checkin.date);
          const date = new Date(checkin.date);
          if (!isNaN(date.getTime())) {
            dateStr = date.toLocaleDateString('en-CA');
          } else {
            return; // Skip invalid checkins
          }
        }
      } else if (checkin.timestamp) {
        // Fallback to timestamp if date doesn't exist
        const date = new Date(checkin.timestamp);
        dateStr = date.toLocaleDateString('en-CA');
      } else {
        console.warn("⚠️ [Heatmap] Checkin missing both date and timestamp:", checkin);
        return; // Skip invalid checkins
      }
      
      // Initialize Set for this date if it doesn't exist
      if (!dateHabitMap[dateStr]) {
        dateHabitMap[dateStr] = new Set();
      }
      
      // Add unique habitId to the Set for this date
      // This ensures we count unique habits, not duplicate checkins
      // Data Object Structure Check: Ensure habitId exists
      const habitId = checkin.habitId || checkin.habit?._id;
      if (habitId) {
        dateHabitMap[dateStr].add(habitId.toString());
      } else {
        console.warn("⚠️ [Heatmap] Checkin missing habitId:", checkin);
      }
    });

    // Transform to array format: [{ date: '2025-12-18', count: 5 }]
    // Count is the number of unique habits completed on that day
    const heatmapValues = Object.entries(dateHabitMap).map(([date, habitSet]) => ({
      date,
      count: habitSet.size, // Count of unique habits, not checkins
    }));

    // Debug: Log heatmap data
    console.log("🔥 [Heatmap] Formatted values:", heatmapValues);
    console.log("🔥 [Heatmap] Total unique dates:", heatmapValues.length);
    // Debug: Show today's count
    const todayStr = new Date().toLocaleDateString('en-CA');
    const todayData = heatmapValues.find(v => v.date === todayStr);
    if (todayData) {
      console.log("🔥 [Heatmap] Today's count:", todayData.count, "habits completed");
    }

    return heatmapValues;
  }, [checkins]); // checkins is the dependency that forces re-calculation

  // Get today's day of week (0 = Sunday, 1 = Monday, etc.)
  const getTodayIndex = () => {
    const today = new Date().getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    // Convert to Monday = 0, Tuesday = 1, ..., Sunday = 6
    return today === 0 ? 6 : today - 1;
  };

  const todayIndex = getTodayIndex();
  const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  // Weekly activity - calculate from checkins for last 7 days
  // Use checkins (completionLogs) as dependency to force re-calculation
  // CRITICAL: Calculate 'Today' using new Date().toLocaleDateString('en-CA')
  const weeklyActivity = useMemo(() => {
    const now = new Date();
    // Get last 7 days (including today)
    const weekDays = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(now);
      date.setDate(date.getDate() - (6 - i)); // Last 7 days: 6 days ago to today
      return startOfDay(date);
    });

    // Get total habits count (active habits)
    const totalHabits = habits.length;
    
    // CRITICAL: Get today's date using new Date().toLocaleDateString('en-CA')
    const todayDateStr = new Date().toLocaleDateString('en-CA');

    // Debugging the Date Key: Log search date and available log dates
    const availableLogDates = checkins.map(l => l.date).filter(Boolean);
    console.log('🔍 [Profile] Search Date:', todayDateStr);
    console.log('🔍 [Profile] Available Log Dates:', availableLogDates);
    console.log('🔍 [Profile] Date Match Check:', availableLogDates.includes(todayDateStr));
    console.log('🔍 [Profile] Total Checkins:', checkins.length);
    console.log('🔍 [Profile] Checkins Sample:', checkins.slice(0, 3));

    // Debug: Log week range
    console.log("📅 [Weekly Activity] Week range:", {
      start: weekDays[0].toLocaleDateString('en-CA'),
      end: weekDays[6].toLocaleDateString('en-CA'),
      today: todayDateStr,
      totalHabits,
      totalCheckins: checkins.length,
    });

    const activity = weekDays.map((day, i) => {
      // Format current day to YYYY-MM-DD using toLocaleDateString('en-CA')
      // This matches the format used in markHabitDone (local time)
      const currentDay = day.toLocaleDateString('en-CA');
      
      // Fix the Comparison Logic: Force both sides to be identical strings
      // Use String().split('T')[0] to handle Date objects, timestamps, and ISO strings
      const currentDayNormalized = String(currentDay).split('T')[0];
      
      // Count Unique Completions: Filter logs for this day and count unique habits
      // Use Set to track unique habitIds for this day
      const uniqueHabits = new Set();
      
      checkins.forEach((log) => {
        // Fix the Comparison Logic: Force both sides to be identical strings
        // This handles Date objects, timestamps, and ISO strings
        let logDateNormalized;
        
        if (log.date) {
          // Normalize the date to YYYY-MM-DD format using String().split('T')[0]
          logDateNormalized = String(log.date).split('T')[0];
        } else if (log.timestamp) {
          // Fallback to timestamp if date doesn't exist
          const logDate = new Date(log.timestamp);
          logDateNormalized = String(logDate.toLocaleDateString('en-CA')).split('T')[0];
        } else {
          return; // Skip invalid logs
        }
        
        // Fix the Comparison Logic: Compare normalized strings
        // This ensures Date Object vs String comparisons work correctly
        const isCompleted = logDateNormalized === currentDayNormalized;
        
        if (isCompleted) {
          // Data Object Structure Check: Ensure habitId exists
          const habitId = log.habitId || log.habit?._id;
          if (habitId) {
            uniqueHabits.add(String(habitId)); // Ensure habitId is a string
            console.log(`✅ [Weekly Activity] Found match for ${currentDayNormalized}: habitId=${habitId}`);
          } else {
            console.warn("⚠️ [Weekly Activity] Log missing habitId:", log);
          }
        }
      });

      // Count Unique Completions: Calculate the percentage
      const completedToday = uniqueHabits.size; // Count of unique habits completed
      const percentage = totalHabits > 0 
        ? Math.min((completedToday / totalHabits) * 100, 100) 
        : 0;
      
      const dayCheckins = completedToday;
      const isActive = dayCheckins > 0;
      const isComplete = totalHabits > 0 && dayCheckins >= totalHabits;
      const isPartial = dayCheckins > 0 && dayCheckins < totalHabits;

      // Get day name
      const dayIndex = day.getDay();
      const dayName = dayNames[dayIndex === 0 ? 6 : dayIndex - 1]; // Convert Sunday=0 to Sunday=6

      // Check if this is today using the same date string comparison
      const isToday = currentDay === todayDateStr;

      return {
        day: dayName,
        date: day,
        count: dayCheckins,
        totalHabits,
        completionRate: Math.round(percentage), // Use percentage variable
        isComplete,
        isPartial,
        isActive,
        isToday,
      };
    });

    // Debug: Log weekly activity
    console.log("📅 [Weekly Activity] Activity data:", activity);
    // Debug: Check today's completion
    const todayActivity = activity.find(a => a.isToday);
    if (todayActivity) {
      console.log("📅 [Weekly Activity] Today's completion:", {
        date: todayDateStr,
        count: todayActivity.count,
        total: todayActivity.totalHabits,
        rate: todayActivity.completionRate,
        isComplete: todayActivity.isComplete,
      });
      
      // Additional debug: Show why it's 0% if it is
      if (todayActivity.count === 0 && checkins.length > 0) {
        console.warn("⚠️ [Weekly Activity] Today shows 0% but checkins exist!");
        console.warn("⚠️ [Weekly Activity] Today date:", todayDateStr);
        const todayCheckins = checkins.filter(c => {
          const cDate = c.date || (c.timestamp ? new Date(c.timestamp).toLocaleDateString('en-CA') : null);
          return cDate === todayDateStr;
        });
        console.warn("⚠️ [Weekly Activity] Checkins for today:", todayCheckins);
        console.warn("⚠️ [Weekly Activity] Today checkins with habitId:", todayCheckins.map(c => ({
          date: c.date,
          habitId: c.habitId,
          hasHabitId: !!c.habitId
        })));
      }
    } else {
      console.warn("⚠️ [Weekly Activity] Today's activity not found in week days!");
    }

    return activity;
  }, [checkins, habits, dayNames]); // checkins is the dependency that forces re-calculation

  // Habit categories - dynamic calculation with case-insensitive matching
  const categories = useMemo(() => {
    const categoryNames = ["Health", "Fitness", "Productivity", "Learning"];
    
    return categoryNames.map(categoryName => {
      // Case-insensitive comparison: normalize both to lowercase
      const count = habits.filter(h => {
        const habitCategory = h.category?.trim() || "";
        return habitCategory.toLowerCase() === categoryName.toLowerCase();
      }).length;
      
      return {
        name: categoryName,
        count
      };
    });
  }, [habits]);

  // Determine if we're still loading (check both local loading and global loading state)
  const isLoading = loading || (isOwnProfile && globalHabitData.loading);
  
  // Show skeleton while loading - don't render content or "User Not Found" until loading is complete
  if (isLoading) {
    return <ProfileSkeleton />;
  }
  
  // Show error if there's an error
  if (error) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <p className="text-red-400">{error}</p>
      </div>
    );
  }
  
  // Only show "User Not Found" if loading is complete AND user is explicitly null
  // Don't show it if user is undefined (still loading) or if we have user data
  if (!user && !isLoading) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <p className="text-text-muted">User not found</p>
      </div>
    );
  }
  
  // If we don't have user yet but loading is false, show skeleton as fallback
  if (!user) {
    return <ProfileSkeleton />;
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
                    <p className="text-2xl font-bold text-text-primary">
                      {habits.length}
                    </p>
                    <p className="text-sm text-text-muted">Active Habits</p>
                  </div>
                  <div className="text-center sm:text-left">
                    <p className="text-2xl font-bold text-accent-cyan">
                      {habits.reduce((acc, h) => {
                        // Ensure we're getting streak from global state correctly
                        const streak = h.streak || 0;
                        return acc + streak;
                      }, 0)}
                    </p>
                    <p className="text-sm text-text-muted">Total Streak Days</p>
                  </div>
                  <div className="text-center sm:text-left">
                    <p className="text-2xl font-bold text-accent-primary">
                      {habits.length > 0
                        ? Math.round(
                            habits.reduce((acc, h) => {
                              // Calculate average completion rate
                              const rate = h.completionRate || 0;
                              return acc + rate;
                            }, 0) / habits.length
                          )
                        : 0}%
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

        {/* Activity Heatmap */}
        <div className="card animate-slideUp" style={{ animationDelay: '200ms', animationFillMode: 'both' }}>
          <h2 className="text-xl font-semibold flex items-center gap-2 mb-6 text-text-primary">
            <Calendar size={20} className="text-accent-primary" />
            Activity Heatmap
          </h2>
          <div className="flex justify-center">
            <div className="w-full max-w-[800px] overflow-x-auto pb-4">
              <CalendarHeatmap
                key={`heatmap-${checkins.length}-${heatmapData.length}`}
                startDate={subMonths(new Date(), 6)}
                endDate={new Date()}
                values={heatmapData}
                squareSize={12}
                gutterSize={2}
                classForValue={(value) => {
                  if (!value || value.count === 0) {
                    return "color-empty";
                  }
                  if (value.count === 1) {
                    return "color-scale-1";
                  }
                  if (value.count === 2) {
                    return "color-scale-2";
                  }
                  if (value.count === 3) {
                    return "color-scale-3";
                  }
                  // For 4+ habits, use the highest intensity (color-scale-4)
                  return "color-scale-4";
                }}
                tooltipDataAttrs={(value) => {
                  if (!value || !value.date) {
                    return { "data-tooltip": "No activity" };
                  }
                  return {
                    "data-tooltip": `${value.date}: ${value.count} ${value.count === 1 ? "habit" : "habits"} completed`,
                  };
                }}
              />
            </div>
          </div>
          <div className="flex items-center justify-between mt-4 text-xs text-text-muted">
            <span>Less</span>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded" style={{ backgroundColor: '#1a1a2e' }}></div>
              <div className="w-3 h-3 rounded" style={{ backgroundColor: '#6366f1', opacity: 0.4 }}></div>
              <div className="w-3 h-3 rounded" style={{ backgroundColor: '#8b5cf6', opacity: 0.6 }}></div>
              <div className="w-3 h-3 rounded" style={{ backgroundColor: '#a855f7', opacity: 0.8 }}></div>
              <div className="w-3 h-3 rounded" style={{ backgroundColor: '#c084fc' }}></div>
            </div>
            <span>More</span>
          </div>
        </div>

        {/* Weekly Activity */}
        <div className="card animate-slideUp" style={{ animationDelay: '250ms', animationFillMode: 'both' }}>
          <h2 className="text-xl font-semibold flex items-center gap-2 mb-6 text-text-primary">
            <Calendar size={20} className="text-accent-primary" />
            This Week's Activity
          </h2>
          <div className="grid grid-cols-7 gap-4">
            {weeklyActivity.map((day) => {
              const isToday = day.isToday;
              const circumference = 2 * Math.PI * 20; // radius = 20
              const offset = circumference - (day.completionRate / 100) * circumference;
              const radius = 20;

              return (
                <div
                  key={`${day.day}-${format(day.date, 'yyyy-MM-dd')}`}
                  className={`flex flex-col items-center gap-3 relative group ${
                    isToday 
                      ? "ring-2 ring-accent-primary rounded-xl p-2 bg-accent-primary/10 shadow-glow" 
                      : ""
                  }`}
                >
                  {/* Day Label */}
                  <div className="flex flex-col items-center gap-1">
                    <span
                      className={`text-xs font-medium ${
                        isToday
                          ? "text-accent-primary"
                          : "text-text-muted"
                      }`}
                    >
                      {day.day}
                    </span>
                    {isToday && (
                      <span className="text-[10px] text-accent-primary/70 font-semibold">Today</span>
                    )}
                  </div>

                  {/* Progress Ring Card */}
                  <div 
                    className={`relative w-16 h-16 flex items-center justify-center ${
                      day.completionRate === 100 ? "shadow-[0_0_15px_rgba(168,85,247,0.6)]" : ""
                    }`}
                  >
                    {day.completionRate === 100 ? (
                      <div className="relative">
                        {/* Purple checkmark for 100% completion with glow */}
                        <CheckCircle2
                          size={48}
                          className="text-purple-500"
                          style={{
                            filter: 'drop-shadow(0 0 15px rgba(168, 85, 247, 0.6))'
                          }}
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-xs font-bold text-purple-500">100%</span>
                        </div>
                      </div>
                    ) : day.completionRate > 0 ? (
                      <svg className="transform -rotate-90 w-16 h-16">
                        {/* Background circle */}
                        <circle
                          cx="32"
                          cy="32"
                          r={radius}
                          stroke="#1f2937"
                          strokeWidth="4"
                          fill="none"
                        />
                        {/* Progress circle */}
                        <circle
                          cx="32"
                          cy="32"
                          r={radius}
                          stroke="#6366f1"
                          strokeWidth="4"
                          fill="none"
                          strokeDasharray={circumference}
                          strokeDashoffset={offset}
                          strokeLinecap="round"
                          className="transition-all duration-500 ease-out"
                        />
                        {/* Center percentage text */}
                        <text
                          x="32"
                          y="32"
                          textAnchor="middle"
                          dominantBaseline="middle"
                          className="text-xs font-bold fill-text-primary"
                          style={{ fontSize: '10px' }}
                        >
                          {day.completionRate}%
                        </text>
                      </svg>
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-dark-hover border border-dark-border flex items-center justify-center">
                        <span className="text-xs font-bold text-text-muted">0%</span>
                      </div>
                    )}
                  </div>

                  {/* Count display */}
                  <div className="text-center">
                    <span className="text-xs text-text-muted">
                      {day.count}/{day.totalHabits}
                    </span>
                  </div>

                  {/* Tooltip */}
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-dark-card border border-dark-border rounded-lg text-xs text-text-primary whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10 shadow-soft">
                    <div className="font-semibold mb-1">{format(day.date, 'MMM d, yyyy')}</div>
                    {day.isComplete
                      ? `All ${day.totalHabits} habits completed`
                      : day.isPartial
                      ? `${day.count} of ${day.totalHabits} habits completed (${day.completionRate}%)`
                      : `No habits completed`}
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-px">
                      <div className="border-4 border-transparent border-t-dark-card"></div>
                    </div>
                  </div>
                </div>
              );
            })}
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
