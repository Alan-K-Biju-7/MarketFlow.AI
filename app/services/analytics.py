from typing import List
from typing import Literal


def score_post(caption: str, hashtags: List[str], cta: str = "") -> Literal["Low", "Medium", "High"]:
    """
    Score a post with lightweight, deterministic engagement heuristics.
    """
    length = len(caption)
    tag_count = len(hashtags)
    text = f"{caption} {cta}".lower()
    score = 0

    if 80 <= length <= 220:
        score += 35
    elif 40 <= length < 80 or 220 < length <= 320:
        score += 22
    elif length >= 25:
        score += 10

    if 3 <= tag_count <= 6:
        score += 25
    elif tag_count == 2:
        score += 15
    elif tag_count > 6:
        score += 8

    if any(word in text for word in ["learn", "shop", "join", "start", "try", "discover", "follow", "book"]):
        score += 20

    if "?" in caption:
        score += 10

    if any(char in caption for char in ["!", ":"]):
        score += 10

    if score < 45:
        return "Low"
    if score < 70:
        return "Medium"
    return "High"
