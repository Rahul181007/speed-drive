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



