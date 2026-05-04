# 🚚 RouteOps: Professional Fleet Dispatch & Route Optimization

[![Laravel](https://img.shields.io/badge/Laravel-FF2D20?style=for-the-badge&logo=laravel&logoColor=white)](https://laravel.com)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org)
[![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com)

**RouteOps** is a high-performance, full-stack logistics management system designed to solve the "Last Mile Delivery" problem. By combining advanced clustering algorithms with real-time map visualization, RouteOps automates the complex task of assigning thousands of orders to specialized vehicle fleets while minimizing total travel distance and delivery time.

---

## 🌟 Project Overview

In modern logistics, manual dispatching is a bottleneck. **RouteOps** eliminates this inefficiency by providing a dynamic, map-centric dashboard where dispatchers can visualize their entire operations in real-time.

### Real-World Use Case
Imagine a city-wide grocery delivery service with 5 hubs and 50 riders. RouteOps automatically determines which hub should handle which order and calculates the exact sequence of stops for every rider, ensuring no vehicle is overloaded and every customer gets their delivery via the shortest possible path.

---

## 🚀 Core Features

- **📍 Smart Hub Auto-Assignment**: Orders are dynamically assigned to the "best" delivery center using a weight-based algorithm that considers both geographical proximity and fleet average speeds.
- **🛣️ Intelligent Route Optimization**: Integration with OSRM (Open Source Routing Machine) to fetch high-fidelity road geometries and travel estimates.
- **🔄 Dynamic "Hub Stealing"**: A proprietary logic where centers can "capture" nearby orders from other hubs if they can prove a more efficient delivery time, ensuring global fleet optimization.
- **📦 Vehicle Capacity Management**: Automated clustering that respects individual vehicle payload constraints and volume limits.
- **🎮 Real-Time Dispatch Simulation**: A smooth, 100ms-interval map playback system that simulates rider movement along generated routes.
- **🛠️ Comprehensive Fleet Control**: Full CRUD management for vehicles, delivery centers, and orders with a focus on ease of use.

---

## 💻 Tech Stack

### Frontend
- **React.js**: Functional components with custom hooks for state management.
- **Leaflet.js**: Interactive map rendering and coordinate handling.
- **Tailwind CSS**: Modern, responsive UI with dark mode support.
- **React Router**: Seamless navigation between Dashboard, Fleet, and Order views.

### Backend
- **Laravel 11**: Robust PHP framework providing a secure and scalable REST API.
- **MongoDB**: NoSQL database for flexible order/route schemas and high-concurrency support.
- **OSRM API**: External routing engine for real-world road network calculations.

---

## 🏗️ Architecture

RouteOps follows a decoupled architecture ensuring high availability and separation of concerns.

1. **Client Layer**: React frontend maintains a global `AppContext` to synchronize the map state with fleet data.
2. **API Layer**: Laravel controllers handle authentication, fleet logic, and route persistence.
3. **Service Layer**: Dedicated `RouteService` and `DistanceService` encapsulate the mathematical heavy lifting.
4. **Data Layer**: MongoDB stores dynamic order statuses and complex polyline geometries.

**Data Flow:**
`Map Interaction` → `API Request` → `RouteService (Clustering)` → `OSRM Fetch (Geometry)` → `MongoDB Save` → `Frontend Refresh (Socket/Polling)`

---

## ⚙️ Installation Guide

### Prerequisites
- PHP 8.2+ & Composer
- Node.js 20+ & NPM
- MongoDB Instance (Local or Atlas)

### 1. Clone & Setup Backend
```bash
git clone https://github.com/Akshatgupta000/RouteOps.git
cd RouteOps
composer install
cp .env.example .env
php artisan key:generate
```

### 2. Configure MongoDB
Update your `.env` with your MongoDB credentials:
```env
DB_CONNECTION=mongodb
DB_HOST=127.0.0.1
DB_PORT=27017
DB_DATABASE=routeops
```

### 3. Setup Frontend
```bash
cd frontend
npm install
cp .env.example .env.local
```

### 4. Run the Application
**Terminal 1 (Backend):**
```bash
php artisan serve
```
**Terminal 2 (Frontend):**
```bash
npm run dev
```

---

## 🔌 API Endpoints (Selected)

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/orders` | Fetch all pending and assigned orders |
| `POST` | `/api/routes/generate` | Trigger fleet-wide route optimization |
| `POST` | `/api/vehicles` | Register a new vehicle to the fleet |
| `DELETE` | `/api/vehicles/{id}` | Remove a vehicle and cleanup its routes |
| `PATCH` | `/api/orders/{id}/assign` | Manually override order-hub assignment |

---

## 📈 Future Improvements

- [ ] **AI-Powered Demand Prediction**: Use historical data to pre-position vehicles in high-demand zones.
- [ ] **Mobile Rider App**: Native app for riders to update delivery status in real-time.
- [ ] **Traffic-Aware Routing**: Integrate live traffic data to adjust ETAs dynamically.
- [ ] **Multi-Depot VRP**: Solve cross-hub optimization for packages traveling between cities.

---

## 👨–💻 Author
**Akshat Gupta**
*Full-Stack Engineer & Logistics Enthusiast*

---
*Developed with ❤️ for the future of logistics.*
