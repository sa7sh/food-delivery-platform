# Treato Go (Food Delivery Platform) - Handover & Architecture Document

Welcome to the Treato Go Food Delivery Platform! This document is designed to help the next developer seamlessly transition into the project. It covers the current tech stack, architecture decisions, features added, and the strategic roadmap for future development.

---

## 1. Tech Stack Overview

### Frontend (React Native & Expo)
- **Customer App**: For ordering food, tracking real-time delivery, and managing multiple addresses and user profiles.
- **Restaurant App**: For restaurant owners to manage menus, track current and past orders, and view earnings.
- **Delivery Partner App**: For drivers to accept/reject rides, track earnings, real-time location streaming, and manage their profile.
- **State Management**: Zustand (for all 3 apps).
- **Navigation**: React Navigation (Stack, Tab, Drawer).

### Backend (Node.js & Express - Microservices Architecture)
- **API Gateway (Port 5000)**: Single entry point handling route forwarding & path-rewriting using `http-proxy-middleware`.
- **Auth Service (Port 5001)**: Customer and Restaurant authentication, JWT generation, password resets.
- **Restaurant Service (Port 5002)**: Restaurant profiles, food menu items, customer reviews, and earnings statistics.
- **Order Service (Port 5003)**: Processing new orders, payment statuses, and maintaining historical order records.
- **Delivery Service (Port 5004)**: Delivery partner auth, ride assignment, partner ratings, and earnings tracking.

### Database & Storage
- **MongoDB & Mongoose**: Shared MongoDB Atlas cluster.
- **Image Storage (Cloudinary)**: Product photos, profile pictures, RC books, Aadhar, Pan card uploads.

### Real-Time Communication
- **Socket.io**: Used heavily in the Delivery Service and Order Service to broadcast new orders to drivers, notify restaurants of incoming orders, and stream live driver locations to the customer app.

---

## 2. Recent Features & Architectural Changes (Step-by-Step)

Over the recent development cycles, the application was massively upgraded to resolve scalability and maintenance bottlenecks:

1. **Monolith to Microservices Migration**: 
   - The monolithic backend was split into 4 independent domain services (Auth, Restaurant, Order, Delivery) + 1 API Gateway.
   - **Why?** To ensure that if the Delivery system crashes during a spike, the Customer and Restaurant apps aren't entirely brought down.
   
2. **API Gateway Implementation (Port 5000)**:
   - Implemented `http-proxy-middleware` v3.
   - Configured robust path-rewriting (e.g., frontend calls `/api/restaurant/public`, Gateway strips `/api/restaurant` and forwards to `/restaurants/public` on Port 5002).
   - Handled `fixRequestBody` to prevent lost POST payloads during proxy forwarding.

3. **Decoupled Delivery Partner Authentication**:
   - Partner login/registration logic was moved securely to the Delivery Service (Port 5004). 
   - Gateway correctly routes `/api/auth/delivery/*` to `5004`, while `/api/auth/*` routes to `5001`.

4. **Frontend Standardization**:
   - Updated Customer, Restaurant, and Delivery React Native apps to explicitly communicate **only** with the API Gateway (`http://localhost:5000` locally).
   - Ensured all URL constants align geographically with the new Gateway prefixing rules (`/api/foods`, `/api/orders`, etc.).

---

## 3. The Roadmap (Next Steps for the New Developer)

Here is the strategic roadmap outlining what needs to be accomplished next to make this platform production-ready and highly scalable:

### Phase 1: Database Decoupling (High Priority)
- **Current State**: All 5 microservices currently connect to the *same* MongoDB cluster and share Mongoose Models (e.g., `Order.js`, `User.js`).
- **Goal**: Implement the **Database-per-Service** pattern.
- **Action**: Give each microservice its own isolated database schema (or separate cluster). The Order Service should "own" the Order collection, while the Restaurant Service owns the Food collection.

### Phase 2: Service-to-Service Communication (Medium Priority)
- **Current State**: Services access foreign collections directly via Mongoose.
- **Goal**: Services must communicate over HTTP/REST (using `axios`) or gRPC instead of direct DB queries.
- **Action**: Example: If the Order Service needs restaurant details to calculate total cart value, it should send a `GET` request to the Restaurant Service internally.

### Phase 3: Finish Frontend "Coming Soon" Features
- **Delivery App**: Implement "Vehicle Details", "Documents" (Aadhar, RC verification logic), and "Bank Details" screens under the Partner Profile. These currently show "Coming Soon" alerts.
- **Notifications**: Implement real push notifications using Expo Push Notifications instead of just local Socket alerts.

### Phase 4: Containerization & DevOps (Pre-Production)
- **Goal**: Dockerize the entire stack.
- **Action**: Create a `Dockerfile` for every service (Gateway, Auth, Rest, Order, Deliv).
- **Action**: Write a `docker-compose.yml` to spin up all 5 Node servers locally with one command.

### Phase 5: Security & Optimization
- **API Gateway Rate Limiting**: Add `express-rate-limit` to the API Gateway to prevent DDoS attacks and spam registrations.
- **Caching**: Introduce Redis to cache frequently fetched data, such as the public list of open restaurants on the Customer App's home screen.

---

### Tips for Debugging
- Always check the **API Gateway Logs** first. The Gateway prints out matching proxy routes.
- If a route returns `404 Not Found` but works on a direct service port (e.g., `5002`), check `services/api-gateway/services/proxies.js` pathRewrite logic.
- If a `POST` request hangs or returns empty body errors through the Gateway, ensure `fixRequestBody` is active on that proxy.

Good luck! You are inheriting a modern, robust, and cleanly separated microservices architecture.
