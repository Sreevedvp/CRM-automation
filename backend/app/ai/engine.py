import json
from typing import Dict, Any, Optional
from app.config import settings

class AIEngine:
    """
    Pluggable AI Intelligence space.
    Supports mock/local fallback engine as well as OpenAI/Gemini/Ollama adapters.
    """

    def __init__(self, provider: str = None):
        self.provider = provider or settings.AI_PROVIDER

    def analyze_lead_intent_and_sentiment(self, text: str, lead_data: Dict[str, Any] = None) -> Dict[str, Any]:
        """
        Analyzes inbound communication text to classify intent and sentiment.
        """
        text_lower = text.lower()
        
        # Heuristic / Mock AI processing (easily replaceable with LLM prompt)
        if any(w in text_lower for w in ["buy", "demo", "price", "quote", "cost", "urgent", "call me"]):
            intent = "high_purchase_intent"
            sentiment = "positive"
            suggested_action = "escalate_to_sales_rep"
        elif any(w in text_lower for w in ["expensive", "not now", "later", "busy"]):
            intent = "price_objection"
            sentiment = "neutral"
            suggested_action = "send_value_prop_nurture"
        elif any(w in text_lower for w in ["stop", "unsubscribe", "don't call", "not interested"]):
            intent = "opt_out"
            sentiment = "negative"
            suggested_action = "mark_not_interested"
        else:
            intent = "general_inquiry"
            sentiment = "neutral"
            suggested_action = "send_warm_drip_sequence"

        return {
            "intent": intent,
            "sentiment": sentiment,
            "suggested_action": suggested_action,
            "confidence": 0.92,
            "provider": self.provider
        }

    def generate_executive_summary(self, lead_name: str, source: str, score: float, classification: str, notes: str = None) -> str:
        """
        Generates an AI executive summary for sales reps on lead detail view.
        """
        notes_str = f" Notes: '{notes}'." if notes else ""
        return (
            f"AI Summary: {lead_name} is classified as a {classification.upper()} lead (Score: {score:.0f}/100) via {source}."
            f"{notes_str} High-priority outreach recommended via WhatsApp & Direct Call."
        )

    def generate_smart_reply(self, lead_name: str, channel: str, last_message: str, classification: str) -> str:
        """
        Generates AI suggested response draft for WhatsApp/Email.
        """
        if channel.lower() == "whatsapp":
            return (
                f"Hi {lead_name}! Thank you for reaching out to us regarding your request. "
                f"I noticed your interest and would love to schedule a quick 5-min demo call for you. "
                f"Does tomorrow at 10 AM or 2 PM work better?"
            )
        else:
            return (
                f"Subject: Re: Next Steps for {lead_name} - Demo & Pricing\n\n"
                f"Hi {lead_name},\n\n"
                f"Thank you for connecting with us! Based on your requirements, we've prepared a customized overview for you.\n\n"
                f"Please let me know when you're free for a brief call to walk through the solution.\n\n"
                f"Best regards,\nSales Team"
            )

ai_engine = AIEngine()
