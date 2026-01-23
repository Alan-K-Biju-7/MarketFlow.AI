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
        
        # 4. Generate images for each post
        from app.services.image_gen import generate_post_image
        
        for idx, post in enumerate(posts):
            try:
                # Convert Pydantic model to dict
                post_dict = post.dict() if hasattr(post, 'dict') else post.model_dump()
                platform = post_dict.get('platform', 'Instagram')
                
                print(f"\n🎨 Generating image for {platform} post {idx + 1}...")
                
                # Call with correct signature
                image_url = generate_post_image(
                    brand_profile=brand_profile,
                    post=post_dict,
                    platform=platform,
                    post_index=idx
                )
                
                post.image_url = image_url
                print(f"✅ Image generated for {platform}")
                
            except Exception as e:
                print(f"⚠️ Failed to generate image for {post.platform}: {e}")
                # Fallback image
                post.image_url = f"https://picsum.photos/1080/1080?random={idx}"
        
        return AnalyzeResponse(
            brand_profile=brand_profile,
            posts=posts
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
