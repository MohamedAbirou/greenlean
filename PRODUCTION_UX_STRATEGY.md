# Production UX Strategy for GreenLean Quiz & AI Generation

## 🎯 Core Principles

1. **Speed Perception > Actual Speed** - Make it FEEL fast even if it takes the same time
2. **Progressive Disclosure** - Don't overwhelm users
3. **Immediate Value** - Show results as soon as possible
4. **Trust Through Transparency** - Show what's happening behind the scenes
5. **Iteration-Friendly** - Easy to tweak and regenerate

---

## 📋 PART 1: Optimized Quiz Flow (11 Screens, ~2-3 Minutes)

### Current Issues:
- ❌ 15 separate screens = 15 "Next" button clicks
- ❌ Feels long even though it's not
- ❌ No time estimate shown
- ❌ Questions not ordered by engagement

### Solution: Smart Grouping + Better Ordering

#### **New Structure (11 Screens in 3 Phases)**

**PHASE 1: Quick Wins (3 screens, 30 seconds)**
Get users engaged with easy, motivating questions first.

```
Screen 1: "What's Your Goal?" (Single screen)
├─ Main Goal (dropdown)
├─ Target Weight (number input)
└─ Timeframe (radio buttons)
💡 Why together: These define success, users know answers instantly

Screen 2: "Your Body Type" (Optional, 5 seconds)
└─ Body Type (quick 4-option choice with images)
💡 Skip button prominent: "Not sure? Skip this"

Screen 3: "How Active Are You?" (Single screen)
└─ Exercise Frequency (5 large buttons with icons)
💡 Visual, easy to answer
```

**PHASE 2: Activity & Food (4 screens, 60 seconds)**
Now that they're engaged, get specific preferences.

```
Screen 4: "Exercise Preferences" (Multi-select with search)
└─ Preferred Exercise Types (checkboxes with icons)
💡 Visual grid layout, can select multiple quickly

Screen 5: "Where Do You Train?" (Multi-select)
└─ Training Environment (3 large cards: Gym/Home/Outdoor)
💡 Big touch targets, visual

Screen 6: "Your Eating Style" (Single screen)
├─ Dietary Style (dropdown with icons)
├─ Meals Per Day (4 radio buttons)
└─ Cooking Skill (4 radio buttons)
💡 Why together: All about "how you eat"

Screen 7: "Kitchen Reality Check" (Single screen)
├─ Time Per Meal (4 options)
└─ Grocery Budget (3 options)
💡 Why together: Practical meal planning constraints
```

**PHASE 3: Lifestyle & Wellness (4 screens, 60 seconds)**
Deep personalization for best AI results.

```
Screen 8: "Sleep Quality" (Visual scale)
└─ Sleep Quality (4 radio with hour ranges)
💡 Quick single question

Screen 9: "Energy Levels" (Dual sliders on one screen)
├─ Motivation Level (1-10 slider with emojis)
└─ Stress Level (1-10 slider with emojis)
💡 Why together: Both are "how you feel right now"

Screen 10: "Lifestyle Habits" (Single select)
└─ Smoking/Drinking habits (5 options)
💡 Quick single question

Screen 11: "Review & Submit" (Summary screen)
├─ Show all answers in collapsible sections
├─ "Edit" buttons for each section
├─ Big "Generate My Plan" button
└─ Estimated wait time: "30-60 seconds"
💡 Builds confidence before submission
```

### UX Improvements to Implement:

#### 1. **Show Progress & Time Estimate**
```tsx
// Top of every screen
<QuizProgress
  currentScreen={4}
  totalScreens={11}
  estimatedTimeRemaining="~1 minute"
  phase="Activity & Food"
/>
```

#### 2. **Auto-advance on Some Questions**
```tsx
// For radio buttons, auto-advance after selection (with 300ms delay)
// Feels faster than clicking "Next"
const handleRadioClick = (value) => {
  setAnswer(value);
  setTimeout(() => handleNext(), 300);
};
```

#### 3. **Keyboard Navigation**
```tsx
// Numbers 1-5 for radio options
// Enter to submit
// Backspace to go back
```

#### 4. **Visual Feedback**
```tsx
// Checkmarks appear instantly when answered
// Green highlight on selected options
// Smooth page transitions (slide effect)
```

---

## 🚀 PART 2: AI Generation Experience (The Money Shot!)

### Current Issues:
- ❌ User doesn't know how long it takes
- ❌ No way to track parallel generation
- ❌ Can't regenerate if they don't like it
- ❌ Generic "generating..." is boring

### Solution: Engaging, Transparent Generation Flow

#### **Generation Flow Timeline**

```
USER SUBMITS QUIZ
    ↓
[0-500ms] Calculate macros (INSTANT)
    ↓
Redirect to Dashboard → Show calculations immediately ✅
    ↓
[Background] Start TWO parallel AI generations:
    ├─ Meal Plan (30-45s)
    └─ Workout Plan (25-40s)
    ↓
User sees REAL-TIME progress on each tab
```

#### **Implementation: Smart Loading States**

**File: `src/features/dashboard/components/MealPlanTab.tsx`**

```tsx
interface GenerationProgress {
  status: 'generating' | 'completed' | 'error';
  startedAt: Date;
  estimatedCompletion?: Date;
  progress: number; // 0-100
  currentStep?: string;
  error?: string;
}

const MealPlanTab = () => {
  const { mealPlan, isGenerating } = useMealPlan();
  const [progress, setProgress] = useState<GenerationProgress | null>(null);

  // Poll for progress every 2 seconds
  useEffect(() => {
    if (mealPlan?.status === 'generating') {
      const interval = setInterval(() => {
        // Update estimated progress based on time elapsed
        const elapsed = Date.now() - mealPlan.createdAt;
        const estimatedTotal = 45000; // 45s average
        const currentProgress = Math.min(95, (elapsed / estimatedTotal) * 100);

        setProgress({
          status: 'generating',
          startedAt: new Date(mealPlan.createdAt),
          progress: currentProgress,
          currentStep: getStepMessage(currentProgress),
          estimatedCompletion: new Date(Date.now() + (estimatedTotal - elapsed))
        });
      }, 2000);

      return () => clearInterval(interval);
    }
  }, [mealPlan?.status]);

  if (isGenerating) {
    return <GeneratingState progress={progress} type="meal" />;
  }

  return <MealPlanDisplay plan={mealPlan} />;
};

// Step messages based on progress
const getStepMessage = (progress: number): string => {
  if (progress < 20) return "Analyzing your nutritional needs...";
  if (progress < 40) return "Selecting recipes that match your preferences...";
  if (progress < 60) return "Balancing macros for optimal results...";
  if (progress < 80) return "Creating your personalized meal schedule...";
  return "Almost there! Adding final touches...";
};
```

**Visual Component:**

```tsx
const GeneratingState = ({ progress, type }: {
  progress: GenerationProgress;
  type: 'meal' | 'workout'
}) => {
  const timeRemaining = progress.estimatedCompletion
    ? formatDistanceToNow(progress.estimatedCompletion)
    : '~30 seconds';

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] space-y-6">
      {/* Animated AI Brain Icon */}
      <div className="relative">
        <Brain className="w-20 h-20 text-primary animate-pulse" />
        <Sparkles className="absolute -top-2 -right-2 w-8 h-8 text-yellow-500 animate-bounce" />
      </div>

      {/* Progress Bar */}
      <div className="w-full max-w-md">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-muted-foreground">{progress.currentStep}</span>
          <span className="font-semibold text-primary">{Math.round(progress.progress)}%</span>
        </div>
        <Progress value={progress.progress} className="h-2" />
        <p className="text-xs text-muted-foreground mt-2 text-center">
          Estimated time: {timeRemaining}
        </p>
      </div>

      {/* What's Happening */}
      <div className="bg-card border rounded-lg p-4 max-w-md">
        <h4 className="font-semibold mb-2 flex items-center gap-2">
          <Zap className="w-4 h-4 text-yellow-500" />
          What's happening behind the scenes?
        </h4>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li className="flex items-center gap-2">
            <Check className="w-4 h-4 text-green-500" />
            Calculated your caloric needs
          </li>
          <li className="flex items-center gap-2">
            {progress.progress > 30 ? (
              <Check className="w-4 h-4 text-green-500" />
            ) : (
              <Loader2 className="w-4 h-4 animate-spin" />
            )}
            AI is crafting personalized {type} plan
          </li>
          <li className="flex items-center gap-2">
            {progress.progress > 90 ? (
              <Check className="w-4 h-4 text-green-500" />
            ) : (
              <div className="w-4 h-4 border-2 border-muted rounded-full" />
            )}
            Validating nutritional balance
          </li>
        </ul>
      </div>

      {/* Fun Tip */}
      <div className="text-center text-sm text-muted-foreground max-w-md">
        <Lightbulb className="w-4 h-4 inline mr-1" />
        <strong>Did you know?</strong> Our AI considers 100+ factors to create your perfect plan!
      </div>
    </div>
  );
};
```

---

## 🔄 PART 3: Regeneration & Tweaking

### Allow users to regenerate plans easily

```tsx
const MealPlanActions = ({ planId, userId }: { planId: string; userId: string }) => {
  const [isRegenerating, setIsRegenerating] = useState(false);
  const { mutate: regenerate } = useRegenerateMealPlan();

  const handleRegenerate = async (options?: { varyRecipes?: boolean }) => {
    setIsRegenerating(true);

    regenerate({
      userId,
      planId,
      options: {
        varyRecipes: options?.varyRecipes ?? true,
        keepMacros: true, // Keep same macros, just different recipes
      }
    }, {
      onSuccess: () => {
        toast.success("New meal plan generated! Check it out below.");
        setIsRegenerating(false);
      },
      onError: () => {
        toast.error("Failed to regenerate. Try again?");
        setIsRegenerating(false);
      }
    });
  };

  return (
    <div className="flex gap-2">
      <Button
        variant="outline"
        onClick={() => handleRegenerate({ varyRecipes: true })}
        disabled={isRegenerating}
      >
        <RefreshCw className={`w-4 h-4 mr-2 ${isRegenerating ? 'animate-spin' : ''}`} />
        Regenerate Plan
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon">
            <Settings className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={() => navigate('/quiz')}>
            <Edit className="w-4 h-4 mr-2" />
            Update Preferences
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleRegenerate({ varyRecipes: true })}>
            <Shuffle className="w-4 h-4 mr-2" />
            Different Recipes (Same Macros)
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
```

---

## 🧠 PART 4: AI Prompt Optimization

### Make AI responses MORE reliable and BETTER quality

**File: `ml_service/prompts/meal_plan.py`**

Add structured output instructions + examples:

```python
def generate_meal_plan_prompt(quiz_data: QuizAnswers, calculations: dict) -> str:
    return f"""You are a professional nutritionist creating a personalized 7-day meal plan.

USER PROFILE:
- Goal: {quiz_data.mainGoal}
- Target Daily Calories: {calculations['target_calories']} kcal
- Macros: Protein {calculations['protein_grams']}g | Carbs {calculations['carbs_grams']}g | Fats {calculations['fat_grams']}g
- Dietary Style: {quiz_data.dietaryStyle}
- Cooking Skill: {quiz_data.cookingSkill}
- Time Per Meal: {quiz_data.cookingTime}
- Budget: {quiz_data.groceryBudget}

CRITICAL REQUIREMENTS:
1. MUST return valid JSON matching the exact schema below
2. MUST include ALL required fields - missing fields will cause errors
3. Each day MUST have breakfast, lunch, dinner
4. Daily calories MUST be within ±100 of target ({calculations['target_calories']} kcal)
5. Macros MUST be balanced according to target ratios

JSON SCHEMA (YOU MUST FOLLOW THIS EXACTLY):
{{
  "weekly_plan": [
    {{
      "day": "monday",  // MUST be lowercase
      "breakfast": {{
        "name": "Oatmeal with Berries",  // REQUIRED
        "calories": 350,  // REQUIRED, must be number
        "protein": 12.0,  // REQUIRED, must be float
        "carbs": 55.0,  // REQUIRED
        "fats": 8.0,  // REQUIRED
        "ingredients": ["oats", "berries", "honey"],  // REQUIRED, array
        "instructions": ["Step 1...", "Step 2..."],  // REQUIRED, array
        "meal_type": "breakfast",  // REQUIRED: breakfast|lunch|dinner|snack
        "prep_time": 5,  // OPTIONAL, minutes
        "cook_time": 10  // OPTIONAL, minutes
      }},
      "lunch": {{ /* same structure */ }},
      "dinner": {{ /* same structure */ }},
      "snacks": [],  // OPTIONAL array
      "total_calories": 1950,  // REQUIRED
      "total_protein": 140.0,  // REQUIRED
      "total_carbs": 200.0,  // REQUIRED
      "total_fats": 55.0  // REQUIRED
    }}
    // ... repeat for all 7 days
  ],
  "weekly_summary": {{
    "avg_daily_calories": 1950,  // REQUIRED
    "avg_daily_protein": 140.0,  // REQUIRED
    "avg_daily_carbs": 200.0,  // REQUIRED
    "avg_daily_fats": 55.0,  // REQUIRED
    "total_unique_meals": 21,  // OPTIONAL
    "prep_friendly": true  // OPTIONAL
  }},
  "shopping_list": ["ingredient1", "ingredient2"],  // OPTIONAL
  "meal_prep_tips": ["tip1", "tip2"],  // OPTIONAL
  "nutritional_notes": "Optional notes"  // OPTIONAL
}}

EXAMPLE OUTPUT (first 2 days):
{EXAMPLE_MEAL_PLAN_JSON}

QUALITY GUIDELINES:
- Recipes must match cooking skill level ({quiz_data.cookingSkill})
- Meals must fit time constraint ({quiz_data.cookingTime})
- Use budget-appropriate ingredients ({quiz_data.groceryBudget})
- Variety: Don't repeat meals within 3 days
- Real recipes: Use actual cooking methods, not generic descriptions

NOW CREATE THE COMPLETE 7-DAY PLAN:
Return ONLY the JSON, no markdown formatting, no explanations.
"""
```

**Add validation retry logic:**

```python
# ml_service/services/ai_service.py

async def generate_meal_plan_with_retry(
    self,
    prompt: str,
    user_id: str,
    max_retries: int = 3
) -> Dict[str, Any]:
    """Generate meal plan with automatic retry on validation failure"""

    last_error = None

    for attempt in range(max_retries):
        try:
            logger.info(f"Meal plan generation attempt {attempt + 1}/{max_retries}")

            # Generate plan
            plan_data = await self.generate_plan(
                prompt=prompt,
                provider="openai",
                model="gpt-4o-mini",
                user_id=user_id,
                plan_type="meal"
            )

            # If we got here, validation passed!
            logger.info(f"Meal plan generated successfully on attempt {attempt + 1}")
            return plan_data

        except ValidationError as e:
            last_error = e
            logger.warning(f"Validation failed on attempt {attempt + 1}: {str(e)}")

            # Append validation errors to prompt for next attempt
            if attempt < max_retries - 1:
                error_fields = [err['loc'][0] for err in e.errors()]
                prompt += f"\n\nPREVIOUS ATTEMPT FAILED - Missing fields: {error_fields}. MUST include these fields!"

                # Wait before retry
                await asyncio.sleep(2 ** attempt)  # Exponential backoff

    # All retries failed
    logger.error(f"Meal plan generation failed after {max_retries} attempts")
    raise HTTPException(
        status_code=500,
        detail=f"Failed to generate valid meal plan after {max_retries} attempts. Last error: {str(last_error)}"
    )
```

---

## ⚡ PART 5: Technical Implementation Checklist

### Frontend Changes:

- [ ] **Quiz Flow** (`src/features/quiz/`)
  - [ ] Reorder questions (easy → complex)
  - [ ] Combine into 11 screens
  - [ ] Add auto-advance on radio buttons
  - [ ] Show time estimates
  - [ ] Add summary/review screen

- [ ] **Generation Progress** (`src/features/dashboard/`)
  - [ ] Add `GeneratingState` component with progress bar
  - [ ] Show current step messages
  - [ ] Estimate time remaining
  - [ ] Add "What's happening" explainer
  - [ ] Show fun tips while waiting

- [ ] **Regeneration** (`src/features/dashboard/`)
  - [ ] Add "Regenerate" button to meal/workout tabs
  - [ ] Add "Tweak preferences" option
  - [ ] Keep macros but vary recipes option

### Backend Changes:

- [ ] **AI Prompts** (`ml_service/prompts/`)
  - [ ] Add detailed schema examples
  - [ ] Add quality guidelines
  - [ ] Add validation error feedback loop

- [ ] **Error Handling** (`ml_service/services/`)
  - [ ] Implement retry logic with better prompts
  - [ ] Add progress tracking endpoint
  - [ ] Add regeneration endpoint

- [ ] **Database** (`supabase`)
  - [ ] Add `generation_progress` table for real-time updates
  - [ ] Add `started_at`, `estimated_completion` fields
  - [ ] Add regeneration history

---

## 📊 Success Metrics

### Before Launch:
- Average quiz completion time: Target < 3 minutes
- Quiz abandonment rate: Target < 20%
- Generation success rate: Target > 95%
- Average generation time: Target < 45 seconds

### Post-Launch:
- User satisfaction with AI plans: Target > 4.2/5
- Regeneration rate: Track (high = good iteration, low = good first gen)
- Time to first value: Target < 2 minutes (quiz + calculations)

---

## 🚀 Implementation Priority

### Week 1 (Critical):
1. ✅ Fix lazy loading, quiz errors, realtime (DONE)
2. Quiz flow optimization (group screens, reorder)
3. Generation progress UI

### Week 2 (Important):
4. AI prompt improvements
5. Regeneration feature
6. Error handling improvements

### Week 3 (Polish):
7. Animations and micro-interactions
8. A/B test quiz variations
9. Analytics integration

---

This strategy keeps ALL required fields while dramatically improving the user experience through better ordering, grouping, feedback, and transparency.
