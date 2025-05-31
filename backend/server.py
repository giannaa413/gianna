from fastapi import FastAPI, APIRouter, HTTPException, Depends, Query, BackgroundTasks
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import asyncio
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional
import uuid
from datetime import datetime, timedelta
import hashlib
import secrets

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ.get('DB_NAME', 'soulmate')]

# Create the main app
app = FastAPI(title="Soulmate Admin API", version="1.0.0")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Security
security = HTTPBearer()
ADMIN_TOKEN = "soulmate_admin_2024"  # In production, use proper JWT

# Models
class User(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    age: int
    bio: str
    interests: List[str]
    created_at: datetime = Field(default_factory=datetime.utcnow)
    is_active: bool = True
    subscription_tier: str = "free"
    credits: int = 10
    voice_minutes: int = 0

class AICompanion(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    personality: str
    avatar: str
    emoji: str
    description: str
    traits: List[str]
    is_premium: bool = False
    voice_enabled: bool = False
    created_at: datetime = Field(default_factory=datetime.utcnow)
    usage_count: int = 0

class ChatMessage(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    companion_id: Optional[str] = None
    match_id: Optional[str] = None
    message: str
    sender: str  # user, ai, match
    message_type: str = "text"  # text, voice, image
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class Match(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user1_id: str
    user2_id: str
    status: str = "active"  # active, unmatched, blocked
    created_at: datetime = Field(default_factory=datetime.utcnow)
    last_message_at: Optional[datetime] = None

class Subscription(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    tier: str  # free, premium, platinum
    status: str = "active"  # active, cancelled, expired
    created_at: datetime = Field(default_factory=datetime.utcnow)
    expires_at: Optional[datetime] = None
    amount: float = 0.0

class AdminStats(BaseModel):
    total_users: int
    active_users: int
    total_ai_companions: int
    total_messages: int
    total_matches: int
    total_revenue: float
    premium_users: int
    voice_minutes_used: int

# Authentication
async def get_admin_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    if credentials.credentials != ADMIN_TOKEN:
        raise HTTPException(status_code=401, detail="Invalid admin token")
    return True

# Admin Dashboard Routes
@api_router.get("/admin/stats", response_model=AdminStats)
async def get_admin_stats(admin: bool = Depends(get_admin_user)):
    """Get comprehensive admin statistics"""
    total_users = await db.users.count_documents({})
    active_users = await db.users.count_documents({"is_active": True})
    total_ai_companions = await db.ai_companions.count_documents({})
    total_messages = await db.chat_messages.count_documents({})
    total_matches = await db.matches.count_documents({})
    premium_users = await db.users.count_documents({"subscription_tier": {"$ne": "free"}})
    
    # Calculate total revenue (mock calculation)
    premium_count = await db.subscriptions.count_documents({"tier": "premium"})
    platinum_count = await db.subscriptions.count_documents({"tier": "platinum"})
    total_revenue = (premium_count * 9.99) + (platinum_count * 19.99)
    
    return AdminStats(
        total_users=total_users,
        active_users=active_users,
        total_ai_companions=total_ai_companions,
        total_messages=total_messages,
        total_matches=total_matches,
        total_revenue=total_revenue,
        premium_users=premium_users,
        voice_minutes_used=0  # Mock data
    )

@api_router.get("/admin/users", response_model=List[User])
async def get_all_users(
    admin: bool = Depends(get_admin_user),
    skip: int = Query(0),
    limit: int = Query(100)
):
    """Get all users with pagination"""
    users = await db.users.find().skip(skip).limit(limit).to_list(length=limit)
    return [User(**user) for user in users]

@api_router.get("/admin/ai-companions", response_model=List[AICompanion])
async def get_all_ai_companions(admin: bool = Depends(get_admin_user)):
    """Get all AI companions"""
    companions = await db.ai_companions.find().to_list(length=1000)
    return [AICompanion(**companion) for companion in companions]

@api_router.post("/admin/ai-companions", response_model=AICompanion)
async def create_ai_companion(companion: AICompanion, admin: bool = Depends(get_admin_user)):
    """Create new AI companion"""
    companion_dict = companion.dict()
    await db.ai_companions.insert_one(companion_dict)
    return companion

@api_router.put("/admin/ai-companions/{companion_id}")
async def update_ai_companion(
    companion_id: str,
    companion: AICompanion,
    admin: bool = Depends(get_admin_user)
):
    """Update AI companion"""
    await db.ai_companions.update_one(
        {"id": companion_id},
        {"$set": companion.dict()}
    )
    return {"message": "AI companion updated successfully"}

@api_router.delete("/admin/ai-companions/{companion_id}")
async def delete_ai_companion(companion_id: str, admin: bool = Depends(get_admin_user)):
    """Delete AI companion"""
    result = await db.ai_companions.delete_one({"id": companion_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="AI companion not found")
    return {"message": "AI companion deleted successfully"}

@api_router.get("/admin/messages", response_model=List[ChatMessage])
async def get_all_messages(
    admin: bool = Depends(get_admin_user),
    skip: int = Query(0),
    limit: int = Query(100)
):
    """Get all chat messages"""
    messages = await db.chat_messages.find().sort("timestamp", -1).skip(skip).limit(limit).to_list(length=limit)
    return [ChatMessage(**message) for message in messages]

@api_router.get("/admin/matches", response_model=List[Match])
async def get_all_matches(admin: bool = Depends(get_admin_user)):
    """Get all user matches"""
    matches = await db.matches.find().to_list(length=1000)
    return [Match(**match) for match in matches]

@api_router.get("/admin/subscriptions", response_model=List[Subscription])
async def get_all_subscriptions(admin: bool = Depends(get_admin_user)):
    """Get all subscriptions"""
    subscriptions = await db.subscriptions.find().to_list(length=1000)
    return [Subscription(**subscription) for subscription in subscriptions]

@api_router.put("/admin/users/{user_id}/subscription")
async def update_user_subscription(
    user_id: str,
    tier: str,
    admin: bool = Depends(get_admin_user)
):
    """Update user subscription tier"""
    await db.users.update_one(
        {"id": user_id},
        {"$set": {"subscription_tier": tier}}
    )
    return {"message": f"User subscription updated to {tier}"}

@api_router.put("/admin/users/{user_id}/credits")
async def update_user_credits(
    user_id: str,
    credits: int,
    admin: bool = Depends(get_admin_user)
):
    """Update user credits"""
    await db.users.update_one(
        {"id": user_id},
        {"$set": {"credits": credits}}
    )
    return {"message": f"User credits updated to {credits}"}

@api_router.put("/admin/users/{user_id}/status")
async def update_user_status(
    user_id: str,
    is_active: bool,
    admin: bool = Depends(get_admin_user)
):
    """Activate or deactivate user"""
    await db.users.update_one(
        {"id": user_id},
        {"$set": {"is_active": is_active}}
    )
    status = "activated" if is_active else "deactivated"
    return {"message": f"User {status} successfully"}

# Mock data creation for demo
@api_router.post("/admin/create-mock-data")
async def create_mock_data(admin: bool = Depends(get_admin_user)):
    """Create mock data for demonstration"""
    
    # Create mock users
    mock_users = [
        {
            "id": str(uuid.uuid4()),
            "name": "Alice Johnson",
            "age": 25,
            "bio": "Love traveling and photography",
            "interests": ["Travel", "Photography", "Art"],
            "created_at": datetime.utcnow(),
            "is_active": True,
            "subscription_tier": "premium",
            "credits": 999,
            "voice_minutes": 100
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Bob Smith",
            "age": 28,
            "bio": "Software engineer and coffee enthusiast",
            "interests": ["Technology", "Coffee", "Gaming"],
            "created_at": datetime.utcnow(),
            "is_active": True,
            "subscription_tier": "free",
            "credits": 5,
            "voice_minutes": 0
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Carol Davis",
            "age": 30,
            "bio": "Fitness instructor and yoga lover",
            "interests": ["Fitness", "Yoga", "Health"],
            "created_at": datetime.utcnow(),
            "is_active": True,
            "subscription_tier": "platinum",
            "credits": 999,
            "voice_minutes": 500
        }
    ]
    
    await db.users.insert_many(mock_users)
    
    # Create mock AI companions
    mock_companions = [
        {
            "id": str(uuid.uuid4()),
            "name": "Luna",
            "personality": "caring",
            "avatar": "https://images.unsplash.com/photo-1485827404703-89b55fcc595e",
            "emoji": "🌙",
            "description": "A caring and empathetic companion",
            "traits": ["Empathetic", "Wise", "Supportive"],
            "is_premium": False,
            "voice_enabled": True,
            "created_at": datetime.utcnow(),
            "usage_count": 150
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Alex",
            "personality": "creative",
            "avatar": "https://images.pexels.com/photos/8566540/pexels-photo-8566540.jpeg",
            "emoji": "🎨",
            "description": "An artistic soul who inspires creativity",
            "traits": ["Creative", "Inspiring", "Artistic"],
            "is_premium": True,
            "voice_enabled": True,
            "created_at": datetime.utcnow(),
            "usage_count": 89
        }
    ]
    
    await db.ai_companions.insert_many(mock_companions)
    
    return {"message": "Mock data created successfully"}

# Include the router in the main app
app.include_router(api_router)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve admin dashboard
@app.get("/admin", response_class=HTMLResponse)
async def admin_dashboard():
    """Serve the admin dashboard"""
    html_content = """
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Soulmate Admin Dashboard</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <script src="https://unpkg.com/axios/dist/axios.min.js"></script>
        <style>
            body { font-family: 'Inter', sans-serif; }
        </style>
    </head>
    <body class="bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 min-h-screen">
        <div id="app" class="container mx-auto px-4 py-8">
            <div class="bg-white/10 backdrop-blur-md rounded-3xl p-8 shadow-2xl">
                <h1 class="text-4xl font-bold text-white mb-8 text-center">
                    🎛️ Soulmate Admin Dashboard
                </h1>
                
                <div id="login-section" class="text-center">
                    <div class="max-w-md mx-auto">
                        <h2 class="text-2xl font-semibold text-white mb-6">Admin Login</h2>
                        <input 
                            type="password" 
                            id="admin-token" 
                            placeholder="Enter admin token"
                            class="w-full p-4 rounded-xl bg-white/20 text-white placeholder-gray-400 border border-white/30 focus:outline-none focus:border-pink-500 mb-4"
                        />
                        <button 
                            onclick="login()" 
                            class="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white py-4 px-8 rounded-xl font-semibold hover:shadow-lg transition-all duration-200"
                        >
                            Login to Dashboard
                        </button>
                        <p class="text-gray-400 text-sm mt-4">Demo token: soulmate_admin_2024</p>
                    </div>
                </div>

                <div id="dashboard-section" class="hidden">
                    <!-- Stats Cards -->
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <div class="bg-white/20 backdrop-blur-sm rounded-2xl p-6">
                            <h3 class="text-lg font-semibold text-white mb-2">Total Users</h3>
                            <p id="total-users" class="text-3xl font-bold text-pink-400">-</p>
                        </div>
                        <div class="bg-white/20 backdrop-blur-sm rounded-2xl p-6">
                            <h3 class="text-lg font-semibold text-white mb-2">AI Companions</h3>
                            <p id="total-companions" class="text-3xl font-bold text-purple-400">-</p>
                        </div>
                        <div class="bg-white/20 backdrop-blur-sm rounded-2xl p-6">
                            <h3 class="text-lg font-semibold text-white mb-2">Premium Users</h3>
                            <p id="premium-users" class="text-3xl font-bold text-yellow-400">-</p>
                        </div>
                        <div class="bg-white/20 backdrop-blur-sm rounded-2xl p-6">
                            <h3 class="text-lg font-semibold text-white mb-2">Total Revenue</h3>
                            <p id="total-revenue" class="text-3xl font-bold text-green-400">-</p>
                        </div>
                    </div>

                    <!-- Navigation -->
                    <div class="flex flex-wrap gap-4 mb-8">
                        <button onclick="showSection('users')" class="bg-pink-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-pink-600 transition-all">
                            👥 Users
                        </button>
                        <button onclick="showSection('companions')" class="bg-purple-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-purple-600 transition-all">
                            🤖 AI Companions
                        </button>
                        <button onclick="showSection('database')" class="bg-indigo-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-indigo-600 transition-all">
                            🗄️ Database
                        </button>
                        <button onclick="showSection('ai-generator')" class="bg-cyan-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-cyan-600 transition-all">
                            🎨 AI Avatar Generator
                        </button>
                        <button onclick="showSection('messages')" class="bg-blue-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-600 transition-all">
                            💬 Messages
                        </button>
                        <button onclick="showSection('subscriptions')" class="bg-green-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-green-600 transition-all">
                            💳 Subscriptions
                        </button>
                        <button onclick="createMockData()" class="bg-yellow-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-yellow-600 transition-all">
                            🎭 Create Mock Data
                        </button>
                    </div>

                    <!-- Content Sections -->
                    <div id="content-area" class="bg-white/10 backdrop-blur-sm rounded-2xl p-6 min-h-96">
                        <div class="text-center text-white">
                            <h3 class="text-2xl font-semibold mb-4">Welcome to Soulmate Admin</h3>
                            <p class="text-gray-300">Select a section above to manage your app data</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <script>
            let authToken = '';
            
            function login() {
                const token = document.getElementById('admin-token').value;
                if (token === 'soulmate_admin_2024') {
                    authToken = token;
                    document.getElementById('login-section').classList.add('hidden');
                    document.getElementById('dashboard-section').classList.remove('hidden');
                    loadStats();
                } else {
                    alert('Invalid admin token');
                }
            }

            async function apiCall(endpoint, method = 'GET', data = null) {
                try {
                    const config = {
                        method,
                        url: `/api${endpoint}`,
                        headers: {
                            'Authorization': `Bearer ${authToken}`,
                            'Content-Type': 'application/json'
                        }
                    };
                    if (data) config.data = data;
                    
                    const response = await axios(config);
                    return response.data;
                } catch (error) {
                    console.error('API Error:', error);
                    return null;
                }
            }

            async function loadStats() {
                const stats = await apiCall('/admin/stats');
                if (stats) {
                    document.getElementById('total-users').textContent = stats.total_users;
                    document.getElementById('total-companions').textContent = stats.total_ai_companions;
                    document.getElementById('premium-users').textContent = stats.premium_users;
                    document.getElementById('total-revenue').textContent = '$' + stats.total_revenue.toFixed(2);
                }
            }

            async function showSection(section) {
                const contentArea = document.getElementById('content-area');
                
                switch(section) {
                    case 'users':
                        const users = await apiCall('/admin/users');
                        contentArea.innerHTML = `
                            <h3 class="text-2xl font-bold text-white mb-6">👥 User Management</h3>
                            <div class="overflow-x-auto">
                                <table class="w-full text-white">
                                    <thead>
                                        <tr class="border-b border-white/20">
                                            <th class="text-left p-3">Name</th>
                                            <th class="text-left p-3">Age</th>
                                            <th class="text-left p-3">Subscription</th>
                                            <th class="text-left p-3">Credits</th>
                                            <th class="text-left p-3">Status</th>
                                            <th class="text-left p-3">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${users ? users.map(user => `
                                            <tr class="border-b border-white/10">
                                                <td class="p-3">${user.name}</td>
                                                <td class="p-3">${user.age}</td>
                                                <td class="p-3">
                                                    <span class="px-3 py-1 rounded-full text-xs ${
                                                        user.subscription_tier === 'premium' ? 'bg-purple-500' :
                                                        user.subscription_tier === 'platinum' ? 'bg-yellow-500' : 'bg-gray-500'
                                                    }">
                                                        ${user.subscription_tier}
                                                    </span>
                                                </td>
                                                <td class="p-3">${user.credits}</td>
                                                <td class="p-3">
                                                    <span class="px-3 py-1 rounded-full text-xs ${user.is_active ? 'bg-green-500' : 'bg-red-500'}">
                                                        ${user.is_active ? 'Active' : 'Inactive'}
                                                    </span>
                                                </td>
                                                <td class="p-3">
                                                    <button onclick="editUser('${user.id}')" class="bg-blue-500 text-white px-3 py-1 rounded text-xs mr-2">Edit</button>
                                                </td>
                                            </tr>
                                        `).join('') : '<tr><td colspan="6" class="p-3 text-center">No users found</td></tr>'}
                                    </tbody>
                                </table>
                            </div>
                        `;
                        break;
                        
                    case 'companions':
                        const companions = await apiCall('/admin/ai-companions');
                        contentArea.innerHTML = `
                            <h3 class="text-2xl font-bold text-white mb-6">🤖 AI Companion Management</h3>
                            <div class="grid gap-4">
                                ${companions ? companions.map(companion => `
                                    <div class="bg-white/10 rounded-xl p-4 flex items-center space-x-4">
                                        <img src="${companion.avatar}" alt="${companion.name}" class="w-16 h-16 rounded-full object-cover">
                                        <div class="flex-1">
                                            <div class="flex items-center space-x-2">
                                                <h4 class="text-xl font-semibold text-white">${companion.name}</h4>
                                                <span class="text-2xl">${companion.emoji}</span>
                                                ${companion.is_premium ? '<span class="bg-yellow-500 text-black px-2 py-1 rounded-full text-xs">Premium</span>' : ''}
                                            </div>
                                            <p class="text-gray-300">${companion.description}</p>
                                            <div class="flex gap-2 mt-2">
                                                ${companion.traits.map(trait => `<span class="bg-white/20 text-white px-2 py-1 rounded-full text-xs">${trait}</span>`).join('')}
                                            </div>
                                            <p class="text-sm text-gray-400 mt-2">Usage: ${companion.usage_count} conversations</p>
                                        </div>
                                        <div class="flex flex-col space-y-2">
                                            <button onclick="editCompanion('${companion.id}')" class="bg-blue-500 text-white px-4 py-2 rounded text-sm">Edit</button>
                                            <button onclick="deleteCompanion('${companion.id}')" class="bg-red-500 text-white px-4 py-2 rounded text-sm">Delete</button>
                                        </div>
                                    </div>
                                `).join('') : '<p class="text-white text-center">No companions found</p>'}
                            </div>
                        `;
                        break;
                        
                    case 'messages':
                        const messages = await apiCall('/admin/messages');
                        contentArea.innerHTML = `
                            <h3 class="text-2xl font-bold text-white mb-6">💬 Message Analytics</h3>
                            <div class="text-white">
                                <p class="mb-4">Total Messages: ${messages ? messages.length : 0}</p>
                                <div class="space-y-3">
                                    ${messages ? messages.slice(0, 10).map(msg => `
                                        <div class="bg-white/10 rounded-xl p-4">
                                            <div class="flex justify-between items-start mb-2">
                                                <span class="font-semibold">${msg.sender}</span>
                                                <span class="text-sm text-gray-400">${new Date(msg.timestamp).toLocaleString()}</span>
                                            </div>
                                            <p class="text-gray-300">${msg.message.substring(0, 100)}${msg.message.length > 100 ? '...' : ''}</p>
                                        </div>
                                    `).join('') : '<p class="text-center">No messages found</p>'}
                                </div>
                            </div>
                        `;
                        break;
                        
                    case 'subscriptions':
                        const subscriptions = await apiCall('/admin/subscriptions');
                        contentArea.innerHTML = `
                            <h3 class="text-2xl font-bold text-white mb-6">💳 Subscription Management</h3>
                            <div class="text-white">
                                <p class="mb-4">Total Subscriptions: ${subscriptions ? subscriptions.length : 0}</p>
                                <div class="overflow-x-auto">
                                    <table class="w-full text-white">
                                        <thead>
                                            <tr class="border-b border-white/20">
                                                <th class="text-left p-3">User ID</th>
                                                <th class="text-left p-3">Tier</th>
                                                <th class="text-left p-3">Status</th>
                                                <th class="text-left p-3">Amount</th>
                                                <th class="text-left p-3">Created</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            ${subscriptions ? subscriptions.map(sub => `
                                                <tr class="border-b border-white/10">
                                                    <td class="p-3">${sub.user_id.substring(0, 8)}...</td>
                                                    <td class="p-3">
                                                        <span class="px-3 py-1 rounded-full text-xs ${
                                                            sub.tier === 'premium' ? 'bg-purple-500' :
                                                            sub.tier === 'platinum' ? 'bg-yellow-500' : 'bg-gray-500'
                                                        }">
                                                            ${sub.tier}
                                                        </span>
                                                    </td>
                                                    <td class="p-3">
                                                        <span class="px-3 py-1 rounded-full text-xs ${sub.status === 'active' ? 'bg-green-500' : 'bg-red-500'}">
                                                            ${sub.status}
                                                        </span>
                                                    </td>
                                                    <td class="p-3">$${sub.amount.toFixed(2)}</td>
                                                    <td class="p-3">${new Date(sub.created_at).toLocaleDateString()}</td>
                                                </tr>
                                            `).join('') : '<tr><td colspan="5" class="p-3 text-center">No subscriptions found</td></tr>'}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        `;
                        break;
                }
            }

            async function createMockData() {
                const result = await apiCall('/admin/create-mock-data', 'POST');
                if (result) {
                    alert('Mock data created successfully!');
                    loadStats();
                } else {
                    alert('Failed to create mock data');
                }
            }

            function editUser(userId) {
                alert(`Edit user functionality would open modal for user: ${userId}`);
            }

            function editCompanion(companionId) {
                alert(`Edit companion functionality would open modal for companion: ${companionId}`);
            }

            async function deleteCompanion(companionId) {
                if (confirm('Are you sure you want to delete this AI companion?')) {
                    const result = await apiCall(`/admin/ai-companions/${companionId}`, 'DELETE');
                    if (result) {
                        alert('AI companion deleted successfully!');
                        showSection('companions');
                    } else {
                        alert('Failed to delete AI companion');
                    }
                }
            }
        </script>
    </body>
    </html>
    """
    return HTMLResponse(content=html_content)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)