import json
import urllib.request

API_URL = "http://127.0.0.1:5000/api/risk-score"

print("=" * 65)
print("  SENTINEL-RASP :: BANKING SECURITY TELEMETRY TERMINAL  ")
print("=" * 65)
print("Order: [integrity] [hook] [syscall] [overlay] [adb] [developer]")
print("Example input: 1 1 0 0 0 0\n")

while True:
    try:
        raw_input = input("Terminal Telemetry (e.g. 1 0 1 0 0 0 or 'q') > ").strip()
        if raw_input.lower() == 'q': break
        flags = [f for f in raw_input.split() if f in ('0', '1')]
        if len(flags) < 6:
            print("⚠️ Please enter exactly 6 binary values (0 or 1)\n")
            continue
        payload = {
            "integrity": flags[0] == "1",
            "hook": flags[1] == "1",
            "syscall": flags[2] == "1",
            "overlay": flags[3] == "1",
            "adb": flags[4] == "1",
            "developer": flags[5] == "1"
        }
        req = urllib.request.Request(API_URL, data=json.dumps(payload).encode('utf-8'), headers={'Content-Type': 'application/json'})
        with urllib.request.urlopen(req) as resp:
            data = json.loads(resp.read().decode('utf-8'))
            print(f"➜ Synced! Score: {data['score']} | Status: {data['status']}\n")
    except Exception as e:
        print(f"❌ Error connecting to server: {e}\n")
