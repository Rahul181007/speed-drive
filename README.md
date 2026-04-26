# 🚗 Speed Drive

A full-stack vehicle tracking and trip management system built with modern web technologies.

---

## 📌 Features

- 📍 Trip tracking with path points  
- 📊 Distance, stoppage time, idling time calculation  
- 📁 CSV upload & processing  
- 🔐 Authentication & secure APIs  
- 📈 Dashboard for trip insights  

---

## 🛠 Tech Stack

### Frontend
- React
- TypeScript
- Tailwind / Bootstrap

### Backend
- Node.js
- Express
- TypeScript
- MongoDB

---

## 🏗 Architecture

This project follows a **lightweight clean architecture**.

### 🔄 Flow
Route → Controller → Service → Model


### 📌 Responsibilities

- **Routes** → Define API endpoints  
- **Controllers** → Handle request/response  
- **Services** → Contain business logic  
- **Models** → Database interaction  

---

## 📂 Project Structure
speed-drive/
│
├── frontend/ # React frontend
│
├── backend/
│ ├── src/
│ │ ├── config/
│ │ ├── controllers/
│ │ ├── services/
│ │ ├── models/
│ │ ├── routes/
│ │ ├── middleware/
│ │ ├── types/
│ │ └── main.ts
│
└── README.md



---

## ⚙️ Setup Instructions

### 1. Clone repo
git clone https://github.com/Rahul181007/speed-drive.git

cd speed-drive

---

### 2. Backend setup
cd backend
npm install
npm start

---

## 🌐 Deployment

- Backend: Render  
- Frontend: Vercel  

---

## 👨‍💻 Author

Rahul R

 
 After Updating

Run:

git add README.md
git commit -m "Improved README formatting and structure"
git push
