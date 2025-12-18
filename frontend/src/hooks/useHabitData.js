import { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { getHabits, getUserCheckins, checkinHabit } from '../services/api';
import { format, startOfDay } from 'date-fns';

// Create context for habit data
const HabitDataContext = createContext(null);

// Provider component
export function HabitDataProvider({ children, userId }) {
  const [habits, setHabits] = useState([]);
  const [checkins, setCheckins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Helper function to format date to YYYY-MM-DD
  const formatDate = useCallback((date) => {
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

  // Load habits - sorted by created date (newest first), then alphabetically
  const loadHabits = useCallback(async () => {
    try {
      const data = await getHabits();
      // Sort by created date (newest first), then alphabetically as fallback
      const sorted = [...data].sort((a, b) => {
        const dateA = new Date(a.createdAt || 0);
        const dateB = new Date(b.createdAt || 0);
        if (dateB.getTime() !== dateA.getTime()) {
          return dateB.getTime() - dateA.getTime(); // Newest first
        }
        // If dates are equal, sort alphabetically
        return (a.name || '').localeCompare(b.name || '');
      });
      setHabits(sorted);
    } catch (err) {
      console.error("Error loading habits:", err);
      setError(err.message);
    }
  }, []);

  // Load checkins for a user
  const loadCheckins = useCallback(async (userId) => {
    if (!userId) return;
    
    try {
      const checkinData = await getUserCheckins(userId);
      
      // Debug: Log raw data
      console.log("🔍 [useHabitData] Raw Checkins Data:", checkinData);
      
      // Normalize all checkins - ensure every entry uses YYYY-MM-DD format as STRING
      // Data Object Structure Check: Ensure date is a string, not a Date object or timestamp
      // Use toLocaleDateString('en-CA') for consistency with markHabitDone
      // This uses local time to match the user's local day
      const normalizedCheckins = checkinData.map((checkin) => {
        let normalizedDate;
        
        // Check if date exists and is a string
        if (checkin.date) {
          // If date is already a string in YYYY-MM-DD format, use it directly
          if (typeof checkin.date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(checkin.date)) {
            normalizedDate = checkin.date;
          } else if (typeof checkin.date === 'string') {
            // Try to parse if it's a string but not in YYYY-MM-DD format
            const date = new Date(checkin.date);
            if (!isNaN(date.getTime())) {
              normalizedDate = date.toLocaleDateString('en-CA');
            } else {
              console.warn("⚠️ [useHabitData] Invalid date string:", checkin.date);
              return null;
            }
          } else {
            // If date is not a string (e.g., Date object), convert it to string
            console.warn("⚠️ [useHabitData] Date is not a string, converting:", checkin.date, typeof checkin.date);
            const date = new Date(checkin.date);
            if (!isNaN(date.getTime())) {
              normalizedDate = date.toLocaleDateString('en-CA');
            } else {
              return null;
            }
          }
        } else if (checkin.timestamp) {
          // Fallback to timestamp if date doesn't exist - convert to string
          const date = new Date(checkin.timestamp);
          normalizedDate = date.toLocaleDateString('en-CA');
        } else {
          console.warn("⚠️ [useHabitData] Checkin missing both date and timestamp:", checkin);
          return null;
        }
        
        // Data Object Structure Check: Ensure habitId exists and is a string
        const habitId = checkin.habitId || checkin.habit?._id;
        if (!habitId) {
          console.warn("⚠️ [useHabitData] Checkin missing habitId:", checkin);
        }
        
        return {
          ...checkin,
          date: normalizedDate, // Always use standardized YYYY-MM-DD format as STRING (local time)
          habitId: habitId ? habitId.toString() : checkin.habitId, // Ensure habitId is a string
          timestamp: checkin.timestamp, // Keep original timestamp for reference
        };
      }).filter((checkin) => checkin !== null && checkin.date !== null && checkin.habitId); // Remove invalid entries
      
      // Debug: Log formatted data
      console.log("✅ [useHabitData] Formatted Checkins Data:", normalizedCheckins);
      console.log("📊 [useHabitData] Total checkins:", normalizedCheckins.length);
      
      setCheckins(normalizedCheckins);
    } catch (err) {
      console.warn("Could not load checkins:", err);
      setCheckins([]);
    }
  }, []);

  // Mark habit as done and immediately update global state
  const markHabitDone = useCallback(async (habitId) => {
    try {
      // Make API call
      await checkinHabit(habitId);
      
      // Get current date in YYYY-MM-DD format using toLocaleDateString('en-CA')
      // This ensures YYYY-MM-DD format regardless of user timezone
      // Use local time for the date string (matches user's local day)
      const now = new Date();
      const today = now.toLocaleDateString('en-CA');
      
      // Optimistically add checkin to global state immediately
      setCheckins((prev) => {
        // Check if checkin already exists for today (avoid duplicates)
        const existingCheckin = prev.find(
          (c) => {
            // Compare dates - normalize both to YYYY-MM-DD format
            const checkinDate = c.date || (c.timestamp ? new Date(c.timestamp).toLocaleDateString('en-CA') : null);
            return c.habitId === habitId && checkinDate === today;
          }
        );
        
        if (!existingCheckin) {
          // Data Object Structure Check: Ensure the log object looks exactly like { date: '2025-12-18', habitId: '...' }
          // date MUST be a string, not a Date object or timestamp
          const newCheckin = {
            habitId: habitId.toString(), // Ensure habitId is a string
            userId: userId,
            timestamp: now,
            date: today, // Use standardized YYYY-MM-DD format as STRING (local time)
          };
          console.log("🔄 [useHabitData] Global Logs Updated - Added checkin for today:", today);
          console.log("🔄 [useHabitData] New checkin object structure:", newCheckin);
          const updated = [...prev, newCheckin];
          console.log("🔄 [useHabitData] Global Logs Updated - Total checkins:", updated.length);
          return updated;
        } else {
          console.log("🔄 [useHabitData] Global Logs Updated - Checkin already exists for today");
          return prev;
        }
      });
      
      // Reload habits to get updated completion status
      await loadHabits();
      
      // Reload checkins to ensure sync with server (this will normalize server dates)
      if (userId) {
        await loadCheckins(userId);
      }
      
      console.log("🔄 [useHabitData] Global Logs Updated - Habit marked as done");
      
      return true;
    } catch (err) {
      console.error("Error marking habit as done:", err);
      throw err;
    }
  }, [userId, loadHabits, loadCheckins]);

  // Initial load
  useEffect(() => {
    const initialize = async () => {
      setLoading(true);
      await loadHabits();
      if (userId) {
        await loadCheckins(userId);
      }
      setLoading(false);
    };
    
    initialize();
  }, [userId, loadHabits, loadCheckins]);

  const value = {
    habits,
    checkins,
    loading,
    error,
    loadHabits,
    loadCheckins,
    markHabitDone,
    formatDate,
  };

  return (
    <HabitDataContext.Provider value={value}>
      {children}
    </HabitDataContext.Provider>
  );
}

// Custom hook to use habit data
export function useHabitData() {
  const context = useContext(HabitDataContext);
  if (!context) {
    throw new Error('useHabitData must be used within HabitDataProvider');
  }
  return context;
}

