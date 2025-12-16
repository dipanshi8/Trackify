import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../services/api";

export default function SignIn({ setUser }) {
  const [emailOrUsername, setEmailOrUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [msgType, setMsgType] = useState("success");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await login({ emailOrUsername, password });
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      setUser(data.user);

      setMsgType("success");
      setMessage("Login successful! Redirecting...");
      setTimeout(() => navigate("/dashboard"), 1500);
    } catch (err) {
      setMsgType("error");
      setMessage(err.response?.data?.message || "Login failed");
      setTimeout(() => setMessage(""), 3000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-dark-bg">
      <div className="w-full max-w-md relative">
        {/* Background gradient effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-accent-primary/20 via-accent-secondary/20 to-accent-cyan/20 rounded-2xl blur-3xl -z-10"></div>
        
        <div className="card relative overflow-hidden">
          {/* Decorative gradient border */}
          <div className="absolute inset-0 bg-gradient-to-r from-accent-primary via-accent-secondary to-accent-cyan opacity-20 rounded-xl"></div>
          <div className="relative bg-dark-card rounded-xl p-8 border border-dark-border">
            {message && (
              <div
                className={`mb-4 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-300 ${
                  msgType === "success" 
                    ? "bg-green-500/20 text-green-400 border border-green-500/30" 
                    : "bg-red-500/20 text-red-400 border border-red-500/30"
                }`}
              >
                {message}
              </div>
            )}
            
            <div className="mb-8">
              <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-accent-primary to-accent-cyan bg-clip-text text-transparent">
                Welcome back
              </h2>
              <p className="text-text-muted">Sign in to continue your journey</p>
            </div>
            
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <input
                  type="text"
                  placeholder="Email or Username"
                  value={emailOrUsername}
                  onChange={(e) => setEmailOrUsername(e.target.value)}
                  className="input-primary w-full"
                  required
                />
              </div>
              <div>
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-primary w-full"
                  required
                />
              </div>
              <button
                type="submit"
                className="btn-primary w-full mt-2"
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    Signing in...
                  </span>
                ) : (
                  "Sign In"
                )}
              </button>
            </form>
            
            <p className="mt-6 text-center text-text-muted text-sm">
              Don't have an account?{" "}
              <a href="/signup" className="text-accent-primary hover:text-accent-cyan transition-colors font-medium">
                Sign up
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
