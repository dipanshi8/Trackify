import React, { useEffect, useState } from 'react';
import { Link } from "react-router-dom";
import { UserPlus, UserCheck, Flame, Sparkles } from "lucide-react";
import { formatDistanceToNow } from 'date-fns';
import { getFeed, searchUsers, followUser } from '../services/api';

export default function Feed() {
  const [feed, setFeed] = useState([]);
  const [q, setQ] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [reactions, setReactions] = useState({}); // { feedItemId: { count: number, userReacted: boolean } }

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

  // Initialize reactions from feed data (local state for now, can be connected to DB later)
  useEffect(() => {
    if (feed.length === 0) return;
    
    setReactions(prev => {
      const newReactions = { ...prev };
      let hasNew = false;
      
      feed.forEach(item => {
        if (!newReactions[item._id]) {
          newReactions[item._id] = {
            count: 0, // Start with 0, can be loaded from API later
            userReacted: false
          };
          hasNew = true;
        }
      });
      
      return hasNew ? newReactions : prev;
    });
  }, [feed]);

  const toggleReaction = (itemId) => {
    setReactions(prev => {
      const current = prev[itemId] || { count: 0, userReacted: false };
      return {
        ...prev,
        [itemId]: {
          count: current.userReacted ? current.count - 1 : current.count + 1,
          userReacted: !current.userReacted
        }
      };
    });
    // TODO: Add API call to persist reaction when backend is ready
  };

  // Feed Activity Card Component
  const FeedActivityCard = ({ item, delay }) => {
    const reaction = reactions[item._id] || { count: 0, userReacted: false };
    const relativeTime = formatDistanceToNow(new Date(item.timestamp), { addSuffix: true });
    return (
      <div 
        className="p-4 rounded-lg bg-dark-hover border border-dark-border hover:border-accent-primary/50 transition-all group animate-slideUp"
        style={{ animationDelay: `${delay}ms`, animationFillMode: 'both' }}
      >
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
              <span>• {relativeTime}</span>
            </div>
            
            {/* Actions Row */}
            <div className="flex items-center gap-4 mt-3 pt-3 border-t border-dark-border">
              {/* Congrats Button */}
              <button
                onClick={() => toggleReaction(item._id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  reaction.userReacted
                    ? 'bg-accent-primary/20 text-accent-primary border border-accent-primary/30'
                    : 'bg-dark-card text-text-muted border border-dark-border hover:border-accent-primary/50 hover:text-accent-primary'
                }`}
              >
                <span className="text-base">🎉</span>
                <span>Congrats</span>
                {reaction.count > 0 && (
                  <span className="ml-1 text-xs">({reaction.count})</span>
                )}
              </button>
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
    );
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: User Search */}
          <div className="lg:col-span-1">
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
          </div>

          {/* Right Column: Activity Feed */}
          <div className="lg:col-span-2">
            <div className="card">
              <h2 className="text-xl font-semibold mb-6 text-text-primary flex items-center gap-2">
                Friends' Activity
              </h2>
              {feed.length === 0 ? (
                <div className="text-center py-12 animate-slideUp" style={{ animationDelay: '0ms', animationFillMode: 'both' }}>
                  <div className="max-w-md mx-auto space-y-4">
                    <div className="w-16 h-16 mx-auto rounded-full bg-dark-hover border border-dark-border flex items-center justify-center">
                      <UserPlus size={32} className="text-text-muted" />
                    </div>
                    <h3 className="text-xl font-semibold text-text-primary">Your feed is empty</h3>
                    <p className="text-text-muted">Follow people to see their habit completions here</p>
                    <p className="text-text-muted/70 text-sm">Use the search bar on the left to find friends and start following them</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {feed.map((item, index) => (
                    <FeedActivityCard 
                      key={item._id} 
                      item={item}
                      delay={index * 50}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
