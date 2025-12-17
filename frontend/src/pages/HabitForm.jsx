import React, { useState, useEffect } from "react";

export default function HabitForm({ initialData, onSubmit, onCancel }) {
  const [name, setName] = useState("");
  const [habitType, setHabitType] = useState("yesno");
  const [frequency, setFrequency] = useState("daily");
  const [category, setCategory] = useState("");

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || "");
      setHabitType(initialData.habitType || "yesno");
      setFrequency(initialData.frequency || "daily");
      setCategory(initialData.category || "");
    }
  }, [initialData]);

  function handleSubmit(e) {
    e.preventDefault();
    onSubmit({ name, habitType, frequency, category });
    if (!initialData) {
      setName("");
      setHabitType("yesno");
      setFrequency("daily");
      setCategory("");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-text-primary mb-2">
          Habit Name
        </label>
        <input
          className="input-primary w-full"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g., Morning Meditation"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-text-primary mb-2">
          Habit Type
        </label>
        <select
          className="input-primary w-full"
          value={habitType}
          onChange={(e) => setHabitType(e.target.value)}
        >
          <option value="yesno">Yes / No</option>
          <option value="quantitative">Quantitative</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-text-primary mb-2">
          Frequency
        </label>
        <select
          className="input-primary w-full"
          value={frequency}
          onChange={(e) => setFrequency(e.target.value)}
        >
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="custom">Custom</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-text-primary mb-2">
          Category
        </label>
        <input
          className="input-primary w-full"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          placeholder="e.g., Health, Fitness, Productivity"
        />
      </div>

      <div className="flex gap-3 pt-2">
        <button
          className="btn-primary flex-1"
          type="submit"
        >
          {initialData ? "Update Habit" : "Add Habit"}
        </button>
        {onCancel && (
          <button
            className="btn-secondary px-6"
            type="button"
            onClick={onCancel}
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
