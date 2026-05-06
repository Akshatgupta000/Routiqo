# 🚚 Routiqo: Professional Fleet Dispatch & Route Optimization

[![Laravel](https://img.shields.io/badge/Laravel-FF2D20?style=for-the-badge&logo=laravel&logoColor=white)](https://laravel.com)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org)
[![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com)

**Routiqo** is a state-of-the-art, full-stack logistics management platform designed to solve the "Last Mile Delivery" challenge. It leverages advanced spatial partitioning, real-time map visualization, and high-performance routing engines to automate fleet dispatching and optimize delivery sequences.

---

## 🌟 Project Overview

In the high-stakes world of logistics, efficiency is everything. **Routiqo** transforms manual, error-prone dispatching into a streamlined, automated process. By using **Voronoi-based spatial clustering** and **OSRM-powered routing**, it ensures that every order is handled by the most efficient hub and delivered via the most optimal path.

### Key Value Propositions
- **Reduced Fuel Costs**: Up to 20% reduction in total fleet travel distance.
- **Improved ETAs**: Accurate delivery time predictions based on vehicle average speeds.
- **Scalable Fleet Management**: Effortlessly manage hundreds of vehicles and thousands of orders.
- **Real-Time Visibility**: Track simulation of rider movement directly on the dashboard.

---

## 🚀 Core Features

### 📍 Intelligent Spatial Partitioning
- **Voronoi Service Zones**: Uses `d3-delaunay` to dynamically generate service boundaries for each delivery center, ensuring no overlapping responsibilities.
- **10km Service Radius**: Enforces a strict spatial constraint to maintain high service quality and local expertise.
- **Dynamic Hub Capture**: Intelligent "Hub Stealing" logic where centers can automatically capture nearby unassigned orders if they fall within their optimized zone.

### 🛣️ Advanced Route Optimization
- **Shortest Distance Focus**: Exclusively optimizes for the most efficient path, minimizing total fleet mileage via a rigorous nearest-neighbor tour builder.
- **OSRM Integration**: Fetches high-fidelity road geometries and real-world travel estimates from the Open Source Routing Machine.

### 📦 Smart Fleet Management
- **Balanced Load Distribution**: Automatically clusters orders based on individual vehicle capacity.
- **Capacity Fallback**: "Last vehicle takes all" logic ensures no order is left behind even if the fleet is near capacity.
- **Dynamic Fleet Simulation**: A high-performance map playback system that simulates vehicle movement. Markers dynamically update color status in real-time as the vehicle passes them sequentially.

### 🎨 Modern, Map-First UI
- **3-Column Architecture**:
  - **Navigation Sidebar**: Quick access to Fleet, Orders, and Routes with prominent delivery center controls.
  - **Interactive Leaflet Map**: Central command view featuring clean popups, hover tooltips for short IDs, and smart auto-zoom handling.
  - **Dynamic Right Panel**: Tab-based management for optimization settings, order queues, and active route details.
- **Responsive & Dark Mode**: Built with Tailwind CSS 4 for a premium look and feel across all devices.

---

## 💻 Tech Stack

### Frontend
- **React 19**: Modern UI with functional components and optimized state management.
- **Leaflet & React-Leaflet**: Industrial-grade interactive map rendering.
- **Tailwind CSS 4**: Next-generation CSS framework for rapid, responsive styling.
- **D3-Delaunay**: Mathematical engine for Voronoi spatial calculations.
- **Axios**: Robust API communication.

### Backend
- **Laravel 11**: High-performance PHP framework following modern architectural patterns.
- **MongoDB**: Flexible NoSQL storage for complex order schemas and polyline geometries.
- **Service-Oriented Architecture**: Decoupled services for Routing, Geocoding, and Fleet logic.
- **Custom Repositories**: Clean abstraction for database interactions.

---

## 🏗️ System Architecture

Routiqo follows a clean, decoupled architecture:

1.  **Frontend (React)**: Handles user interaction, map state synchronization via `AppContext`, and real-time simulation rendering.
2.  **API Layer (Laravel)**: Provides a secure RESTful interface for all management operations.
3.  **Service Layer (PHP)**:
    *   `RouteService`: The "brain" of the system, handling clustering and optimization.
    *   `ServiceZoneService`: Manages spatial logic and Voronoi polygon calculations.
    *   `GeocodingService`: Translates human-readable addresses into geographic coordinates.
4.  **Database (MongoDB)**: Stores persistent data with support for high-concurrency and flexible data structures.

---

## ⚙️ Installation Guide

### Prerequisites
- **PHP**: 8.2 or higher
- **Node.js**: 20 or higher
- **Composer** & **NPM**
- **MongoDB**: A running instance (Local or Atlas)

### 1. Backend Setup
```bash
# Clone the repository
git clone https://github.com/Akshatgupta000/Routiqo.git
cd Routiqo

# Install dependencies
composer install

# Environment configuration
cp .env.example .env
php artisan key:generate
```

Update your `.env` with MongoDB and API credentials:
```env
DB_CONNECTION=mongodb
DB_HOST=127.0.0.1
DB_PORT=27017
DB_DATABASE=routiqo

# Geocoding (e.g., OpenStreetMap/Nominatim or others)
GEOCODING_SERVICE=nominatim
```

### 2. Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Environment configuration
cp .env.example .env.local
```

### 3. Running the Platform
**Terminal 1 (Laravel):**
```bash
php artisan serve
```

**Terminal 2 (React):**
```bash
npm run dev
```

---

## 🔌 API Documentation

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/centers` | List all delivery hubs with their metadata |
| `POST` | `/api/routes/generate` | Trigger fleet-wide route optimization |
| `POST` | `/api/zones/generate` | Recalculate Voronoi zones based on active centers |
| `PATCH` | `/api/orders/{id}/assign` | Manually override order-hub assignment |
| `POST` | `/api/vehicles/reset-fleet` | Reset all vehicle loads and route assignments |

---

## 📈 Roadmap & Future Scope

- [ ] **AI Demand Forecasting**: Predicting order surges based on historical trends.
- [ ] **Dynamic Traffic Integration**: Real-time route adjustments using live traffic APIs.
- [ ] **Rider Mobile App**: Dedicated interface for drivers to manage stops and capture proof-of-delivery.
- [ ] **Multi-Depot VRP**: Solving complex Vehicle Routing Problems across interconnected cities.

---

## 👤 Author
**Akshat Gupta**
*Software Architect & Logistics Engineer*
[GitHub](https://github.com/Akshatgupta000) | [LinkedIn](https://www.linkedin.com/in/akshatgupta000/)

---
*Built with precision for the next generation of logistics.*

