import React, { useState } from "react";
import { searchUsers, followUser, unfollowUser } from "../services/api";

export default function SearchUsers() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);

  const handleSearch = async () => {
    try {
      const data = await searchUsers(query);
      // Mark if already following (optional: backend can send this)
      setResults(data.map(u => ({ ...u, following: u.following || false })));
    } catch (err) {
      alert(err.response?.data?.message || "Error searching users");
    }
  };

  const handleFollow = async (id) => {
    try {
      await followUser(id);
      setResults(prev => prev.map(u => u._id === id ? { ...u, following: true } : u));
    } catch (err) {
      alert(err.response?.data?.message || "Error following user");
    }
  };

  const handleUnfollow = async (id) => {
    try {
      await unfollowUser(id);
      setResults(prev => prev.map(u => u._id === id ? { ...u, following: false } : u));
    } catch (err) {
      alert(err.response?.data?.message || "Error unfollowing user");
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Search Users</h1>

      <div className="flex gap-2 mb-4">
        <input
          type="text"
          className="border p-2 rounded w-full"
          placeholder="Search username"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button
          className="bg-blue-500 text-white px-3 py-1 rounded"
          onClick={handleSearch}
        >
          Search
        </button>
      </div>

      <div className="space-y-2">
        {results.map(u => (
          <div key={u._id} className="p-2 bg-white rounded shadow flex justify-between items-center">
            <span>{u.username}</span>
            <button
              className={`px-3 py-1 rounded text-white ${u.following ? "bg-red-500" : "bg-green-500"}`}
              onClick={() => u.following ? handleUnfollow(u._id) : handleFollow(u._id)}
            >
              {u.following ? "Unfollow" : "Follow"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
