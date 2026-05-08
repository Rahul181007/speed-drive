# 🚗 Speed Drive

A full-stack vehicle tracking and trip management system built with modern web technologies.

---

## 📌 Features

- 📍 Trip tracking with path points
- 📊 Distance, stoppage time, and idling time calculation
- 📁 CSV upload & processing
- 🔐 Authentication & secure APIs
- 📈 Dashboard for trip insights

---

## 🛠 Tech Stack

### Frontend
- React
- TypeScript
- Tailwind CSS / Bootstrap

### Backend
- Node.js
- Express.js
- TypeScript
- MongoDB

---

## 🏗 Architecture

This project follows a lightweight clean architecture.

### 🔄 Flow

```text
Route → Controller → Service → Model
```

### 📌 Responsibilities

- **Routes** → Define API endpoints
- **Controllers** → Handle request and response
- **Services** → Contain business logic
- **Models** → Handle database interaction

---

## 📂 Project Structure

```bash
speed-drive/
│
├── frontend/              # React frontend
│
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── middleware/
│   │   ├── types/
│   │   └── main.ts
│
└── README.md
```

---

## ⚙️ Setup Instructions

### 1️⃣ Clone Repository

```bash
git clone https://github.com/Rahul181007/speed-drive.git

cd speed-drive
```

---

### 2️⃣ Backend Setup

```bash
cd backend

npm install

npm start
```

---

## 🌐 Deployment

- Backend → Render
- Frontend → Vercel

---

## 👨‍💻 Author

Rahul R

---

---

## 📡 API Endpoints

### 🔐 Auth APIs

| Method | Endpoint | Description |
|---|---|---|
| POST | `/auth/register` | Register a new user |
| POST | `/auth/login` | Login user |

---

### 🚗 Trip APIs

| Method | Endpoint | Description |
|---|---|---|
| GET | `/trips` | Fetch all trips |
| POST | `/upload` | Upload trip CSV |
| DELETE | `/trips/:id` | Delete trip |

---

## 🔐 Environment Variables

### Backend `.env`

```env
PORT=5000
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_secret_key
```

### Frontend `.env`

```env
VITE_API_URL=http://localhost:5000
```

---

## 📄 CSV Format

The uploaded CSV file should contain the following columns:

| Column | Description |
|---|---|
| latitude | GPS latitude |
| longitude | GPS longitude |
| speed | Vehicle speed |
| timestamp | Recorded time |

---

## 📊 Calculated Metrics

The system calculates:

- Total Distance
- Stoppage Duration
- Idling Duration
- Overspeed Distance
- Overspeed Segments

---



