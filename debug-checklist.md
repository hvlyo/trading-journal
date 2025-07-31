# 🐛 Debug Checklist - All Issues

## 🔧 **Development Server Issues**
- [ ] Server not starting (wrong directory)
- [ ] Port conflicts
- [ ] Missing dependencies
- [ ] Build errors

## 🗄️ **Database Issues**
- [ ] Wrong column names (camelCase vs snake_case)
- [ ] Missing tables
- [ ] RLS policy conflicts
- [ ] Permission denied errors
- [ ] Connection issues

## 🎨 **UI/UX Issues**
- [ ] Navigation highlight problems
- [ ] Card styling missing borders
- [ ] Button hover animations not working
- [ ] Form validation errors
- [ ] Loading states not showing

## 🔐 **Authentication Issues**
- [ ] Login not working
- [ ] Signup errors
- [ ] Password reset problems
- [ ] Session management issues

## 📊 **Data Loading Issues**
- [ ] Smart withdrawal settings not loading
- [ ] User settings errors
- [ ] Trade data not saving
- [ ] Dashboard metrics not calculating

## 🎯 **Specific Error Types**
- [ ] PGRST116 (No rows found) - NORMAL for new users
- [ ] 42P01 (Table doesn't exist)
- [ ] 42501 (Permission denied)
- [ ] Network errors
- [ ] TypeScript errors
- [ ] React hydration errors

## 🚀 **Quick Fixes Applied**
- [x] Fixed PGRST116 error handling
- [x] Updated database schemas
- [x] Improved error logging
- [x] Added default settings for new users

## 📋 **Next Steps**
1. Start development server
2. Check browser console for errors
3. Test each page functionality
4. Verify database connections
5. Test authentication flow 