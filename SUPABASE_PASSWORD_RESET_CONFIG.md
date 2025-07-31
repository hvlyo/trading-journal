# Supabase Password Reset Configuration

## Problem
Password reset links are expiring too quickly. By default, Supabase password reset links expire after 1 hour.

## Solution: Configure Longer Expiration Times

### 1. Go to Supabase Dashboard
1. Log into your Supabase project dashboard
2. Navigate to **Authentication** → **Settings**

### 2. Update Password Reset Settings
In the **Email Templates** section:

1. **Find "Reset Password" template**
2. **Update the expiration time**:
   - Look for `expires_in` parameter
   - Change from `3600` (1 hour) to `86400` (24 hours) or `604800` (7 days)

### 3. Alternative: Update via SQL
You can also update this via SQL in the Supabase SQL Editor:

```sql
-- Update password reset link expiration to 24 hours
UPDATE auth.config
SET value = jsonb_set(
  value,
  '{email_template_reset_password,expires_in}',
  '86400'
)
WHERE key = 'email_template_reset_password';
```

### 4. Test the Configuration
1. Request a password reset from your app
2. Check the email link - it should now be valid for 24 hours
3. Test the complete flow: request → email → click link → set new password

## Additional Settings

### Email Template Customization
You can also customize the email template in Supabase Dashboard:

1. Go to **Authentication** → **Email Templates**
2. Select **"Reset Password"**
3. Customize the subject and content
4. Make sure the link includes the correct redirect URL

### Security Considerations
- **24 hours** is a good balance between security and usability
- **7 days** is more user-friendly but less secure
- Consider your application's security requirements

## Troubleshooting

### If links still expire quickly:
1. Check if you're using the correct Supabase project
2. Verify the configuration was saved
3. Clear browser cache and try again
4. Check Supabase logs for any errors

### If the reset flow doesn't work:
1. Ensure your redirect URL is correct: `https://yourdomain.com/auth?reset=true`
2. Check that your Supabase project URL and keys are correct
3. Verify email templates are properly configured

## Current Implementation
The app is now configured to:
- ✅ Handle password reset requests
- ✅ Process reset links with proper token validation
- ✅ Allow users to set new passwords
- ✅ Redirect back to login after successful reset
- ✅ Handle expired/invalid links gracefully

The only remaining step is to configure the expiration time in your Supabase dashboard. 