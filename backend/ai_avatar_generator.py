import asyncio
import aiohttp
import base64
import hashlib
import os
from typing import List, Dict, Optional
import uuid
from datetime import datetime
import json

class AIAvatarGenerator:
    """
    AI Avatar Generator for creating unique virtual companion appearances
    Supports multiple AI image generation services
    """
    
    def __init__(self):
        self.openai_api_key = os.getenv("OPENAI_API_KEY", "demo_key")
        self.stability_api_key = os.getenv("STABILITY_API_KEY", "demo_key")
        self.midjourney_api_key = os.getenv("MIDJOURNEY_API_KEY", "demo_key")
        
        # Predefined style templates for consistent generation
        self.style_templates = {
            "modern": "modern, clean, contemporary style",
            "anime": "anime style, manga inspired, Japanese animation",
            "realistic": "photorealistic, highly detailed, professional photography",
            "artistic": "artistic, painterly, creative illustration",
            "futuristic": "futuristic, sci-fi, technological aesthetic",
            "vintage": "vintage, retro, classic style",
            "minimalist": "minimalist, simple, clean design"
        }
        
        # Personality-based appearance traits
        self.personality_traits = {
            "caring": {
                "expression": "warm smile, kind eyes, gentle expression",
                "colors": "soft warm colors, pastels",
                "style": "approachable, friendly"
            },
            "creative": {
                "expression": "artistic, expressive, imaginative look",
                "colors": "vibrant colors, artistic palette",
                "style": "unique, creative, artistic flair"
            },
            "energetic": {
                "expression": "bright smile, energetic eyes, dynamic pose",
                "colors": "bright, energetic colors",
                "style": "dynamic, active, vibrant"
            },
            "wise": {
                "expression": "thoughtful expression, intelligent eyes",
                "colors": "sophisticated, muted colors",
                "style": "elegant, refined, intellectual"
            },
            "mysterious": {
                "expression": "enigmatic smile, intriguing gaze",
                "colors": "deep, mysterious colors",
                "style": "mysterious, alluring, sophisticated"
            }
        }

    async def generate_avatar_dalle3(self, prompt: str, style: str = "realistic") -> Dict[str, str]:
        """Generate avatar using DALL-E 3"""
        try:
            # In production, this would call OpenAI's DALL-E 3 API
            # For demo, we'll return a mock response with actual image URLs
            
            mock_generated_images = [
                "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=512&h=512&fit=crop&crop=face",
                "https://images.pexels.com/photos/8566540/pexels-photo-8566540.jpeg?w=512&h=512&fit=crop&crop=face",
                "https://images.unsplash.com/photo-1643255083197-18721220670e?w=512&h=512&fit=crop&crop=face",
                "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=512&h=512&fit=crop&crop=face"
            ]
            
            # Simulate AI generation delay
            await asyncio.sleep(2)
            
            # Select image based on prompt hash for consistency
            image_index = hash(prompt) % len(mock_generated_images)
            selected_image = mock_generated_images[image_index]
            
            return {
                "success": True,
                "image_url": selected_image,
                "model": "dall-e-3",
                "prompt_used": prompt,
                "generation_id": str(uuid.uuid4()),
                "style": style
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "image_url": "https://images.unsplash.com/photo-1485827404703-89b55fcc595e",  # Fallback
                "model": "dall-e-3"
            }

    async def generate_avatar_stable_diffusion(self, prompt: str, style: str = "realistic") -> Dict[str, str]:
        """Generate avatar using Stable Diffusion"""
        try:
            # Mock Stable Diffusion generation
            mock_sd_images = [
                "https://images.pexels.com/photos/8721322/pexels-photo-8721322.jpeg?w=512&h=512&fit=crop&crop=face",
                "https://images.unsplash.com/photo-1625314868143-20e93ce3ff33?w=512&h=512&fit=crop&crop=face",
                "https://images.unsplash.com/photo-1742197143486-d6c7d146fbc3?w=512&h=512&fit=crop&crop=face"
            ]
            
            await asyncio.sleep(1.5)
            
            image_index = hash(prompt + style) % len(mock_sd_images)
            selected_image = mock_sd_images[image_index]
            
            return {
                "success": True,
                "image_url": selected_image,
                "model": "stable-diffusion-xl",
                "prompt_used": prompt,
                "generation_id": str(uuid.uuid4()),
                "style": style
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "image_url": "https://images.pexels.com/photos/8721322/pexels-photo-8721322.jpeg",
                "model": "stable-diffusion-xl"
            }

    def build_prompt(self, personality: str, gender: str = "neutral", 
                    age_range: str = "25-30", ethnicity: str = "diverse",
                    style: str = "modern") -> str:
        """Build optimized prompt for AI avatar generation"""
        
        base_prompt = f"Portrait of a {age_range} year old person, {ethnicity} ethnicity"
        
        # Add personality traits
        if personality in self.personality_traits:
            traits = self.personality_traits[personality]
            base_prompt += f", {traits['expression']}, {traits['style']}"
        
        # Add style
        if style in self.style_templates:
            base_prompt += f", {self.style_templates[style]}"
        
        # Add quality modifiers
        base_prompt += ", high quality, detailed, professional, centered composition"
        
        # Add negative prompts to avoid unwanted elements
        negative_elements = "low quality, blurry, distorted, multiple faces, text, watermark"
        
        return {
            "positive_prompt": base_prompt,
            "negative_prompt": negative_elements
        }

    async def generate_companion_avatar_set(self, 
                                          name: str,
                                          personality: str,
                                          gender: str = "neutral",
                                          style: str = "modern",
                                          variations: int = 3) -> Dict[str, any]:
        """Generate a complete avatar set for an AI companion"""
        
        prompts = self.build_prompt(personality, gender, style=style)
        main_prompt = prompts["positive_prompt"]
        
        results = {
            "companion_name": name,
            "personality": personality,
            "main_avatar": None,
            "variations": [],
            "generation_metadata": {
                "prompt_used": main_prompt,
                "style": style,
                "generated_at": datetime.utcnow().isoformat(),
                "model_used": "dall-e-3"
            }
        }
        
        try:
            # Generate main avatar
            main_result = await self.generate_avatar_dalle3(main_prompt, style)
            if main_result["success"]:
                results["main_avatar"] = main_result
            
            # Generate variations
            for i in range(variations):
                variation_prompt = main_prompt + f", variation {i+1}, slightly different angle"
                variation_result = await self.generate_avatar_dalle3(variation_prompt, style)
                if variation_result["success"]:
                    results["variations"].append(variation_result)
            
            return results
            
        except Exception as e:
            # Return fallback data
            return {
                "companion_name": name,
                "personality": personality,
                "main_avatar": {
                    "success": True,
                    "image_url": "https://images.unsplash.com/photo-1485827404703-89b55fcc595e",
                    "model": "fallback"
                },
                "variations": [],
                "error": str(e)
            }

    async def regenerate_avatar(self, companion_id: str, new_style: str = None) -> Dict[str, str]:
        """Regenerate avatar for existing companion with new style"""
        # This would fetch existing companion data and regenerate
        # For demo purposes, return new avatar
        
        prompt = "Portrait of an AI companion, friendly and approachable"
        if new_style:
            prompt += f", {self.style_templates.get(new_style, new_style)}"
        
        return await self.generate_avatar_dalle3(prompt, new_style or "modern")

    def get_available_styles(self) -> List[str]:
        """Get list of available avatar styles"""
        return list(self.style_templates.keys())

    def get_personality_traits(self) -> Dict[str, Dict[str, str]]:
        """Get personality-based appearance traits"""
        return self.personality_traits

# Avatar Generation Service Manager
class AvatarGenerationService:
    """Service for managing AI avatar generation across the application"""
    
    def __init__(self):
        self.generator = AIAvatarGenerator()
        self.generation_queue = asyncio.Queue()
        self.is_processing = False
    
    async def queue_avatar_generation(self, companion_data: Dict[str, str]) -> str:
        """Queue avatar generation request"""
        request_id = str(uuid.uuid4())
        request = {
            "id": request_id,
            "companion_data": companion_data,
            "status": "queued",
            "created_at": datetime.utcnow()
        }
        
        await self.generation_queue.put(request)
        return request_id
    
    async def process_generation_queue(self):
        """Process queued avatar generation requests"""
        while True:
            try:
                if not self.generation_queue.empty():
                    request = await self.generation_queue.get()
                    
                    # Generate avatar set
                    companion_data = request["companion_data"]
                    result = await self.generator.generate_companion_avatar_set(
                        name=companion_data.get("name", "AI Companion"),
                        personality=companion_data.get("personality", "caring"),
                        gender=companion_data.get("gender", "neutral"),
                        style=companion_data.get("style", "modern")
                    )
                    
                    # Store result (in production, this would update the database)
                    request["result"] = result
                    request["status"] = "completed"
                    request["completed_at"] = datetime.utcnow()
                    
                    print(f"Avatar generation completed for request {request['id']}")
                
                await asyncio.sleep(1)  # Prevent busy waiting
                
            except Exception as e:
                print(f"Error processing avatar generation: {e}")
                await asyncio.sleep(5)

# Initialize global service
avatar_service = AvatarGenerationService()