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
    <div className="relative p-5 rounded-2xl bg-white/60 backdrop-blur-sm border border-gray-200 shadow-md hover:shadow-xl transform hover:scale-105 transition-all duration-300">
      {/* Flash message */}
      {message && (
        <div
          className={`absolute top-2 right-2 px-3 py-1 rounded text-sm font-medium shadow-lg animate-fadeIn ${
            msgType === "success"
              ? "bg-green-600 text-white"
              : "bg-red-600 text-white"
          }`}
        >
          {message}
        </div>
      )}

      {/* Edit/Delete icons */}
      <div className="absolute top-3 right-3 flex gap-2 opacity-0 hover:opacity-100 transition-opacity duration-300">
        <button onClick={() => onEdit(habit)}>
          <Edit3 className="text-gray-600 hover:text-blue-600" size={18} />
        </button>
        <button onClick={handleDelete}>
          <Trash2 className="text-gray-600 hover:text-red-600" size={18} />
        </button>
      </div>

      <h3 className="text-lg font-semibold text-gray-800">{habit.name}</h3>
      <p className="text-sm text-gray-600 mt-1">{habit.description}</p>

      {/* Category & Frequency badges */}
      <div className="flex flex-wrap gap-2 mt-2">
        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-200 text-green-800">
          {habit.category}
        </span>
        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-200 text-blue-800">
          {habit.frequency}
        </span>
      </div>

      {/* Streak & Completion */}
      <div className="flex items-center gap-3 mt-3 text-sm text-gray-700">
        <Flame className="text-orange-500" size={16} /> {habit.streak || 0}
        -day streak
        <span>• Completion: {habit.completionRate || 0}%</span>
      </div>

      {/* Check-in Button */}
      <button
        onClick={handleCheckin}
        disabled={loading || completed}
        className={`mt-4 w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl font-semibold text-white transition ${
          completed
            ? "bg-green-500 hover:bg-green-600"
            : "bg-gradient-to-r from-orange-400 to-pink-500 hover:from-pink-500 hover:to-orange-400"
        } ${loading ? "opacity-70 cursor-wait" : ""}`}
      >
        {loading ? (
          <span className="loader-border loader-border-white w-5 h-5 rounded-full border-2 border-t-2 animate-spin"></span>
        ) : completed ? (
          <CheckCircle2 size={18} />
        ) : (
          <Circle size={18} />
        )}
        {completed ? "Completed" : "Check-in"}
      </button>
    </div>
  );
}

export default HabitCard;
