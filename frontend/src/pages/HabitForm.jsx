import React, { useState, useEffect } from "react";

export default function HabitForm({ initialData, onSubmit, onCancel }) {
  const [name, setName] = useState("");
  const [frequency, setFrequency] = useState("daily");
  const [category, setCategory] = useState("");

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setFrequency(initialData.frequency);
      setCategory(initialData.category);
    }
  }, [initialData]);

  function handleSubmit(e) {
    e.preventDefault();
    onSubmit({ name, frequency, category });
    setName("");
    setFrequency("daily");
    setCategory("");
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <input
          className="input-primary w-full"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Habit name"
          required
        />
      </div>
      <div>
        <select
          className="input-primary w-full"
          value={frequency}
          onChange={(e) => setFrequency(e.target.value)}
        >
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
        </select>
      </div>
      <div>
        <input
          className="input-primary w-full"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          placeholder="Category (e.g., Health, Fitness, Productivity)"
        />
      </div>
      <div className="flex gap-3 pt-2">
        <button
          className="btn-primary flex-1"
          type="submit"
        >
          {initialData ? "Update Habit" : "Add Habit"}
        </button>
        {initialData && (
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
