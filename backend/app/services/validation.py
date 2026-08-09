import re
from typing import Tuple, Optional, Dict, Any

WHITELISTED_SOURCES = {"website", "whatsapp", "facebook_ads", "google_ads", "manual", "import"}

def validate_lead_payload(payload: Dict[str, Any]) -> Tuple[bool, Optional[str], Dict[str, Any]]:
    """
    Validates mandatory lead fields, phone format, email format, and source whitelist.
    Returns (is_valid, error_message, normalized_payload)
    """
    name = payload.get("name", "").strip()
    phone = payload.get("phone", "").strip()
    email = payload.get("email", "").strip()
    source = payload.get("source", "website").strip().lower()

    if not name:
        return False, "Missing required field: name", {}

    if not phone:
        return False, "Missing required field: phone", {}

    # Basic E.164 / digits cleaning for phone
    cleaned_phone = re.sub(r"[^\d+]", "", phone)
    if len(re.sub(r"\D", "", cleaned_phone)) < 7:
        return False, f"Invalid phone number format: {phone}", {}

    if not email:
        return False, "Missing required field: email", {}

    # Email pattern check
    email_regex = r"^[\w\.-]+@[\w\.-]+\.\w+$"
    if not re.match(email_regex, email):
        return False, f"Invalid email format: {email}", {}

    if source not in WHITELISTED_SOURCES:
        source = "other"

    normalized = {
        "name": name.title(),
        "phone": cleaned_phone,
        "email": email.lower(),
        "source": source,
        "budget": payload.get("budget", 0.0),
        "intent_signals": payload.get("intent_signals", []),
        "company_size": payload.get("company_size"),
        "notes": payload.get("notes"),
        "raw_payload": payload
    }

    return True, None, normalized
