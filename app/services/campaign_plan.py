from typing import List

from app.schemas import BrandProfile, CampaignPlan, FunnelStage, GeneratedPost


def first_or_default(items: List[str], fallback: str) -> str:
    return items[0] if items else fallback


def unique_values(values: List[str], limit: int = 6) -> List[str]:
    seen = set()
    results = []
    for value in values:
        normalized = value.strip()
        key = normalized.lower()
        if normalized and key not in seen:
            seen.add(key)
            results.append(normalized)
        if len(results) >= limit:
            break
    return results


def build_campaign_plan(brand_profile: BrandProfile, posts: List[GeneratedPost], tone_preset: str) -> CampaignPlan:
    brand_name = brand_profile.brand_name
    primary_offer = first_or_default(brand_profile.products_services, "the core offer")
    primary_audience = first_or_default(brand_profile.target_audience, "the ideal customer")
    keywords = unique_values([str(keyword) for keyword in brand_profile.keywords], limit=5)
    ctas = unique_values([post.cta for post in posts], limit=5)
    strongest_posts = [post for post in posts if post.engagement_score_label == "High"]
    strongest_platform = strongest_posts[0].platform if strongest_posts else (posts[0].platform if posts else "Instagram")
    tone = brand_profile.tone or tone_preset or "clear and confident"

    content_pillars = unique_values(
        [
            f"Problem framing for {primary_audience}",
            f"Proof and credibility around {primary_offer}",
            f"Use-case education for {brand_name}",
            f"Behind-the-scenes trust building in a {tone} voice",
            f"Conversion content built around {', '.join(ctas) if ctas else 'a clear next step'}",
        ],
        limit=5,
    )

    offer_hooks = unique_values(
        [
            f"Turn {primary_audience}'s daily friction into a simpler workflow",
            f"Show the before-and-after value of {primary_offer}",
            f"Make {brand_name} feel low-risk with proof, clarity, and a direct CTA",
            f"Use {strongest_platform} as the lead channel for the sharpest hook",
            f"Connect {', '.join(keywords[:3]) if keywords else 'brand keywords'} to measurable outcomes",
        ],
        limit=5,
    )

    funnel_stages = [
        FunnelStage(
            stage="Awareness",
            objective=f"Make {primary_audience} recognize the core problem and remember {brand_name}.",
            message=f"{brand_name} helps with {primary_offer} in a {tone} way.",
            asset=f"{strongest_platform} hook post with a strong campaign visual",
            automation_trigger="Add engaged viewers or post clickers to a warm retargeting segment.",
        ),
        FunnelStage(
            stage="Consideration",
            objective="Turn interest into trust with practical education and proof.",
            message=f"Explain why {primary_offer} matters and what makes the approach credible.",
            asset="LinkedIn value post, carousel outline, or founder proof note",
            automation_trigger="Send resource, case-study, or comparison follow-up to warm leads.",
        ),
        FunnelStage(
            stage="Conversion",
            objective="Move ready prospects toward a clear next action.",
            message=f"Give {primary_audience} one simple reason to act now.",
            asset=f"CTA-led post using {ctas[0] if ctas else 'Get started'}",
            automation_trigger="Notify sales or add the contact to a high-intent nurture sequence.",
        ),
        FunnelStage(
            stage="Retention",
            objective="Keep new users or customers connected after the first action.",
            message=f"Reinforce the win they get from staying close to {brand_name}.",
            asset="Customer success post, usage tip, or community invitation",
            automation_trigger="Send a follow-up prompt asking for feedback, referral, or next-step adoption.",
        ),
    ]

    kpis = [
        "Post saves and shares by platform",
        "Profile visits or landing-page clicks from UTM links",
        "CTA click-through rate by post angle",
        "Comment quality and qualified replies",
        "Lead capture or demo/signup conversion rate",
    ]

    experiments = [
        f"Test emotional hook vs. practical hook for {primary_audience}",
        f"Compare {strongest_platform} visual-first creative against LinkedIn proof-led copy",
        "Run two CTAs: one low-friction learning CTA and one direct conversion CTA",
        "Test stock imagery against AI-generated branded imagery when Gemini is configured",
        "Recycle the highest-engagement post as an email subject and landing-page headline",
    ]

    automation_playbook = [
        "Queue the five posts into the generated calendar slots.",
        "Attach the generated UTM link for each platform before publishing.",
        "Tag every click or reply by campaign source and audience stage.",
        "Move high-intent responders into a follow-up sequence within 24 hours.",
        "Review performance after 48 hours and promote the best hook into the next campaign.",
    ]

    risk_checks = [
        "Confirm every claim is supported by the website or brand notes.",
        "Check image crops on mobile before scheduling.",
        "Avoid overusing hashtags that dilute the professional tone.",
        "Make sure every CTA points to a real destination or next step.",
        "Review AI-generated visuals for brand fit before paid distribution.",
    ]

    return CampaignPlan(
        campaign_name=f"{brand_name} Growth Sprint",
        primary_angle=f"{primary_offer} for {primary_audience}",
        positioning_statement=(
            f"{brand_name} positions {primary_offer} as the practical next step for {primary_audience}, "
            f"using a {tone} voice and proof-led content to move people from awareness to action."
        ),
        audience_insight=(
            f"{primary_audience} needs quick clarity: what problem is being solved, why {brand_name} is credible, "
            "and what low-friction action they should take next."
        ),
        content_pillars=content_pillars,
        offer_hooks=offer_hooks,
        funnel_stages=funnel_stages,
        kpis=kpis,
        experiments=experiments,
        automation_playbook=automation_playbook,
        risk_checks=risk_checks,
    )
