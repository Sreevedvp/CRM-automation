from typing import Dict, Any, Tuple

def calculate_lead_score(payload: Dict[str, Any]) -> Tuple[float, Dict[str, Any], str]:
    """
    Computes rule-based score based on:
    - Budget (0-40 pts)
    - Intent signals (0-30 pts)
    - Source quality (0-15 pts)
    - Company size (0-15 pts)

    Returns (total_score, score_breakdown, classification)
    - HOT: score >= 70
    - WARM: 40 <= score < 70
    - COLD: score < 40
    """
    total_score = 0.0
    breakdown = {}

    # 1. Budget scoring
    budget = payload.get("budget", 0.0) or 0.0
    if budget >= 50000:
        budget_score = 40.0
    elif budget >= 20000:
        budget_score = 30.0
    elif budget >= 5000:
        budget_score = 20.0
    elif budget > 0:
        budget_score = 10.0
    else:
        budget_score = 0.0
    breakdown["budget_score"] = budget_score
    total_score += budget_score

    # 2. Intent signals
    intent_signals = payload.get("intent_signals", []) or []
    intent_score = 0.0
    high_intent_keywords = {"demo", "pricing", "rfp", "immediate", "buy", "contact_sales"}
    med_intent_keywords = {"webinar", "whitepaper", "download", "newsletter"}

    for sig in intent_signals:
        sig_lower = str(sig).lower()
        if any(kw in sig_lower for kw in high_intent_keywords):
            intent_score += 15.0
        elif any(kw in sig_lower for kw in med_intent_keywords):
            intent_score += 7.5
    intent_score = min(intent_score, 30.0)
    breakdown["intent_score"] = intent_score
    total_score += intent_score

    # 3. Source Quality
    source = payload.get("source", "website").lower()
    source_weights = {
        "whatsapp": 15.0,
        "manual": 15.0,
        "google_ads": 12.0,
        "website": 10.0,
        "facebook_ads": 8.0,
        "import": 5.0
    }
    source_score = source_weights.get(source, 5.0)
    breakdown["source_score"] = source_score
    total_score += source_score

    # 4. Company Size
    size = str(payload.get("company_size", "")).lower()
    if any(k in size for k in ["enterprise", "500+", "1000+"]):
        size_score = 15.0
    elif any(k in size for k in ["midmarket", "50-249", "250-499"]):
        size_score = 10.0
    elif any(k in size for k in ["smb", "10-49"]):
        size_score = 5.0
    else:
        size_score = 2.0
    breakdown["company_size_score"] = size_score
    total_score += size_score

    # Classification
    if total_score >= 70.0:
        classification = "hot"
    elif total_score >= 40.0:
        classification = "warm"
    else:
        classification = "cold"

    return total_score, breakdown, classification
