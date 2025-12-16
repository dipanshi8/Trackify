import { useState } from "react";
import { Circle, CheckCircle2, Edit3, Trash2, Flame } from "lucide-react";
import { checkinHabit, deleteHabit } from "../services/api";

function HabitCard({ habit, onUpdated, onEdit }) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [msgType, setMsgType] = useState("success");

  const handleCheckin = async () => {
    try {
      setLoading(true);
      const res = await checkinHabit(habit._id);

      setMessage(res.message || "Checked in successfully!");
      setMsgType("success");
      if (onUpdated) onUpdated();
    } catch (err) {
      setMessage(err.response?.data?.message || "Already checked in!");
      setMsgType("error");
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(""), 3000);
    }
  };

  const handleDelete = async () => {
    try {
      const res = await deleteHabit(habit._id);
      setMessage(res.message || "Habit deleted successfully");
      setMsgType("success");
      if (onUpdated) onUpdated();
    } catch (err) {
      setMessage("Error deleting habit");
      setMsgType("error");
    }
    setTimeout(() => setMessage(""), 3000);
  };

  const completed = habit.completedToday;

  return (
    <div className="relative card group hover:border-accent-primary/50 transition-all duration-300">
      {/* Flash message */}
      {message && (
        <div
          className={`absolute top-3 right-3 px-3 py-2 rounded-lg text-xs font-medium shadow-lg animate-fadeIn z-10 ${
            msgType === "success"
              ? "bg-green-500/20 text-green-400 border border-green-500/30"
              : "bg-red-500/20 text-red-400 border border-red-500/30"
          }`}
        >
          {message}
        </div>
      )}

      {/* Edit/Delete icons */}
      <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
        <button 
          onClick={() => onEdit(habit)}
          className="p-2 rounded-lg bg-dark-hover hover:bg-accent-primary/20 text-text-muted hover:text-accent-primary transition-all"
        >
          <Edit3 size={16} />
        </button>
        <button 
          onClick={handleDelete}
          className="p-2 rounded-lg bg-dark-hover hover:bg-red-500/20 text-text-muted hover:text-red-400 transition-all"
        >
          <Trash2 size={16} />
        </button>
      </div>

      <div className="space-y-3">
        <div>
          <h3 className="text-lg font-semibold text-text-primary mb-1">{habit.name}</h3>
          {habit.description && (
            <p className="text-sm text-text-muted">{habit.description}</p>
          )}
        </div>

        {/* Category & Frequency badges */}
        <div className="flex flex-wrap gap-2">
          <span className="px-3 py-1 text-xs font-semibold rounded-full bg-accent-primary/20 text-accent-primary border border-accent-primary/30">
            {habit.category || "Uncategorized"}
          </span>
          <span className="px-3 py-1 text-xs font-semibold rounded-full bg-accent-cyan/20 text-accent-cyan border border-accent-cyan/30">
            {habit.frequency}
          </span>
        </div>

        {/* Streak & Completion */}
        <div className="flex items-center gap-4 text-sm text-text-secondary pt-2 border-t border-dark-border">
          <div className="flex items-center gap-1.5">
            <Flame className="text-accent-primary" size={16} />
            <span className="font-medium">{habit.streak || 0} day streak</span>
          </div>
          <span className="text-text-muted">•</span>
          <span className="text-text-muted">Completion: {habit.completionRate || 0}%</span>
        </div>

        {/* Check-in Button */}
        <button
          onClick={handleCheckin}
          disabled={loading || completed}
          className={`mt-4 w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-semibold text-white transition-all duration-300 ${
            completed
              ? "bg-green-500/20 text-green-400 border border-green-500/30 hover:bg-green-500/30 cursor-not-allowed"
              : "bg-gradient-to-r from-accent-primary via-accent-secondary to-accent-cyan hover:shadow-glow hover:scale-[1.02] active:scale-[0.98]"
          } ${loading ? "opacity-70 cursor-wait" : ""}`}
        >
          {loading ? (
            <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
          ) : completed ? (
            <>
              <CheckCircle2 size={18} />
              Completed
            </>
          ) : (
            <>
              <Circle size={18} />
              Check-in
            </>
          )}
        </button>
      </div>
    </div>
  );
}

export default HabitCard;
