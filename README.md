# VolunteerBridge Platform

VolunteerBridge is a full-stack web platform that connects NGOs with volunteers. It features a **microservice-style architecture** with three independent, role-specific portals — **Admin**, **Volunteer**, and **NGO** — each with its own backend server, database, and themed UI.

---

## ✨ Features

| Feature | Description |
|---|---|
| 🎯 **Skill-Based Matching** | Matches volunteers to NGO requests based on skills, location, and availability — ensuring the right help reaches the right cause. |
| 🔒 **Verified NGOs** | Every NGO goes through an admin verification process, so volunteers can trust they're contributing to legitimate organisations. |
| 📊 **Real-Time Analytics** | Admins get a bird's-eye view of platform health — user metrics, request pipelines, and completion rates — all in real-time. |
| 🏆 **Impact Tracking** | Volunteers can track tasks they've completed and build a verifiable record of social impact and community contributions. |
| 🌐 **Multi-Portal Design** | Three distinct portals — Admin, Volunteer, and NGO — each with its own tailored interface, features, and visual identity. |
| ⚡ **Urgency Levels** | NGOs can mark requests as low, medium, or high urgency — helping volunteers prioritize where help is needed most. |



---

## 🛠 Prerequisites

Before running the platform, make sure you have the following installed:

1. **MongoDB** — Must be running locally on the default port `27017`.
   - The platform uses three separate databases: `volunteerbridge_admin`, `volunteerbridge_volunteer`, and `volunteerbridge_ngo`.
2. **Python 3.x** — Required for the Flask backend servers.
3. **Node.js (v18+)** — Required for the React/Vite frontend.

---

## 🚀 Running Instructions

### Step 1: Install Backend Dependencies

Open a terminal and navigate to the `backend` directory:

```bash
cd backend
pip install -r requirements.txt
```

### Step 2: Start the Three Backend Servers

You need **three separate terminals**, one for each portal server:

**Terminal 1 — Admin Server (Port 5001):**
```bash
cd backend
py admin_server.py
```

**Terminal 2 — Volunteer Server (Port 5002):**
```bash
cd backend
py volunteer_server.py
```

**Terminal 3 — NGO Server (Port 5003):**
```bash
cd backend
py ngo_server.py
```

### Step 3: Start the Frontend

Open a **fourth terminal**:

```bash
cd frontend
npm install
npm run dev
```

The frontend will start at **http://localhost:3000**.

---

## 🖥 Opening Multiple Portals Simultaneously

VolunteerBridge supports **simultaneous multi-portal sessions** in different browser tabs. This means you can be logged in as a **Volunteer** in one tab and as an **NGO** in another tab at the same time — without one session overwriting the other.

### How It Works

Each portal's authentication session is stored independently using role-scoped keys in `localStorage` (e.g., `token_volunteer`, `token_ngo`, `token_admin`). This means:

- Logging in as **Volunteer** in Tab 1 stores the session under `token_volunteer`.
- Logging in as **NGO** in Tab 2 stores the session under `token_ngo`.
- Both sessions coexist — refreshing either tab keeps its own session intact.

### Steps to Use Multiple Portals at Once

1. **Open Tab 1** → Go to `http://localhost:3000/login`
   - Select **Volunteer**, enter credentials, and sign in.
   - You'll be redirected to the **Volunteer Dashboard**.

2. **Open Tab 2** → Go to `http://localhost:3000/login`
   - Select **NGO**, enter credentials, and sign in.
   - You'll be redirected to the **NGO Dashboard**.

3. **Open Tab 3** (optional) → Go to `http://localhost:3000/login`
   - Select **Admin**, enter credentials, and sign in.
   - You'll be redirected to the **Admin Dashboard**.

All three tabs will maintain their own independent sessions. Logging out from one portal does **not** affect the others.

---

## 📁 Project Structure

```
OOPS_CP/
├── backend/
│   ├── admin_server.py        # Admin portal Flask server (port 5001)
│   ├── volunteer_server.py    # Volunteer portal Flask server (port 5002)
│   ├── ngo_server.py          # NGO portal Flask server (port 5003)
│   ├── db_admin.py            # Admin database layer
│   ├── db_volunteer.py        # Volunteer database layer
│   ├── db_ngo.py              # NGO database layer
│   ├── controllers/           # Business logic controllers
│   ├── models/                # Data models (OOP)
│   ├── routes/                # API route blueprints
│   ├── services/              # Service layer
│   ├── middleware/             # Auth middleware
│   ├── utils/                 # Utility functions
│   ├── requirements.txt       # Python dependencies
│   └── .env                   # Environment configuration
├── frontend/
│   ├── src/
│   │   ├── App.jsx            # Root component with routing & theming
│   │   ├── context/           # AuthContext (multi-portal sessions)
│   │   ├── components/        # Shared UI components (Navbar, Footer)
│   │   ├── pages/             # Page components (dashboards, auth)
│   │   └── services/          # API service layer
│   ├── vite.config.js         # Vite config with multi-backend proxy
│   └── package.json           # Node.js dependencies
└── screenshots/               # Application screenshots
```

---

## ⚙️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19, React Router 7, Vite 6 |
| **Backend** | Flask 3.1, Flask-JWT-Extended |
| **Database** | MongoDB (via PyMongo) |
| **Auth** | JWT (JSON Web Tokens), bcrypt |
| **Architecture** | Multi-server microservice pattern, OOP design |

---

## 🔑 Environment Variables

The backend `.env` file contains the following configuration:

| Variable | Default Value | Description |
|---|---|---|
| `MONGO_URI_ADMIN` | `mongodb://localhost:27017/volunteerbridge_admin` | Admin database URI |
| `MONGO_URI_VOLUNTEER` | `mongodb://localhost:27017/volunteerbridge_volunteer` | Volunteer database URI |
| `MONGO_URI_NGO` | `mongodb://localhost:27017/volunteerbridge_ngo` | NGO database URI |
| `JWT_SECRET_KEY` | *(set in .env)* | Secret key for JWT token signing |
| `ADMIN_PORT` | `5001` | Admin server port |
| `VOLUNTEER_PORT` | `5002` | Volunteer server port |
| `NGO_PORT` | `5003` | NGO server port |
