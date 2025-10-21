from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI, HTTPException
from contextlib import asynccontextmanager
from pydantic import BaseModel
import os
import logging
import asyncpg
import anthropic
import google.generativeai as genai
from llamaapi import LlamaAPI
from openai import OpenAI

# ====== Environment Keys ======
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
LLAMA_API_KEY = os.getenv("LLAMA_API_KEY", "")
ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY", "")

# Initialize clients
if OPENAI_API_KEY:
    openai_client = OpenAI(api_key=OPENAI_API_KEY)
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)
if LLAMA_API_KEY:
    llama_client = LlamaAPI(LLAMA_API_KEY)
if ANTHROPIC_API_KEY:
    anthropic_client = anthropic.Anthropic(api_key=ANTHROPIC_API_KEY)
    
# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Database configuration
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:password@localhost:54322/postgres")

# Global variables for database connection
db_pool = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initialize database connection on startup"""
    global db_pool
    
    try:
        # Initialize database connection pool
        db_pool = await asyncpg.create_pool(DATABASE_URL, min_size=1, max_size=10)
        logger.info("Database connection pool initialized")
        
        yield
        
    finally:
        # Cleanup
        if db_pool:
            await db_pool.close()
        logger.info("Application shutdown complete")

app = FastAPI(
    title="Meal Generation ML Service",
    description="Machine learning service for personalized meal plan generation",
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

# ====== Template Prompt ======
TEMPLATE_PROMPT = """
User preferences are: {user_preferences}.
User restrictions are: {user_restrictions}.
User's goal is to create a meal plan that meets the following targets:
- Total daily calories: {total_calories} kcal.
- Total daily protein: {target_protein}g.
- Total daily sugar: {target_sugar}g.
The plan must include:
- Breakfast, lunch, dinner, and snacks.
- The calorie count for each meal (e.g., "Breakfast: 400 kcal").
- At the end of each meal plan option, provide the total calories, total fat, total protein, and total carbohydrate.
- For each item in the meal plans (e.g., breakfast, lunch), specify the exact portion sizes, including the number of items or volume (e.g., "1 Kit Kat bar (45g)," "1 hamburger with a 150g beef patty, bun, and lettuce").
- Provide a short recipe for each item in the meal plan, detailing how it can be prepared (e.g., "Grill the patty for 5 minutes, then assemble with lettuce, tomato, and a bun").
Provide three different meal plan options for diversity.
Use familiar dishes instead of listing individual food items. For example, use "hamburger" instead of "150 grams of meat with bun and lettuce."
Ensure the plan adheres to the user's preferences and restrictions and meets the specified targets while maintaining a balanced nutritional profile.
Here is the available items for generating the meal plan:
{menu_input}
"""

# ====== Input Models ======
class MenuItem(BaseModel):
    foods: dict
    energy: float
    protein: float
    sugar: float

class GenerateRequest(BaseModel):
    menus: list[MenuItem]
    preferences: str = ""
    restrictions: str = ""
    company: str = "openai"
    model_name: str = "gpt-4o"

# ====== Helper ======
def build_prompt(menu, prefs, restrict):
    menu_input = "\n".join([f"{f} = {q}" for f, q in menu['foods'].items()])
    return TEMPLATE_PROMPT.format(
        user_preferences=prefs,
        user_restrictions=restrict,
        total_calories=menu["energy"],
        target_protein=menu["protein"],
        target_sugar=menu["sugar"],
        menu_input=menu_input
    )

# ====== API Route ======
@app.post("/generate")
def generate(request: GenerateRequest):
    try:
        responses = []
        for menu in request.menus:
            prompt = build_prompt(menu.dict(), request.preferences, request.restrictions)
            if request.company == "openai":
                res = openai_client.chat.completions.create(
                    model=request.model_name,
                    messages=[{"role": "user", "content": prompt}],
                    max_tokens=2000,
                    temperature=0.7
                )
                content = res.choices[0].message.content
            elif request.company == "anthropic":
                msg = anthropic_client.messages.create(
                    model=request.model_name,
                    max_tokens=2000,
                    messages=[{"role": "user", "content": prompt}]
                )
                content = msg.content[0].text
            else:
                content = "Unsupported model company"
            responses.append(content)
        return {"responses": responses}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)