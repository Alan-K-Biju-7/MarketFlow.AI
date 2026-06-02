from app.services.analytics import score_post


def test_score_post_returns_high_for_complete_engaging_copy():
    label = score_post(
        "Ready to grow smarter? Discover practical marketing workflows built for busy teams!",
        ["#marketing", "#growth", "#strategy"],
        "Get started",
    )

    assert label == "High"


def test_score_post_returns_low_for_sparse_copy():
    assert score_post("Hi", []) == "Low"
