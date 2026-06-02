"""
Production Pexels Image Generator
Context-aware image selection from Pexels catalog
"""

import requests
import os
from typing import Dict, List, Optional

class PexelsImageGenerator:
    """
    Pexels-based image generator with smart product detection
    """
    
    PEXELS_API_URL = "https://api.pexels.com/v1/search"
    PLATFORM_SPECS = {
        "instagram": {"width": 1080, "height": 1080, "orientation": "square"},
        "linkedin": {"width": 1200, "height": 630, "orientation": "landscape"},
        "x": {"width": 1200, "height": 675, "orientation": "landscape"}
    }
    
    # Brand-specific search queries
    BRAND_QUERIES = {
        "starbucks": ["coffee cup latte art", "cafe barista", "espresso drink"],
        "apple": ["modern smartphone", "laptop workspace", "wireless earbuds"],
        "tesla": ["electric vehicle", "modern car", "sustainable transport"],
        "nike": ["athletic sneakers", "running shoes", "sports footwear"],
        "neurobots": ["robotics team", "tech competition", "engineering students"]
    }
    
    def __init__(self):
        """Initialize Pexels API"""
        self.api_key = os.getenv("PEXELS_API_KEY")
        self.session = requests.Session()
        if self.api_key:
            self.session.headers.update({"Authorization": self.api_key})
            print("Pexels Image Generator initialized")
        else:
            print("PEXELS_API_KEY not set; image generation will use placeholders")
    
    def build_search_query(
        self,
        brand_name: str,
        products: List[str],
        platform: str
    ) -> str:
        """
        Build smart search query for Pexels
        """
        
        brand_lower = brand_name.lower()
        
        # Check for known brands
        for brand_key, queries in self.BRAND_QUERIES.items():
            if brand_key in brand_lower:
                return queries[0]  # Return primary query
        
        # Build from products
        if products:
            # Use first product + platform context
            platform_context = {
                "instagram": "lifestyle",
                "linkedin": "professional",
                "x": "modern"
            }
            context = platform_context.get(platform, "modern")
            return f"{products[0]} {context}"
        
        # Fallback
        return f"{brand_name} product"
    
    def search_pexels(
        self,
        query: str,
        orientation: str,
        per_page: int = 15
    ) -> Optional[List[Dict]]:
        """Search Pexels API"""
        if not self.api_key:
            return None
        
        params = {
            "query": query,
            "orientation": orientation,
            "per_page": per_page,
            "size": "large"
        }
        
        try:
            response = self.session.get(
                self.PEXELS_API_URL,
                params=params,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                return data.get("photos", [])
            
            return None
            
        except Exception as e:
            print(f"     ❌ Pexels error: {e}")
            return None
    
    def generate_post_image(
        self,
        brand_profile,
        post: Dict,
        platform: str,
        post_index: int = 0
    ) -> str:
        """
        Generate image URL from Pexels
        
        Args:
            brand_profile: BrandProfile Pydantic object
            post: Dict with 'caption', 'platform', etc.
            platform: 'instagram', 'linkedin', or 'x'
            post_index: Index for variety
            
        Returns:
            str: Image URL
        """
        
        try:
            # Normalize platform
            platform = str(platform).lower()
            spec = self.PLATFORM_SPECS.get(platform, self.PLATFORM_SPECS["instagram"])
            
            # Get brand name
            brand_name = getattr(brand_profile, 'brand_name', 'Brand')
            
            print(f"  📸 Generating {platform.upper()} image for {brand_name}")
            
            # Extract products
            products = []
            if hasattr(brand_profile, 'products_services') and brand_profile.products_services:
                products = [str(p).lower() for p in brand_profile.products_services[:3]]
            
            if products:
                print(f"     Products: {', '.join(products)}")
            
            # Build query
            query = self.build_search_query(brand_name, products, platform)
            print(f"     Search: '{query}'")
            
            # Search Pexels
            photos = self.search_pexels(
                query=query,
                orientation=spec["orientation"],
                per_page=15
            )
            
            if photos and len(photos) > 0:
                # Select photo with variety
                index = post_index % len(photos)
                photo = photos[index]
                image_url = photo["src"]["large"]
                
                print(f"     ✅ Found: {photo.get('photographer', 'Unknown')}")
                return image_url
            
            # Fallback to Lorem Picsum
            print(f"     ⚠️  No results, using fallback")
            import hashlib
            seed = int(hashlib.md5(f"{brand_name}{platform}{post_index}".encode()).hexdigest()[:8], 16) % 1000
            return f"https://picsum.photos/{spec['width']}/{spec['height']}?random={seed}"
            
        except Exception as e:
            print(f"     ❌ Error: {e}")
            # Ultimate fallback
            return f"https://picsum.photos/1080/1080?random={abs(hash(str(brand_profile.brand_name))) % 1000}"


# Singleton
_generator = None

def get_generator() -> PexelsImageGenerator:
    """Get or create generator singleton"""
    global _generator
    if _generator is None:
        _generator = PexelsImageGenerator()
    return _generator


def generate_post_image(
    brand_profile,
    post: Dict,
    platform: str,
    post_index: int = 0
) -> str:
    """
    Public API: Generate image from Pexels catalog
    
    Args:
        brand_profile: BrandProfile Pydantic model
        post: Dict with post data (must have 'caption' key)
        platform: 'Instagram', 'LinkedIn', or 'X'
        post_index: Post index for variety (0-4)
        
    Returns:
        str: Image URL from Pexels or fallback
    """
    generator = get_generator()
    return generator.generate_post_image(brand_profile, post, platform, post_index)
