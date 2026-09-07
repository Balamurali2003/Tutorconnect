import urllib.request
import urllib.parse
import json

BASE_URL = 'http://localhost:5001/api'

def request(url, method='GET', data=None):
    req = urllib.request.Request(url, method=method)
    req.add_header('Content-Type', 'application/json')
    req.add_header('Accept', 'application/json')
    if data:
        body = json.dumps(data).encode('utf-8')
        resp = urllib.request.urlopen(req, data=body)
    else:
        resp = urllib.request.urlopen(req)
    return resp.status, json.loads(resp.read().decode('utf-8'))

print("=== STARTING OFFICIAL WHATSAPP BUSINESS API BULK SEND TEST ===")

# 1. Fetch at least 5 tutors from the database
status, tutors_res = request(f"{BASE_URL}/tutors?limit=10")
all_tutors = tutors_res.get('tutors', [])
assert len(all_tutors) >= 5, "Database must have at least 5 tutors"
test_tutors = all_tutors[:5]
tutor_ids = [t['id'] for t in test_tutors]

print(f"[TEST 1] Retrieved {len(test_tutors)} test tutors:")
for idx, t in enumerate(test_tutors):
    print(f"         Tutor {idx+1}: {t.get('fullName')} | Phone: {t.get('whatsappPhoneNumber') or t.get('mobile')} | Opt-In: {t.get('whatsappOptIn')}")

# 2. Execute ONE bulk send action to message ALL 5 selected tutors
payload = {
    "tutorIds": tutor_ids,
    "templateId": "interview_invitation",
    "templateName": "Interview Invitation",
    "messageTemplate": (
        "Hello {{tutor_name}},\n\n"
        "This is TutorConnect Tuition Centre.\n\n"
        "We are contacting you regarding your tutor application for {{subjects}}.\n\n"
        "Status: {{status}} | Experience: {{experience}}\n\n"
        "Thank you."
    )
}

status, bulk_res = request(f"{BASE_URL}/whatsapp/bulk-send", method='POST', data=payload)
assert status == 200, f"Expected status 200, got {status}"

summary = bulk_res.get('summary', {})
results = bulk_res.get('results', [])

print("\n[TEST 2] Bulk WhatsApp Response Received:")
print(f"         Total Selected:     {summary.get('totalSelected')}")
print(f"         Successfully Sent:  {summary.get('successfullySent')}")
print(f"         Failed:             {summary.get('failed')}")
print(f"         Invalid Numbers:    {summary.get('invalidNumbers')}")
print(f"         Skipped (No Opt-in):{summary.get('skippedNotEligible')}")

# Critical assertion: ALL 5 tutors must be processed! Not just the first tutor!
assert summary.get('totalSelected') == 5, f"Expected totalSelected=5, got {summary.get('totalSelected')}"
assert summary.get('successfullySent') == 5, f"Expected 5 successfully sent, got {summary.get('successfullySent')}"
assert len(results) == 5, f"Expected 5 results in array, got {len(results)}"

print("\n[TEST 3] Verifying Individual Delivery Results:")
for idx, r in enumerate(results):
    tutor_name = r.get('tutorName')
    expected_name = test_tutors[idx].get('fullName')
    assert tutor_name == expected_name, f"Mismatch in tutor name at index {idx}: {tutor_name} vs {expected_name}"
    assert r.get('status') == 'Sent', f"Tutor {tutor_name} was not marked 'Sent'"
    assert r.get('providerMessageId', '').startswith('wamid.HBg'), f"Invalid providerMessageId for {tutor_name}"
    # Verify personalized message contains the candidate's actual name
    msg_body = r.get('message', '')
    assert expected_name in msg_body, f"Personalized message does not contain tutor's actual name: {expected_name}"
    print(f"         Tutor {idx+1} -> {tutor_name} | {r.get('phoneNumber')} | Status: [OK] {r.get('status')} | Provider ID: {r.get('providerMessageId')}")

# 4. Verify Individual History Records in Database (one record per tutor, not just one bulk record)
status, history_res = request(f"{BASE_URL}/whatsapp/history?limit=10")
history = history_res.get('history', [])

recent_history = [h for h in history if h.get('templateId') == 'interview_invitation'][:5]
assert len(recent_history) == 5, f"Expected 5 distinct history records, found {len(recent_history)}"

print("\n[TEST 4] Verifying Message History Records in Database:")
for idx, h in enumerate(recent_history):
    assert h.get('id'), "History record missing id"
    assert h.get('tutorId'), "History record missing tutorId"
    assert h.get('phoneNumber') or h.get('phone'), "History record missing phoneNumber"
    assert h.get('message'), "History record missing message content"
    assert h.get('sentAt') or h.get('date'), "History record missing timestamp"
    assert h.get('status') == 'Sent', "History record status must be Sent"
    assert h.get('providerMessageId'), "History record missing providerMessageId"
    print(f"         Record {idx+1}: ID={h.get('id')} | Tutor={h.get('tutorName')} | Status={h.get('status')} | SentAt={h.get('sentAt') or h.get('date')}")

print("\n=======================================================")
print("ALL BULK WHATSAPP BUSINESS API TESTS PASSED 100%!")
print("=======================================================")
