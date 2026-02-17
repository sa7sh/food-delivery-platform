🍔 Food Delivery Platform

A full-stack food delivery ecosystem inspired by Swiggy/Zomato architecture.
This project consists of a centralized Node.js backend and three role-based React Native applications.

🏗 System Architecture
FoodDeliveryPlatform
│
├── Backend (Node.js + Express + MongoDB)
├── frontend-Customer-App (React Native - Expo)
├── Restaurant-app (React Native - Expo)
└── DeliveryPartnerApp (React Native - Expo)

🚀 Tech Stack
Backend

Node.js

Express.js

MongoDB / MongoDB Atlas

JWT Authentication

Socket.io (Real-time updates)

Cloudinary (Image storage)

Mobile Applications

React Native (Expo)

Axios (API integration)

React Navigation

Socket.io Client

Maps & Geolocation APIs

📱 Applications Overview
👤 Customer App

Browse restaurants & menus

Add to cart & place orders

Live order tracking

Search & filter functionality

Authentication (JWT based)

Rating & review system

🏪 Restaurant App

Manage menu items

Accept / reject orders

Real-time order notifications

View order history

🛵 Delivery Partner App

Accept delivery requests

Live location tracking

Update order status (Picked / Delivered)

Navigation integration

⚙️ Installation & Setup
1️⃣ Backend Setup
cd Backend
npm install


Create a .env file inside Backend:

PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret


Start the backend server:

npm start


Server runs on:

http://localhost:5000

2️⃣ Customer App
cd frontend-Customer-App
npm install
npm start


Scan QR code using Expo Go.

3️⃣ Restaurant App
cd Restaurant-app
npm install
npm start


Scan QR code using Expo Go.

4️⃣ Delivery Partner App
cd DeliveryPartnerApp
npm install
npm start


Scan QR code using Expo Go.

🔥 Core Features

✅ JWT-based Authentication

✅ Role-Based Access (Customer / Restaurant / Delivery)

✅ Real-time Order Tracking (Socket.io)

✅ Live Location Updates

✅ Secure REST APIs

✅ Image Upload via Cloudinary

✅ Cart & Checkout Logic

✅ Order Status Workflow

✅ Admin-level Backend Controls

📡 Real-Time Flow

Customer places order

Restaurant receives instant notification

Restaurant accepts order

Delivery partner gets request

Live tracking updates customer

All handled using Socket.io WebSockets.

🔐 Security Features

Password hashing (bcrypt)

JWT token authentication

Protected API routes

Environment variable configuration

📌 Future Improvements

Online payment gateway integration

Admin dashboard (Web)

Production deployment (AWS / Render / Railway)

CI/CD integration
