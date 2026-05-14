# 🌱 AgroLink Nigeria

**A full-stack agricultural marketplace platform connecting farmers directly with buyers across Nigeria.**

> Built with FastAPI · React · PostgreSQL · Supabase · JWT Auth

---

## 🔗 Live Demo

> _Deployment in progress — backend hosted on Railway, frontend on Vercel_

---

## 📌 What is AgroLink?

AgroLink is a web platform that eliminates the middleman in Nigeria's agricultural supply chain. Farmers list their crops, buyers discover and purchase them directly, and an intelligent matching engine surfaces the best deals based on location and buying history.

The platform features a full transaction lifecycle — from listing to payment verification to delivery tracking — with a real-time market price index powered by live platform data.

---

## ✨ Key Features

### 👨‍🌾 For Farmers
- **Crop Listing Management** — Create, edit, and manage agricultural product listings with price, category, and location
- **Smart Buyer Matching** — A backend scoring engine recommends buyers based on geographic proximity and crop interest history
- **Payment Verification** — Receive buyer receipts and verify bank transfer payments before confirming orders
- **Real-time Messaging** — Chat directly with buyers to negotiate deals

### 🛒 For Buyers
- **Marketplace & Search** — Browse and filter live crop listings by category, price, and location
- **Purchase Requests** — Send formal order requests with quantity and notes
- **Bank Transfer Payment Flow** — Upload payment receipts for farmer verification
- **Delivery Tracking** — 5-step order tracking (Processing → Shipped → In Transit → Delivered → Confirmed)
- **Saved Listings** — Bookmark crops for later comparison

### 🛡️ For Admins
- **Live Dashboard** — Real-time stats on users, verified farmers, active listings, and transaction volume
- **NIN Identity Verification** — Review and approve National Identity Number submissions
- **Subscription Management** — Manually extend user subscriptions (+7 or +30 days)
- **Listing Moderation** — Full visibility and control over all platform listings

### 📊 Intelligence & Data
- **Market Price Index** — Auto-calculated average prices per crop category based on live listings
- **Historical Price Tracking** — Daily price snapshots with percentage change indicators (Increasing / Decreasing / Stable)

### 🔐 Platform Infrastructure
- **Role-Based Access Control (RBAC)** — Strict separation of Farmer, Buyer, and Admin permissions via `ProtectedRoute` components
- **7-Day Free Trial + Subscription** — New users get full access for 7 days, then a 2,000 Naira/month subscription with a "Subscription Guard" overlay
- **Live Marketplace Preview** — Public landing page with real listings; Auth Guard prompts unauthenticated interactions
- **Dark Mode** — Full light/dark theme toggle via Tailwind CSS + Shadcn UI

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Backend | FastAPI (Python) |
| ORM | SQLAlchemy |
| Frontend | React + Vite + TypeScript |
| UI | Tailwind CSS + Shadcn UI |
| Database | PostgreSQL (Supabase) |
| Auth | JWT (JSON Web Tokens) |
| Deployment | Railway (backend) · Vercel (frontend) |

---

## 🚀 Getting Started

### Prerequisites
- Python 3.10+
- Node.js 18+
- PostgreSQL (or Supabase account)

### Backend Setup

```bash
# Clone the repo
git clone https://github.com/Techsheik/AgroLink.git
cd AgroLink/backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set up environment variables
cp .env.example .env
# Fill in your DATABASE_URL, SECRET_KEY, etc.

# Run the server
uvicorn main:app --reload
```

### Frontend Setup

```bash
cd AgroLink/sprout-smart-grid-main

# Install dependencies
npm install

# Start development server
npm run dev
```

---

## 📁 Project Structure

```
AgroLink/
├── backend/              # FastAPI backend
│   ├── main.py           # App entry point
│   ├── models/           # SQLAlchemy models
│   ├── routers/          # API route handlers
│   └── auth/             # JWT authentication
├── sprout-smart-grid-main/  # React frontend
│   ├── src/
│   │   ├── components/   # UI components
│   │   ├── pages/        # Route pages
│   │   └── hooks/        # Custom React hooks
└── AGROLINK_FEATURES.txt # Full feature specifications
```

---

## 🗺️ Roadmap

- [ ] Mobile app (React Native)
- [ ] SMS notifications via GSM integration
- [ ] AI-powered crop price forecasting
- [ ] Logistics partner integration

---

## 👤 Author

**Abdullahi Musa Ibrahim**
Backend Engineer · AI/ML Builder
[GitHub](https://github.com/Techsheik)

---

## 📄 License

This project is licensed under the MIT License.
