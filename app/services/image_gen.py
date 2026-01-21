"""
Image Generation using Pexels API (Primary) + Unsplash Fallback
FREE: 200 requests/hour via Pexels
Falls back to Unsplash (50/hour) if Pexels unavailable
Real professional stock photos - instantly
"""

import requests
import os
from typing import Dict, Optional

class ImageGenerator:
    """
    Professional stock photos from Pexels with Unsplash fallback
    """
    
    PEXELS_API = "https://api.pexels.com/v1/search"
    UNSPLASH_API = "https://source.unsplash.com/featured"
    
    PLATFORM_SPECS = {
        "instagram": {
            "width": 1080,
            "height": 1080,
            "orientation": "square",
            "keywords": ["lifestyle", "cafe", "people", "community", "business"]
        },
        "linkedin": {
            "width": 1200,
            "height": 627,
            "orientation": "landscape",
            "keywords": ["business", "office", "professional", "corporate", "workspace"]
        },
        "x": {
            "width": 1200,
            "height": 675,
            "orientation": "landscape",
            "keywords": ["dynamic", "innovation", "technology", "action", "modern"]
        }
    }
    
    def __init__(self):
        """Initialize with Pexels API key"""
        # Use provided demo key or environment variable
        self.api_key = os.getenv("PEXELS_API_KEY", "563492ad6f91700001000001c3b8975a742f4d6a803f1a9f44b33d8b")
        print("✅ Image Generation Ready (Pexels 200/hr + Unsplash fallback)")
    
    def generate_via_pexels(
        self,
        query: str,
        platform: str,
        post_index: int = 0
    ) -> Optional[str]:
        """Try to get image from Pexels API"""
        try:
            spec = self.PLATFORM_SPECS.get(platform.lower(), self.PLATFORM_SPECS["instagram"])
            
            headers = {"Authorization": self.api_key}
            params = {
                "query": query,
                "orientation": spec['orientation'],
                "size": "large",
                "per_page": 10
            }
            
            response = requests.get(
                self.PEXELS_API,
                headers=headers,
                params=params,
                timeout=8
            )
            
            if response.status_code == 200:
                data = response.json()
                
                if data.get('photos'):
                    # Get photo based on post_index (cycle through results)
                    photo = data['photos'][post_index % len(data['photos'])]
                    image_url = photo['src']['large']
                    
                    print(f"     ✅ Pexels (by {photo['photographer']})")
                    return image_url
            else:
                print(f"     ⚠️  Pexels {response.status_code}")
                return None
        
        except Exception as e:
            print(f"     ⚠️  Pexels error: {str(e)[:50]}")
            return None
    
    def generate_via_unsplash(
        self,
        query: str,
        platform: str
    ) -> str:
        """Fallback to Unsplash"""
        spec = self.PLATFORM_SPECS.get(platform.lower(), self.PLATFORM_SPECS["instagram"])
        image_url = (
            f"{self.UNSPLASH_API}/{spec['width']}x{spec['height']}"
            f"?{query}"
        )
        print(f"     ✅ Unsplash (fallback)")
        return image_url
    
    def build_search_query(self, brand_name: str, keywords: list = None) -> str:
        """Build relevant search query from brand info"""
        
        search_terms = []
        
        # Add brand name
        if brand_name and brand_name != "Brand":
            search_terms.append(brand_name)
        
        # Add keywords
        if keywords and len(keywords) > 0:
            filtered = [k for k in keywords if k and k.strip()]
            search_terms.extend(filtered[:2])
        
        # Fallback
        query = " ".join(search_terms) if search_terms else "business"
        return query
    
    def generate_post_image(
        self,
        brand_name: str,
        post_caption: str,
        platform: str,
        keywords: list = None,
        post_index: int = 0
    ) -> str:
        """
        Generate platform-specific image
        Tries Pexels first, falls back to Unsplash
        """
        
        platform_lower = platform.lower()
        if platform_lower not in self.PLATFORM_SPECS:
            platform_lower = "instagram"
        
        spec = self.PLATFORM_SPECS[platform_lower]
        
        # Build search query
        query = self.build_search_query(brand_name, keywords)
        
        print(f"  📸 Getting {platform.upper()} image for {brand_name}")
        print(f"     Search: {query}")
        print(f"     Size: {spec['width']}x{spec['height']}")
        
        # Try Pexels first
        image_url = self.generate_via_pexels(query, platform_lower, post_index)
        
        # Fallback to Unsplash if Pexels fails
        if not image_url:
            image_url = self.generate_via_unsplash(query, platform_lower)
        
        return image_url


# Global singleton
_generator: Optional[ImageGenerator] = None

def get_generator() -> ImageGenerator:
    """Get or create singleton instance"""
    global _generator
    if _generator is None:
        _generator = ImageGenerator()
    return _generator

def generate_post_image(
    brand_name: str,
    post_caption: str,
    platform: str,
    tone: str = None,
    hashtags: list = None,
    **kwargs
) -> str:
    """
    Public API: Generate platform-specific image
    
    Uses Pexels (200/hr) with Unsplash (50/hr) fallback
    Always returns a professional stock photo URL
    
    Args:
        brand_name: str - Brand/company name
        post_caption: str - Post caption text
        platform: str - 'Instagram', 'LinkedIn', or 'X'
        tone: str - Tone (optional, for compatibility)
        hashtags: list - Hashtags (used as keywords)
        
    Returns:
        str: Image URL ready for display
    """
    generator = get_generator()
    keywords = hashtags or []
    
    return generator.generate_post_image(
        brand_name=brand_name,
        post_caption=post_caption,
        platform=platform,
        keywords=keywords,
        post_index=0
    )


def generate_multiple_images(brand_name: str, posts: list) -> dict:
    """
    Generate images for multiple posts
    """
    image_urls = {}
    generator = get_generator()
    
    for idx, post in enumerate(posts):
        try:
            platform = post.get("platform", "Instagram") if isinstance(post, dict) else getattr(post, "platform", "Instagram")
            hashtags = post.get("hashtags", []) if isinstance(post, dict) else getattr(post, "hashtags", [])
            caption = post.get("caption", "") if isinstance(post, dict) else getattr(post, "caption", "")
            
            image_url = generator.generate_post_image(
                brand_name=brand_name,
                post_caption=caption,
                platform=platform,
                keywords=hashtags,
                post_index=idx
            )
            image_urls[idx] = image_url
            
        except Exception as e:
            print(f"❌ Error generating image for post {idx}: {e}")
            image_urls[idx] = None
    
    return image_urls
