# 🐛 Debug Guide - Fix All 20 Issues

## 🚀 **Step 1: Start Development Server**

```bash
# Make sure you're in the correct directory
cd supabase-auth-app
npm run dev
```

**Expected Output:**
```
> supabase-auth-app@0.1.0 dev
> next dev

- ready started server on 0.0.0.0:3000, url: http://localhost:3000
```

## 🔍 **Step 2: Check Browser Console**

Open browser console (F12) and look for:

### ✅ **Good Signs:**
- No red error messages
- Pages load normally
- Console shows initialization messages

### ❌ **Bad Signs:**
- Red error messages
- Network errors
- React hydration errors

## 🗄️ **Step 3: Database Issues**

### **Issue 1: Wrong Column Names**
**Problem:** Database uses snake_case, code expects camelCase
**Solution:** Recreate tables with correct column names

```sql
-- Drop existing tables
DROP TABLE IF EXISTS trades CASCADE;
DROP TABLE IF EXISTS smart_withdrawal_settings CASCADE;
DROP TABLE IF EXISTS user_settings CASCADE;
DROP TABLE IF EXISTS withdrawal_transactions CASCADE;

-- Run corrected schemas
-- smart_withdrawal_schema.sql
-- trades_schema.sql  
-- user_settings_schema.sql
```

### **Issue 2: PGRST116 Errors**
**Problem:** "No rows found" - this is NORMAL for new users
**Solution:** ✅ Already fixed in code

### **Issue 3: RLS Policy Conflicts**
**Problem:** Policies already exist
**Solution:** Use `IF NOT EXISTS` or ignore the error

## 🎨 **Step 4: UI Issues**

### **Issue 4: Navigation Highlight**
**Problem:** White highlight makes text invisible
**Solution:** ✅ Already fixed - text turns black

### **Issue 5: Card Borders**
**Problem:** Cards missing subtle borders
**Solution:** ✅ Already added `border border-dark-border`

### **Issue 6: Button Hover Animations**
**Problem:** Buttons not scaling on hover
**Solution:** ✅ Already added global hover animations

## 🔐 **Step 5: Authentication Issues**

### **Issue 7: Login Problems**
**Check:** 
- Environment variables set correctly
- Supabase client initialized
- Network connectivity

### **Issue 8: Password Reset**
**Check:**
- Reset link configuration
- Email settings in Supabase

## 📊 **Step 6: Data Loading Issues**

### **Issue 9: Smart Withdrawal Not Loading**
**Check:**
- Database tables exist
- RLS policies correct
- User authenticated

### **Issue 10: User Settings Errors**
**Check:**
- `user_settings` table exists
- Policies allow user access

## 🎯 **Step 7: Specific Error Types**

### **PGRST116 (No rows found)**
- ✅ **FIXED** - Now handled as normal case
- Returns `null` instead of throwing error

### **42P01 (Table doesn't exist)**
- Run the corrected SQL schemas
- Check table names match exactly

### **42501 (Permission denied)**
- Check RLS policies exist
- Verify user authentication

## 🚀 **Step 8: Quick Fixes Applied**

✅ **Fixed Issues:**
1. PGRST116 error handling
2. Database schema column names
3. Error logging improvements
4. Default settings for new users
5. Navigation highlight colors
6. Card border styling
7. Button hover animations
8. Smart withdrawal error handling
9. User settings error handling
10. Trade form validation

## 📋 **Step 9: Test Each Page**

### **Dashboard:**
- [ ] Loads without errors
- [ ] Smart withdrawal section shows
- [ ] Metrics display correctly

### **Add Trade:**
- [ ] Form loads properly
- [ ] Can input all fields
- [ ] Saves to database

### **Journal:**
- [ ] Shows trade history
- [ ] No duplicate headers

### **Settings:**
- [ ] Loads user settings
- [ ] Can save changes
- [ ] Toggle switches work

### **Authentication:**
- [ ] Login works
- [ ] Signup works
- [ ] Password reset works

## 🎉 **Step 10: Success Criteria**

**All Issues Should Be Resolved When:**
- ✅ No red errors in console
- ✅ All pages load normally
- ✅ Database operations work
- ✅ UI elements styled correctly
- ✅ Authentication flows work
- ✅ Data saves and loads properly

## 🆘 **If Issues Persist**

1. **Share specific error messages** from browser console
2. **Check which page** the error occurs on
3. **Verify database tables** exist in Supabase
4. **Test authentication** flow step by step

**Let me know what specific errors you see and I'll help fix them!** 🕵️‍♂️ 