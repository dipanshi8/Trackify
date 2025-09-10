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
      <input
        className="border p-3 w-full rounded-lg focus:ring-2 focus:ring-blue-400"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Habit name"
        required
      />
      <select
        className="border p-3 w-full rounded-lg focus:ring-2 focus:ring-blue-400"
        value={frequency}
        onChange={(e) => setFrequency(e.target.value)}
      >
        <option value="daily">Daily</option>
        <option value="weekly">Weekly</option>
      </select>
      <input
        className="border p-3 w-full rounded-lg focus:ring-2 focus:ring-blue-400"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        placeholder="Category"
      />
      <div className="flex gap-3">
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          type="submit"
        >
          {initialData ? "Update Habit" : "Add Habit"}
        </button>
        {initialData && (
          <button
            className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition"
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
