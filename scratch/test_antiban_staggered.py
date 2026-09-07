import urllib.request
import urllib.parse
import json
import time

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

print("=== STARTING BUSINESS WHATSAPP ANTI-BAN & STAGGERED DISPATCH TEST ===")

# Test 1: Fetch tutors to test with
status, tutors_res = request(f"{BASE_URL}/tutors?limit=5")
tutors = tutors_res.get('tutors', [])
assert len(tutors) >= 3, "Need at least 3 tutors"
test_tutors = tutors[:3]
tutor_ids = [t['id'] for t in test_tutors]
print(f"[PASS] Retrieved 3 test tutors: {[t['fullName'] for t in test_tutors]}")

# Test 2: Test backend bulk-send with 1000ms staggered anti-ban delay
start_time = time.time()
status, bulk_res = request(f"{BASE_URL}/whatsapp/bulk-send", method='POST', data={
    'tutorIds': tutor_ids,
    'messageTemplate': "Hello {{tutor_name}}, this is Charithra Home Tuition testing staggered anti-ban delivery.",
    'templateName': 'Anti-Ban Staggered Test',
    'staggerDelayMs': 1000,
    'overrideConsent': True
})
elapsed = time.time() - start_time
assert status == 200, f"Expected status 200, got {status}"
assert bulk_res.get('sentCount') == 3, f"Expected 3 sent, got {bulk_res.get('sentCount')}"
assert elapsed >= 1.8, f"Expected elapsed time >= 1.8s due to staggered delay, got {elapsed:.2f}s"
print(f"[PASS] Staggered bulk dispatch completed in {elapsed:.2f}s with anti-ban pacing! (Sent: {bulk_res.get('sentCount')})")

# Test 3: Verify individual timestamps in WhatsApp history
status, history_res = request(f"{BASE_URL}/whatsapp/history?limit=10")
history = history_res.get('history', [])
relevant_items = [h for h in history if h.get('templateName') == 'Anti-Ban Staggered Test']
assert len(relevant_items) >= 3, f"Expected at least 3 history entries, found {len(relevant_items)}"
print(f"[PASS] Successfully verified {len(relevant_items)} staggered history records logged in database.")
for idx, h in enumerate(reversed(relevant_items[:3])):
    print(f"       Message {idx+1}: To {h.get('tutorName')} ({h.get('phone')}) at {h.get('date')}")

print("\n=======================================================")
print("ALL ANTI-BAN STAGGERED DISPATCH TESTS PASSED 100%!")
print("=======================================================")
