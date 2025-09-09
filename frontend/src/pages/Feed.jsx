import React, { useEffect, useState } from 'react';
import { Link } from "react-router-dom";
import { UserPlus, UserCheck, Flame } from "lucide-react";
import { getFeed, searchUsers, followUser } from '../services/api';

export default function Feed() {
  const [feed, setFeed] = useState([]);
  const [q, setQ] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  const loadFeed = async () => {
    try { const res = await getFeed(); setFeed(res); } 
    catch (err) { console.error(err); }
  };

  useEffect(() => { loadFeed(); }, []);

  const doSearch = async (e) => {
    const val = e.target.value;
    setQ(val);
    if (val.length < 2) { setSearchResults([]); return; }
    try {
      const res = await searchUsers(val);
      setSearchResults(res.map(u => ({ ...u, following: u.following || false })));
    } catch (err) { console.error(err); }
  };

  const doFollow = async (id) => {
    try {
      await followUser(id);
      setSearchResults(prev => prev.map(u => u._id === id ? { ...u, following: true } : u));
      loadFeed();
    } catch (err) { console.error(err); }
  };

  return (
    <div className="relative min-h-screen overflow-hidden p-6 bg-gray-100">
      {/* Floating Blobs */}
      <div className="absolute top-10 right-10 w-64 h-64 bg-pink-400 opacity-30 rounded-full mix-blend-multiply filter blur-3xl animate-pulse"></div>
      <div className="absolute bottom-20 left-20 w-72 h-72 bg-indigo-400 opacity-30 rounded-full mix-blend-multiply filter blur-3xl animate-ping"></div>

      <div className="relative max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column: User Search */}
        <div className="bg-white rounded-2xl p-6 shadow-lg space-y-4">
          <h2 className="text-xl font-semibold mb-4">Find Friends 🔍</h2>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Search by name or email..."
              value={q}
              onChange={doSearch}
              className="flex-1 p-3 rounded-2xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-400 shadow-sm transition"
            />
            <button className="px-5 py-3 bg-gradient-to-r from-green-400 to-emerald-500 text-white font-semibold rounded-xl shadow hover:scale-105 transition-transform">
              Search
            </button>
          </div>
          {searchResults.length > 0 && (
            <div className="mt-2 bg-gray-50 rounded-2xl shadow-md divide-y divide-gray-200">
              {searchResults.map(u => (
                <div key={u._id} className="p-3 flex justify-between items-center hover:bg-gray-100 transition">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center text-white font-bold">
                      {u.username.charAt(0)}
                    </div>
                    <div>
                      <Link to={`/profile/${u._id}`} className="text-blue-600 font-medium hover:underline">
                        {u.username}
                      </Link>
                      <p className="text-xs text-gray-500">{u.email}</p>
                    </div>
                  </div>
                  <button
                    className={`flex items-center gap-1 px-3 py-1 rounded text-white font-semibold ${
                      u.following ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-500 hover:bg-green-600'
                    } transition`}
                    onClick={() => !u.following && doFollow(u._id)}
                    disabled={u.following}
                  >
                    {u.following ? <UserCheck size={16} /> : <UserPlus size={16} />}
                    {u.following ? 'Following' : 'Follow'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Activity Feed */}
        <div className="bg-white rounded-2xl p-6 shadow-lg space-y-4">
          <h2 className="text-xl font-semibold mb-4">Friends' Activity Feed 📈</h2>
          {feed.length === 0 ? (
            <p className="text-gray-500 text-center">No recent activity from friends.</p>
          ) : (
            <div className="space-y-3">
              {feed.map(item => (
                <div key={item._id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl shadow-sm hover:shadow-md transition">
                  <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center font-bold text-white">
                    {item.user.username.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm">
                      <Link to={`/profile/${item.user._id}`} className="text-blue-600 font-semibold hover:underline">
                        {item.user.username}
                      </Link> completed <strong>{item.habit}</strong>
                    </p>
                    <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                      {item.streak && <Flame className="text-orange-500" size={16} />}
                      <span>{item.streak ? `${item.streak}-day streak` : ''}</span>
                      <span>• {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    item.category === 'health' ? 'bg-green-200 text-green-800' :
                    item.category === 'fitness' ? 'bg-blue-200 text-blue-800' :
                    'bg-gray-200 text-gray-800'
                  }`}>
                    {item.category || 'Other'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
