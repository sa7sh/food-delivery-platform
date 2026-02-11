# Treato - Food Delivery App

A full-stack food delivery application with Customer App and Backend.

## 📁 Project Structure

- **frontend-Customer-App/** - React Native Expo app for customers
- **Backend/** - Node.js Express backend with MongoDB

## 🚀 Getting Started

### Backend Setup
```bash
cd Backend
npm install
# Create .env file with your MongoDB connection string
npm start
```

### Customer App Setup
```bash
cd frontend-Customer-App
npm install
npx expo start
```

## 🔧 Environment Variables

### Backend (.env)
```
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
PORT=5000
```

### Frontend (src/config/env.js)
```javascript
export const API_BASE_URL = 'http://YOUR_IP:5000/api';
```

## ✨ Features

- Restaurant browsing
- Real-time menu display
- Food item ordering
- Base64 image support
- User authentication
- Cart management

## 📱 Tech Stack

**Frontend:**
- React Native
- Expo
- Zustand (State Management)
- Axios

**Backend:**
- Node.js
- Express
- MongoDB
- JWT Authentication
