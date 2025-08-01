from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import uuid
import hashlib
import base64
from datetime import datetime
import asyncio

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Pydantic Models
class UserRegistration(BaseModel):
    phone_number: str
    phrase: str

class User(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    phone_number: str
    nickname: str
    avatar_base64: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

class Message(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    sender_id: str
    content: str
    message_type: str = "text"  # text, voice, image, location, video, red_packet
    voice_base64: Optional[str] = None
    image_base64: Optional[str] = None
    location_data: Optional[Dict[str, Any]] = None
    video_base64: Optional[str] = None
    red_packet_data: Optional[Dict[str, Any]] = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    translations: Dict[str, str] = {}

class MessageCreate(BaseModel):
    sender_id: str
    content: str
    message_type: str = "text"
    voice_base64: Optional[str] = None
    image_base64: Optional[str] = None
    location_data: Optional[Dict[str, Any]] = None
    video_base64: Optional[str] = None
    red_packet_data: Optional[Dict[str, Any]] = None

class TranslationRequest(BaseModel):
    text: str
    target_language: str

# Hash-based nickname generation
def generate_nickname(phone_number: str, phrase: str) -> str:
    """Generate a deterministic encoded nickname from phone number and phrase using hash"""
    combined = f"{phone_number}_{phrase}"
    hash_object = hashlib.sha256(combined.encode())
    hex_dig = hash_object.hexdigest()
    
    # Create a more readable encoded nickname
    prefixes = ["Neo", "Zyx", "Kai", "Rin", "Lux", "Arc", "Vex", "Zed"]
    suffixes = ["X7", "Q9", "R4", "T8", "M3", "N6", "P2", "K5"]
    
    prefix_idx = int(hex_dig[:2], 16) % len(prefixes)
    suffix_idx = int(hex_dig[2:4], 16) % len(suffixes)
    middle = hex_dig[4:8].upper()
    
    return f"{prefixes[prefix_idx]}{middle}{suffixes[suffix_idx]}"

# Mock avatar generation (will be replaced with Gemini)
def generate_mock_avatar(phone_number: str) -> str:
    """Generate a mock avatar as base64 string"""
    # This creates a simple colored square as a placeholder
    # In production, this would use Gemini image generation
    from PIL import Image, ImageDraw
    import io
    
    hash_object = hashlib.sha256(phone_number.encode())
    color_seed = int(hash_object.hexdigest()[:6], 16)
    
    # Generate RGB color from hash
    r = (color_seed >> 16) & 255
    g = (color_seed >> 8) & 255
    b = color_seed & 255
    
    # Create a simple avatar image
    img = Image.new('RGB', (100, 100), color=(r, g, b))
    draw = ImageDraw.Draw(img)
    
    # Add some simple patterns
    draw.ellipse([20, 20, 80, 80], fill=(255-r, 255-g, 255-b))
    draw.ellipse([40, 40, 60, 60], fill=(r, g, b))
    
    # Convert to base64
    buffer = io.BytesIO()
    img.save(buffer, format='PNG')
    img_base64 = base64.b64encode(buffer.getvalue()).decode('utf-8')
    
    return img_base64

# Simple translation function (built-in solution)
LANGUAGE_TRANSLATIONS = {
    'en': {'hello': 'hello', 'goodbye': 'goodbye', 'thank you': 'thank you'},
    'es': {'hello': 'hola', 'goodbye': 'adiós', 'thank you': 'gracias'},
    'fr': {'hello': 'bonjour', 'goodbye': 'au revoir', 'thank you': 'merci'},
    'de': {'hello': 'hallo', 'goodbye': 'auf wiedersehen', 'thank you': 'danke'},
    'zh': {'hello': '你好', 'goodbye': '再见', 'thank you': '谢谢'},
    'ja': {'hello': 'こんにちは', 'goodbye': 'さようなら', 'thank you': 'ありがとう'},
    'ko': {'hello': '안녕하세요', 'goodbye': '안녕히 가세요', 'thank you': '감사합니다'},
    'ru': {'hello': 'привет', 'goodbye': 'до свидания', 'thank you': 'спасибо'},
    'ar': {'hello': 'مرحبا', 'goodbye': 'وداعا', 'thank you': 'شكرا'},
    'hi': {'hello': 'नमस्ते', 'goodbye': 'अलविदा', 'thank you': 'धन्यवाद'}
}

def simple_translate(text: str, target_lang: str) -> str:
    """Simple built-in translation - in production would use proper translation service"""
    text_lower = text.lower()
    
    # Check if we have a direct translation
    for lang_code, translations in LANGUAGE_TRANSLATIONS.items():
        if lang_code == target_lang:
            for key, value in translations.items():
                if key in text_lower:
                    return text_lower.replace(key, value)
    
    # If no translation found, return original with language indicator
    return f"[{target_lang.upper()}] {text}"

# API Routes
@api_router.post("/register", response_model=User)
async def register_user(registration: UserRegistration):
    """Register a new user with phone number and phrase"""
    try:
        # Check if user already exists
        existing_user = await db.users.find_one({"phone_number": registration.phone_number})
        if existing_user:
            return User(**existing_user)
        
        # Generate nickname using hash algorithm
        nickname = generate_nickname(registration.phone_number, registration.phrase)
        
        # Generate mock avatar (will be Gemini in production)
        avatar_base64 = generate_mock_avatar(registration.phone_number)
        
        # Create user
        user = User(
            phone_number=registration.phone_number,
            nickname=nickname,
            avatar_base64=avatar_base64
        )
        
        # Save to database
        await db.users.insert_one(user.dict())
        
        return user
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Registration failed: {str(e)}")

@api_router.get("/users", response_model=List[User])
async def get_users():
    """Get all users"""
    users = await db.users.find().to_list(1000)
    return [User(**user) for user in users]

@api_router.get("/users/{user_id}", response_model=User)
async def get_user(user_id: str):
    """Get a specific user"""
    user = await db.users.find_one({"id": user_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return User(**user)

@api_router.post("/messages", response_model=Message)
async def create_message(message: MessageCreate):
    """Create a new message"""
    try:
        message_obj = Message(**message.dict())
        await db.messages.insert_one(message_obj.dict())
        return message_obj
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create message: {str(e)}")

@api_router.get("/messages", response_model=List[Message])
async def get_messages():
    """Get all messages sorted by timestamp"""
    messages = await db.messages.find().sort("timestamp", -1).to_list(1000)
    return [Message(**message) for message in messages]

@api_router.post("/translate")
async def translate_text(request: TranslationRequest):
    """Translate text to target language"""
    try:
        translated = simple_translate(request.text, request.target_language)
        return {"original": request.text, "translated": translated, "language": request.target_language}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Translation failed: {str(e)}")

@api_router.get("/languages")
async def get_supported_languages():
    """Get list of supported languages (52 languages simulation)"""
    languages = [
        {"code": "en", "name": "English"},
        {"code": "es", "name": "Spanish"},
        {"code": "fr", "name": "French"},
        {"code": "de", "name": "German"},
        {"code": "zh", "name": "Chinese"},
        {"code": "ja", "name": "Japanese"},
        {"code": "ko", "name": "Korean"},
        {"code": "ru", "name": "Russian"},
        {"code": "ar", "name": "Arabic"},
        {"code": "hi", "name": "Hindi"},
        {"code": "pt", "name": "Portuguese"},
        {"code": "it", "name": "Italian"},
        {"code": "nl", "name": "Dutch"},
        {"code": "sv", "name": "Swedish"},
        {"code": "no", "name": "Norwegian"},
        {"code": "da", "name": "Danish"},
        {"code": "fi", "name": "Finnish"},
        {"code": "pl", "name": "Polish"},
        {"code": "tr", "name": "Turkish"},
        {"code": "he", "name": "Hebrew"},
        {"code": "th", "name": "Thai"},
        {"code": "vi", "name": "Vietnamese"},
        {"code": "id", "name": "Indonesian"},
        {"code": "ms", "name": "Malay"},
        {"code": "tl", "name": "Filipino"},
        {"code": "uk", "name": "Ukrainian"},
        {"code": "cs", "name": "Czech"},
        {"code": "sk", "name": "Slovak"},
        {"code": "hu", "name": "Hungarian"},
        {"code": "ro", "name": "Romanian"},
        {"code": "bg", "name": "Bulgarian"},
        {"code": "hr", "name": "Croatian"},
        {"code": "sr", "name": "Serbian"},
        {"code": "sl", "name": "Slovenian"},
        {"code": "et", "name": "Estonian"},
        {"code": "lv", "name": "Latvian"},
        {"code": "lt", "name": "Lithuanian"},
        {"code": "mt", "name": "Maltese"},
        {"code": "ga", "name": "Irish"},
        {"code": "cy", "name": "Welsh"},
        {"code": "is", "name": "Icelandic"},
        {"code": "mk", "name": "Macedonian"},
        {"code": "sq", "name": "Albanian"},
        {"code": "bs", "name": "Bosnian"},
        {"code": "me", "name": "Montenegrin"},
        {"code": "eu", "name": "Basque"},
        {"code": "ca", "name": "Catalan"},
        {"code": "gl", "name": "Galician"},
        {"code": "ast", "name": "Asturian"},
        {"code": "an", "name": "Aragonese"},
        {"code": "ext", "name": "Extremaduran"},
        {"code": "mwl", "name": "Mirandese"}
    ]
    return {"languages": languages, "total": len(languages)}

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()