import json, os

client_pkg_path = r"C:\Users\Lenovo\.gemini\antigravity\scratch\tutorconnect-crm\client\package.json"
with open(client_pkg_path, "r", encoding="utf-8") as f:
    data = json.load(f)

data["pnpm"] = {
    "onlyBuiltDependencies": ["esbuild"]
}

with open(client_pkg_path, "w", encoding="utf-8") as f:
    json.dump(data, f, indent=2)

print("Updated client package.json with pnpm onlyBuiltDependencies")
