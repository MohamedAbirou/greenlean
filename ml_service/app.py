"""
ML Microservice for Meal Generation Learning and Prediction

This service provides machine learning capabilities for:
1. Learning from user feedback on meals
2. Predicting optimal meal templates and portion sizes
3. Continuous improvement of meal recommendations
"""

from fastapi import FastAPI, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Dict, Optional, Any
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.metrics import mean_squared_error, r2_score
import joblib
import os
import logging
from datetime import datetime, timedelta
import asyncio
import asyncpg
from contextlib import asynccontextmanager
from fastapi.middleware.cors import CORSMiddleware


# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Database configuration
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:password@localhost:54322/postgres")

# Global variables for models and database connection
models = {}
db_pool = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initialize models and database connection on startup"""
    global models, db_pool
    
    try:
        # Initialize database connection pool
        db_pool = await asyncpg.create_pool(DATABASE_URL, min_size=1, max_size=10)
        logger.info("Database connection pool initialized")
        
        # Load or train models
        await initialize_models()
        
        yield
        
    finally:
        # Cleanup
        if db_pool:
            await db_pool.close()
        logger.info("Application shutdown complete")

app = FastAPI(
    title="Meal Generation ML Service",
    description="Machine learning service for personalized meal recommendations",
    version="1.0.0",
    lifespan=lifespan
)


# Add this **after your FastAPI app initialization**
origins = [
    "http://localhost:5173",  # your frontend
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # or ["*"] to allow all (only for testing)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Pydantic models for API
class UserFeedback(BaseModel):
    user_id: str
    meal_id: str
    meal_name: str
    template_name: Optional[str]
    rating: Optional[int] = None
    liked: Optional[bool] = None
    satiety_score: Optional[int] = None
    goal_progress_score: Optional[int] = None
    feedback_text: Optional[str] = None
    consumed: bool = False
    consumed_date: Optional[str] = None

class MealPredictionRequest(BaseModel):
    user_id: str
    user_profile: Dict[str, Any]
    macro_targets: Dict[str, float]
    meal_type: str
    available_templates: List[str]

class MealPrediction(BaseModel):
    recommended_templates: List[str]
    portion_sizes: Dict[str, float]
    confidence: float
    reasoning: str

class ModelPerformance(BaseModel):
    model_name: str
    metric_name: str
    metric_value: float
    evaluation_date: str
    training_data_size: int
    test_data_size: int

# Database dependency
async def get_db():
    async with db_pool.acquire() as connection:
        yield connection

async def initialize_models():
    """Initialize or train ML models"""
    global models
    
    try:
        # Check if we have enough data to train models
        async with db_pool.acquire() as conn:
            feedback_count = await conn.fetchval("SELECT COUNT(*) FROM meal_feedback WHERE rating IS NOT NULL")
            generation_count = await conn.fetchval("SELECT COUNT(*) FROM meal_generation_logs")
            
        if feedback_count < 100 or generation_count < 100:
            logger.warning(f"Insufficient data for training: {feedback_count} feedback, {generation_count} generations")
            return
            
        # Train models
        await train_rating_prediction_model()
        await train_satiety_prediction_model()
        await train_goal_progress_model()
        await train_template_selection_model()
        
        logger.info("All models trained successfully")
        
    except Exception as e:
        logger.error(f"Error initializing models: {e}")

async def train_rating_prediction_model():
    """Train model to predict meal ratings"""
    try:
        async with db_pool.acquire() as conn:
            # Fetch training data
            query = """
            SELECT 
                mf.rating,
                mgl.template_name,
                mgl.macro_alignment_score,
                mgl.health_condition_score,
                mgl.variety_score,
                mgl.total_score,
                mgl.final_calories,
                mgl.final_protein,
                mgl.final_carbs,
                mgl.final_fats,
                mgl.health_conditions,
                mgl.dietary_restrictions,
                mgl.goal,
                mgl.diet_type,
                up.preference_value as user_preference
            FROM meal_feedback mf
            JOIN meal_generation_logs mgl ON mf.meal_id = mgl.id
            LEFT JOIN user_preferences up ON mf.user_id = up.user_id 
                AND up.preference_type = 'food_likes'
            WHERE mf.rating IS NOT NULL
            """
            
            rows = await conn.fetch(query)
            
        if len(rows) < 50:
            logger.warning("Insufficient data for rating prediction model")
            return
            
        # Prepare features
        df = pd.DataFrame(rows)
        
        # Feature engineering
        features = prepare_features(df)
        target = df['rating'].values
        
        # Train model
        X_train, X_test, y_train, y_test = train_test_split(
            features, target, test_size=0.2, random_state=42
        )
        
        model = GradientBoostingRegressor(
            n_estimators=100,
            learning_rate=0.1,
            max_depth=6,
            random_state=42
        )
        
        model.fit(X_train, y_train)
        
        # Evaluate model
        y_pred = model.predict(X_test)
        mse = mean_squared_error(y_test, y_pred)
        r2 = r2_score(y_test, y_pred)
        
        logger.info(f"Rating prediction model - MSE: {mse:.3f}, R²: {r2:.3f}")
        
        # Save model
        models['rating_prediction'] = model
        
        # Log performance
        await log_model_performance(
            'rating_prediction',
            'mse',
            mse,
            len(X_train),
            len(X_test)
        )
        
    except Exception as e:
        logger.error(f"Error training rating prediction model: {e}")

async def train_satiety_prediction_model():
    """Train model to predict satiety scores"""
    try:
        async with db_pool.acquire() as conn:
            query = """
            SELECT 
                mf.satiety_score,
                mgl.final_protein,
                mgl.final_carbs,
                mgl.final_fats,
                mgl.final_calories,
                mgl.health_conditions,
                mgl.goal
            FROM meal_feedback mf
            JOIN meal_generation_logs mgl ON mf.meal_id = mgl.id
            WHERE mf.satiety_score IS NOT NULL
            """
            
            rows = await conn.fetch(query)
            
        if len(rows) < 50:
            logger.warning("Insufficient data for satiety prediction model")
            return
            
        df = pd.DataFrame(rows)
        features = prepare_satiety_features(df)
        target = df['satiety_score'].values
        
        X_train, X_test, y_train, y_test = train_test_split(
            features, target, test_size=0.2, random_state=42
        )
        
        model = RandomForestRegressor(
            n_estimators=100,
            max_depth=8,
            random_state=42
        )
        
        model.fit(X_train, y_train)
        
        y_pred = model.predict(X_test)
        mse = mean_squared_error(y_test, y_pred)
        r2 = r2_score(y_test, y_pred)
        
        logger.info(f"Satiety prediction model - MSE: {mse:.3f}, R²: {r2:.3f}")
        
        models['satiety_prediction'] = model
        
        await log_model_performance(
            'satiety_prediction',
            'mse',
            mse,
            len(X_train),
            len(X_test)
        )
        
    except Exception as e:
        logger.error(f"Error training satiety prediction model: {e}")

async def train_goal_progress_model():
    """Train model to predict goal progress scores"""
    try:
        async with db_pool.acquire() as conn:
            query = """
            SELECT 
                mf.goal_progress_score,
                mgl.final_protein,
                mgl.final_carbs,
                mgl.final_fats,
                mgl.final_calories,
                mgl.goal,
                mgl.diet_type,
                mgl.health_conditions
            FROM meal_feedback mf
            JOIN meal_generation_logs mgl ON mf.meal_id = mgl.id
            WHERE mf.goal_progress_score IS NOT NULL
            """
            
            rows = await conn.fetch(query)
            
        if len(rows) < 50:
            logger.warning("Insufficient data for goal progress model")
            return
            
        df = pd.DataFrame(rows)
        features = prepare_goal_progress_features(df)
        target = df['goal_progress_score'].values
        
        X_train, X_test, y_train, y_test = train_test_split(
            features, target, test_size=0.2, random_state=42
        )
        
        model = GradientBoostingRegressor(
            n_estimators=100,
            learning_rate=0.1,
            max_depth=6,
            random_state=42
        )
        
        model.fit(X_train, y_train)
        
        y_pred = model.predict(X_test)
        mse = mean_squared_error(y_test, y_pred)
        r2 = r2_score(y_test, y_pred)
        
        logger.info(f"Goal progress model - MSE: {mse:.3f}, R²: {r2:.3f}")
        
        models['goal_progress'] = model
        
        await log_model_performance(
            'goal_progress',
            'mse',
            mse,
            len(X_train),
            len(X_test)
        )
        
    except Exception as e:
        logger.error(f"Error training goal progress model: {e}")

async def train_template_selection_model():
    """Train model to predict best template selection"""
    try:
        async with db_pool.acquire() as conn:
            query = """
            SELECT 
                mgl.template_name,
                mgl.template_score,
                mgl.macro_alignment_score,
                mgl.health_condition_score,
                mgl.variety_score,
                mgl.total_score,
                mgl.goal,
                mgl.diet_type,
                mgl.health_conditions,
                mgl.dietary_restrictions,
                CASE WHEN mf.liked = true THEN 1 ELSE 0 END as user_liked
            FROM meal_generation_logs mgl
            LEFT JOIN meal_feedback mf ON mgl.id = mf.meal_id
            WHERE mgl.template_name IS NOT NULL
            """
            
            rows = await conn.fetch(query)
            
        if len(rows) < 100:
            logger.warning("Insufficient data for template selection model")
            return
            
        df = pd.DataFrame(rows)
        features = prepare_template_selection_features(df)
        target = df['user_liked'].fillna(0.5).values  # Default to neutral if no feedback
        
        X_train, X_test, y_train, y_test = train_test_split(
            features, target, test_size=0.2, random_state=42
        )
        
        model = RandomForestRegressor(
            n_estimators=100,
            max_depth=8,
            random_state=42
        )
        
        model.fit(X_train, y_train)
        
        y_pred = model.predict(X_test)
        mse = mean_squared_error(y_test, y_pred)
        r2 = r2_score(y_test, y_pred)
        
        logger.info(f"Template selection model - MSE: {mse:.3f}, R²: {r2:.3f}")
        
        models['template_selection'] = model
        
        await log_model_performance(
            'template_selection',
            'mse',
            mse,
            len(X_train),
            len(X_test)
        )
        
    except Exception as e:
        logger.error(f"Error training template selection model: {e}")

def prepare_features(df: pd.DataFrame) -> np.ndarray:
    """Prepare features for rating prediction"""
    # Numerical features
    numerical_features = [
        'macro_alignment_score', 'health_condition_score', 'variety_score',
        'total_score', 'final_calories', 'final_protein', 'final_carbs', 'final_fats'
    ]
    
    # Handle missing values
    for col in numerical_features:
        if col in df.columns:
            df[col] = df[col].fillna(df[col].median())
    
    # Categorical features (one-hot encoding)
    categorical_features = ['goal', 'diet_type']
    feature_arrays = []
    
    # Add numerical features
    for col in numerical_features:
        if col in df.columns:
            feature_arrays.append(df[col].values.reshape(-1, 1))
    
    # Add categorical features
    for col in categorical_features:
        if col in df.columns:
            dummies = pd.get_dummies(df[col], prefix=col)
            feature_arrays.append(dummies.values)
    
    # Combine all features
    if feature_arrays:
        return np.hstack(feature_arrays)
    else:
        return np.array([]).reshape(len(df), 0)

def prepare_satiety_features(df: pd.DataFrame) -> np.ndarray:
    """Prepare features for satiety prediction"""
    features = ['final_protein', 'final_carbs', 'final_fats', 'final_calories']
    
    for col in features:
        if col in df.columns:
            df[col] = df[col].fillna(df[col].median())
    
    return df[features].values

def prepare_goal_progress_features(df: pd.DataFrame) -> np.ndarray:
    """Prepare features for goal progress prediction"""
    numerical_features = ['final_protein', 'final_carbs', 'final_fats', 'final_calories']
    categorical_features = ['goal', 'diet_type']
    
    feature_arrays = []
    
    # Add numerical features
    for col in numerical_features:
        if col in df.columns:
            df[col] = df[col].fillna(df[col].median())
            feature_arrays.append(df[col].values.reshape(-1, 1))
    
    # Add categorical features
    for col in categorical_features:
        if col in df.columns:
            dummies = pd.get_dummies(df[col], prefix=col)
            feature_arrays.append(dummies.values)
    
    return np.hstack(feature_arrays) if feature_arrays else np.array([]).reshape(len(df), 0)

def prepare_template_selection_features(df: pd.DataFrame) -> np.ndarray:
    """Prepare features for template selection"""
    numerical_features = [
        'template_score', 'macro_alignment_score', 'health_condition_score',
        'variety_score', 'total_score'
    ]
    categorical_features = ['goal', 'diet_type']
    
    feature_arrays = []
    
    # Add numerical features
    for col in numerical_features:
        if col in df.columns:
            df[col] = df[col].fillna(df[col].median())
            feature_arrays.append(df[col].values.reshape(-1, 1))
    
    # Add categorical features
    for col in categorical_features:
        if col in df.columns:
            dummies = pd.get_dummies(df[col], prefix=col)
            feature_arrays.append(dummies.values)
    
    return np.hstack(feature_arrays) if feature_arrays else np.array([]).reshape(len(df), 0)

async def log_model_performance(
    model_name: str,
    metric_name: str,
    metric_value: float,
    training_size: int,
    test_size: int
):
    """Log model performance to database"""
    try:
        async with db_pool.acquire() as conn:
            await conn.execute("""
                INSERT INTO ml_model_performance 
                (model_version, metric_name, metric_value, training_data_size, test_data_size)
                VALUES ($1, $2, $3, $4, $5)
            """, model_name, metric_name, metric_value, training_size, test_size)
    except Exception as e:
        logger.error(f"Error logging model performance: {e}")

async def process_feedback_for_learning(feedback: UserFeedback, db):
    """Process feedback to extract food preferences and restrictions for learning"""
    try:
        # Extract food restrictions from feedback text
        if feedback.feedback_text:
            restrictions = extract_food_restrictions(feedback.feedback_text)
            
            # Store user preferences based on feedback
            for restriction in restrictions:
                await db.execute("""
                    INSERT INTO user_preferences 
                    (user_id, preference_type, preference_key, preference_value, confidence, last_updated)
                    VALUES ($1, $2, $3, $4, $5, $6)
                    ON CONFLICT (user_id, preference_type, preference_key)
                    DO UPDATE SET 
                        preference_value = EXCLUDED.preference_value,
                        confidence = EXCLUDED.confidence,
                        last_updated = EXCLUDED.last_updated
                """, 
                feedback.user_id, 'food_restrictions', restriction['food'], 
                restriction['value'], restriction['confidence'], 
                datetime.now().isoformat())
        
        # Store template preference based on rating
        if feedback.template_name and feedback.rating:
            preference_value = (feedback.rating - 3) / 2  # Convert 1-5 to -1 to +1
            confidence = 0.8 if abs(preference_value) > 0.5 else 0.6
            
            await db.execute("""
                INSERT INTO user_preferences 
                (user_id, preference_type, preference_key, preference_value, confidence, last_updated)
                VALUES ($1, $2, $3, $4, $5, $6)
                ON CONFLICT (user_id, preference_type, preference_key)
                DO UPDATE SET 
                    preference_value = EXCLUDED.preference_value,
                    confidence = EXCLUDED.confidence,
                    last_updated = EXCLUDED.last_updated
            """, 
            feedback.user_id, 'template_likes', feedback.template_name, 
            preference_value, confidence, datetime.now().isoformat())
            
    except Exception as e:
        logger.error(f"Error processing feedback for learning: {e}")

def extract_food_restrictions(feedback_text: str) -> List[Dict[str, Any]]:
    """Extract food restrictions from feedback text using keyword matching"""
    restrictions = []
    text_lower = feedback_text.lower()
    
    # Define food restriction patterns
    restriction_patterns = {
        'pork': ['pork', 'ham', 'bacon', 'sausage', 'haram'],
        'beef': ['beef', 'steak', 'hamburger'],
        'chicken': ['chicken', 'poultry'],
        'fish': ['fish', 'salmon', 'tuna', 'seafood'],
        'dairy': ['dairy', 'milk', 'cheese', 'yogurt', 'lactose'],
        'gluten': ['gluten', 'wheat', 'bread', 'pasta'],
        'nuts': ['nuts', 'peanuts', 'almonds', 'walnuts'],
        'shellfish': ['shellfish', 'shrimp', 'crab', 'lobster'],
        'eggs': ['eggs', 'egg']
    }
    
    # Check for negative sentiment words
    negative_words = ['dont', "don't", 'hate', 'dislike', 'avoid', 'cant', "can't", 'allergic', 'intolerant']
    has_negative = any(word in text_lower for word in negative_words)
    
    if has_negative:
        for food_type, keywords in restriction_patterns.items():
            if any(keyword in text_lower for keyword in keywords):
                restrictions.append({
                    'food': food_type,
                    'value': -0.9,  # Strong negative preference
                    'confidence': 0.9
                })
    
    return restrictions

# API Endpoints

@app.post("/feedback", response_model=Dict[str, str])
async def submit_feedback(feedback: UserFeedback, db=Depends(get_db)):
    """Submit user feedback for a meal"""
    try:
        await db.execute("""
            INSERT INTO meal_feedback 
            (user_id, meal_id, meal_name, template_name, rating, liked, 
             satiety_score, goal_progress_score, feedback_text, consumed, consumed_date)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        """, 
        feedback.user_id, feedback.meal_id, feedback.meal_name, feedback.template_name,
        feedback.rating, feedback.liked, feedback.satiety_score, feedback.goal_progress_score,
        feedback.feedback_text, feedback.consumed, feedback.consumed_date)
        
        # Process feedback for learning - extract food preferences and restrictions
        await process_feedback_for_learning(feedback, db)
        
        return {"status": "success", "message": "Feedback submitted successfully"}
        
    except Exception as e:
        logger.error(f"Error submitting feedback: {e}")
        raise HTTPException(status_code=500, detail="Failed to submit feedback")

@app.post("/predict", response_model=MealPrediction)
async def predict_meal(request: MealPredictionRequest, db=Depends(get_db)):
    """Predict optimal meal template and portion sizes"""
    try:
        if 'template_selection' not in models:
            # Fallback to rule-based prediction
            return await rule_based_prediction(request, db)
        
        # Use ML model for prediction
        model = models['template_selection']
        
        # Prepare features for prediction
        features = prepare_prediction_features(request, db)
        
        if features.size == 0:
            return await rule_based_prediction(request, db)
        
        # Get predictions for all available templates
        template_scores = {}
        for template in request.available_templates:
            # Modify features for this template
            template_features = features.copy()
            # Add template-specific features if available
            
            score = model.predict([template_features])[0]
            template_scores[template] = score
        
        # Sort templates by score
        sorted_templates = sorted(template_scores.items(), key=lambda x: x[1], reverse=True)
        
        # Select top templates
        recommended_templates = [t[0] for t in sorted_templates[:3]]
        
        # Predict portion sizes (simplified)
        portion_sizes = predict_portion_sizes(request.macro_targets, recommended_templates[0])
        
        # Calculate confidence based on score variance
        scores = [t[1] for t in sorted_templates[:3]]
        confidence = min(1.0, np.std(scores) / (np.mean(scores) + 1e-6))
        
        reasoning = f"Selected based on ML model with confidence {confidence:.2f}"
        
        return MealPrediction(
            recommended_templates=recommended_templates,
            portion_sizes=portion_sizes,
            confidence=confidence,
            reasoning=reasoning
        )
        
    except Exception as e:
        logger.error(f"Error in prediction: {e}")
        return await rule_based_prediction(request, db)

async def rule_based_prediction(request: MealPredictionRequest, db) -> MealPrediction:
    """Fallback rule-based prediction when ML model is not available"""
    # Simple rule-based logic
    goal = request.user_profile.get('goal', 'Maintain weight')
    diet_type = request.user_profile.get('dietType', 'omnivore')
    
    # Filter templates based on diet type
    suitable_templates = [t for t in request.available_templates if is_suitable_for_diet(t, diet_type)]
    
    if not suitable_templates:
        suitable_templates = request.available_templates[:3]
    
    # Predict portion sizes
    portion_sizes = predict_portion_sizes(request.macro_targets, suitable_templates[0])
    
    return MealPrediction(
        recommended_templates=suitable_templates[:3],
        portion_sizes=portion_sizes,
        confidence=0.5,
        reasoning="Rule-based prediction (ML model not available)"
    )

def is_suitable_for_diet(template_name: str, diet_type: str) -> bool:
    """Check if template is suitable for diet type"""
    if diet_type == "Vegan":
        return not any(meat in template_name.lower() for meat in ['chicken', 'beef', 'pork', 'turkey', 'fish', 'salmon', 'tuna'])
    elif diet_type == "Vegetarian":
        return not any(meat in template_name.lower() for meat in ['chicken', 'beef', 'pork', 'turkey', 'fish', 'salmon', 'tuna'])
    elif diet_type == "Keto":
        return not any(carb in template_name.lower() for carb in ['rice', 'pasta', 'bread', 'oats', 'quinoa'])
    return True

def predict_portion_sizes(macro_targets: Dict[str, float], template_name: str) -> Dict[str, float]:
    """Predict portion sizes for a template"""
    # Simplified portion size prediction
    base_calories = 400  # Base calories for most templates
    target_calories = macro_targets.get('calories', 500)
    
    scale_factor = target_calories / base_calories
    
    # Return scaling factors for different components
    return {
        'protein_scale': scale_factor,
        'carb_scale': scale_factor,
        'fat_scale': scale_factor,
        'vegetable_scale': scale_factor * 1.2  # More vegetables
    }

def prepare_prediction_features(request: MealPredictionRequest, db) -> np.ndarray:
    """Prepare features for ML prediction"""
    # This would need to be implemented based on the specific features
    # used in training. For now, return empty array.
    return np.array([]).reshape(1, 0)

@app.post("/retrain")
async def retrain_models():
    """Trigger model retraining"""
    try:
        await initialize_models()
        return {"status": "success", "message": "Models retrained successfully"}
    except Exception as e:
        logger.error(f"Error retraining models: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrain models")

@app.get("/performance", response_model=List[ModelPerformance])
async def get_model_performance(db=Depends(get_db)):
    """Get model performance metrics"""
    try:
        rows = await db.fetch("""
            SELECT model_version, metric_name, metric_value, evaluation_date,
                   training_data_size, test_data_size
            FROM ml_model_performance
            ORDER BY evaluation_date DESC
            LIMIT 50
        """)
        
        return [ModelPerformance(**row) for row in rows]
        
    except Exception as e:
        logger.error(f"Error fetching model performance: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch performance data")

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "models_loaded": list(models.keys()),
        "database_connected": db_pool is not None
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
