import { foods } from "./foods";

export interface MealComponent {
  food: keyof typeof foods;
  base: number; // base grams before scaling
}

export interface MealTemplate {
  items: MealComponent[];
  name?: string; // Optional descriptive name for the meal
  difficulty?: 'easy' | 'medium' | 'advanced'; // Cooking difficulty
  prepTime?: number; // Estimated prep time in minutes
}

export const mealTemplates = {
  omnivore: {
    breakfast: [
      { 
        items: [{ food: "oats", base: 50 }, { food: "greekYogurt", base: 150 }, { food: "berries", base: 80 }, { food: "almonds", base: 15 }],
        name: "Berry Overnight Oats",
        difficulty: 'easy',
        prepTime: 5
      },
      { 
        items: [{ food: "egg", base: 120 }, { food: "spinach", base: 50 }, { food: "wholeWheatBread", base: 40 }, { food: "avocado", base: 50 }],
        name: "Avocado Toast with Scrambled Eggs",
        difficulty: 'easy',
        prepTime: 10
      },
      { 
        items: [{ food: "cottageCheese", base: 200 }, { food: "banana", base: 100 }, { food: "walnuts", base: 15 }],
        name: "Cottage Cheese Bowl",
        difficulty: 'easy',
        prepTime: 3
      },
      { 
        items: [{ food: "wholeWheatBread", base: 60 }, { food: "egg", base: 100 }, { food: "cheese", base: 20 }, { food: "tomatoes", base: 50 }],
        name: "Breakfast Sandwich",
        difficulty: 'medium',
        prepTime: 15
      },
    ],
    lunch: [
      { 
        items: [{ food: "chickenBreast", base: 150 }, { food: "brownRice", base: 120 }, { food: "broccoli", base: 100 }, { food: "oliveOil", base: 10 }],
        name: "Chicken & Rice Bowl",
        difficulty: 'medium',
        prepTime: 25
      },
      { 
        items: [{ food: "salmon", base: 150 }, { food: "quinoa", base: 100 }, { food: "spinach", base: 80 }, { food: "bellPeppers", base: 50 }],
        name: "Salmon Quinoa Bowl",
        difficulty: 'medium',
        prepTime: 20
      },
      { 
        items: [{ food: "leanBeef", base: 120 }, { food: "sweetPotato", base: 150 }, { food: "asparagus", base: 80 }, { food: "oliveOil", base: 8 }],
        name: "Beef & Sweet Potato",
        difficulty: 'medium',
        prepTime: 30
      },
      { 
        items: [{ food: "tuna", base: 100 }, { food: "wholeWheatBread", base: 60 }, { food: "avocado", base: 50 }, { food: "tomatoes", base: 40 }],
        name: "Tuna Avocado Sandwich",
        difficulty: 'easy',
        prepTime: 10
      },
    ],
    dinner: [
      { 
        items: [{ food: "chickenBreast", base: 160 }, { food: "sweetPotato", base: 150 }, { food: "broccoli", base: 100 }, { food: "oliveOil", base: 12 }],
        name: "Herb-Crusted Chicken",
        difficulty: 'medium',
        prepTime: 35
      },
      { 
        items: [{ food: "salmon", base: 150 }, { food: "quinoa", base: 100 }, { food: "spinach", base: 100 }, { food: "mushrooms", base: 60 }],
        name: "Baked Salmon with Quinoa",
        difficulty: 'medium',
        prepTime: 30
      },
      { 
        items: [{ food: "porkTenderloin", base: 140 }, { food: "whitePotato", base: 150 }, { food: "brusselsSprouts", base: 80 }, { food: "oliveOil", base: 10 }],
        name: "Pork Tenderloin Dinner",
        difficulty: 'advanced',
        prepTime: 45
      },
      { 
        items: [{ food: "turkeyBreast", base: 150 }, { food: "brownRice", base: 120 }, { food: "kale", base: 80 }, { food: "carrots", base: 60 }],
        name: "Turkey & Rice Stir-fry",
        difficulty: 'medium',
        prepTime: 25
      },
    ],
    snacks: [
      { 
        items: [{ food: "greekYogurt", base: 200 }, { food: "berries", base: 60 }, { food: "almonds", base: 15 }],
        name: "Greek Yogurt Parfait",
        difficulty: 'easy',
        prepTime: 2
      },
      { 
        items: [{ food: "cottageCheese", base: 150 }, { food: "apple", base: 100 }, { food: "walnuts", base: 10 }],
        name: "Apple Cottage Cheese",
        difficulty: 'easy',
        prepTime: 3
      },
      { 
        items: [{ food: "hardBoiledEgg", base: 100 }, { food: "avocado", base: 50 }],
        name: "Egg & Avocado",
        difficulty: 'easy',
        prepTime: 5
      },
      { 
        items: [{ food: "cheese", base: 30 }, { food: "wholeWheatBread", base: 30 }, { food: "tomatoes", base: 40 }],
        name: "Cheese & Tomato Toast",
        difficulty: 'easy',
        prepTime: 5
      },
    ],
  },

  vegetarian: {
    breakfast: [
      { 
        items: [{ food: "oats", base: 50 }, { food: "greekYogurt", base: 150 }, { food: "berries", base: 80 }, { food: "almonds", base: 20 }],
        name: "Protein Overnight Oats",
        difficulty: 'easy',
        prepTime: 5
      },
      { 
        items: [{ food: "egg", base: 120 }, { food: "spinach", base: 50 }, { food: "cheese", base: 20 }, { food: "wholeWheatBread", base: 40 }],
        name: "Vegetarian Scramble",
        difficulty: 'easy',
        prepTime: 10
      },
      { 
        items: [{ food: "cottageCheese", base: 200 }, { food: "banana", base: 100 }, { food: "chiaSeeds", base: 10 }],
        name: "Chia Cottage Cheese Bowl",
        difficulty: 'easy',
        prepTime: 3
      },
    ],
    lunch: [
      { 
        items: [{ food: "lentils", base: 200 }, { food: "quinoa", base: 120 }, { food: "broccoli", base: 100 }, { food: "oliveOil", base: 10 }],
        name: "Lentil Quinoa Bowl",
        difficulty: 'medium',
        prepTime: 25
      },
      { 
        items: [{ food: "chickpeas", base: 150 }, { food: "brownRice", base: 120 }, { food: "spinach", base: 80 }, { food: "tomatoes", base: 60 }],
        name: "Chickpea Rice Bowl",
        difficulty: 'medium',
        prepTime: 20
      },
      { 
        items: [{ food: "blackBeans", base: 150 }, { food: "sweetPotato", base: 150 }, { food: "bellPeppers", base: 60 }, { food: "avocado", base: 50 }],
        name: "Black Bean Sweet Potato",
        difficulty: 'medium',
        prepTime: 30
      },
    ],
    dinner: [
      { 
        items: [{ food: "tofu", base: 150 }, { food: "brownRice", base: 120 }, { food: "spinach", base: 100 }, { food: "mushrooms", base: 60 }],
        name: "Tofu Stir-fry",
        difficulty: 'medium',
        prepTime: 25
      },
      { 
        items: [{ food: "lentils", base: 180 }, { food: "quinoa", base: 100 }, { food: "kale", base: 80 }, { food: "carrots", base: 60 }],
        name: "Lentil Curry Bowl",
        difficulty: 'advanced',
        prepTime: 40
      },
      { 
        items: [{ food: "chickpeas", base: 150 }, { food: "sweetPotato", base: 150 }, { food: "broccoli", base: 100 }, { food: "oliveOil", base: 12 }],
        name: "Roasted Chickpea Bowl",
        difficulty: 'medium',
        prepTime: 35
      },
    ],
    snacks: [
      { 
        items: [{ food: "cheese", base: 40 }, { food: "apple", base: 100 }, { food: "almonds", base: 15 }],
        name: "Cheese & Apple",
        difficulty: 'easy',
        prepTime: 2
      },
      { 
        items: [{ food: "greekYogurt", base: 200 }, { food: "berries", base: 60 }, { food: "walnuts", base: 10 }],
        name: "Berry Yogurt Bowl",
        difficulty: 'easy',
        prepTime: 3
      },
      { 
        items: [{ food: "cottageCheese", base: 150 }, { food: "pineapple", base: 80 }, { food: "chiaSeeds", base: 8 }],
        name: "Tropical Cottage Cheese",
        difficulty: 'easy',
        prepTime: 3
      },
    ],
  },

  vegan: {
    breakfast: [
      { 
        items: [{ food: "oats", base: 50 }, { food: "almondMilk", base: 200 }, { food: "berries", base: 80 }, { food: "almonds", base: 20 }],
        name: "Vegan Overnight Oats",
        difficulty: 'easy',
        prepTime: 5
      },
      { 
        items: [{ food: "tofu", base: 100 }, { food: "spinach", base: 50 }, { food: "wholeWheatBread", base: 40 }, { food: "avocado", base: 50 }],
        name: "Tofu Scramble Toast",
        difficulty: 'medium',
        prepTime: 15
      },
      { 
        items: [{ food: "quinoa", base: 80 }, { food: "almondMilk", base: 150 }, { food: "banana", base: 100 }, { food: "chiaSeeds", base: 10 }],
        name: "Quinoa Breakfast Bowl",
        difficulty: 'easy',
        prepTime: 10
      },
    ],
    lunch: [
      { 
        items: [{ food: "lentils", base: 200 }, { food: "quinoa", base: 120 }, { food: "broccoli", base: 100 }, { food: "oliveOil", base: 10 }],
        name: "Lentil Quinoa Power Bowl",
        difficulty: 'medium',
        prepTime: 25
      },
      { 
        items: [{ food: "chickpeas", base: 150 }, { food: "brownRice", base: 120 }, { food: "spinach", base: 80 }, { food: "tomatoes", base: 60 }],
        name: "Chickpea Rice Bowl",
        difficulty: 'medium',
        prepTime: 20
      },
      { 
        items: [{ food: "blackBeans", base: 150 }, { food: "sweetPotato", base: 150 }, { food: "bellPeppers", base: 60 }, { food: "avocado", base: 50 }],
        name: "Black Bean Sweet Potato",
        difficulty: 'medium',
        prepTime: 30
      },
    ],
    dinner: [
      { 
        items: [{ food: "tofu", base: 180 }, { food: "sweetPotato", base: 150 }, { food: "spinach", base: 100 }, { food: "mushrooms", base: 60 }],
        name: "Tofu Sweet Potato Bowl",
        difficulty: 'medium',
        prepTime: 30
      },
      { 
        items: [{ food: "tempeh", base: 150 }, { food: "brownRice", base: 120 }, { food: "kale", base: 80 }, { food: "carrots", base: 60 }],
        name: "Tempeh Stir-fry",
        difficulty: 'medium',
        prepTime: 25
      },
      { 
        items: [{ food: "lentils", base: 180 }, { food: "quinoa", base: 100 }, { food: "broccoli", base: 100 }, { food: "oliveOil", base: 12 }],
        name: "Lentil Curry Bowl",
        difficulty: 'advanced',
        prepTime: 40
      },
    ],
    snacks: [
      { 
        items: [{ food: "almonds", base: 20 }, { food: "apple", base: 100 }],
        name: "Apple & Almonds",
        difficulty: 'easy',
        prepTime: 1
      },
      { 
        items: [{ food: "avocado", base: 80 }, { food: "wholeWheatBread", base: 30 }],
        name: "Avocado Toast",
        difficulty: 'easy',
        prepTime: 5
      },
      { 
        items: [{ food: "banana", base: 100 }, { food: "almonds", base: 15 }, { food: "chiaSeeds", base: 8 }],
        name: "Banana Chia Bowl",
        difficulty: 'easy',
        prepTime: 3
      },
    ],
  },

  keto: {
    breakfast: [
      { 
        items: [{ food: "egg", base: 150 }, { food: "avocado", base: 80 }, { food: "oliveOil", base: 10 }],
        name: "Avocado Scrambled Eggs",
        difficulty: 'easy',
        prepTime: 10
      },
      { 
        items: [{ food: "egg", base: 120 }, { food: "cheese", base: 30 }, { food: "spinach", base: 50 }, { food: "oliveOil", base: 8 }],
        name: "Cheesy Spinach Omelet",
        difficulty: 'medium',
        prepTime: 12
      },
      { 
        items: [{ food: "greekYogurt", base: 200 }, { food: "almonds", base: 20 }, { food: "coconutOil", base: 5 }],
        name: "Keto Yogurt Bowl",
        difficulty: 'easy',
        prepTime: 3
      },
    ],
    lunch: [
      { 
        items: [{ food: "salmon", base: 150 }, { food: "spinach", base: 100 }, { food: "oliveOil", base: 20 }, { food: "avocado", base: 50 }],
        name: "Salmon Avocado Salad",
        difficulty: 'easy',
        prepTime: 15
      },
      { 
        items: [{ food: "chickenBreast", base: 150 }, { food: "broccoli", base: 100 }, { food: "cheese", base: 25 }, { food: "oliveOil", base: 12 }],
        name: "Cheesy Chicken Broccoli",
        difficulty: 'medium',
        prepTime: 25
      },
      { 
        items: [{ food: "tuna", base: 120 }, { food: "avocado", base: 80 }, { food: "oliveOil", base: 10 }, { food: "cucumbers", base: 60 }],
        name: "Tuna Avocado Bowl",
        difficulty: 'easy',
        prepTime: 10
      },
    ],
    dinner: [
      { 
        items: [{ food: "chickenBreast", base: 180 }, { food: "broccoli", base: 100 }, { food: "oliveOil", base: 15 }, { food: "cheese", base: 20 }],
        name: "Herb Chicken with Broccoli",
        difficulty: 'medium',
        prepTime: 30
      },
      { 
        items: [{ food: "salmon", base: 150 }, { food: "asparagus", base: 80 }, { food: "oliveOil", base: 12 }, { food: "almonds", base: 15 }],
        name: "Baked Salmon with Asparagus",
        difficulty: 'medium',
        prepTime: 25
      },
      { 
        items: [{ food: "leanBeef", base: 140 }, { food: "mushrooms", base: 80 }, { food: "spinach", base: 60 }, { food: "oliveOil", base: 10 }],
        name: "Beef & Mushroom Stir-fry",
        difficulty: 'medium',
        prepTime: 20
      },
    ],
    snacks: [
      { 
        items: [{ food: "cheese", base: 50 }, { food: "almonds", base: 20 }],
        name: "Cheese & Almonds",
        difficulty: 'easy',
        prepTime: 1
      },
      { 
        items: [{ food: "avocado", base: 80 }, { food: "oliveOil", base: 5 }],
        name: "Avocado with Olive Oil",
        difficulty: 'easy',
        prepTime: 2
      },
      { 
        items: [{ food: "greekYogurt", base: 200 }, { food: "walnuts", base: 15 }, { food: "coconutOil", base: 5 }],
        name: "Keto Yogurt Bowl",
        difficulty: 'easy',
        prepTime: 3
      },
    ],
  },

  pescatarian: {
    breakfast: [
      { 
        items: [{ food: "oats", base: 50 }, { food: "greekYogurt", base: 150 }, { food: "berries", base: 80 }],
        name: "Berry Overnight Oats",
        difficulty: 'easy',
        prepTime: 5
      },
      { 
        items: [{ food: "egg", base: 120 }, { food: "spinach", base: 50 }, { food: "wholeWheatBread", base: 40 }, { food: "avocado", base: 50 }],
        name: "Avocado Toast with Eggs",
        difficulty: 'easy',
        prepTime: 10
      },
    ],
    lunch: [
      { 
        items: [{ food: "salmon", base: 150 }, { food: "quinoa", base: 100 }, { food: "broccoli", base: 100 }, { food: "oliveOil", base: 10 }],
        name: "Salmon Quinoa Bowl",
        difficulty: 'medium',
        prepTime: 20
      },
      { 
        items: [{ food: "tuna", base: 120 }, { food: "brownRice", base: 120 }, { food: "spinach", base: 80 }, { food: "tomatoes", base: 60 }],
        name: "Tuna Rice Bowl",
        difficulty: 'easy',
        prepTime: 15
      },
      { 
        items: [{ food: "cod", base: 150 }, { food: "sweetPotato", base: 150 }, { food: "asparagus", base: 80 }, { food: "oliveOil", base: 12 }],
        name: "Baked Cod with Sweet Potato",
        difficulty: 'medium',
        prepTime: 30
      },
    ],
    dinner: [
      { 
        items: [{ food: "salmon", base: 160 }, { food: "sweetPotato", base: 150 }, { food: "spinach", base: 100 }, { food: "oliveOil", base: 12 }],
        name: "Herb-Crusted Salmon",
        difficulty: 'medium',
        prepTime: 30
      },
      { 
        items: [{ food: "shrimp", base: 120 }, { food: "quinoa", base: 100 }, { food: "bellPeppers", base: 60 }, { food: "mushrooms", base: 60 }],
        name: "Shrimp Quinoa Stir-fry",
        difficulty: 'medium',
        prepTime: 25
      },
      { 
        items: [{ food: "tilapia", base: 150 }, { food: "brownRice", base: 120 }, { food: "broccoli", base: 100 }, { food: "oliveOil", base: 10 }],
        name: "Lemon Tilapia with Rice",
        difficulty: 'medium',
        prepTime: 25
      },
    ],
    snacks: [
      { 
        items: [{ food: "greekYogurt", base: 200 }, { food: "berries", base: 60 }, { food: "almonds", base: 15 }],
        name: "Berry Yogurt Bowl",
        difficulty: 'easy',
        prepTime: 3
      },
      { 
        items: [{ food: "cottageCheese", base: 150 }, { food: "apple", base: 100 }, { food: "walnuts", base: 10 }],
        name: "Apple Cottage Cheese",
        difficulty: 'easy',
        prepTime: 3
      },
    ],
  },
};
