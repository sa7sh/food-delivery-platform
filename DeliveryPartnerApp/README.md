# 🍔 Food Delivery Platform  

A full-stack food delivery ecosystem inspired by Swiggy/Zomato architecture.  
This project consists of a centralized Node.js backend and three role-based React Native applications.

---

## 🏗 Project Structure

FoodDeliveryPlatform
│
├── Backend
├── frontend-Customer-App
├── Restaurant-app
└── DeliveryPartnerApp


---

## 🚀 Tech Stack

### Backend
- Node.js
- Express.js
- MongoDB / MongoDB Atlas
- JWT Authentication
- Socket.io (Real-time updates)
- Cloudinary (Image storage)

### Mobile Applications
- React Native (Expo)
- Axios
- React Navigation
- Socket.io Client
- Maps & Geolocation APIs

---

## 📱 Applications Overview

### 👤 Customer App
- Browse restaurants and menus
- Add to cart and place orders
- Live order tracking
- Search and filter functionality
- Secure login/signup

### 🏪 Restaurant App
- Manage menu items
- Accept / reject orders
- Real-time order notifications
- View order history

### 🛵 Delivery Partner App
- Accept delivery requests
- Update order status (Picked / Delivered)
- Live location tracking
- Navigation integration

---

## ⚙️ Installation & Setup

### Backend

```bash
cd Backend
npm install
Create a .env file:

PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
Start the server:

npm start
Run Apps
Customer App:

cd frontend-Customer-App
npm install
npm start
Restaurant App:

cd Restaurant-app
npm install
npm start
Delivery Partner App:

cd DeliveryPartnerApp
npm install
npm start
🔐 Security
JWT Authentication

Password hashing (bcrypt)

Protected API routes

Environment variables for secrets
