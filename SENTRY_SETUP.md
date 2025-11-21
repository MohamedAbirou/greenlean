# Sentry Error Tracking Setup Guide

## Overview
Sentry is now integrated into GreenLean for production-grade error tracking and performance monitoring.

---

## 1. Install Sentry Package

Run this command to install the required Sentry packages:

```bash
npm install --save @sentry/react
```

Or with yarn:
```bash
yarn add @sentry/react
```

---

## 2. Create Free Sentry Account

1. Go to [https://sentry.io/signup/](https://sentry.io/signup/)
2. Sign up for a free account (5,000 errors/month included)
3. Create a new project:
   - Platform: **React**
   - Project name: **greenlean** (or your preferred name)
4. Copy your **DSN** (Data Source Name) - it looks like:
   ```
   https://[key]@[org].ingest.sentry.io/[project-id]
   ```

---

## 3. Configure Environment Variables

Add these variables to your `.env` file:

```env
# Sentry Configuration
VITE_SENTRY_DSN=https://your-sentry-dsn-here
VITE_SENTRY_ENVIRONMENT=production  # or development, staging, etc.
```

**For Production (Vercel):**
1. Go to your Vercel project settings
2. Navigate to "Environment Variables"
3. Add:
   - `VITE_SENTRY_DSN` = your Sentry DSN
   - `VITE_SENTRY_ENVIRONMENT` = `production`

---

## 4. What's Already Configured

✅ **Automatic Error Reporting**
- All unhandled errors are automatically sent to Sentry
- Errors include stack traces, user context, and breadcrumbs

✅ **Performance Monitoring**
- React Router navigation tracking
- 10% of production transactions sampled
- 100% of development transactions sampled

✅ **Session Replay**
- 10% of normal sessions recorded
- 100% of error sessions recorded
- All text and media masked for privacy

✅ **Smart Filtering**
- Ignores common browser extension errors
- Filters out network errors in development
- Excludes sensitive data (PII)

✅ **React Router Integration**
- Automatic route tracking
- Performance metrics per route

---

## 5. Usage in Code

### Automatic Error Catching
Most errors are caught automatically by the ErrorBoundary. No code changes needed!

### Manual Error Reporting
```typescript
import { captureException, captureMessage } from '@/lib/sentry/config';

// Report an exception
try {
  someDangerousOperation();
} catch (error) {
  captureException(error as Error, {
    context: 'additional info',
    userId: user.id,
  });
}

// Report a message
captureMessage('User completed quiz', 'info');
```

### Set User Context (for better debugging)
```typescript
import { setUserContext, clearUserContext } from '@/lib/sentry/config';

// On login
setUserContext({
  id: user.id,
  email: user.email,
  username: user.name,
});

// On logout
clearUserContext();
```

### Add Custom Context
```typescript
import { setContext } from '@/lib/sentry/config';

setContext('quiz', {
  questionNumber: 5,
  phase: 'nutrition',
  answersCount: 12,
});
```

---

## 6. Integration Points

### Where Sentry is Active:

1. **Application Root** (`src/main.tsx`)
   - Sentry initialized on app startup
   - Global ErrorBoundary wraps entire app

2. **All Routes**
   - React Router integration tracks page views
   - Automatic performance monitoring

3. **Manual Tracking** (Optional)
   - You can add Sentry to specific try/catch blocks
   - Log important events as messages

---

## 7. Testing Sentry

### Test Error Reporting:
Add this button temporarily to any page:

```tsx
<button onClick={() => {
  throw new Error("Sentry test error!");
}}>
  Test Sentry
</button>
```

Click it and check your Sentry dashboard - you should see the error appear within seconds!

### Test in Development:
1. Set `VITE_SENTRY_DSN` in `.env.local`
2. Run `npm run dev`
3. Trigger an error
4. Check Sentry dashboard

---

## 8. Sentry Dashboard

Once configured, you can:

- **View errors**: See all errors with stack traces
- **Track performance**: Monitor slow pages and operations
- **User feedback**: See which users are affected
- **Releases**: Track errors by deployment version
- **Alerts**: Get notified via email/Slack when errors spike

---

## 9. Best Practices

### DO:
✅ Set user context on login
✅ Clear user context on logout
✅ Add custom context for important operations (quiz, plan generation)
✅ Monitor Sentry dashboard weekly
✅ Set up alerts for critical errors

### DON'T:
❌ Log sensitive data (passwords, API keys, payment info)
❌ Ignore errors in dashboard - they're real user issues!
❌ Set sample rate to 100% in production (expensive)

---

## 10. Cost

**Free Tier:**
- 5,000 errors/month
- 10,000 transactions/month
- 500 replays/month
- 1 user

**Should be sufficient for MVP.** If you exceed limits, Sentry will just stop collecting data (won't break your app).

---

## 11. Alternative: Skip Sentry

If you don't want Sentry right now:

1. **Don't install the package** - app will work fine
2. The code checks for `VITE_SENTRY_DSN` and gracefully skips if missing
3. Basic ErrorBoundary still works for graceful error handling

**However**, without Sentry, you won't know about production errors unless users report them!

---

## 12. Next Steps After Setup

1. ✅ Install package: `npm install @sentry/react`
2. ✅ Sign up for Sentry account
3. ✅ Add `VITE_SENTRY_DSN` to `.env` and Vercel
4. ✅ Test with a thrown error
5. ✅ Set up email/Slack alerts in Sentry dashboard
6. ✅ Add user context in login flow (optional but recommended)

---

## Support

**Sentry Documentation:** https://docs.sentry.io/platforms/javascript/guides/react/

**Issue?** Check `src/lib/sentry/config.ts` for configuration options.
