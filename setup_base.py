import json, os

root_pkg = {
    "name": "tutorconnect-crm",
    "version": "1.0.0",
    "private": True,
    "scripts": {
        "start:server": "cd server && npm start",
        "start:client": "cd client && npm run dev",
        "dev": "concurrently \"npm run start:server\" \"npm run start:client\"",
        "build": "cd client && npm run build"
    },
    "devDependencies": {
        "concurrently": "^8.2.2"
    }
}

server_pkg = {
    "name": "tutorconnect-server",
    "version": "1.0.0",
    "description": "TutorConnect Backend REST API",
    "main": "src/index.js",
    "scripts": {
        "start": "node src/index.js",
        "dev": "node src/index.js"
    },
    "dependencies": {
        "cors": "^2.8.5",
        "dotenv": "^16.4.5",
        "express": "^4.19.2",
        "multer": "^1.4.5-lts.1",
        "xlsx": "^0.18.5"
    }
}

client_pkg = {
    "name": "tutorconnect-client",
    "version": "1.0.0",
    "private": True,
    "type": "module",
    "scripts": {
        "dev": "vite",
        "build": "tsc && vite build",
        "preview": "vite preview"
    },
    "dependencies": {
        "react": "^18.3.1",
        "react-dom": "^18.3.1",
        "lucide-react": "^0.400.0",
        "xlsx": "^0.18.5",
        "canvas-confetti": "^1.9.3"
    },
    "devDependencies": {
        "@types/canvas-confetti": "^1.9.0",
        "@types/react": "^18.3.3",
        "@types/react-dom": "^18.3.0",
        "@vitejs/plugin-react": "^4.3.1",
        "autoprefixer": "^10.4.19",
        "postcss": "^8.4.38",
        "tailwindcss": "^3.4.4",
        "typescript": "^5.4.5",
        "vite": "^5.3.1"
    }
}

base = r"C:\Users\Lenovo\.gemini\antigravity\scratch\tutorconnect-crm"
with open(os.path.join(base, "package.json"), "w", encoding="utf-8") as f:
    json.dump(root_pkg, f, indent=2)

with open(os.path.join(base, "server", "package.json"), "w", encoding="utf-8") as f:
    json.dump(server_pkg, f, indent=2)

with open(os.path.join(base, "client", "package.json"), "w", encoding="utf-8") as f:
    json.dump(client_pkg, f, indent=2)

print("Wrote package.json files successfully!")
