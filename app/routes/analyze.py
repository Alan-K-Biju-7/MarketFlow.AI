from fastapi import APIRouter, HTTPException
from app.schemas import AnalyzeRequest, AnalyzeResponse
from app.services.scraper import fetch_website_text
from app.services.brand_profile import generate_brand_profile
from app.services.posts import generate_posts

router = APIRouter()

@router.post("/analyze", response_model=AnalyzeResponse)
async def analyze_website(request: AnalyzeRequest):
    """
    Analyze a website URL and generate brand profile + social media posts WITH IMAGES
    """
    try:
        # 1. Scrape website (also returns detected color hex codes)
        website_text, detected_colors = fetch_website_text(request.url, fallback_text=request.fallbackText)

        # 2. Generate brand profile, pass detected colors to help the LLM name them
        brand_profile = generate_brand_profile(website_text, request.tonePreset, detected_colors=detected_colors)
        
        # 3. Generate posts
        posts = generate_posts(brand_profile, request.tonePreset)
        
        # 4. Generate images for each post (NEW!)
        from app.services.image_gen import generate_post_image
        
        for post in posts:
            try:
                image_url = generate_post_image(
                    brand_name=brand_profile.brand_name,
                    post_caption=post.caption,
                    platform=post.platform,
                    tone=post.tone,
                    hashtags=post.hashtags
                )
                post.image_url = image_url
                print(f"✅ Generated image for {post.platform} post")
            except Exception as e:
                print(f"⚠️ Failed to generate image for {post.platform}: {e}")
                post.image_url = None
        
        return AnalyzeResponse(
            brand_profile=brand_profile,
            posts=posts
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
