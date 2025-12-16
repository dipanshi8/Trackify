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
    <div className="min-h-screen bg-dark-bg py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-accent-primary to-accent-cyan bg-clip-text text-transparent">
            Social Feed
          </h1>
          <p className="text-text-muted">Connect with friends and see their progress</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column: User Search */}
          <div className="card">
            <h2 className="text-xl font-semibold mb-6 text-text-primary flex items-center gap-2">
              Find Friends
            </h2>
            <div className="flex gap-3 mb-4">
              <input
                type="text"
                placeholder="Search by name or email..."
                value={q}
                onChange={doSearch}
                className="input-primary flex-1"
              />
            </div>
            {searchResults.length > 0 && (
              <div className="mt-4 space-y-2">
                {searchResults.map(u => (
                  <div key={u._id} className="p-4 rounded-lg bg-dark-hover border border-dark-border hover:border-accent-primary/50 transition-all group">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-accent-primary to-accent-cyan flex items-center justify-center text-white font-bold text-lg shadow-lg">
                          {u.username.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <Link 
                            to={`/profile/${u._id}`} 
                            className="text-text-primary font-semibold hover:text-accent-primary transition-colors block"
                          >
                            {u.username}
                          </Link>
                          <p className="text-xs text-text-muted">{u.email}</p>
                        </div>
                      </div>
                      <button
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                          u.following 
                            ? 'bg-dark-card text-text-muted border border-dark-border cursor-not-allowed' 
                            : 'btn-primary'
                        }`}
                        onClick={() => !u.following && doFollow(u._id)}
                        disabled={u.following}
                      >
                        {u.following ? <UserCheck size={16} /> : <UserPlus size={16} />}
                        {u.following ? 'Following' : 'Follow'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {q.length > 0 && searchResults.length === 0 && (
              <p className="text-text-muted text-center py-8">No users found</p>
            )}
          </div>

          {/* Right Column: Activity Feed */}
          <div className="card">
            <h2 className="text-xl font-semibold mb-6 text-text-primary flex items-center gap-2">
              Friends' Activity
            </h2>
            {feed.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-text-muted">No recent activity from friends.</p>
                <p className="text-text-muted text-sm mt-2">Start following people to see their updates!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {feed.map(item => (
                  <div key={item._id} className="p-4 rounded-lg bg-dark-hover border border-dark-border hover:border-accent-primary/50 transition-all group">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-accent-secondary to-accent-cyan flex items-center justify-center font-bold text-white text-lg shadow-lg flex-shrink-0">
                        {item.user.username.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-text-secondary mb-1">
                          <Link 
                            to={`/profile/${item.user._id}`} 
                            className="text-accent-primary font-semibold hover:text-accent-cyan transition-colors"
                          >
                            {item.user.username}
                          </Link>
                          {' '}completed <span className="text-text-primary font-medium">{item.habit}</span>
                        </p>
                        <div className="flex items-center gap-3 mt-2 text-xs text-text-muted">
                          {item.streak && (
                            <div className="flex items-center gap-1">
                              <Flame className="text-accent-primary" size={14} />
                              <span>{item.streak}-day streak</span>
                            </div>
                          )}
                          <span>• {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold flex-shrink-0 ${
                        item.category === 'health' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                        item.category === 'fitness' ? 'bg-accent-cyan/20 text-accent-cyan border border-accent-cyan/30' :
                        'bg-accent-primary/20 text-accent-primary border border-accent-primary/30'
                      }`}>
                        {item.category || 'Other'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
