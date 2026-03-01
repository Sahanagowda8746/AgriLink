# 🌾 AgriLink: Smart Farmer-to-Market Platform

A full-stack web platform connecting farmers directly with buyers, powered by machine learning and a multilingual chatbot.

## 🖥️ Technology Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite, plain CSS |
| Backend | Python Flask + Flask-CORS |
| Database | SQLite (via SQLAlchemy) |
| ML | Pillow (disease detection), NumPy (demand forecast) |
| Charts | Recharts |

---

## 📁 Project Structure
```
AgriTech/
├── backend/
│   ├── app.py              ← Flask entry point
│   ├── config.py           ← Configuration
│   ├── models.py           ← Database models
│   ├── requirements.txt    ← Python dependencies
│   ├── routes/
│   │   ├── auth.py         ← Auth API
│   │   ├── farmer.py       ← Farmer API
│   │   ├── buyer.py        ← Buyer API
│   │   ├── ml.py           ← ML API
│   │   └── chatbot.py      ← Chatbot API
│   └── ml/
│       ├── disease_model.py   ← Disease detection
│       ├── demand_model.py    ← Demand forecasting
│       └── chatbot_engine.py  ← Multilingual chatbot
└── frontend/
    └── src/
        ├── pages/          ← All page components
        └── components/     ← Navbar, Chatbot
```

---

## 🚀 Setup & Running

### Step 1 — Install Backend Dependencies

```powershell
cd C:\Users\SAHANA GOWDA\Desktop\AgriTech\backend
pip install -r requirements.txt
```

### Step 2 — Start the Backend Server

```powershell
python app.py
```
Backend runs at: **http://localhost:5000**

The database and demo data are created automatically on first run.

### Step 3 — Start the Frontend (new terminal)

```powershell
cd C:\Users\SAHANA GOWDA\Desktop\AgriTech\frontend
npm run dev
```
Frontend runs at: **http://localhost:5173**

### Step 4 — Open the App

Open your browser and go to: **http://localhost:5173**

---

## 🔑 Demo Accounts

| Role | Email | Password |
|---|---|---|
| 👨‍🌾 Farmer | `farmer@demo.com` | `password123` |
| 🛍️ Buyer | `buyer@demo.com` | `password123` |

---

## 🌐 API Endpoints

### Authentication (`/api/auth`)
| Method | Endpoint | Description |
|---|---|---|
| POST | `/signup` | Register new user |
| POST | `/signin` | Login |
| POST | `/logout` | Logout |
| GET | `/me` | Get current user |

### Farmer (`/api/farmer`)
| Method | Endpoint | Description |
|---|---|---|
| POST | `/crops` | Add new crop (multipart) |
| GET | `/crops` | Get own crops |
| DELETE | `/crops/:id` | Delete crop |
| GET | `/orders` | Get received orders |
| GET | `/stats` | Farmer statistics |

### Buyer (`/api/buyer`)
| Method | Endpoint | Description |
|---|---|---|
| GET | `/marketplace` | Browse crops |
| GET | `/crops/:id` | Crop detail |
| POST | `/purchase` | Place order |
| GET | `/orders` | My orders |
| POST | `/payment/:id` | Simulate payment |
| POST | `/transport/:id` | Book transport |
| GET | `/stats` | Buyer statistics |

### Machine Learning (`/api/ml`)
| Method | Endpoint | Description |
|---|---|---|
| POST | `/disease` | Disease detection |
| GET | `/demand?category=X` | Demand forecast |
| GET | `/demand/all` | All categories |

### Chatbot (`/api/chatbot`)
| Method | Endpoint | Description |
|---|---|---|
| POST | `/` | Get chatbot reply |

---

## ✨ Features

- **Farmer Dashboard** — Add crops, view orders, check stats
- **Disease Detection** — Upload crop image → AI analyzes disease with confidence score and treatment advice
- **Demand Forecasting** — 12-month seasonal demand charts with trend indicators
- **Buyer Marketplace** — Search/filter crops by name, location, category
- **Purchase Flow** — Order → Optional transport booking → Payment simulation
- **Multilingual Chatbot** — English, ಕನ್ನಡ (Kannada), हिन्दी (Hindi), తెలుగు (Telugu)
- **JWT Authentication** — Secure token-based auth persisted in localStorage

---

## 🤖 Machine Learning Details

### Disease Detection
Uses PIL image analysis (color statistics) to classify:
- ✅ Healthy
- 🟡 Leaf Blight  
- 🟠 Powdery Mildew
- 🔴 Leaf Rust
- 🟤 Bacterial Spot

### Demand Forecasting
Uses seasonal pattern data + NumPy-based noise simulation to generate 12-month demand forecasts for 7 crop categories. Returns trend (Rising/Falling/Stable) and best selling months.
