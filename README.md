# 🏢 Vidudhi Smart Residence & Hostel Living Platform

**Unified Full-Stack Hostel Living & Biometric Operations Platform (v2.0.0)**  
Featuring 1:1 ResNet-34 neural network facial identification, Haversine spherical geodesic geofencing (300m perimeter), WebAuthn hardware biometric authentication, cryptographic HMAC SHA-256 gatepass tokens, and MongoDB Atlas cloud synchronization.

---

## 🚀 Live Demo & Repository Links

- **🌐 Live Production Web Application (GitHub Pages)**: [https://keerthana-glitch-debug.github.io/Viduthi-Frontend-HostelPortal/](https://keerthana-glitch-debug.github.io/Viduthi-Frontend-HostelPortal/)
- **☁️ Permanent Cloud Full-Stack Deployment (Render.com)**: [https://vidudhi-hostel-portal.onrender.com](https://vidudhi-hostel-portal.onrender.com)
- **🩺 Backend API Health & Metadata**: [https://vidudhi-hostel-portal.onrender.com/api/health](https://vidudhi-hostel-portal.onrender.com/api/health)
- **📦 GitHub Repositories**:
  - **Frontend Portal**: [https://github.com/keerthana-glitch-debug/Viduthi-Frontend-HostelPortal](https://github.com/keerthana-glitch-debug/Viduthi-Frontend-HostelPortal)
  - **Backend API**: [https://github.com/keerthana-glitch-debug/Viduthi-Backend](https://github.com/keerthana-glitch-debug/Viduthi-Backend)
  - **Unified Monorepo**: [https://github.com/keerthana-glitch-debug/Vidudhi-Smart-Hostel-Management-System](https://github.com/keerthana-glitch-debug/Vidudhi-Smart-Hostel-Management-System)

---

## 🔐 Default Login Credentials

| Role | Username / Identifier | Password | Access Capabilities |
| :--- | :--- | :--- | :--- |
| **Chief Warden / Super Admin** | `keerthana020706@gmail.com` *(or `warden` / `keerthana@gmail.com`)* | `123` / `Vidudhi@2026` | Resident enrollment, biometric oversight, emergency SOS resolution, audit logs |
| **Campus Doctor** | `doctor.madhu@vidudhi.edu` *(or `doctor`)* | `123` / `Vidudhi@2026` | Clinic shift status, digital consultation & prescription issuance, medical reviews |
| **Mess Manager** | `muthumari@vidudhi.edu` *(or `mess`)* | `123` / `Vidudhi@2026` | Weekly mess menu scheduling, student dietary feedback monitoring |
| **Executive Admin** | `admin.venkatesh@vidudhi.edu` *(or `admin`)* | `123` / `Vidudhi@2026` | System overview, resident directory, administrative audit trail |
| **Student Resident** | Roll No (e.g. `24104030`, `24104404`) | `123` | Face ID attendance check-in, gatepass QR, personal leaves/complaints/clinic queue |

> **Note on Account Provisioning**: In compliance with hostel security policy, public self-registration (`/api/auth/register`) is disabled (HTTP 403). New resident accounts are provisioned exclusively by authorized Wardens and Administrators via `POST /api/admin/users`.

---

## ⚡ 24/7 Cloud Deployment on Render.com

To deploy or rebuild the application on Render:

1. Connect the GitHub repository: `Viduthi-Frontend-HostelPortal` (or unified repo `Vidudhi-Smart-Hostel-Management-System`).
2. Deployment configuration:
   - **Environment**: `Node`
   - **Branch**: `main` *(or `master`)*
   - **Build Command**: `npm run build`
   - **Start Command**: `npm start`
3. Set the following **Environment Variables**:
   - `NODE_ENV`: `production`
   - `MONGODB_URI`: `mongodb+srv://keerthana:<password>@cluster0.92rctps.mongodb.net/vidudhi?retryWrites=true&w=majority`
   - `JWT_SECRET`: `vidudhi_keerthana_portal_jwt_secret_token_2026_xyz`
   - `JWT_EXPIRES_IN`: `7d`
   - `AUDIT_HMAC_SECRET`: `vidudhi_keerthana_audit_hmac_secret_key_9981`
   - `HOSTEL_LAT`: `13.0827`
   - `HOSTEL_LNG`: `80.2707`
   - `GEOFENCE_RADIUS_METERS`: `300`

---

## 🛠️ Technical Specifications & Architecture

1. **Biometric Facial Recognition Engine**:
   - Client-side deep learning inference powered by `@vladmandic/face-api` (ResNet-34 128-dimensional descriptor vectors).
   - Calibrated Euclidean distance threshold: **`< 0.48`** (strictly tuned for high-confidence 1:1 verification, rejecting any descriptor distance $\ge 0.48$).
2. **Spherical Haversine Geofence Engine**:
   - Mathematical geodesic distance calculation verifying device GPS coordinates against hostel perimeter (`13.0827° N, 80.2707° E`) with a strict **300-meter** radius buffer.
3. **Hardware Biometrics & Cryptographic Tokens**:
   - WebAuthn integration supporting hardware fingerprint sensors and Windows Hello.
   - HMAC SHA-256 digital signatures embedded into turnstile QR gatepasses and attendance audit trails.
4. **Cloud Database Architecture**:
   - Real-time persistent data storage on **MongoDB Atlas Cluster0** (`cluster0.92rctps.mongodb.net`, database: `vidudhi`, owner: `keerthana`).
5. **Role-Based Access Control (RBAC)**:
   - Dedicated authorization across 6 distinct roles: `student`, `warden`, `doctor`, `mess_manager`, `admin`, and `staff`.
