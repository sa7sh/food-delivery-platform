# 🍔 Food Delivery Platform

A scalable **full-stack food delivery system** built using **React Native, Node.js, and Microservices Architecture**.
This platform supports **Customers, Restaurants, and Delivery Partners** with real-time order tracking and efficient service orchestration.

---

## 🚀 Features

### 👤 Customer App

* Browse restaurants & food items
* Add to cart & place orders
* Real-time order tracking (Socket.io)
* Multiple address management
* Order history & profile management

### 🍽️ Restaurant App

* Manage menu items
* Accept/reject orders
* Track live orders
* View earnings dashboard

### 🚴 Delivery Partner App

* Accept/reject delivery requests
* Real-time location tracking
* Earnings tracking
* Profile management

---

## 🏗️ System Architecture

### 🔹 Microservices-Based Backend

* **API Gateway (Port 5000)**

  * Central entry point
  * Request routing & path rewriting

* **Auth Service (Port 5001)**

  * User & restaurant authentication
  * JWT-based security

* **Restaurant Service (Port 5002)**

  * Menu & restaurant management
  * Reviews & analytics

* **Order Service (Port 5003)**

  * Order processing
  * Payment & history tracking

* **Delivery Service (Port 5004)**

  * Delivery partner system
  * Ride assignment & tracking

---

## 🛠️ Tech Stack

### 📱 Frontend

* React Native + Expo
* Zustand (State Management)
* React Navigation

### ⚙️ Backend

* Node.js + Express
* Microservices Architecture
* http-proxy-middleware (API Gateway)

### 🗄️ Database & Storage

* MongoDB + Mongoose
* Cloudinary (Image Storage)

### ⚡ Real-Time

* Socket.io (Live tracking & notifications)

---

## 📂 Project Structure

```
FoodDeliveryApp/
│
├── Backend/
│   ├── api-gateway/
│   ├── auth-service/
│   ├── restaurant-service/
│   ├── order-service/
│   └── delivery-service/
│
├── frontend-Customer-App/
├── Restaurant-app/
├── DeliveryPartnerApp/
│
└── README.md
```

---

## ⚙️ Installation & Setup

### 1️⃣ Clone Repository

```bash
git clone https://github.com/sa7sh/food-delivery-platform.git
cd food-delivery-platform
```

---

### 2️⃣ Install Dependencies

```bash
cd Backend && npm install
cd ../frontend-Customer-App && npm install
cd ../Restaurant-app && npm install
cd ../DeliveryPartnerApp && npm install
```

---

### 3️⃣ Environment Variables

Create `.env` files in respective services:

```env
PORT=5000
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_secret
CLOUDINARY_URL=your_cloudinary_url
```

---

### 4️⃣ Run Backend Services

Run each service separately:

```bash
node server.js
```

Or (recommended):

```bash
npm run dev
```

---

### 5️⃣ Run Mobile Apps

```bash
npm start
```

Use Expo Go / Emulator to run apps.

---

## 📌 Author

**Saish Sagvekar**

