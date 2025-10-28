import type { DietPlan } from "@/shared/types/dashboard";

export const dietPlans: DietPlan[] = [
  {
    id: 1,
    name: "Mediterranean Diet",
    description: "Rich in fruits, vegetables, whole grains, and healthy fats. Perfect for heart health and weight management.",
    category: "Weight Loss",
    calories: '1800-2200 per day',
    duration: "12 weeks",
    difficulty: "Medium",
    image:"https://images.pexels.com/photos/1640774/pexels-photo-1640774.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
     macros: {
      protein: '15-20%',
      carbs: '50-60%',
      fats: '25-35%'
    },
    benefits: [
      'Reduces risk of heart disease',
      'Promotes weight loss',
      'Improves brain function',
      'Helps prevent chronic diseases'
    ],
    mealPlan: {
      breakfast: [
        {
          item: 'Greek yogurt with honey',
          portion: '200g yogurt + 1 tbsp honey',
          calories: 180,
          protein: 20,
          carbs: 24,
          fats: 4
        },
        {
          item: 'Whole grain toast with olive oil',
          portion: '2 slices + 1 tbsp oil',
          calories: 220,
          protein: 6,
          carbs: 28,
          fats: 14
        },
        {
          item: 'Mixed berries',
          portion: '1 cup (150g)',
          calories: 85,
          protein: 1,
          carbs: 20,
          fats: 0
        }
      ],
      lunch: [
        {
          item: 'Mediterranean salad',
          portion: '300g mixed vegetables',
          calories: 120,
          protein: 4,
          carbs: 16,
          fats: 6
        },
        {
          item: 'Grilled fish',
          portion: '150g salmon/cod',
          calories: 250,
          protein: 30,
          carbs: 0,
          fats: 15
        },
        {
          item: 'Quinoa',
          portion: '1 cup cooked (185g)',
          calories: 220,
          protein: 8,
          carbs: 39,
          fats: 4
        }
      ],
      dinner: [
        {
          item: 'Grilled vegetables',
          portion: '250g mixed vegetables',
          calories: 100,
          protein: 3,
          carbs: 18,
          fats: 4
        },
        {
          item: 'Lean chicken breast',
          portion: '150g',
          calories: 165,
          protein: 31,
          carbs: 0,
          fats: 4
        },
        {
          item: 'Brown rice',
          portion: '1 cup cooked (195g)',
          calories: 216,
          protein: 5,
          carbs: 45,
          fats: 2
        }
      ],
      snacks: [
        {
          item: 'Mixed nuts',
          portion: '30g (small handful)',
          calories: 180,
          protein: 6,
          carbs: 6,
          fats: 16
        },
        {
          item: 'Apple with almond butter',
          portion: '1 medium apple + 1 tbsp butter',
          calories: 200,
          protein: 5,
          carbs: 25,
          fats: 12
        },
        {
          item: 'Hummus with carrots',
          portion: '1/4 cup hummus + 1 cup carrots',
          calories: 180,
          protein: 6,
          carbs: 20,
          fats: 10
        }
      ]
    },
    guidelines: [
      'Eat plenty of vegetables (at least 5 servings/day)',
      'Choose whole grains over refined grains',
      'Use olive oil as primary fat source (2-3 tbsp/day)',
      'Limit red meat to 1-2 times per week'
    ]
  },
  {
    id: 2,
    name: "Keto Diet Plan",
    description:
      "High fat, low carb approach to trigger ketosis for rapid weight loss and increased energy.",
    image:
      "https://images.pexels.com/photos/1640771/pexels-photo-1640771.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    category: "Weight Loss",
    calories: '1600-1800 per day',
    difficulty: "Hard",
    duration: "8 weeks",
    macros: {
      protein: '20-25%',
      carbs: '5-10%',
      fats: '70-75%'
    },
    benefits: [
      'Rapid weight loss',
      'Increased mental clarity',
      'Reduced inflammation',
      'Stable blood sugar levels'
    ],
    mealPlan: {
      breakfast: [
        {
          item: 'Keto coffee',
          portion: '1 cup coffee + 1 tbsp MCT oil + 1 tbsp butter',
          calories: 230,
          protein: 0,
          carbs: 0,
          fats: 25
        },
        {
          item: 'Scrambled eggs with avocado',
          portion: '3 eggs + 1/2 avocado',
          calories: 400,
          protein: 20,
          carbs: 4,
          fats: 35
        }
      ],
      lunch: [
        {
          item: 'Keto salad',
          portion: '2 cups mixed greens + 150g chicken + 30g cheese',
          calories: 350,
          protein: 35,
          carbs: 3,
          fats: 22
        },
        {
          item: 'Olive oil dressing',
          portion: '2 tbsp',
          calories: 120,
          protein: 0,
          carbs: 0,
          fats: 14
        }
      ],
      dinner: [
        {
          item: 'Grilled salmon',
          portion: '200g',
          calories: 440,
          protein: 46,
          carbs: 0,
          fats: 28
        },
        {
          item: 'Cauliflower rice',
          portion: '1 cup',
          calories: 25,
          protein: 2,
          carbs: 5,
          fats: 0
        },
        {
          item: 'Sautéed spinach',
          portion: '2 cups',
          calories: 90,
          protein: 3,
          carbs: 3,
          fats: 7
        }
      ],
      snacks: [
        {
          item: 'Macadamia nuts',
          portion: '30g',
          calories: 204,
          protein: 2,
          carbs: 4,
          fats: 21
        },
        {
          item: 'String cheese',
          portion: '1 piece',
          calories: 80,
          protein: 7,
          carbs: 1,
          fats: 6
        }
      ]
    },
    guidelines: [
      'Keep net carbs under 20g per day',
      'Eat moderate protein (1.2-1.7g per kg body weight)',
      'Get 70-75% of calories from healthy fats',
      'Stay hydrated and supplement electrolytes'
    ]
  },
  {
    id: 3,
    name: "Plant-Based Diet",
    description:
      "Focus on plant foods for improved health, weight management, and reduced environmental impact.",
    image:
      "https://images.pexels.com/photos/1435904/pexels-photo-1435904.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    category: "Health",
    calories: '2000-2400 per day',
    difficulty: "Medium",
    duration: "12 weeks",
    macros: {
      protein: '15-20%',
      carbs: '55-60%',
      fats: '25-30%'
    },
    benefits: [
      'Reduced environmental impact',
      'Lower risk of chronic diseases',
      'Improved digestion',
      'Better heart health'
    ],
    mealPlan: {
      breakfast: [
        {
          item: 'Overnight oats',
          portion: '1 cup oats + plant milk + chia seeds',
          calories: 350,
          protein: 12,
          carbs: 55,
          fats: 10
        },
        {
          item: 'Mixed berries',
          portion: '1 cup',
          calories: 85,
          protein: 1,
          carbs: 20,
          fats: 0
        }
      ],
      lunch: [
        {
          item: 'Buddha bowl',
          portion: '2 cups mixed vegetables + quinoa + chickpeas',
          calories: 450,
          protein: 15,
          carbs: 65,
          fats: 12
        },
        {
          item: 'Tahini dressing',
          portion: '2 tbsp',
          calories: 120,
          protein: 3,
          carbs: 5,
          fats: 10
        }
      ],
      dinner: [
        {
          item: 'Lentil curry',
          portion: '1.5 cups',
          calories: 380,
          protein: 18,
          carbs: 45,
          fats: 14
        },
        {
          item: 'Brown rice',
          portion: '1 cup cooked',
          calories: 216,
          protein: 5,
          carbs: 45,
          fats: 2
        }
      ],
      snacks: [
        {
          item: 'Trail mix',
          portion: '1/4 cup',
          calories: 170,
          protein: 6,
          carbs: 15,
          fats: 12
        },
        {
          item: 'Apple with almond butter',
          portion: '1 apple + 2 tbsp almond butter',
          calories: 280,
          protein: 8,
          carbs: 28,
          fats: 18
        }
      ]
    },
    guidelines: [
      'Eat a variety of colorful fruits and vegetables',
      'Include plant-based protein sources',
      'Choose whole grains over refined grains',
      'Supplement B12 if fully vegan'
    ]
  },
  {
    id: 4,
    name: "Intermittent Fasting",
    description:
      "Alternate eating and fasting periods to improve metabolism and support weight loss.",
    image:
      "https://images.pexels.com/photos/5638732/pexels-photo-5638732.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
      calories: '1600-2000 per day',
    category: "Weight Loss",
    difficulty: "Medium",
    duration: "10 weeks",
    macros: {
      protein: '25-30%',
      carbs: '40-45%',
      fats: '30-35%'
    },
    benefits: [
      'Improved insulin sensitivity',
      'Enhanced fat burning',
      'Better mental clarity',
      'Cellular repair (autophagy)'
    ],
    mealPlan: {
      breakfast: [
        {
          item: 'Break-fast meal (12 PM)',
          portion: 'Greek yogurt bowl with nuts and berries',
          calories: 400,
          protein: 25,
          carbs: 35,
          fats: 20
        }
      ],
      lunch: [
        {
          item: 'Protein-rich salad',
          portion: '3 cups mixed greens + protein + healthy fats',
          calories: 450,
          protein: 35,
          carbs: 25,
          fats: 25
        }
      ],
      dinner: [
        {
          item: 'Last meal (8 PM)',
          portion: 'Grilled protein with vegetables',
          calories: 500,
          protein: 40,
          carbs: 30,
          fats: 25
        }
      ],
      snacks: [
        {
          item: 'Afternoon snack',
          portion: 'Protein shake with fruit',
          calories: 250,
          protein: 20,
          carbs: 25,
          fats: 8
        }
      ]
    },
    guidelines: [
      'Fast for 16 hours, eat within 8-hour window',
      'Stay hydrated during fasting period',
      'Break fast with moderate-sized meal',
      'Focus on nutrient-dense foods'
    ]
  },
  {
    id: 5,
    name: "DASH Diet",
    description:
      "Designed to lower blood pressure through balanced nutrition and reduced sodium intake.",
    image:
      "https://images.pexels.com/photos/4033636/pexels-photo-4033636.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
      calories: '2000-2400 per day',
    category: "Health",
    difficulty: "Easy",
    duration: "16 weeks",
     macros: {
      protein: '18-22%',
      carbs: '55-60%',
      fats: '22-27%'
    },
    benefits: [
      'Lowers blood pressure',
      'Reduces heart disease risk',
      'Supports weight loss',
      'Improves overall health'
    ],
    mealPlan: {
      breakfast: [
        {
          item: 'Whole grain cereal',
          portion: '1 cup + low-fat milk',
          calories: 300,
          protein: 12,
          carbs: 45,
          fats: 5
        },
        {
          item: 'Fresh fruit',
          portion: '1 medium banana',
          calories: 105,
          protein: 1,
          carbs: 27,
          fats: 0
        }
      ],
      lunch: [
        {
          item: 'Turkey sandwich',
          portion: 'Whole grain bread + lean turkey + vegetables',
          calories: 350,
          protein: 25,
          carbs: 40,
          fats: 10
        },
        {
          item: 'Side salad',
          portion: '2 cups mixed greens',
          calories: 100,
          protein: 3,
          carbs: 12,
          fats: 5
        }
      ],
      dinner: [
        {
          item: 'Baked chicken',
          portion: '150g',
          calories: 250,
          protein: 30,
          carbs: 0,
          fats: 14
        },
        {
          item: 'Steamed vegetables',
          portion: '2 cups mixed',
          calories: 100,
          protein: 4,
          carbs: 20,
          fats: 0
        }
      ],
      snacks: [
        {
          item: 'Fresh fruit',
          portion: '1 apple',
          calories: 95,
          protein: 0,
          carbs: 25,
          fats: 0
        },
        {
          item: 'Unsalted nuts',
          portion: '1/4 cup',
          calories: 170,
          protein: 6,
          carbs: 6,
          fats: 15
        }
      ]
    },
    guidelines: [
      'Limit sodium to 2,300mg per day',
      'Eat plenty of fruits and vegetables',
      'Choose low-fat dairy products',
      'Include lean proteins'
    ]
  },
  {
    id: 6,
    name: "Paleo Diet",
    description:
      "Based on foods similar to what our ancestors ate during the Paleolithic era, focusing on whole foods.",
    image:
      "https://images.pexels.com/photos/6546021/pexels-photo-6546021.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
      calories: '1800-2200 per day',
    category: "Weight Loss",
    difficulty: "Hard",
    duration: "12 weeks",
    macros: {
      protein: '30-35%',
      carbs: '35-40%',
      fats: '30-35%'
    },
    benefits: [
      'Better blood sugar control',
      'Reduced inflammation',
      'Improved satiety',
      'Natural weight management'
    ],
    mealPlan: {
      breakfast: [
        {
          item: 'Sweet potato hash',
          portion: '1 medium sweet potato + 2 eggs',
          calories: 350,
          protein: 16,
          carbs: 35,
          fats: 18
        }
      ],
      lunch: [
        {
          item: 'Grilled chicken salad',
          portion: '150g chicken + mixed greens',
          calories: 400,
          protein: 35,
          carbs: 15,
          fats: 25
        }
      ],
      dinner: [
        {
          item: 'Grass-fed beef',
          portion: '150g with vegetables',
          calories: 450,
          protein: 35,
          carbs: 20,
          fats: 30
        }
      ],
      snacks: [
        {
          item: 'Mixed berries',
          portion: '1 cup',
          calories: 85,
          protein: 1,
          carbs: 20,
          fats: 0
        },
        {
          item: 'Mixed nuts',
          portion: '30g',
          calories: 180,
          protein: 6,
          carbs: 6,
          fats: 16
        }
      ]
    },
    guidelines: [
      'Avoid processed foods',
      'Eliminate grains and legumes',
      'Focus on whole, unprocessed foods',
      'Include plenty of vegetables'
    ]
  },
  {
    id: 7,
    name: "Flexitarian Diet",
    description:
      "A flexible approach to vegetarianism that emphasizes plant-based foods with occasional meat.",
    image:
      "https://images.pexels.com/photos/1660027/pexels-photo-1660027.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
      calories: '1600-2000 per day',
    category: "Health",
    difficulty: "Easy",
    duration: "10 weeks",
    macros: {
      protein: '20-25%',
      carbs: '45-50%',
      fats: '30-35%'
    },
    benefits: [
      'Environmental sustainability',
      'Weight management',
      'Reduced risk of chronic diseases',
      'Lower food costs',
      'Flexible meal planning'
    ],
    mealPlan: {
      breakfast: [
        {
          item: 'Overnight oats with berries and nuts',
          portion: '1 cup oats (80g) + 1 cup berries + 30g nuts',
          calories: 420,
          protein: 14,
          carbs: 56,
          fats: 18
        },
        {
          item: 'Plant-based protein smoothie',
          portion: '300ml almond milk + 30g protein + 1 banana',
          calories: 280,
          protein: 25,
          carbs: 35,
          fats: 5
        },
        {
          item: 'Whole grain toast with avocado',
          portion: '2 slices + 1/2 avocado',
          calories: 320,
          protein: 8,
          carbs: 38,
          fats: 16
        }
      ],
      lunch: [
        {
          item: 'Quinoa Buddha bowl',
          portion: '1 cup quinoa + 200g mixed vegetables',
          calories: 380,
          protein: 12,
          carbs: 65,
          fats: 8
        },
        {
          item: 'Lentil and vegetable soup',
          portion: '400ml soup (200g lentils)',
          calories: 320,
          protein: 18,
          carbs: 45,
          fats: 6
        },
        {
          item: 'Mixed bean salad',
          portion: '250g mixed beans + vegetables',
          calories: 300,
          protein: 15,
          carbs: 48,
          fats: 4
        }
      ],
      dinner: [
        {
          item: 'Grilled fish with vegetables',
          portion: '150g fish + 250g vegetables',
          calories: 350,
          protein: 35,
          carbs: 15,
          fats: 18
        },
        {
          item: 'Plant-based burger with sweet potato',
          portion: '1 burger (120g) + 150g sweet potato',
          calories: 400,
          protein: 22,
          carbs: 52,
          fats: 14
        },
        {
          item: 'Stir-fried tofu with brown rice',
          portion: '150g tofu + 1 cup rice + vegetables',
          calories: 420,
          protein: 20,
          carbs: 55,
          fats: 12
        }
      ],
      snacks: [
        {
          item: 'Mixed nuts and dried fruit',
          portion: '30g nuts + 20g dried fruit',
          calories: 200,
          protein: 6,
          carbs: 18,
          fats: 14
        },
        {
          item: 'Hummus with vegetables',
          portion: '1/4 cup hummus + 1 cup vegetables',
          calories: 180,
          protein: 6,
          carbs: 20,
          fats: 10
        },
        {
          item: 'Apple with almond butter',
          portion: '1 medium apple + 1 tbsp butter',
          calories: 200,
          protein: 5,
          carbs: 25,
          fats: 12
        }
      ]
    },
    guidelines: [
      'Focus on plant-based meals 4-5 days per week',
      'Include meat/fish 2-3 times per week (150g portions)',
      'Eat at least 5 servings of vegetables daily (1 serving = 80g)',
      'Include plant-based proteins daily (legumes, tofu, tempeh)'
    ]
  },
  {
    id: 8,
    name: "Low-Carb Diet",
    description:
      "Reduce carbohydrate intake while focusing on protein and healthy fats for effective weight loss.",
    image:
      "https://images.pexels.com/photos/1410235/pexels-photo-1410235.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
      calories: '1500-1800 per day',
    category: "Weight Loss",
    difficulty: "Medium",
    duration: "8 weeks",
    macros: {
      protein: '30-35%',
      carbs: '10-15%',
      fats: '50-55%'
    },
    benefits: [
      'Rapid weight loss',
      'Reduced hunger',
      'Improved insulin sensitivity',
      'Better blood sugar control',
      'Increased energy levels'
    ],
    mealPlan: {
      breakfast: [
        {
          item: 'Eggs with avocado and spinach',
          portion: '3 eggs + 1/2 avocado + 2 cups spinach',
          calories: 400,
          protein: 22,
          carbs: 8,
          fats: 32
        },
        {
          item: 'Greek yogurt with berries',
          portion: '200g yogurt + 50g berries + 15g nuts',
          calories: 280,
          protein: 20,
          carbs: 12,
          fats: 18
        },
        {
          item: 'Protein smoothie',
          portion: '30g protein + 200ml almond milk + 100g berries',
          calories: 250,
          protein: 28,
          carbs: 10,
          fats: 12
        }
      ],
      lunch: [
        {
          item: 'Grilled chicken salad',
          portion: '150g chicken + 3 cups mixed greens',
          calories: 350,
          protein: 35,
          carbs: 8,
          fats: 22
        },
        {
          item: 'Tuna lettuce wraps',
          portion: '150g tuna + 2 large lettuce leaves',
          calories: 280,
          protein: 32,
          carbs: 4,
          fats: 16
        },
        {
          item: 'Turkey and cheese roll-ups',
          portion: '100g turkey + 30g cheese + vegetables',
          calories: 320,
          protein: 28,
          carbs: 5,
          fats: 24
        }
      ],
      dinner: [
        {
          item: 'Baked salmon with vegetables',
          portion: '180g salmon + 250g low-carb vegetables',
          calories: 420,
          protein: 38,
          carbs: 12,
          fats: 28
        },
        {
          item: 'Steak with mushrooms',
          portion: '150g steak + 200g mushrooms',
          calories: 380,
          protein: 35,
          carbs: 8,
          fats: 26
        },
        {
          item: 'Chicken stir-fry (no rice)',
          portion: '150g chicken + 300g vegetables',
          calories: 350,
          protein: 32,
          carbs: 15,
          fats: 20
        }
      ],
      snacks: [
        {
          item: 'String cheese',
          portion: '2 pieces (56g)',
          calories: 160,
          protein: 14,
          carbs: 2,
          fats: 12
        },
        {
          item: 'Hard-boiled eggs',
          portion: '2 eggs',
          calories: 140,
          protein: 12,
          carbs: 0,
          fats: 10
        },
        {
          item: 'Almonds',
          portion: '30g (about 23 almonds)',
          calories: 180,
          protein: 6,
          carbs: 6,
          fats: 16
        }
      ]
    },
    guidelines: [
      'Limit carbs to 50g per day',
      'Eat protein with every meal (min 30g)',
      'Choose healthy fats (avocado, olive oil, nuts)',
      'Avoid processed foods and sugars'
    ]
  },
  {
    id: 9,
    name: "Anti-Inflammatory Diet",
    description:
      "Combat inflammation through nutrient-rich foods and balanced nutrition.",
    image:
      "https://images.pexels.com/photos/1099680/pexels-photo-1099680.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
      calories: '1800-2200 per day',
    category: "Health",
    difficulty: "Medium",
    duration: "12 weeks",
    macros: {
      protein: '20-25%',
      carbs: '40-45%',
      fats: '30-35%'
    },
    benefits: [
      'Reduced inflammation',
      'Better joint health',
      'Improved digestion',
      'Enhanced immune function',
      'Better skin health'
    ],
    mealPlan: {
      breakfast: [
        {
          item: 'Berry and turmeric smoothie',
          portion: '300ml (1 cup berries + turmeric + coconut milk)',
          calories: 280,
          protein: 8,
          carbs: 32,
          fats: 14
        },
        {
          item: 'Chia seed pudding',
          portion: '200g pudding + 100g mixed fruits',
          calories: 320,
          protein: 12,
          carbs: 38,
          fats: 16
        },
        {
          item: 'Anti-inflammatory oatmeal',
          portion: '1 cup oats + cinnamon + berries + walnuts',
          calories: 380,
          protein: 10,
          carbs: 45,
          fats: 18
        }
      ],
      lunch: [
        {
          item: 'Salmon and quinoa bowl',
          portion: '150g salmon + 1 cup quinoa + vegetables',
          calories: 450,
          protein: 35,
          carbs: 42,
          fats: 22
        },
        {
          item: 'Mediterranean salad',
          portion: '300g mixed vegetables + olive oil + chickpeas',
          calories: 380,
          protein: 12,
          carbs: 35,
          fats: 24
        },
        {
          item: 'Turmeric rice with vegetables',
          portion: '1 cup rice + 200g vegetables + turmeric',
          calories: 320,
          protein: 8,
          carbs: 48,
          fats: 12
        }
      ],
      dinner: [
        {
          item: 'Grilled fish with ginger',
          portion: '180g fish + ginger sauce + vegetables',
          calories: 380,
          protein: 32,
          carbs: 18,
          fats: 20
        },
        {
          item: 'Anti-inflammatory curry',
          portion: '300g curry (vegetables + lentils + spices)',
          calories: 420,
          protein: 18,
          carbs: 45,
          fats: 22
        },
        {
          item: 'Herb-roasted chicken',
          portion: '150g chicken + herbs + roasted vegetables',
          calories: 350,
          protein: 35,
          carbs: 15,
          fats: 18
        }
      ],
      snacks: [
        {
          item: 'Green tea with ginger',
          portion: '240ml tea + fresh ginger',
          calories: 5,
          protein: 0,
          carbs: 1,
          fats: 0
        },
        {
          item: 'Mixed berries',
          portion: '1 cup (150g)',
          calories: 85,
          protein: 1,
          carbs: 20,
          fats: 0
        },
        {
          item: 'Walnuts and dark chocolate',
          portion: '30g walnuts + 20g dark chocolate',
          calories: 280,
          protein: 7,
          carbs: 12,
          fats: 24
        }
      ]
    },
    guidelines: [
      'Include omega-3 rich foods daily (fatty fish 2-3 times/week)',
      'Eat 7-9 servings of fruits and vegetables daily',
      'Use anti-inflammatory spices (turmeric, ginger, cinnamon)',
      'Avoid processed foods and refined sugars'
    ]
  },
  {
    id: 10,
    name: "High-Protein Diet",
    description:
      "Build and maintain muscle mass while supporting weight loss through increased protein intake.",
    image:
      "https://images.pexels.com/photos/1624487/pexels-photo-1624487.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
      calories: '2000-2400 per day',
    category: "Weight Loss",
    difficulty: "Medium",
    duration: "10 weeks",
    macros: {
      protein: '40-45%',
      carbs: '30-35%',
      fats: '25-30%'
    },
    benefits: [
      'Increased muscle mass',
      'Better recovery',
      'Reduced hunger',
      'Improved metabolism',
      'Preserved lean body mass'
    ],
    mealPlan: {
      breakfast: [
        {
          item: 'Protein pancakes',
          portion: '3 pancakes (60g protein powder + oats)',
          calories: 420,
          protein: 35,
          carbs: 45,
          fats: 12
        },
        {
          item: 'Egg white omelet',
          portion: '6 egg whites + vegetables + 1 whole egg',
          calories: 280,
          protein: 32,
          carbs: 8,
          fats: 10
        },
        {
          item: 'Protein smoothie bowl',
          portion: '30g protein + fruits + granola',
          calories: 380,
          protein: 30,
          carbs: 42,
          fats: 14
        }
      ],
      lunch: [
        {
          item: 'Grilled chicken breast',
          portion: '200g chicken + sweet potato + vegetables',
          calories: 450,
          protein: 45,
          carbs: 35,
          fats: 12
        },
        {
          item: 'Turkey and quinoa bowl',
          portion: '180g turkey + 1 cup quinoa + vegetables',
          calories: 420,
          protein: 40,
          carbs: 38,
          fats: 14
        },
        {
          item: 'Tuna salad',
          portion: '170g tuna + mixed greens + olive oil',
          calories: 380,
          protein: 42,
          carbs: 12,
          fats: 18
        }
      ],
      dinner: [
        {
          item: 'Lean beef stir-fry',
          portion: '180g beef + vegetables + brown rice',
          calories: 480,
          protein: 42,
          carbs: 45,
          fats: 16
        },
        {
          item: 'Baked fish',
          portion: '200g white fish + quinoa + vegetables',
          calories: 420,
          protein: 45,
          carbs: 32,
          fats: 12
        },
        {
          item: 'Protein-packed pasta',
          portion: '100g protein pasta + lean meat sauce',
          calories: 450,
          protein: 38,
          carbs: 48,
          fats: 14
        }
      ],
      snacks: [
        {
          item: 'Protein shake',
          portion: '30g protein powder + 300ml milk',
          calories: 180,
          protein: 25,
          carbs: 12,
          fats: 3
        },
        {
          item: 'Greek yogurt',
          portion: '200g yogurt + berries + honey',
          calories: 220,
          protein: 22,
          carbs: 25,
          fats: 5
        },
        {
          item: 'Cottage cheese with fruit',
          portion: '200g cottage cheese + 100g fruit',
          calories: 240,
          protein: 28,
          carbs: 20,
          fats: 4
        }
      ]
    },
    guidelines: [
      'Consume 1.6-2.2g of protein per kg of body weight',
      'Space protein intake evenly throughout the day (25-40g per meal)',
      'Drink 3-4 liters of water daily',
      'Time protein intake around workouts (within 2 hours)'
    ]
  },
  {
    id: 11,
    name: "Mediterranean-DASH Diet",
    description:
      "Combine the best of Mediterranean and DASH diets for heart health and weight management.",
    image:
      "https://images.pexels.com/photos/5638609/pexels-photo-5638609.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
      calories: '2000-2400 per day',
    category: "Health",
    difficulty: "Medium",
    duration: "14 weeks",
    macros: {
      protein: '20-25%',
      carbs: '50-55%',
      fats: '25-30%'
    },
    benefits: [
      'Improved heart health',
      'Lower blood pressure',
      'Better weight management',
      'Reduced inflammation'
    ],
    mealPlan: {
      breakfast: [
        {
          item: 'Mediterranean oatmeal',
          portion: '1 cup oats + nuts + honey',
          calories: 350,
          protein: 12,
          carbs: 45,
          fats: 15
        }
      ],
      lunch: [
        {
          item: 'Greek salad with chicken',
          portion: '150g chicken + vegetables + olive oil',
          calories: 400,
          protein: 35,
          carbs: 20,
          fats: 25
        }
      ],
      dinner: [
        {
          item: 'Baked fish with quinoa',
          portion: '180g fish + 1 cup quinoa',
          calories: 450,
          protein: 40,
          carbs: 45,
          fats: 15
        }
      ],
      snacks: [
        {
          item: 'Fresh fruit and nuts',
          portion: '1 fruit + 30g nuts',
          calories: 250,
          protein: 8,
          carbs: 25,
          fats: 16
        }
      ]
    },
    guidelines: [
      'Limit sodium to 2,300mg per day',
      'Eat plenty of fruits and vegetables',
      'Use olive oil as primary fat source',
      'Include lean proteins and whole grains'
    ]
  },
  {
    id: 12,
    name: "Whole30 Diet",
    description:
      "Reset your nutrition with 30 days of whole foods and elimination of processed ingredients.",
    image:
      "https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
      calories: '1800-2200 per day',
    category: "Weight Loss",
    difficulty: "Hard",
    duration: "4 weeks",
    macros: {
      protein: '30-35%',
      carbs: '30-35%',
      fats: '35-40%'
    },
    benefits: [
      'Food sensitivity identification',
      'Improved digestion',
      'Better sleep quality',
      'Increased energy'
    ],
    mealPlan: {
      breakfast: [
        {
          item: 'Sweet potato hash',
          portion: '1 medium potato + 2 eggs + vegetables',
          calories: 400,
          protein: 20,
          carbs: 35,
          fats: 25
        }
      ],
      lunch: [
        {
          item: 'Chicken and vegetable bowl',
          portion: '150g chicken + mixed vegetables',
          calories: 350,
          protein: 35,
          carbs: 20,
          fats: 18
        }
      ],
      dinner: [
        {
          item: 'Grilled steak',
          portion: '180g steak + roasted vegetables',
          calories: 450,
          protein: 40,
          carbs: 25,
          fats: 25
        }
      ],
      snacks: [
        {
          item: 'Approved fruits and nuts',
          portion: 'Apple + almonds',
          calories: 200,
          protein: 6,
          carbs: 25,
          fats: 12
        }
      ]
    },
    guidelines: [
      'No grains, legumes, dairy, or added sugars',
      'Focus on whole, unprocessed foods',
      'Read all food labels carefully',
      'No alcohol or processed foods'
    ]
  },
];