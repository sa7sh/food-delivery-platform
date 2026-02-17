# 🍔 Food Delivery Platform

A full-stack food delivery ecosystem inspired by real-world platforms like Swiggy and Zomato.  
This project includes a centralized Node.js backend and three role-based React Native mobile applications.

---

## 🏗 Project Structure

FoodDeliveryPlatform
│
├── Backend # Node.js + Express + MongoDB API
├── frontend-Customer-App # Customer mobile application
├── Restaurant-app # Restaurant owner application
└── DeliveryPartnerApp # Delivery partner application


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
- Ratings & reviews system

### 🏪 Restaurant App
- Manage menu items
- Accept / reject orders
- Real-time order notifications
- View order history

### 🛵 Delivery Partner App
- Accept delivery requests
- Update order status (Picked / Delivered)
- Live location tracking
- Navigation support

---

## ⚙️ Installation & Setup

### 1️⃣ Backend Setup

```bash
cd Backend
npm install
Create a .env file inside the Backend folder:

PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
Start the backend:

npm start
Server runs at:
http://localhost:5000

```
###
2️⃣ Customer App
cd frontend-Customer-App
npm install
npm start


Scan the QR code using Expo Go.

3️⃣ Restaurant App
cd Restaurant-app
npm install
npm start


Scan the QR code using Expo Go.

4️⃣ Delivery Partner App
cd DeliveryPartnerApp
npm install
npm start


Scan the QR code using Expo Go.

🔥 Core Features

JWT-based authentication

Role-based access (Customer / Restaurant / Delivery)

Real-time order tracking using Socket.io

Live delivery location updates

Secure REST APIs

Image upload via Cloudinary

Cart and checkout system

Order lifecycle management

🔐 Security

Password hashing using bcrypt

JWT token authorization

Protected API routes

Environment-based configuration

📌 Future Improvements

Online payment gateway integration

Admin dashboard

Production deployment

CI/CD pipeline




