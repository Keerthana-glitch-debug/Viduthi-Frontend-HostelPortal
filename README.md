# 🏢 Vidudhi Smart Residence & Hostel Living Platform

Unified full-stack hostel resident management platform featuring 1:1 ResNet-34 neural network face identification, GPS coordinates geofencing, WebAuthn fingerprint authentication, and cryptographic gatepass QR codes.

---

## 🚀 Live Demo & Links

- **Active Live Cloudflare Gateway**: [Live Application](https://impaired-bosnia-particle-notebook.trycloudflare.com)
- **Backup Gateway**: [Backup Mirror](https://b855a4cdf9cfed.lhr.life)
- **Permanent Cloud Deployment**: Deploy to [Render.com](https://render.com) for a 24/7 permanent `.onrender.com` domain.

---

## 🔐 Default Login Credentials

| Role | Username / Identifier | Password | Access Capabilities |
| :--- | :--- | :--- | :--- |
| **Super Admin / Warden** | `keerthana@gmail.com` | `123` | User enrollment, biometric management, emergency monitor, database controls |
| **Student Resident** | Roll No (e.g. `22CS001`) | `123` | Face ID attendance, Gatepass, Leave requests, Mess menu, Complaints |

---

## ⚡ Permanent 24/7 Cloud Deployment on Render.com

To keep this portal active permanently without needing your personal laptop running:

1. Go to [https://dashboard.render.com](https://dashboard.render.com) and click **New + > Web Service**.
2. Connect your GitHub repository: `Viduthi-HostelPortal`.
3. Set the following settings:
   - **Environment**: `Node`
   - **Branch**: `main` or `master`
   - **Build Command**: `npm run build`
   - **Start Command**: `npm start`
4. Under **Environment Variables**, add:
   - `MONGODB_URI`: `mongodb+srv://keerthana:keer@cluster0.92rctps.mongodb.net/vidudhi?retryWrites=true&w=majority`
   - `NODE_ENV`: `production`
   - `JWT_SECRET`: `vidudhi_keerthana_portal_jwt_secret_token_2026_xyz`
   - `JWT_EXPIRES_IN`: `7d`
   - `AUDIT_HMAC_SECRET`: `vidudhi_keerthana_audit_hmac_secret_key_9981`
5. Click **Create Web Service**.
6. Render builds both the Vite frontend and Express backend, giving you a **permanent 24/7 HTTPS domain** (e.g. `https://vidudhi-hostel-portal.onrender.com`).

---

## 🛠️ Features

1. **Biometric Face Verification**:
   - Client-side inference powered by `@vladmandic/face-api` (ResNet-34 128-dimensional embedding vectors).
   - Euclidean distance calculation with `< 0.50` matching threshold.
2. **GPS Geofence Validation**:
   - Uses device geolocation API to verify user coordinates against hostel coordinates (`13.0827° N, 80.2707° E`).
3. **WebAuthn Hardware Fingerprint Support**:
   - Authenticates through Windows Hello / Android Fingerprint biometric sensors.
4. **Cryptographic Gatepass**:
   - HMAC SHA-256 signed gatepass QR codes for secure turnstile verification.
5. **MongoDB Atlas Backend**:
   - Real-time persistent data storage on MongoDB Atlas cluster `keerthana`.
