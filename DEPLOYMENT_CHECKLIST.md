# Deployment Checklist - Trackify

## Quick Reference

**Frontend:** https://trackify-ggjb.vercel.app  
**Backend:** https://trackify-1-j03x.onrender.com

---

## ✅ Code Status: READY

All code fixes have been applied:
- ✅ CORS configured with Vercel domain
- ✅ All API routes verified
- ✅ Request/response formats compatible

---

## ⚠️ Deployment Configuration Required

### Render (Backend) Environment Variables

Go to: Render Dashboard → Your Backend Service → Environment

Set these variables:

```env
MONGO_URI=mongodb+srv://yaduvanshidips25_db_user:baN8ufhQqU0qGmGs@trackify.of744pl.mongodb.net/?retryWrites=true&w=majority&appName=Trackify
JWT_SECRET=Hellu@1212
NODE_ENV=production
FRONTEND_URL=https://trackify-ggjb.vercel.app
```

**Critical:**
- `MONGO_URI` - Required for database connection
- `JWT_SECRET` - Required, must be at least 10 characters
- `NODE_ENV` - Required, set to `production` to enable CORS for Vercel

**Optional:**
- `FRONTEND_URL` - Already hardcoded in CORS, but good to have for reference

### Vercel (Frontend) Environment Variables

Go to: Vercel Dashboard → Your Project → Settings → Environment Variables

Set this variable (optional but recommended):

```env
REACT_APP_API_URL=https://trackify-1-j03x.onrender.com/api
```

**Note:** Frontend has a fallback to this URL, so this is optional but recommended for clarity.

---

## 🚀 Deployment Steps

### 1. Deploy Backend to Render

1. Push updated `backend/server.js` to your repository
2. Render will automatically redeploy
3. Verify environment variables are set correctly
4. Check Render logs to ensure server starts successfully

### 2. Verify Frontend on Vercel

1. Ensure `REACT_APP_API_URL` is set (optional)
2. Vercel will automatically redeploy on git push
3. Frontend should work with current configuration

---

## 🧪 Testing After Deployment

### Test 1: Signup
1. Go to https://trackify-ggjb.vercel.app/signup
2. Fill in username, email, password
3. Click "Sign Up"
4. ✅ Should redirect to dashboard on success

### Test 2: Login
1. Go to https://trackify-ggjb.vercel.app/signin
2. Enter credentials
3. Click "Sign In"
4. ✅ Should redirect to dashboard on success

### Test 3: Check Browser Console
1. Open browser DevTools (F12)
2. Go to Console tab
3. ✅ Should see no CORS errors
4. ✅ API requests should return 200/201 status

### Test 4: Check Network Tab
1. Open browser DevTools (F12)
2. Go to Network tab
3. Try signup/login
4. ✅ Check request URL: Should be `https://trackify-1-j03x.onrender.com/api/...`
5. ✅ Check response headers: Should include `Access-Control-Allow-Origin: https://trackify-ggjb.vercel.app`

---

## 🔍 Troubleshooting

### Issue: CORS Error
**Symptom:** Browser console shows "CORS policy" error

**Solution:**
1. Verify `NODE_ENV=production` is set in Render
2. Verify backend has been redeployed with latest code
3. Check Render logs to ensure server started correctly

### Issue: 401 Unauthorized
**Symptom:** Login/signup returns 401

**Solution:**
1. Verify `JWT_SECRET` is set in Render (minimum 10 characters)
2. Check backend logs for JWT errors

### Issue: 503 Service Unavailable
**Symptom:** API returns 503

**Solution:**
1. Verify `MONGO_URI` is set correctly in Render
2. Check MongoDB Atlas connection
3. Check Render logs for database connection errors

### Issue: Wrong API URL
**Symptom:** Requests going to localhost or wrong URL

**Solution:**
1. Set `REACT_APP_API_URL` in Vercel environment variables
2. Clear browser cache
3. Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)

---

## ✅ Success Indicators

After deployment, you should see:

1. ✅ No CORS errors in browser console
2. ✅ Signup/login working from Vercel frontend
3. ✅ API requests showing correct backend URL in Network tab
4. ✅ Response headers include `Access-Control-Allow-Origin`
5. ✅ All features working (habits, feed, profile, etc.)

---

**Last Updated:** Current Date  
**Status:** Ready for Deployment

