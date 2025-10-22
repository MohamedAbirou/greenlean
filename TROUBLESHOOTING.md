# Troubleshooting Guide

## Issue: ML Service "cannot access local variable 'json'" Error

**Status**: ✅ FIXED

**Solution**: Restart your ML service after pulling the latest code.

```bash
# Stop ML service (Ctrl+C in the terminal running it)
cd ml_service
source venv/bin/activate  # or venv\Scripts\activate on Windows
python main.py
```

---

## Issue: Quiz Doesn't Generate Plans

### Symptom
- Quiz completes but dashboard shows no AI-generated plans
- Frontend shows "Creating Your Personalized Plan" indefinitely
- Console errors about failed fetch requests

### Possible Causes & Solutions

#### 1. ML Service Not Running
**Check**: Is the ML service running on port 8000?
```bash
curl http://localhost:8000/health
```

**Expected Response**:
```json
{
  "status": "healthy",
  "service": "AI Health & Fitness ML Service",
  "version": "2.0.0",
  "ai_providers": {
    "openai": true,
    "anthropic": false,
    "gemini": false
  }
}
```

**Solution**: Start ML service
```bash
cd ml_service
source venv/bin/activate
python main.py
```

#### 2. Missing OpenAI API Key
**Check**: Look at ML service startup logs
```
INFO:__main__:Database connection pool initialized
```

**Check health endpoint**: `ai_providers.openai` should be `true`

**Solution**: Add OpenAI API key to `ml_service/.env`:
```env
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxx
```

Get your key from: https://platform.openai.com/api-keys

#### 3. OpenAI API Rate Limit or No Credits
**Check ML service logs for**:
```
ERROR:__main__:AI model call failed: Rate limit exceeded
ERROR:__main__:AI model call failed: You exceeded your current quota
```

**Solutions**:
- Wait a few minutes (rate limit resets)
- Add billing/credits to your OpenAI account
- Use a different API key
- Switch to `gpt-4o-mini` (cheaper) in the code

#### 4. Database Connection Failed
**Check ML service startup for**:
```
ERROR: Could not connect to database
asyncpg.exceptions.InvalidPasswordError
```

**Solution**: Check `ml_service/.env` has correct DATABASE_URL:
```env
DATABASE_URL=postgresql://postgres:I@M@G3N1u$@db.rsufjeprivwzzygrbvdb.supabase.co:5432/postgres
```

**Test database connection**:
```bash
psql "postgresql://postgres:I@M@G3N1u$@db.rsufjeprivwzzygrbvdb.supabase.co:5432/postgres" -c "SELECT 1"
```

#### 5. CORS Errors in Browser Console
**Check browser console (F12) for**:
```
Access to fetch at 'http://localhost:8000/generate-complete-plan' from origin 'http://localhost:5173' has been blocked by CORS policy
```

**Solution**: Verify `ml_service/main.py` has correct origins:
```python
origins = [
    "http://localhost:5173",
    "https://nehiwycctshtttprvuwy.supabase.co",
    "*"
]
```

Restart ML service after making changes.

---

## Issue: Plans Generate But Don't Show in Dashboard

### Symptom
- Quiz completes successfully
- ML service logs show successful generation
- Dashboard shows empty or no plans

### Solutions

#### 1. Check localStorage
Open browser console (F12) and run:
```javascript
console.log(localStorage.getItem('aiGeneratedPlans'))
```

If `null`, plans weren't saved. Check frontend console for errors.

#### 2. Check Database
Go to Supabase Dashboard → Table Editor → `ai_meal_plans` and `ai_workout_plans`

Should see rows with your `user_id` and `is_active = true`

#### 3. Clear Cache and Regenerate
```javascript
// In browser console
localStorage.clear()
location.reload()
```

Then take the quiz again.

---

## Issue: "AI Response Not Valid JSON" Error

### Symptom
ML service logs show:
```
ERROR:__main__:Failed to parse AI response as JSON
```

### Cause
OpenAI occasionally returns non-JSON or malformed JSON

### Solutions

#### 1. Try Again
Simply retake the quiz. AI responses can vary.

#### 2. Check the AI Response in Logs
Look for the logged response:
```
ERROR:__main__:AI Response (first 1000 chars): ...
```

If it starts with explanatory text instead of `{`, the AI didn't follow instructions.

#### 3. Improve the Prompt (Advanced)
Edit `ml_service/main.py` prompts to emphasize JSON-only output.

---

## Issue: ML Service Takes Too Long (>30 seconds)

### Cause
- Using `gpt-4o` instead of `gpt-4o-mini`
- OpenAI API slow response
- Complex prompts

### Solutions

#### 1. Use Faster Model
In `src/pages/Quiz.tsx`, change model:
```typescript
const completePlan = await mlService.generateCompletePlan(
  user.id,
  quizData.id,
  answers,
  calculations,
  "openai",
  "gpt-4o-mini"  // ← Faster and cheaper
);
```

#### 2. Increase Frontend Timeout
In `src/services/mlService.ts`, the fetch has default browser timeout.
Generation typically takes 10-20 seconds, which is normal.

---

## Issue: High OpenAI Costs

### Current Costs (gpt-4o-mini)
- ~$0.002 per complete plan generation
- 1000 users ≈ $2.00

### Optimization Strategies

#### 1. Cache Plans (Recommended)
Plans are already cached in database and localStorage.
Don't regenerate unless user explicitly requests.

#### 2. Rate Limiting
Limit regeneration to once per day or week per user.

#### 3. Use Even Cheaper Models
Consider fine-tuning a smaller model on your specific format.

---

## Issue: Frontend Shows "No Health Profile Found"

### Cause
User hasn't completed the quiz yet.

### Solution
Take the quiz first: `/quiz`

---

## Issue: Workout/Meal Logging Not Working

### Symptom
- Click "Log Meal" or "Log Workout" buttons
- Modal opens but save fails
- Console errors

### Check

#### 1. User Authenticated
Logging requires authentication. Check if signed in.

#### 2. Database RLS Policies
All tables have RLS enabled. Verify in Supabase Dashboard:
- Go to Authentication → Policies
- Check `daily_nutrition_logs` and `workout_logs` have INSERT policies

#### 3. Browser Console
Look for specific error messages in console (F12)

---

## Issue: Water Intake Not Tracking

### Solution
The water intake feature is ready in the database but not yet implemented in the UI.

To add water tracking, create a new component in `src/components/dashboard/WaterIntakeWidget.tsx`

---

## Getting Help

If none of these solutions work:

1. **Check ML Service Logs**: Look for detailed error messages
2. **Check Browser Console**: Press F12 → Console tab
3. **Check Supabase Logs**: Dashboard → Logs & Reports
4. **Test Endpoints Manually**:
   ```bash
   curl http://localhost:8000/health
   ```

5. **Verify Environment Variables**:
   ```bash
   # Check .env exists
   cat .env

   # Check ml_service/.env exists
   cat ml_service/.env
   ```

---

## Quick Fix Checklist

When something breaks, run through this:

- [ ] ML service is running (`curl http://localhost:8000/health`)
- [ ] Frontend is running (`http://localhost:5173`)
- [ ] Database is accessible (check Supabase dashboard)
- [ ] OpenAI API key is valid and has credits
- [ ] User is signed in
- [ ] Browser console has no CORS errors
- [ ] Both .env files are correctly configured

---

## Common Success Patterns

✅ **Everything Working**:
1. ML service logs: "Database connection pool initialized"
2. Health endpoint returns `"status": "healthy"`
3. Quiz completes in ~15 seconds
4. Dashboard shows AI-generated plans
5. Logging modals open and save successfully

✅ **Typical Flow**:
```
User takes quiz →
Frontend calls /generate-complete-plan →
ML service calls OpenAI (10-20s) →
Saves to database →
Returns to frontend →
Dashboard shows plans →
User can log meals/workouts
```

That's the happy path! 🎉
