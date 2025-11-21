# Quiz Simplification Analysis

## Problem
Current quiz has 28 questions across 5 phases. User feedback: "too many steps and questions, users will drop off"

## Critical Constraint
**CANNOT remove any required fields from Python ML service QuizAnswers model**

## Python ML Service Required Fields (19 total)

### Demographics & Physical (5 required):
1. ✅ `age` - Collected in registration (NOT in quiz)
2. ✅ `gender` - Collected in registration (NOT in quiz)
3. ✅ `height` - Collected in registration (NOT in quiz)
4. ✅ `currentWeight` - Collected in registration (NOT in quiz)
5. ✅ `targetWeight` - **IN QUIZ** (Phase 1, Q1)

### Goals & Timeline (2 required):
6. ✅ `mainGoal` - **IN QUIZ** (Phase 4, Q1)
7. ✅ `timeFrame` - **IN QUIZ** (Phase 4, Q3)

### Lifestyle & Wellness (5 required):
8. ✅ `lifestyle` - **IN QUIZ** (Phase 5, Q5)
9. ✅ `groceryBudget` - **IN QUIZ** (Phase 3, Q7)
10. ✅ `sleepQuality` - **IN QUIZ** (Phase 5, Q3)
11. ✅ `motivationLevel` (1-10) - **IN QUIZ** (Phase 4, Q4)
12. ✅ `stressLevel` (1-10) - **IN QUIZ** (Phase 5, Q4)

### Nutrition (4 required):
13. ✅ `dietaryStyle` - **IN QUIZ** (Phase 3, Q1)
14. ✅ `mealsPerDay` - **IN QUIZ** (Phase 3, Q4)
15. ✅ `cookingSkill` - **IN QUIZ** (Phase 3, Q5)
16. ✅ `cookingTime` - **IN QUIZ** (Phase 3, Q6)

### Fitness (3 required):
17. ✅ `exerciseFrequency` - **IN QUIZ** (Phase 2, Q1)
18. ✅ `preferredExercise` (List) - **IN QUIZ** (Phase 2, Q2)
19. ✅ `trainingEnvironment` (List) - **IN QUIZ** (Phase 2, Q3)

## Current Quiz Structure

### Phase 1 - Basic Info (6 questions):
- targetWeight ✅ REQUIRED
- bodyType (optional, not skippable)
- bodyFat (optional, skippable) ❌ REMOVE
- neck (optional, skippable) ❌ REMOVE
- waist (optional, skippable) ❌ REMOVE
- hip (optional, skippable) ❌ REMOVE

### Phase 2 - Lifestyle & Activity (5 questions):
- exerciseFrequency ✅ REQUIRED
- preferredExercise ✅ REQUIRED
- trainingEnvironment ✅ REQUIRED
- equipment (optional, skippable) ❌ REMOVE
- injuries (optional, skippable) ❌ REMOVE

### Phase 3 - Nutrition Habits (7 questions):
- dietaryStyle ✅ REQUIRED
- foodAllergies (optional, skippable) ❌ REMOVE
- dislikedFoods (optional, skippable) ❌ REMOVE
- mealsPerDay ✅ REQUIRED
- cookingSkill ✅ REQUIRED
- cookingTime ✅ REQUIRED
- groceryBudget ✅ REQUIRED

### Phase 4 - Goals & Preferences (5 questions):
- mainGoal ✅ REQUIRED
- secondaryGoals (optional, skippable) ❌ REMOVE
- timeFrame ✅ REQUIRED
- motivationLevel ✅ REQUIRED
- challenges (optional, skippable) ❌ REMOVE

### Phase 5 - Health & Medical (5 questions):
- healthConditions (optional, skippable) ❌ REMOVE
- medications (optional, skippable) ❌ REMOVE
- sleepQuality ✅ REQUIRED
- stressLevel ✅ REQUIRED
- lifestyle ✅ REQUIRED

## Simplification Strategy

### Questions to REMOVE (12 optional questions):
1. bodyFat - Can be calculated from neck/waist/hip if needed, but not critical
2. neck - Body composition optional, AI can work without it
3. waist - Body composition optional, AI can work without it
4. hip - Body composition optional, AI can work without it
5. equipment - Can default to "None" or infer from trainingEnvironment
6. injuries - Can default to empty, user can mention in other fields if critical
7. foodAllergies - Can default to empty, less critical for initial plan
8. dislikedFoods - Can default to empty, can be adjusted later
9. secondaryGoals - Can default to empty, mainGoal is sufficient
10. challenges - Can default to empty, can be inferred from other answers
11. healthConditions - Can default to ["None"], user can update profile later
12. medications - Can default to empty, user can update profile later

### Questions to KEEP (15 required + 1 semi-important):
1. targetWeight (REQUIRED)
2. bodyType (optional but provides value, quick single-choice)
3. exerciseFrequency (REQUIRED)
4. preferredExercise (REQUIRED)
5. trainingEnvironment (REQUIRED)
6. dietaryStyle (REQUIRED)
7. mealsPerDay (REQUIRED)
8. cookingSkill (REQUIRED)
9. cookingTime (REQUIRED)
10. groceryBudget (REQUIRED)
11. mainGoal (REQUIRED)
12. timeFrame (REQUIRED)
13. motivationLevel (REQUIRED)
14. sleepQuality (REQUIRED)
15. stressLevel (REQUIRED)
16. lifestyle (REQUIRED)

**Total: 16 questions → Need to reduce to 12**

### Strategy to Get to 12 Questions:

**Option 1: Combine Related Questions into Multi-Part Screens**
1. **Goals & Timeline** - Combine mainGoal + timeFrame (1 screen, 2 inputs)
2. **Wellness Metrics** - Combine motivationLevel + stressLevel (1 screen, 2 sliders)
3. **Meal Preferences** - Combine mealsPerDay + dietaryStyle (1 screen, 2 selects)
4. **Cooking Profile** - Combine cookingSkill + cookingTime + groceryBudget (1 screen, 3 selects)

This reduces 10 questions to 4 screens = saves 6 questions

**Final Count:**
- targetWeight (1)
- bodyType (1)
- exerciseFrequency (1)
- preferredExercise (1)
- trainingEnvironment (1)
- Goals & Timeline combined (1 screen)
- Meal Preferences combined (1 screen)
- Cooking Profile combined (1 screen)
- sleepQuality (1)
- Wellness Metrics combined (1 screen)
- lifestyle (1)

**Total: 11 questions/screens** ✅

**Option 2: Remove bodyType (optional field)**
This brings us to exactly 10 questions/screens, but bodyType provides some value.

## Recommended: Keep 11-12 Questions

Keep bodyType since it's quick and provides value. Final structure:

### NEW SIMPLIFIED QUIZ (11 screens across 3 phases):

**Phase 1: Your Goals (3 screens)**
1. Target Weight
2. Goals & Timeline (mainGoal + timeFrame)
3. Body Type (quick optional)

**Phase 2: Your Activity (3 screens)**
4. Exercise Frequency
5. Preferred Exercises (multi-select)
6. Training Environment (multi-select)

**Phase 3: Your Lifestyle (5 screens)**
7. Meal Preferences (mealsPerDay + dietaryStyle)
8. Cooking Profile (cookingSkill + cookingTime + groceryBudget)
9. Sleep Quality
10. Wellness Metrics (motivationLevel + stressLevel sliders)
11. Lifestyle Habits

## Implementation Notes

1. **Default values for removed fields:**
   ```typescript
   // Set these defaults when submitting quiz:
   equipment: [],
   injuries: null,
   foodAllergies: null,
   dislikedFoods: null,
   secondaryGoals: [],
   challenges: [],
   healthConditions: ["None"],
   medications: null,
   bodyFat: null,
   neck: null,
   waist: null,
   hip: null,
   ```

2. **Multi-part screens** should:
   - Show all fields on one screen
   - Validate all fields before allowing "Next"
   - Use clear visual separation between fields
   - Keep mobile-friendly (stackable layout)

3. **User can always:**
   - Update profile later to add allergies, medications, etc.
   - Skip bodyType if uncertain
   - Get a good AI-generated plan without the optional fields

## Risk Assessment

✅ **SAFE**: All 19 required Python fields are still collected
✅ **SAFE**: Quiz still collects all data needed for AI generation
✅ **IMPROVED UX**: 28 → 11 screens (61% reduction)
✅ **FASTER**: Users more likely to complete shorter quiz
⚠️ **TRADE-OFF**: Less personalization data initially (can be added to profile later)

## Next Steps

1. Update `phases.ts` with new simplified structure
2. Update quiz submission logic to include default values for removed fields
3. Test that AI plan generation still works correctly
4. Monitor completion rates (should increase significantly)
