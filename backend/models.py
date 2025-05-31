from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime
from enum import Enum

# Database Models for Complete Data Persistence

class UserStatus(str, Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"
    SUSPENDED = "suspended"
    DELETED = "deleted"

class SubscriptionTier(str, Enum):
    FREE = "free"
    PREMIUM = "premium"
    PLATINUM = "platinum"

class MessageType(str, Enum):
    TEXT = "text"
    VOICE = "voice"
    IMAGE = "image"
    EMOJI = "emoji"

class AIPersonalityType(str, Enum):
    CARING = "caring"
    CREATIVE = "creative"
    ENERGETIC = "energetic"
    WISE = "wise"
    PLAYFUL = "playful"
    ROMANTIC = "romantic"
    MYSTERIOUS = "mysterious"
    ADVENTUROUS = "adventurous"

# User Data Model - Complete Customer Information Storage
class User(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: Optional[str] = None
    phone: Optional[str] = None
    name: str
    age: int
    gender: Optional[str] = None
    location: Optional[Dict[str, Any]] = None  # {"city": "", "country": "", "coordinates": []}
    bio: str
    interests: List[str] = []
    preferences: Dict[str, Any] = {}  # Dating preferences, AI companion preferences
    
    # Account Status
    status: UserStatus = UserStatus.ACTIVE
    email_verified: bool = False
    phone_verified: bool = False
    
    # Subscription & Credits
    subscription_tier: SubscriptionTier = SubscriptionTier.FREE
    credits: int = 10
    voice_minutes: int = 0
    subscription_expires_at: Optional[datetime] = None
    
    # Usage Statistics
    total_messages_sent: int = 0
    total_voice_minutes_used: int = 0
    total_ai_conversations: int = 0
    total_matches: int = 0
    last_active_at: Optional[datetime] = None
    
    # Privacy & Settings
    privacy_settings: Dict[str, bool] = {
        "show_online_status": True,
        "allow_location_based_matching": True,
        "allow_ai_data_training": True,
        "receive_notifications": True
    }
    
    # Device & Session Info
    device_info: Optional[Dict[str, str]] = None
    last_login_ip: Optional[str] = None
    login_count: int = 0
    
    # Timestamps
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    deleted_at: Optional[datetime] = None

# AI-Generated Virtual Companion Model
class AICompanion(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    personality: AIPersonalityType
    
    # AI-Generated Appearance
    avatar_url: str  # AI-generated profile image
    avatar_generation_prompt: str  # Original prompt used to generate avatar
    avatar_generation_model: str = "dall-e-3"  # AI model used
    avatar_variations: List[str] = []  # Multiple generated variations
    
    # Character Details
    age_appearance: int = 25
    gender_appearance: str = "neutral"
    ethnicity_appearance: str = "diverse"
    style_preference: str = "modern"
    
    # Personality & Behavior
    emoji: str = "🤖"
    description: str
    traits: List[str] = []
    conversation_style: str = "adaptive"
    humor_level: int = 5  # 1-10 scale
    emotional_intelligence: int = 8  # 1-10 scale
    
    # AI Model Configuration
    ai_model: str = "gpt-4"
    voice_model: str = "elevenlabs"
    voice_id: Optional[str] = None
    language_support: List[str] = ["en"]
    
    # Companion Settings
    is_premium: bool = False
    is_nsfw: bool = False
    age_restriction: int = 18
    voice_enabled: bool = True
    
    # Usage & Analytics
    total_conversations: int = 0
    total_users_interacted: int = 0
    average_conversation_length: float = 0.0
    user_satisfaction_rating: float = 4.5
    
    # Administrative
    created_by: str = "system"  # admin user ID
    is_active: bool = True
    featured: bool = False
    
    # Timestamps
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

# Conversation Message Storage
class ChatMessage(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    conversation_id: str
    user_id: str
    companion_id: Optional[str] = None  # For AI conversations
    match_id: Optional[str] = None  # For human-to-human conversations
    
    # Message Content
    message_type: MessageType = MessageType.TEXT
    content: str
    sender: str  # "user", "ai", "match"
    
    # Media Attachments
    attachments: List[Dict[str, str]] = []  # [{"type": "image", "url": "...", "metadata": "{}"}]
    
    # AI-Specific Data
    ai_model_used: Optional[str] = None
    ai_response_time_ms: Optional[int] = None
    ai_confidence_score: Optional[float] = None
    
    # Voice Message Data
    voice_duration_seconds: Optional[float] = None
    voice_transcript: Optional[str] = None
    voice_emotion_detected: Optional[str] = None
    
    # Message Metadata
    sent_from_device: Optional[str] = None
    message_length: int = 0
    language_detected: Optional[str] = None
    
    # Moderation
    is_flagged: bool = False
    moderation_score: Optional[float] = None
    moderation_categories: List[str] = []
    
    # Timestamps
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    delivered_at: Optional[datetime] = None
    read_at: Optional[datetime] = None

# Conversation Session Storage
class Conversation(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    companion_id: Optional[str] = None
    match_id: Optional[str] = None
    
    # Conversation Metadata
    conversation_type: str  # "ai_companion", "user_match", "group"
    conversation_mode: str = "text"  # "text", "voice", "mixed"
    
    # Session Data
    session_duration_minutes: float = 0.0
    message_count: int = 0
    voice_minutes_used: float = 0.0
    
    # AI Conversation Context
    ai_personality_context: Optional[Dict[str, Any]] = None
    ai_memory_context: Optional[Dict[str, Any]] = None
    conversation_mood: Optional[str] = None
    
    # User Engagement
    user_satisfaction: Optional[int] = None  # 1-5 rating
    user_feedback: Optional[str] = None
    
    # Timestamps
    started_at: datetime = Field(default_factory=datetime.utcnow)
    last_message_at: Optional[datetime] = None
    ended_at: Optional[datetime] = None

# User Matching System
class Match(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user1_id: str
    user2_id: str
    
    # Match Details
    match_score: float = 0.0
    common_interests: List[str] = []
    compatibility_factors: Dict[str, float] = {}
    
    # Match Status
    status: str = "pending"  # "pending", "active", "unmatched", "blocked"
    initiated_by: str  # user1_id or user2_id
    
    # Interaction Data
    first_message_sent: bool = False
    total_messages_exchanged: int = 0
    last_interaction_at: Optional[datetime] = None
    
    # Timestamps
    created_at: datetime = Field(default_factory=datetime.utcnow)
    matched_at: Optional[datetime] = None
    unmatched_at: Optional[datetime] = None

# Subscription & Payment Tracking
class Subscription(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    
    # Subscription Details
    tier: SubscriptionTier
    status: str = "active"  # "active", "cancelled", "expired", "suspended"
    billing_cycle: str = "monthly"  # "monthly", "yearly"
    
    # Pricing
    amount: float
    currency: str = "USD"
    discount_applied: Optional[float] = None
    
    # Payment Integration
    stripe_subscription_id: Optional[str] = None
    stripe_customer_id: Optional[str] = None
    payment_method_id: Optional[str] = None
    
    # Billing History
    next_billing_date: Optional[datetime] = None
    trial_end_date: Optional[datetime] = None
    cancellation_date: Optional[datetime] = None
    cancellation_reason: Optional[str] = None
    
    # Timestamps
    created_at: datetime = Field(default_factory=datetime.utcnow)
    expires_at: Optional[datetime] = None
    updated_at: datetime = Field(default_factory=datetime.utcnow)

# User Behavior Analytics
class UserAnalytics(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    date: datetime = Field(default_factory=datetime.utcnow)
    
    # Daily Usage
    sessions_count: int = 0
    total_session_duration_minutes: float = 0.0
    messages_sent: int = 0
    voice_minutes_used: float = 0.0
    
    # Feature Usage
    ai_conversations_started: int = 0
    profiles_viewed: int = 0
    swipes_right: int = 0
    swipes_left: int = 0
    matches_made: int = 0
    
    # Engagement Metrics
    app_opens: int = 0
    screen_time_minutes: float = 0.0
    features_used: List[str] = []
    
    # Revenue Tracking
    credits_purchased: int = 0
    money_spent: float = 0.0

# Content Moderation & Safety
class ModerationReport(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    reported_user_id: str
    reporter_user_id: str
    
    # Report Details
    report_type: str  # "inappropriate_content", "harassment", "spam", "fake_profile"
    description: str
    evidence_urls: List[str] = []
    
    # Investigation
    status: str = "pending"  # "pending", "investigating", "resolved", "dismissed"
    investigated_by: Optional[str] = None
    resolution: Optional[str] = None
    action_taken: Optional[str] = None
    
    # Timestamps
    created_at: datetime = Field(default_factory=datetime.utcnow)
    resolved_at: Optional[datetime] = None

# System Configuration
class SystemSettings(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    setting_key: str
    setting_value: Any
    setting_type: str  # "string", "number", "boolean", "json"
    description: str
    is_public: bool = False
    
    # Change Tracking
    changed_by: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

# API Usage Tracking
class APIUsage(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: Optional[str] = None
    endpoint: str
    method: str
    
    # Request Details
    request_size_bytes: int = 0
    response_size_bytes: int = 0
    response_time_ms: int = 0
    status_code: int = 200
    
    # AI Service Usage
    ai_model_used: Optional[str] = None
    ai_tokens_consumed: Optional[int] = None
    ai_cost: Optional[float] = None
    
    # Timestamps
    timestamp: datetime = Field(default_factory=datetime.utcnow)