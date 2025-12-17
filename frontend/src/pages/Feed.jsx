import React, { useEffect, useState, useRef } from 'react';
import { Link } from "react-router-dom";
import { UserPlus, UserCheck, Flame, Eye } from "lucide-react";
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

  // Example Activity Card Component
  const ExampleActivityCard = ({ username, habit, streak, category, delay }) => {
    const [animatedProgress, setAnimatedProgress] = useState(0);
    const progressRef = useRef(null);
    const circumference = 2 * Math.PI * 20; // radius 20
    const targetProgress = Math.min((streak / 14) * 100, 100); // Cap at 100%
    const offset = circumference - (animatedProgress / 100) * circumference;

    useEffect(() => {
      const duration = 800;
      const startTime = Date.now();
      
      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progressRatio = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progressRatio, 3);
        const newProgress = targetProgress * eased;
        
        setAnimatedProgress(newProgress);
        
        if (progressRatio < 1) {
          requestAnimationFrame(animate);
        }
      };
      
      requestAnimationFrame(animate);
    }, [targetProgress]);

    const categoryStyles = {
      'Fitness': 'bg-accent-cyan/20 text-accent-cyan border border-accent-cyan/30',
      'Learning': 'bg-accent-primary/20 text-accent-primary border border-accent-primary/30',
      'Health': 'bg-green-500/20 text-green-400 border border-green-500/30',
    };

    return (
      <div 
        className="p-4 rounded-lg bg-dark-hover/60 border border-dashed border-accent-primary/30 relative animate-slideUp opacity-75" 
        style={{ animationDelay: `${delay}ms`, animationFillMode: 'both' }}
      >
        {/* Example Badge */}
        <div className="absolute top-3 right-3 z-10">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-accent-primary/20 border border-accent-primary/40 backdrop-blur-sm">
            <Eye size={12} className="text-accent-primary" />
            <span className="text-xs font-semibold text-accent-primary">Example activity</span>
          </div>
        </div>

        <div className="flex items-start gap-4 pr-20">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-accent-secondary to-accent-cyan flex items-center justify-center font-bold text-white text-lg shadow-lg flex-shrink-0">
            {username.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-text-secondary mb-1">
              <span className="text-accent-primary font-semibold">{username}</span>
              {' '}completed <span className="text-text-primary font-medium">'{habit}'</span> for {streak} days straight 🔥
            </p>
            <div className="flex items-center gap-4 mt-3">
              {/* Progress Ring */}
              <div className="relative w-10 h-10 flex-shrink-0">
                <svg className="transform -rotate-90 w-10 h-10" ref={progressRef}>
                  <circle
                    cx="20"
                    cy="20"
                    r="18"
                    stroke="#1f2937"
                    strokeWidth="3"
                    fill="none"
                  />
                  <circle
                    cx="20"
                    cy="20"
                    r="18"
                    stroke="#6366f1"
                    strokeWidth="3"
                    fill="none"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    style={{
                      transition: 'stroke-dashoffset 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
                    }}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xs font-bold text-text-primary/70">
                    {Math.round(animatedProgress)}%
                  </span>
                </div>
              </div>
              {/* Streak Badge */}
              <div className="flex items-center gap-1.5">
                <Flame className="text-accent-primary" size={16} />
                <span className="text-xs font-medium text-accent-primary">{streak}-day streak</span>
              </div>
            </div>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-semibold flex-shrink-0 ${categoryStyles[category] || categoryStyles['Learning']}`}>
            {category}
          </span>
        </div>
      </div>
    );
  };

  // Real Feed Activity Card Component
  const FeedActivityCard = ({ item, delay }) => {
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
                <div className="space-y-4">
                  {/* Example Activity Cards */}
                  <ExampleActivityCard 
                    username="Ananya"
                    habit="Morning Walk"
                    streak={7}
                    category="Fitness"
                    delay={0}
                  />
                  <ExampleActivityCard 
                    username="Marcus"
                    habit="Read 10 pages"
                    streak={12}
                    category="Learning"
                    delay={100}
                  />
                  
                  {/* Empty State Message */}
                  <div className="text-center py-8 mt-6 animate-slideUp" style={{ animationDelay: '200ms', animationFillMode: 'both' }}>
                    <p className="text-text-muted text-lg mb-2">Follow people to stay inspired by their consistency</p>
                    <p className="text-text-muted/70 text-sm">Their progress will appear here as they build their habits</p>
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
