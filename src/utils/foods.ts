// Comprehensive food database with macros per 100g (or per piece for some items)

export interface Food {
  name: string;
  protein: number; // grams per 100g
  carbs: number;
  fats: number;
  calories: number;
  category: 'protein' | 'carb' | 'fat' | 'dairy' | 'vegetable' | 'fruit' | 'grain' | 'legume' | 'nut' | 'oil';
  restrictions?: string[]; // dietary restrictions this food doesn't fit
  healthBenefits?: string[]; // health conditions this food is good for
}

export const foods: Record<string, Food> = {
  // Lean Proteins (meat - not suitable for vegetarian/vegan)
  chickenBreast: { name: "Chicken Breast", protein: 31, carbs: 0, fats: 3, calories: 165, category: 'protein' },
  turkeyBreast: { name: "Turkey Breast", protein: 30, carbs: 0, fats: 1, calories: 135, category: 'protein' },
  leanBeef: { name: "Lean Beef (95% lean)", protein: 26, carbs: 0, fats: 5, calories: 150, category: 'protein', restrictions: ['heart disease'] },
  porkTenderloin: { name: "Pork Tenderloin", protein: 26, carbs: 0, fats: 3, calories: 130, category: 'protein' },
  
  // Fish & Seafood
  salmon: { name: "Salmon", protein: 20, carbs: 0, fats: 13, calories: 208, category: 'protein', healthBenefits: ['heart disease'] },
  cod: { name: "Cod", protein: 18, carbs: 0, fats: 1, calories: 82, category: 'protein' },
  tuna: { name: "Tuna (canned in water)", protein: 30, carbs: 0, fats: 1, calories: 128, category: 'protein' },
  shrimp: { name: "Shrimp", protein: 24, carbs: 0, fats: 0.3, calories: 99, category: 'protein' },
  tilapia: { name: "Tilapia", protein: 26, carbs: 0, fats: 1.7, calories: 96, category: 'protein' },
  
  // Eggs & Dairy Proteins
  egg: { name: "Egg (large)", protein: 13, carbs: 1, fats: 11, calories: 155, category: 'protein' },
  eggWhites: { name: "Egg Whites", protein: 11, carbs: 1, fats: 0, calories: 52, category: 'protein' },
  cottageCheese: { name: "Cottage Cheese (low fat)", protein: 11, carbs: 4, fats: 1, calories: 72, category: 'dairy', healthBenefits: ['high blood pressure'] },
  greekYogurt: { name: "Greek Yogurt (low fat)", protein: 10, carbs: 4, fats: 0.4, calories: 59, category: 'dairy', healthBenefits: ['diabetes'] },
  cheese: { name: "Cheddar Cheese", protein: 25, carbs: 2, fats: 33, calories: 402, category: 'dairy', restrictions: ['heart disease', 'high blood pressure'] },
  
  // Plant Proteins
  tofu: { name: "Tofu (firm)", protein: 8, carbs: 2, fats: 5, calories: 76, category: 'protein', restrictions: ['soy allergy'] },
  tempeh: { name: "Tempeh", protein: 19, carbs: 9, fats: 11, calories: 192, category: 'protein', restrictions: ['soy allergy'] },
  seitan: { name: "Seitan", protein: 25, carbs: 4, fats: 1, calories: 120, category: 'protein', restrictions: ['gluten-free'] },
  
  // Legumes
  lentils: { name: "Lentils (cooked)", protein: 9, carbs: 20, fats: 0.4, calories: 116, category: 'legume', healthBenefits: ['diabetes', 'high blood pressure'] },
  blackBeans: { name: "Black Beans (cooked)", protein: 8, carbs: 23, fats: 0.3, calories: 132, category: 'legume', healthBenefits: ['diabetes'] },
  chickpeas: { name: "Chickpeas (cooked)", protein: 8, carbs: 27, fats: 2.6, calories: 164, category: 'legume' },
  kidneyBeans: { name: "Kidney Beans (cooked)", protein: 8, carbs: 22, fats: 0.5, calories: 127, category: 'legume' },
  edamame: { name: "Edamame (cooked)", protein: 11, carbs: 10, fats: 5, calories: 122, category: 'legume', restrictions: ['soy allergy'] },

  // Grains & Starches
  brownRice: { name: "Brown Rice (cooked)", protein: 2.5, carbs: 23, fats: 0.9, calories: 112, category: 'grain', healthBenefits: ['diabetes'] },
  whiteRice: { name: "White Rice (cooked)", protein: 2.7, carbs: 28, fats: 0.3, calories: 130, category: 'grain', restrictions: ['diabetes'] },
  quinoa: { name: "Quinoa (cooked)", protein: 4.1, carbs: 21, fats: 1.9, calories: 120, category: 'grain', healthBenefits: ['diabetes'] },
  oats: { name: "Rolled Oats", protein: 13, carbs: 67, fats: 7, calories: 389, category: 'grain', healthBenefits: ['high blood pressure', 'diabetes', 'heart disease'] },
  barley: { name: "Barley (cooked)", protein: 3.5, carbs: 28, fats: 0.8, calories: 123, category: 'grain', healthBenefits: ['diabetes'] },
  buckwheat: { name: "Buckwheat (cooked)", protein: 3.4, carbs: 20, fats: 0.6, calories: 92, category: 'grain', healthBenefits: ['diabetes'] },
  sweetPotato: { name: "Sweet Potato", protein: 2, carbs: 20, fats: 0, calories: 86, category: 'carb', healthBenefits: ['diabetes'] },
  whitePotato: { name: "White Potato", protein: 2, carbs: 17, fats: 0.1, calories: 77, category: 'carb' },
  wholeWheatBread: { name: "Whole Wheat Bread", protein: 13, carbs: 41, fats: 4, calories: 247, category: 'grain', restrictions: ['gluten-free'] },
  wholeWheatPasta: { name: "Whole Wheat Pasta (cooked)", protein: 5, carbs: 25, fats: 1, calories: 124, category: 'grain', restrictions: ['gluten-free'] },

  // Nuts & Seeds
  almonds: { name: "Almonds", protein: 21, carbs: 22, fats: 49, calories: 579, category: 'nut', healthBenefits: ['heart disease'] },
  walnuts: { name: "Walnuts", protein: 15, carbs: 14, fats: 65, calories: 654, category: 'nut', healthBenefits: ['heart disease'] },
  cashews: { name: "Cashews", protein: 18, carbs: 30, fats: 44, calories: 553, category: 'nut' },
  peanuts: { name: "Peanuts", protein: 26, carbs: 16, fats: 49, calories: 567, category: 'nut' },
  chiaSeeds: { name: "Chia Seeds", protein: 17, carbs: 42, fats: 31, calories: 486, category: 'nut', healthBenefits: ['diabetes'] },
  flaxseeds: { name: "Flaxseeds", protein: 18, carbs: 29, fats: 42, calories: 534, category: 'nut', healthBenefits: ['heart disease'] },
  pumpkinSeeds: { name: "Pumpkin Seeds", protein: 19, carbs: 54, fats: 19, calories: 446, category: 'nut' },

  // Healthy Fats & Oils
  oliveOil: { name: "Olive Oil", protein: 0, carbs: 0, fats: 100, calories: 884, category: 'oil', healthBenefits: ['heart disease'] },
  coconutOil: { name: "Coconut Oil", protein: 0, carbs: 0, fats: 100, calories: 862, category: 'oil' },
  avocadoOil: { name: "Avocado Oil", protein: 0, carbs: 0, fats: 100, calories: 884, category: 'oil' },
  avocado: { name: "Avocado", protein: 2, carbs: 9, fats: 15, calories: 160, category: 'fat', healthBenefits: ['heart disease'] },
  olives: { name: "Olives", protein: 1, carbs: 6, fats: 11, calories: 115, category: 'fat' },

  // Vegetables
  broccoli: { name: "Broccoli", protein: 3, carbs: 7, fats: 0.3, calories: 34, category: 'vegetable', healthBenefits: ['heart disease', 'diabetes'] },
  spinach: { name: "Spinach", protein: 3, carbs: 4, fats: 0.4, calories: 23, category: 'vegetable', healthBenefits: ['high blood pressure', 'heart disease', 'diabetes'] },
  kale: { name: "Kale", protein: 4, carbs: 9, fats: 1, calories: 49, category: 'vegetable', healthBenefits: ['heart disease', 'diabetes'] },
  bellPeppers: { name: "Bell Peppers", protein: 1, carbs: 6, fats: 0.3, calories: 31, category: 'vegetable' },
  carrots: { name: "Carrots", protein: 1, carbs: 10, fats: 0.2, calories: 41, category: 'vegetable' },
  tomatoes: { name: "Tomatoes", protein: 1, carbs: 4, fats: 0.2, calories: 18, category: 'vegetable' },
  cucumbers: { name: "Cucumbers", protein: 1, carbs: 4, fats: 0.1, calories: 16, category: 'vegetable' },
  zucchini: { name: "Zucchini", protein: 1, carbs: 3, fats: 0.2, calories: 17, category: 'vegetable' },
  asparagus: { name: "Asparagus", protein: 2, carbs: 4, fats: 0.1, calories: 20, category: 'vegetable' },
  brusselsSprouts: { name: "Brussels Sprouts", protein: 3, carbs: 9, fats: 0.3, calories: 43, category: 'vegetable' },
  cauliflower: { name: "Cauliflower", protein: 2, carbs: 5, fats: 0.3, calories: 25, category: 'vegetable' },
  mushrooms: { name: "Mushrooms", protein: 3, carbs: 3, fats: 0.3, calories: 22, category: 'vegetable' },

  // Fruits
  banana: { name: "Banana", protein: 1, carbs: 23, fats: 0.3, calories: 89, category: 'fruit', healthBenefits: ['high blood pressure'] },
  apple: { name: "Apple", protein: 0.3, carbs: 14, fats: 0.2, calories: 52, category: 'fruit', healthBenefits: ['diabetes', 'heart disease'] },
  berries: { name: "Mixed Berries", protein: 1, carbs: 12, fats: 0.3, calories: 57, category: 'fruit', healthBenefits: ['heart disease', 'diabetes'] },
  orange: { name: "Orange", protein: 1, carbs: 12, fats: 0.2, calories: 47, category: 'fruit' },
  grapes: { name: "Grapes", protein: 0.6, carbs: 18, fats: 0.2, calories: 62, category: 'fruit' },
  pineapple: { name: "Pineapple", protein: 0.5, carbs: 13, fats: 0.1, calories: 50, category: 'fruit' },
  mango: { name: "Mango", protein: 0.8, carbs: 15, fats: 0.4, calories: 60, category: 'fruit' },

  // Dairy Alternatives
  almondMilk: { name: "Almond Milk (unsweetened)", protein: 1, carbs: 1, fats: 3, calories: 17, category: 'dairy', restrictions: ['nut allergy'] },
  oatMilk: { name: "Oat Milk (unsweetened)", protein: 1, carbs: 7, fats: 1, calories: 40, category: 'dairy' },
  coconutMilk: { name: "Coconut Milk (light)", protein: 1, carbs: 3, fats: 2, calories: 30, category: 'dairy' },
  soyMilk: { name: "Soy Milk (unsweetened)", protein: 3, carbs: 2, fats: 2, calories: 33, category: 'dairy', restrictions: ['soy allergy'] },
  
  // Additional items referenced in templates
  hardBoiledEgg: { name: "Hard Boiled Egg", protein: 13, carbs: 1, fats: 11, calories: 155, category: 'protein' },
};
