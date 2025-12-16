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
    <div className="min-h-screen bg-dark-bg py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-accent-primary to-accent-cyan bg-clip-text text-transparent">
            Search Users
          </h1>
          <p className="text-text-muted">Find and connect with other users</p>
        </div>

        <div className="card">
          <div className="flex gap-3 mb-6">
            <input
              type="text"
              className="input-primary flex-1"
              placeholder="Search by username..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
            <button
              className="btn-primary px-6"
              onClick={handleSearch}
            >
              Search
            </button>
          </div>

          {results.length > 0 ? (
            <div className="space-y-3">
              {results.map(u => (
                <div key={u._id} className="p-4 rounded-lg bg-dark-hover border border-dark-border hover:border-accent-primary/50 transition-all group">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-accent-primary to-accent-cyan flex items-center justify-center text-white font-bold text-lg shadow-lg">
                        {u.username.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-text-primary">{u.username}</p>
                        {u.email && (
                          <p className="text-sm text-text-muted">{u.email}</p>
                        )}
                      </div>
                    </div>
                    <button
                      className={`px-4 py-2 rounded-lg font-medium transition-all ${
                        u.following 
                          ? "bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30" 
                          : "btn-primary"
                      }`}
                      onClick={() => u.following ? handleUnfollow(u._id) : handleFollow(u._id)}
                    >
                      {u.following ? "Unfollow" : "Follow"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : query && results.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-text-muted">No users found matching "{query}"</p>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-text-muted">Enter a username to search</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
