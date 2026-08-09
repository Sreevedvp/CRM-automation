import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__)))

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_full_lead_lifecycle():
    print("--- 1. Testing Lead Intake (HOT Lead) ---")
    intake_data = {
        "name": "Alex Mercer",
        "phone": "+15550192837",
        "email": "alex.mercer@apexcorp.com",
        "source": "website",
        "budget": 75000,
        "intent_signals": ["demo", "pricing", "contact_sales"],
        "company_size": "500+ employees",
        "notes": "Urgent requirement for enterprise CRM automation with WhatsApp."
    }
    response = client.post("/api/intake", json=intake_data)
    assert response.status_code == 201, f"Failed intake: {response.text}"
    lead = response.json()
    print(f"✅ Lead Created: ID {lead['id']} | Status: {lead['status']} | Score: {lead['score']} | Assigned: {lead['assigned_to']}")
    assert lead["status"] == "hot"
    assert lead["score"] >= 70
    assert lead["assigned_to"] is not None

    print("\n--- 2. Testing Inbound Reply Webhook (Hard Interrupt & AI Analysis) ---")
    reply_payload = {
        "phone_or_email": "+15550192837",
        "channel": "whatsapp",
        "content": "Thanks! Can we get a custom price quote for 100 sales reps today?"
    }
    response = client.post("/api/intake/inbound-reply", json=reply_payload)
    assert response.status_code == 200, f"Failed interrupt: {response.text}"
    res = response.json()
    print(f"✅ Inbound Interrupt Triggered: Status -> {res['lead_status']} | AI Intent: {res['ai_intent']}")
    assert res["lead_status"] == "replied"
    assert res["ai_intent"] == "high_purchase_intent"

    print("\n--- 3. Testing Sales Rep Action (Mark Converted) ---")
    action_payload = {
        "status": "converted",
        "reason": "Signed annual contract"
    }
    response = client.post(f"/api/leads/{lead['id']}/action", json=action_payload)
    assert response.status_code == 200
    res = response.json()
    print(f"✅ Sales Action Applied: Lead #{lead['id']} New Status -> {res['new_status']}")
    assert res["new_status"] == "converted"

    print("\n--- 4. Testing Audit Log Retrieval ---")
    audit_res = client.get(f"/api/leads/{lead['id']}/audit")
    assert audit_res.status_code == 200
    logs = audit_res.json()
    print(f"✅ Audit Log Entries Count: {len(logs)}")
    for log in logs:
        print(f"   - [{log['timestamp']}] Trigger: {log['trigger']} | Actions: {log['actions_executed']}")

    print("\n🎉 ALL BACKEND END-TO-END TESTS PASSED CLEANLY!")

if __name__ == "__main__":
    test_full_lead_lifecycle()
