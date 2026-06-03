"""
Campaign image provider layer.

Supports Gemini/Nano Banana image generation, Pexels stock search, and a
hybrid mode that prefers generated campaign assets while keeping stock fallback.
"""

import base64
import hashlib
import os
import re
from pathlib import Path
from typing import Dict, List, Optional, TypedDict

import requests
from dotenv import load_dotenv


load_dotenv()


class ImageResult(TypedDict, total=False):
    url: str
    provider: str
    prompt: str


PLATFORM_SPECS = {
    "instagram": {"width": 1080, "height": 1080, "orientation": "square", "aspect_ratio": "1:1"},
    "linkedin": {"width": 1200, "height": 630, "orientation": "landscape", "aspect_ratio": "16:9"},
    "x": {"width": 1200, "height": 675, "orientation": "landscape", "aspect_ratio": "16:9"},
}


def normalize_platform(platform: str) -> str:
    platform_key = str(platform).lower()
    if platform_key in {"twitter", "x.com"}:
        return "x"
    return platform_key if platform_key in PLATFORM_SPECS else "instagram"


def placeholder_result(brand_name: str, platform: str, post_index: int, prompt: str = "") -> ImageResult:
    spec = PLATFORM_SPECS.get(platform, PLATFORM_SPECS["instagram"])
    seed = int(hashlib.md5(f"{brand_name}{platform}{post_index}".encode()).hexdigest()[:8], 16) % 1000
    return {
        "url": f"https://picsum.photos/{spec['width']}/{spec['height']}?random={seed}",
        "provider": "placeholder",
        "prompt": prompt,
    }


def public_asset_url(filename: str) -> str:
    base_url = os.getenv("PUBLIC_API_BASE_URL", "http://localhost:8000").rstrip("/")
    return f"{base_url}/generated-assets/{filename}"


def safe_slug(value: str) -> str:
    slug = re.sub(r"[^a-zA-Z0-9]+", "-", value).strip("-").lower()
    return slug[:48] or "campaign"


class GeminiImageGenerator:
    """Generate branded campaign visuals with Gemini native image generation."""

    API_URL = "https://generativelanguage.googleapis.com/v1/models/{model}:generateContent"

    def __init__(self):
        self.api_key = os.getenv("GEMINI_API_KEY")
        self.model = os.getenv("GEMINI_IMAGE_MODEL", "gemini-3.1-flash-image")
        self.asset_dir = Path(os.getenv("GENERATED_ASSET_DIR", "generated_assets"))
        self.asset_dir.mkdir(parents=True, exist_ok=True)
        self.session = requests.Session()

        if self.api_key:
            print(f"Gemini image generator initialized with {self.model}")
        else:
            print("GEMINI_API_KEY not set; Gemini image generation will be skipped")

    def build_prompt(self, brand_profile, post: Dict, platform: str) -> str:
        brand_name = getattr(brand_profile, "brand_name", "Brand")
        description = getattr(brand_profile, "description", "")
        products = ", ".join(getattr(brand_profile, "products_services", [])[:4])
        audience = ", ".join(getattr(brand_profile, "target_audience", [])[:4])
        tone = getattr(brand_profile, "tone", "modern and confident")
        caption = str(post.get("caption", ""))[:900]
        cta = str(post.get("cta", ""))[:180]
        spec = PLATFORM_SPECS.get(platform, PLATFORM_SPECS["instagram"])

        return (
            f"Create a polished campaign image for {brand_name}. "
            f"Platform: {platform}. Aspect ratio: {spec['aspect_ratio']}. "
            f"Brand description: {description}. Products or services: {products}. "
            f"Audience: {audience}. Tone: {tone}. "
            f"Campaign caption context: {caption}. CTA context: {cta}. "
            "Make it premium, realistic, commercially usable, and visually specific to the brand. "
            "Avoid small unreadable text, fake UI, distorted hands, watermarks, logos you do not know, "
            "and generic stock-photo staging. Leave clean negative space for optional social post copy."
        )

    def extract_inline_image(self, data: Dict) -> Optional[Dict[str, str]]:
        for candidate in data.get("candidates", []):
            content = candidate.get("content", {})
            for part in content.get("parts", []):
                inline_data = part.get("inlineData") or part.get("inline_data")
                if not inline_data:
                    continue
                encoded = inline_data.get("data")
                mime_type = inline_data.get("mimeType") or inline_data.get("mime_type") or "image/png"
                if encoded:
                    return {"data": encoded, "mime_type": mime_type}
        return None

    def extension_for_mime(self, mime_type: str) -> str:
        if "jpeg" in mime_type or "jpg" in mime_type:
            return "jpg"
        if "webp" in mime_type:
            return "webp"
        return "png"

    def generate_post_image(self, brand_profile, post: Dict, platform: str, post_index: int = 0) -> Optional[ImageResult]:
        if not self.api_key:
            return None

        brand_name = getattr(brand_profile, "brand_name", "brand")
        prompt = self.build_prompt(brand_profile, post, platform)
        payload = {
            "contents": [{"parts": [{"text": prompt}]}]
        }

        try:
            response = self.session.post(
                self.API_URL.format(model=self.model),
                headers={"x-goog-api-key": self.api_key, "Content-Type": "application/json"},
                json=payload,
                timeout=60,
            )
            if not response.ok:
                print(f"Gemini image generation failed: {response.status_code} {response.text[:400]}")
                return None
            response.raise_for_status()
            inline_image = self.extract_inline_image(response.json())
            if not inline_image:
                print("Gemini did not return inline image data")
                return None

            image_bytes = base64.b64decode(inline_image["data"])
            digest = hashlib.sha256(image_bytes).hexdigest()[:12]
            ext = self.extension_for_mime(inline_image["mime_type"])
            filename = f"{safe_slug(brand_name)}-{platform}-{post_index + 1}-{digest}.{ext}"
            path = self.asset_dir / filename
            path.write_bytes(image_bytes)

            return {"url": public_asset_url(filename), "provider": f"gemini:{self.model}", "prompt": prompt}
        except Exception as exc:
            print(f"Gemini image generation failed: {exc}")
            return None


class PexelsImageGenerator:
    """Pexels-based image generator with smart product detection."""

    PEXELS_API_URL = "https://api.pexels.com/v1/search"

    BRAND_QUERIES = {
        "starbucks": ["coffee cup latte art", "cafe barista", "espresso drink"],
        "apple": ["modern smartphone", "laptop workspace", "wireless earbuds"],
        "tesla": ["electric vehicle", "modern car", "sustainable transport"],
        "nike": ["athletic sneakers", "running shoes", "sports footwear"],
        "neurobots": ["robotics team", "tech competition", "engineering students"],
    }

    def __init__(self):
        self.api_key = os.getenv("PEXELS_API_KEY")
        self.session = requests.Session()
        if self.api_key:
            self.session.headers.update({"Authorization": self.api_key})
            print("Pexels image generator initialized")
        else:
            print("PEXELS_API_KEY not set; Pexels will be skipped")

    def build_search_query(self, brand_name: str, products: List[str], platform: str, post: Optional[Dict] = None) -> str:
        brand_lower = brand_name.lower()
        post = post or {}
        caption = str(post.get("caption", "")).lower()

        for brand_key, queries in self.BRAND_QUERIES.items():
            if brand_key in brand_lower:
                return queries[0]

        domain_queries = [
            (["marketing", "social media", "campaign", "content", "brand"], "marketing strategy team"),
            (["coffee", "cafe", "bakery", "restaurant"], "cafe coffee lifestyle"),
            (["fitness", "gym", "wellness", "health"], "fitness lifestyle"),
            (["fashion", "clothing", "apparel"], "fashion brand lifestyle"),
            (["software", "saas", "technology", "ai", "automation"], "startup team technology"),
            (["ngo", "nonprofit", "impact", "community"], "community support nonprofit"),
            (["finance", "accounting", "investment"], "business finance planning"),
        ]
        haystack = " ".join([brand_lower, caption, " ".join(products)])
        for keywords, query in domain_queries:
            if any(keyword in haystack for keyword in keywords):
                return query

        if products:
            platform_context = {"instagram": "lifestyle", "linkedin": "professional", "x": "modern"}
            return f"{products[0]} {platform_context.get(platform, 'modern')}"

        return f"{brand_name} product"

    def search_pexels(self, query: str, orientation: str, per_page: int = 15) -> Optional[List[Dict]]:
        if not self.api_key:
            return None

        try:
            response = self.session.get(
                self.PEXELS_API_URL,
                params={"query": query, "orientation": orientation, "per_page": per_page, "size": "large"},
                timeout=10,
            )
            if response.status_code == 200:
                return response.json().get("photos", [])
            return None
        except Exception as exc:
            print(f"Pexels search failed: {exc}")
            return None

    def generate_post_image(self, brand_profile, post: Dict, platform: str, post_index: int = 0) -> Optional[ImageResult]:
        if not self.api_key:
            return None

        brand_name = getattr(brand_profile, "brand_name", "Brand")
        products = []
        if getattr(brand_profile, "products_services", None):
            products = [str(product).lower() for product in brand_profile.products_services[:3]]

        spec = PLATFORM_SPECS.get(platform, PLATFORM_SPECS["instagram"])
        query = self.build_search_query(brand_name, products, platform, post)
        photos = self.search_pexels(query=query, orientation=spec["orientation"], per_page=15)

        if photos:
            photo = photos[post_index % len(photos)]
            return {"url": photo["src"]["large"], "provider": "pexels", "prompt": query}

        return None


class CampaignImageGenerator:
    def __init__(self):
        self.gemini = GeminiImageGenerator()
        self.pexels = PexelsImageGenerator()

    def generate_post_image(
        self,
        brand_profile,
        post: Dict,
        platform: str,
        post_index: int = 0,
        provider: str = "hybrid",
    ) -> ImageResult:
        provider = (provider or os.getenv("IMAGE_PROVIDER", "hybrid")).lower()
        platform_key = normalize_platform(platform)
        brand_name = getattr(brand_profile, "brand_name", "Brand")

        if provider in {"gemini", "hybrid"}:
            gemini_result = self.gemini.generate_post_image(brand_profile, post, platform_key, post_index)
            if gemini_result:
                return gemini_result

        if provider in {"pexels", "hybrid", "gemini"}:
            pexels_result = self.pexels.generate_post_image(brand_profile, post, platform_key, post_index)
            if pexels_result:
                return pexels_result

        prompt = ""
        if provider in {"gemini", "hybrid"}:
            prompt = self.gemini.build_prompt(brand_profile, post, platform_key)
        return placeholder_result(brand_name, platform_key, post_index, prompt)


_generator = None


def get_generator() -> CampaignImageGenerator:
    global _generator
    if _generator is None:
        _generator = CampaignImageGenerator()
    return _generator


def generate_post_image(
    brand_profile,
    post: Dict,
    platform: str,
    post_index: int = 0,
    provider: str = "hybrid",
) -> ImageResult:
    generator = get_generator()
    return generator.generate_post_image(brand_profile, post, platform, post_index, provider)
