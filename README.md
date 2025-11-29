# 🌟 UniWell Tracker

**Student Wellness & Smart Finance Platform**

UniWell adalah platform all-in-one untuk mahasiswa yang menggabungkan pelacakan kesehatan, manajemen tugas akademik, dan pengelolaan keuangan pintar dengan teknologi OCR.

---

## 📋 Daftar Isi

- [Problem Statement](#-problem-statement)
- [Solution Overview](#-solution-overview)
- [Tech Stack](#️-tech-stack)
- [Fitur Utama](#-fitur-utama)
- [Cara Menjalankan](#-cara-menjalankan)
- [API Documentation](#-api-documentation)
- [Demo](#-demo)

---

## 🎯 Problem Statement

Mahasiswa menghadapi tiga tantangan utama dalam kehidupan kampus:

### 1. 🏥 Kesehatan Mental & Fisik
- Sulit melacak pola tidur dan mood harian
- Lupa minum air yang cukup
- Tidak ada monitoring tingkat energi

### 2. 📚 Manajemen Akademik
- Deadline menumpuk dan stress meningkat
- Sulit mengatur prioritas tugas
- Tidak ada sistem untuk track beban kerja

### 3. 💸 Pengelolaan Keuangan
- Pengeluaran tidak terkontrol
- Malas mencatat struk belanja
- Tidak tahu kemana uang habis

**Masalah Inti**: Mahasiswa membutuhkan **satu platform terintegrasi** untuk mengelola kesehatan, akademik, dan keuangan secara bersamaan.

---

## 💡 Solution Overview

UniWell menyediakan **3-in-1 Smart Dashboard**:

### 🏥 Health Tracker
- ✅ Log mood harian dengan 5 emoji interaktif
- ✅ Pelacakan air minum (goal: 2000ml/hari)
- ✅ Monitor jam tidur (goal: 8 jam/hari)
- ✅ Track tingkat energi (0-100%)
- ✅ Catat aktivitas olahraga (steps + durasi)

### 📅 Smart Schedule
- ✅ Manajemen tugas dengan 3 level prioritas
- ✅ Kalender visual interaktif
- ✅ **Stress Level Calculator** otomatis
- ✅ Filter tugas berdasarkan kategori
- ✅ Deadline reminder

### 💰 Smart Finance + OCR
- ✅ **Upload foto struk → Auto extract data**
- ✅ Kategorisasi otomatis (Food, Academic, Transport, dll)
- ✅ Grafik pengeluaran per kategori
- ✅ Budget tracking bulanan
- ✅ Search & filter transaksi

---

## 🛠️ Tech Stack

### Frontend
```
⚛️  React 18.3 + TypeScript
⚡  Vite 7.2
🎨  TailwindCSS 3.4 + shadcn/ui
✨  Framer Motion (animations)
📊  Recharts (visualizations)
🔄  React Query (state management)
```

### Backend
```
🟢  Node.js 18+ + Express 4.17
🍃  MongoDB + Mongoose 6.7
🔐  JWT Authentication (jsonwebtoken 9.0)
📸  Tesseract.js 4.0 (OCR)
📁  Multer 2.0 (file upload)
```

### Database Schema
```javascript
User: { name, email, passwordHash, avatarUrl, dailyGoals }
HealthLog: { userId, date, mood, waterMl, sleepHours, energy, exercises }
Task: { userId, title, dueAt, priority, category, isDone }
Expense: { userId, amount, merchant, category, date, receiptUrl }
```

---

## ✨ Fitur Utama

| Kategori | Fitur | Deskripsi |
|----------|-------|-----------|
| 🔐 **Auth** | JWT Login/Register | Secure authentication dengan token 7 hari |
| 😊 **Mood** | 5 Level Tracking | Excellent → Good → Neutral → Poor → Bad |
| 💧 **Water** | Quick Add Buttons | 250ml, 500ml, 1000ml instant add |
| 🌙 **Sleep** | Hour Tracker | Input jam tidur dengan target 8 jam |
| ⚡ **Energy** | Slider 0-100% | Real-time energy level monitoring |
| 🏃 **Exercise** | Multi-field Log | Type, steps, duration, time tracking |
| 📆 **Calendar** | Visual Grid | Interactive month view dengan task dots |
| 🚨 **Stress** | Auto Calculator | Hitung stress dari workload & priority |
| 📸 **OCR** | Photo Upload | Tesseract.js extract merchant & amount |
| 📊 **Charts** | Pie & Bar | Recharts visualization per kategori |

---

## 🚀 Cara Menjalankan

### Prerequisites
```bash
✅ Node.js 18+ (recommended: 20.x)
✅ MongoDB (local atau MongoDB Atlas)
✅ npm atau yarn
```

### 1️⃣ Clone Repository
```bash
git clone https://github.com/joselinputri/Uniwell.git
cd Uniwell
```

### 2️⃣ Setup Backend
```bash
# Install dependencies
npm install

# Create .env file
PORT=5050
MONGO_URI=mongodb+srv://your-username:your-password@cluster.mongodb.net/?appName=Cluster0
JWT_SECRET=your-super-secret-key-here

# Run backend server
npm run dev
```

**Expected Output:**
```bash
✅ Server running at http://localhost:5050
📡 API available at http://localhost:5050/api
✅ MongoDB connected.
```

### 3️⃣ Setup Frontend
```bash
cd frontend  # atau folder root jika frontend di root

# Install dependencies
npm install

# Create .env file
VITE_API_BASE=http://localhost:5050/api

# Run frontend
npm run dev
```

**Expected Output:**
```bash
  VITE v7.2.4  ready in 324 ms

  ➜  Local:   http://localhost:8080/
  ➜  Network: http://192.168.x.x:8080/
```

### 4️⃣ Test API (Optional)
```bash
# Test health endpoint
curl http://localhost:5050/api/test

# Expected response:
{
  "message": "Backend is running!",
  "timestamp": "2025-11-29T...",
  "dbState": 1
}
```

### 5️⃣ Access Application
```
🌐 Frontend:  http://localhost:8080
🔌 Backend:   http://localhost:5050/api
📊 Database:  MongoDB Atlas (remote)
```

---

## 📡 API Documentation

### 🔐 Authentication

#### Register User
```bash
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@university.edu",
  "password": "password123"
}

# Response:
{
  "token": "eyJhbGciOiJIUzI1...",
  "user": {
    "id": "692b03fa6b66346bb34c3970",
    "name": "John Doe",
    "email": "john@university.edu"
  }
}
```

#### Login
```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@university.edu",
  "password": "password123"
}
```

#### Get Current User
```bash
GET /api/auth/me
Authorization: Bearer eyJhbGciOiJIUzI1...
```

---

### 🏥 Health API

#### Get Today's Stats
```bash
GET /api/health/today
Authorization: Bearer YOUR_TOKEN

# Response:
{
  "success": true,
  "data": {
    "mood": "excellent",
    "waterIntake": 1500,
    "waterGoal": 2000,
    "sleepHours": 7.5,
    "sleepGoal": 8,
    "energyLevel": 80,
    "exercises": [
      {
        "type": "Running",
        "steps": 5000,
        "duration": 30,
        "time": "07:00"
      }
    ]
  }
}
```

#### Create/Update Health Log
```bash
POST /api/health/logs
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "mood": "excellent",
  "waterMl": 2000,
  "sleepHours": 8,
  "energyLevel": 90,
  "notes": "Great day!",
  "exercises": [
    {
      "type": "Gym",
      "steps": 3000,
      "duration": 60,
      "time": "18:00",
      "date": "2025-11-29"
    }
  ]
}

# Response:
{
  "success": true,
  "data": { /* health log object */ },
  "message": "Health log created"
}
```

---

### 📅 Tasks API

#### Get All Tasks
```bash
GET /api/tasks
Authorization: Bearer YOUR_TOKEN

# Response:
[
  {
    "id": "692b03fa6b66346bb34c3970",
    "title": "Submit Assignment",
    "dueAt": "2025-11-30T14:00:00.000Z",
    "priority": "high",
    "category": "Academic",
    "isDone": false
  }
]
```

#### Create Task
```bash
POST /api/tasks
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "title": "Study for Exam",
  "date": "2025-12-01",
  "time": "14:00",
  "category": "Academic",
  "priority": "high"
}
```

#### Update Task
```bash
PUT /api/tasks/692b03fa6b66346bb34c3970
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "isDone": true
}
```

#### Delete Task
```bash
DELETE /api/tasks/692b03fa6b66346bb34c3970
Authorization: Bearer YOUR_TOKEN
```

---

### 💰 Expenses API

#### Get All Expenses
```bash
GET /api/expenses
Authorization: Bearer YOUR_TOKEN

# Response:
{
  "success": true,
  "data": [
    {
      "id": "692b04506b66346bb34c397f",
      "merchant": "Indomaret",
      "amount": 25000,
      "category": "Food",
      "date": "2025-11-29",
      "receiptUrl": "/uploads/receipts/receipt-1732886608.jpg"
    }
  ]
}
```

#### Upload Receipt (OCR)
```bash
POST /api/expenses/upload
Authorization: Bearer YOUR_TOKEN
Content-Type: multipart/form-data

FormData:
  receipt: [image file]
  merchant: "Alfamart" (optional)
  amount: "50000" (optional)
  category: "Food" (optional)

# Response:
{
  "success": true,
  "data": {
    "id": "692b04686b66346bb34c3985",
    "merchant": "Alfamart",
    "amount": 50000,
    "category": "Food",
    "date": "2025-11-29",
    "ocrRaw": { "text": "ALFAMART\nTOTAL: 50,000" }
  },
  "message": "Receipt processed successfully"
}
```

#### Create Manual Expense
```bash
POST /api/expenses
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "merchant": "Gojek",
  "amount": 15000,
  "category": "Transport",
  "date": "2025-11-29"
}
```

---

## 🚨 Key Technical Achievements

### 1. OCR Integration
```javascript
// Tesseract.js auto-extract dari foto struk
const { data: { text } } = await worker.recognize(imagePath);
const amount = parseAmountFromText(text);  // Rp 50.000 → 50000
const merchant = parseMerchant(text);      // Extract nama toko
```

### 2. Smart Categorization
```javascript
// Auto-detect kategori dari merchant name
function guessCategory(merchant) {
  if (/cafe|coffee|resto/i.test(merchant)) return "Food";
  if (/kampus|toko buku/i.test(merchant)) return "Academic";
  // ... 7 categories total
}
```

### 3. Stress Calculator Algorithm
```javascript
function calculateStressLevel(tasks) {
  const totalWeight = tasks.reduce((sum, task) => {
    const priority = task.priority || "medium";
    return sum + (priority === "high" ? 3 : priority === "medium" ? 2 : 1);
  }, 0);
  
  const maxCapacity = 5 * 3; // 5 tasks × high priority
  return Math.min(100, Math.round((totalWeight / maxCapacity) * 100));
}
```

---

# 📊 Demo

## Screenshots

## 🏠 Landing Page 
![Dashboard](img/aa.png)
![Dashboard](img/bb.png)
![Dashboard](img/cc.png)
----
## 🧑‍💻 Login/Register 
![Dashboard](img/dd.png)
![Dashboard](img/ee.png)
----
## 🏥 Health Tracker
![Dashboard](img/ff.png)
![Dashboard](img/gg.png)
![Dashboard](img/hh.png)
----
## 🗓️ Schedule + Stress Level
![Dashboard](img/ii.jpeg)
![Dashboard](img/hmmm.png)
----
## 💰 Finance + OCR
![Finance](img/ww.png)
![Finance](img/www.png)
![Finance](img/karaoke.png)
![Finance](img/wwwww.png)
![Finance](img/pp.jpeg)
![Finance](img/final.png)
----
## 👤 Profile
![Profile](img/rr.png)
![Profile](img/ss.png)
---
## 👤 Dashboard Final
![Profile](img/well.png)




## 🔮 Future Roadmap

- [ ] 🔔 Push notifications untuk reminder
- [ ] 📄 Export data ke PDF/Excel
- [ ] 🤝 Social features (share progress)
- [ ] 🤖 AI expense prediction
- [ ] 🔗 Integration dengan Google Calendar
- [ ] 🎮 Gamification (badges, streaks)
- [ ] 📱 React Native mobile app
- [ ] 🌍 Multi-language support
- [ ] 🔗 Pengembangan OCR Sempurna (saat ini belum sempurna dan belum terscan dengan baik)

---

## 👥 Team
**Putri Joselina Silitonga** - 
