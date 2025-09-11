import axios from 'axios';

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "https://trackify-1-j03x.onrender.com/",
});



// attach token to requests
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default API;

export async function register(data) { return API.post('/auth/register', data).then(r => r.data); }
export async function login(data) { return API.post('/auth/login', data).then(r => r.data); }

export async function getHabits() { return API.get('/habits').then(r => r.data); }
export async function createHabit(habit) { return API.post('/habits', habit).then(r=>r.data); }
export async function editHabit(id, body) { return API.put(`/habits/${id}`, body).then(r=>r.data); }
export async function deleteHabit(id) { return API.delete(`/habits/${id}`).then(r=>r.data); }
// export async function checkinHabit(id) { return API.post(`/habits/${id}/checkin`).then(r=>r.data); }
export async function checkinHabit(habitId) {
  try {
    const res = await API.post(`/habits/${habitId}/checkin`);
    return res.data;
  } catch (err) {
    console.error("Check-in API error:", err.response?.data || err.message);
    throw new Error(err.response?.data?.message || "Check-in failed");
  }
}


export async function searchUsers(q) { return API.get(`/users/search?q=${encodeURIComponent(q)}`).then(r=>r.data); }
export async function followUser(id) { return API.post(`/users/${id}/follow`).then(r=>r.data); }
export async function unfollowUser(id) { return API.post(`/users/${id}/unfollow`).then(r=>r.data); }
export async function getFeed() { return API.get('/users/feed').then(r=>r.data); }


// inside services/api.js
export async function getUserById(id) {
  return API.get(`/users/${id}`).then((r) => r.data);
}

export async function getUserHabits(id) {
  return API.get(`/users/${id}/habits`).then((r) => r.data);
}

export async function getUserProfile(id) {
  return API.get(`/users/${id}`).then(r => r.data);
}

