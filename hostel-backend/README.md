# Vidudhi Hostel Resident Portal — Backend API Service

Production-grade Node.js / Express / MongoDB backend for the **Vidudhi Smart Residence & Campus Living Platform**.

- **Database Target**: MongoDB Cluster `keerthana`
- **Default Port**: `http://localhost:5000` (`/api`)
- **Security**: JWT Bearer Tokens, Bcrypt Password Hashing, Helmet HTTP Security Headers, Express Rate Limiting, RBAC Middleware

---

## 🌟 Quick Start

### 1. Install Dependencies
```bash
cd hostel-backend
npm install
```

### 2. Configure Environment Variables
Verify `.env` has the desired configuration:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/keerthana
# For MongoDB Atlas:
# MONGODB_URI=mongodb+srv://keerthana:<password>@keerthana.mongodb.net/keerthana?retryWrites=true&w=majority
JWT_SECRET=vidudhi_keerthana_portal_jwt_secret_token_2026_xyz
AUDIT_HMAC_SECRET=vidudhi_keerthana_audit_hmac_secret_key_9981
HOSTEL_LAT=13.0827
HOSTEL_LNG=80.2707
GEOFENCE_RADIUS_METERS=300
```

### 3. Seed Authentic Data (No Sample/Dummy Text)
Populates 6 authentic residential accounts, room matrices, maintenance tickets, turnstile outpasses, and attendance logs:
```bash
npm run seed
```

### 4. Run Automated Verification Test Suite
Executes 35 automated tests verifying health, all 6 user logins, RBAC security, GPS Haversine calculation, HMAC SHA-256 tokens, What-If resource simulator, and chatbot queries:
```bash
npm run test:api
```

### 5. Start the Server
```bash
npm start
# or for auto-reloading:
npm run dev
```

---

## 👥 Authentic Verified User Accounts

All accounts use the secure password: `Vidudhi@2026`

| Name | Role | Email / Identifier | Department / Details | Room / Office |
| :--- | :--- | :--- | :--- | :--- |
| **Keerthana G.** | Student | `keerthana.g@vidudhi.edu`<br>`24104031` | Computer Science & Engineering (3rd Year) | Room A-101 |
| **Kavya N.** | Student | `kavya.n@vidudhi.edu`<br>`24104088` | Electronics & Communication (2nd Year) | Room B-102 |
| **Priya M.** | Student | `priya.m@vidudhi.edu`<br>`24104052` | Information Technology (3rd Year) | Room A-102 |
| **Dr. R. Sundaram** | Chief Warden | `warden.sundaram@vidudhi.edu`<br>`WRD-1001` | Student Affairs Directorate | Warden Command Desk |
| **Prof. K. Venkatesh** | Administrator | `admin.venkatesh@vidudhi.edu`<br>`ADM-0001` | Executive Residential Directorate | Administrative Office |
| **S. Ramanathan** | Staff | `mess.ramanathan@vidudhi.edu`<br>`STF-2004` | Dining Hall & Food Services | Mess Supervisor Desk |

---

## 🛡️ Non-CRUD Algorithmic Features (Resume & Interview Defense)

### 1. GPS Geofenced + Biometric Attendance Engine (`/api/attendance/*`)
- **Spherical Haversine Geodesic Distance Formula**:
  $$\text{distance} = 2 R \arcsin\left(\sqrt{\sin^2\left(\frac{\Delta\phi}{2}\right) + \cos\phi_1\cos\phi_2\sin^2\left(\frac{\Delta\lambda}{2}\right)}\right)$$
  Calculates real-time distance in meters between user device GPS coordinates and the Vidudhi Campus reference perimeter (`13.0827° N, 80.2707° E`).
- **Cryptographic HMAC SHA-256 Audit Signatures**:
  Every roll-call check-in generates a tamper-proof digital signature binding `studentId + rollNo + date + timestamp + lat + lng + secret`. Any subsequent database alteration invalidates the audit proof.

### 2. Algorithmic What-If Capacity & Resource Simulator (`/api/simulation/*`)
- Non-CRUD operational forecasting model that projects campus resource consumption under dynamic scenarios (Examination Week, Monsoon Flood Emergency, Festival Exodus, Summer Heatwave):
  - **Water Drawdown Curve**: Hourly depletion rate ($L/\text{hr}$) and hours-to-exhaustion against reservoir capacities.
  - **Electrical Grid Load & Generator Fuel Burn**: Peak load ($\text{kW}$) and diesel generator liters required during municipal power outages.
  - **Dining Hall Buffer**: Food waste vs. stockout probability metrics.
  - **Dynamic Contingency Checklist**: Prioritized mitigation actions with emergency budget estimations (in INR ₹).

### 3. Cryptographic Turnstile Outpass Tokens (`/api/leave/*`)
- Issues time-bounded HMAC clearance tokens for verified gate pass approvals.

### 4. Recently Accessed & Audit Logging (`/api/user/recently-accessed`)
- Tracks user operational history across rooms, outpasses, grievances, and reports.

---

## 📡 Key API Endpoints

### Authentication & Profiles
- `POST /api/auth/login`: Authenticate with roll number, staff ID, or email + password. Returns JWT token and profile.
- `POST /api/auth/register`: Create new user with role and room assignment.
- `POST /api/auth/google`: Google OAuth token exchange and automatic resident provisioning.
- `GET /api/auth/me`: Current authenticated user profile.
- `PATCH /api/auth/profile`: Update phone, avatar, or language.

### Admin Dashboard (RBAC Protected)
- `GET /api/admin/overview`: High-level metrics (occupancy rate, active outpasses, open complaints, attendance %, health).
- `GET /api/admin/users`: User directory with search and pagination.
- `POST /api/admin/users`: Admin creates staff/student.
- `PATCH /api/admin/users/:id`: Modify user details.
- `DELETE /api/admin/users/:id`: Deactivate user.
- `GET /api/admin/logs`: System audit trail.

### Attendance & Geofencing
- `POST /api/attendance/check-in`: Student check-in with GPS coordinates + biometric verification.
- `GET /api/attendance/daily`: Warden night roll-call register.
- `PATCH /api/attendance/override/:id`: Warden manual physical inspection verification.
- `GET /api/attendance/history`: Student's 30-day attendance trail.

### Non-CRUD Simulation
- `POST /api/simulation/forecast`: Run resource and capacity forecasting model.
- `GET /api/simulation/scenarios`: List preset campus contingency scenarios.

### Chatbot & Rulebook
- `POST /api/chatbot/query`: Campus NLP rulebook resolving quiet hours, mess timings, curfew, sports gear, and laundry tokens.

### User & Multilingual
- `GET /api/user/recently-accessed`: Fetch recent operational modules and records.
- `POST /api/user/recently-accessed`: Record a viewed resource.
- `PATCH /api/user/language`: Save user language preference (`en`, `ta`, `hi`).

### Facility & Student Services
- `GET/POST /api/complaints`: Maintenance ticket management.
- `GET/POST /api/leave`: Outpass requests with turnstile QR clearance.
- `GET /api/rooms`: Residential block room status and occupancy matrix.
- `GET/POST /api/visitors`: Front gate security sign-in and sign-out.
