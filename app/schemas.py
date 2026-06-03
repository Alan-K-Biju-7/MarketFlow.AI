import ipaddress
from typing import Any, List, Literal, Optional

from pydantic import AnyHttpUrl, BaseModel, Field, field_validator


TonePreset = Literal["auto", "startup", "cafe", "ngo", "enterprise"]
ImageProvider = Literal["hybrid", "gemini", "pexels"]

class AnalyzeRequest(BaseModel):
    url: AnyHttpUrl
    tonePreset: TonePreset = "auto"
    fallbackText: Optional[str] = Field(default=None, max_length=4000)
    imageProvider: ImageProvider = "hybrid"

    @field_validator("url")
    @classmethod
    def reject_local_or_private_urls(cls, url: AnyHttpUrl) -> AnyHttpUrl:
        hostname = url.host or ""
        host = hostname.lower()

        if host in {"localhost", "127.0.0.1", "0.0.0.0", "::1"} or host.endswith(".local"):
            raise ValueError("Local and private network URLs are not allowed")

        try:
            ip = ipaddress.ip_address(host)
        except ValueError:
            return url

        if ip.is_private or ip.is_loopback or ip.is_link_local or ip.is_reserved:
            raise ValueError("Local and private network URLs are not allowed")

        return url


class BrandProfile(BaseModel):
    brand_name: str
    description: str
    products_services: List[str]
    target_audience: List[str]
    tone: str
    keywords: List[str]
    # colors may be hex strings, color names, or objects like {"name":"Silver","hex":"#C0C0C0"}
    colors: List[Any]


class GeneratedPost(BaseModel):
    platform: Literal["Instagram", "LinkedIn", "X"]
    caption: str
    hashtags: List[str]
    cta: str
    tone: str
    engagement_score_label: Literal["Low", "Medium", "High"]
    image_url: Optional[str] = None
    image_provider: Optional[str] = None
    image_prompt: Optional[str] = None


class FunnelStage(BaseModel):
    stage: str
    objective: str
    message: str
    asset: str
    automation_trigger: str


class CampaignPlan(BaseModel):
    campaign_name: str
    primary_angle: str
    positioning_statement: str
    audience_insight: str
    content_pillars: List[str]
    offer_hooks: List[str]
    funnel_stages: List[FunnelStage]
    kpis: List[str]
    experiments: List[str]
    automation_playbook: List[str]
    risk_checks: List[str]


class AnalyzeResponse(BaseModel):
    brand_profile: BrandProfile
    posts: List[GeneratedPost]
    campaign_plan: CampaignPlan
