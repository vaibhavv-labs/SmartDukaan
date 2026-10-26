# SmartDukaan (KiranaMind AI) 🛒🤖

> **Multi-Modal Proactive AI Store Assistant for Kirana & Retail Stores**

SmartDukaan is an end-to-end intelligent retail management system designed specifically for local Kirana store owners. It simplifies day-to-day retail operations with voice-driven billing, automated inventory tracking, khata book (credit/udhaar) management, proactive AI business insights, and smart bill scanning.

---

## ✨ Features

- 🎙️ **Voice Billing**: Add items to cart using spoken natural language in Hinglish or English.
- 📦 **Smart Inventory**: Real-time stock levels, low-stock warnings, and expiry tracking.
- 📒 **Digital Khata Book**: Customer ledger management, credit limits, payment histories, and WhatsApp-ready reminder alerts.
- 📸 **Bill & Khata Scanner**: Multi-modal OCR/scanner for wholesaler paper bills and handwritten khata ledgers.
- 📊 **Proactive AI Insights**: Automated intelligence engine detecting dead stock, impending expiries, customer credit risks, and replenishment suggestions.
- 💬 **Store Copilot**: Natural language AI assistant for instant store analytics, customer queries, and inventory reports.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 19 + Vite
- **Styling**: Tailwind CSS
- **Components & Icons**: Lucide React, Framer Motion
- **Data Visualization**: Recharts
- **Router**: React Router DOM v7

### Backend
- **Framework**: FastAPI (Python 3.10+)
- **Server**: Uvicorn ASGI
- **Database**: SQLite with SQLAlchemy ORM
- **Validation & Settings**: Pydantic v2 & Pydantic-Settings
- **Authentication**: JWT (JSON Web Tokens) with Passlib & Bcrypt

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- Python 3.10+

---

### 1. Backend Setup

```bash
cd server

# Create and activate virtual environment
python -m venv venv
# Windows:
.\venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure environment variables
cp .env.example .env

# (Optional) Seed the database with sample inventory & customers
python seed_data.py

# Run FastAPI backend server
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

Backend will be live at:
- **API URL**: [http://127.0.0.1:8000](http://127.0.0.1:8000)
- **Interactive Swagger Docs**: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)

---

### 2. Frontend Setup

```bash
cd client

# Install NPM dependencies
npm install

# Start Vite dev server
npm run dev
```

Frontend will be live at:
- **Application URL**: [http://localhost:5173](http://localhost:5173)

---

## 📂 Project Structure

```
Smart Dukan/
├── client/                 # React + Vite frontend application
│   ├── src/
│   │   ├── components/     # Reusable layout and UI components
│   │   ├── context/        # Global application state
│   │   ├── pages/          # Dashboard, VoiceBilling, Inventory, KhataBook, etc.
│   │   ├── services/       # Unified API client connecting to FastAPI
│   │   └── utils/          # Constants and formatting utilities
│   └── package.json
├── server/                 # FastAPI backend application
│   ├── app/
│   │   ├── routes/         # API endpoints (auth, inventory, sales, khata, ai, etc.)
│   │   ├── services/       # Intelligence engine and AI processing services
│   │   ├── database.py     # SQLite connection and session setup
│   │   ├── models.py       # SQLAlchemy ORM models
│   │   └── schemas.py      # Pydantic request/response schemas
│   ├── requirements.txt    # Python dependencies
│   ├── seed_data.py        # Database seeder with realistic Kirana store records
│   └── .env.example
└── README.md
```

---

## 📄 License
This project is developed for academic and commercial retail research.
