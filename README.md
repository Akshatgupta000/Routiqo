# 🚚 LogiRoute AI

[![Laravel](https://img.shields.io/badge/Laravel-11.x-FF2D20?style=for-the-badge&logo=laravel)](https://laravel.com)
[![React](https://img.shields.io/badge/React-19.x-61DAFB?style=for-the-badge&logo=react)](https://reactjs.org)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-4.x-06B6D4?style=for-the-badge&logo=tailwindcss)](https://tailwindcss.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

**LogiRoute AI** is a professional, production-ready logistics management platform designed to streamline delivery operations through intelligent route optimization. Built with a modern full-stack architecture, it empowers fleet managers to visualize, simulate, and optimize complex delivery networks in real-time.

---

### 📌 Features

- **📍 Dynamic Route Optimization**: Generate the most efficient delivery paths based on "Shortest Distance" or "Fastest Time" profiles using advanced clustering algorithms.
- **🗺️ Interactive Map Dashboard**: Real-time visualization of delivery centers, orders, and vehicle paths powered by Leaflet.
- **⚡ Live Route Simulation**: Step-through or auto-play vehicle movements to monitor delivery progress and ETA accuracy.
- **🚛 Fleet & Center Management**: Comprehensive tools to manage delivery hubs, vehicle capacities, and driver assignments.
- **📦 Order Lifecycle Tracking**: Monitor orders from pending status through assignment to final delivery.
- **📊 Performance Analytics**: Insightful metrics on total distance, estimated arrival times, and vehicle utilization.

---

### 🛠️ Tech Stack

| Component | Technology |
| :--- | :--- |
| **Frontend** | React 19, Vite, Tailwind CSS 4, React Leaflet, Axios |
| **Backend** | Laravel 11 (PHP 8.2+), Eloquent ORM, REST API |
| **Database** | SQLite (Production-ready local storage) |
| **Icons & UI** | Lucide React, Framer Motion (Micro-animations) |

---

### 📂 Project Structure

```bash
├── app/                # Laravel Backend (Models, Controllers, Services)
│   ├── Services/       # Route optimization & clustering logic
│   └── Repositories/   # Data access layer
├── frontend/           # React Frontend (Vite + React 19)
│   ├── src/
│   │   ├── components/ # Map, Route, and UI components
│   │   ├── pages/      # Dashboard, Orders, Vehicles, Routes
│   │   └── context/    # Global State Management (App Context)
├── database/           # Migrations & Seeders (SQLite)
├── routes/             # API & Web route definitions
└── public/             # Static assets & build files
```

---

### ⚙️ Installation & Setup

#### Prerequisites
- PHP 8.2+ & Composer
- Node.js (v18+) & NPM
- SQLite3

#### 1. Backend Setup (Laravel)
```bash
# Clone the repository
git clone https://github.com/[YOUR_USERNAME]/[REPO_NAME].git
cd [REPO_NAME]

# Install PHP dependencies
composer install

# Configure Environment
cp .env.example .env
php artisan key:generate

# Setup Database (SQLite)
touch database/database.sqlite
php artisan migrate --seed

# Start Laravel Server
php artisan serve
```

#### 2. Frontend Setup (React)
```bash
# Navigate to frontend directory
cd frontend

# Install NPM dependencies
npm install

# Start Development Server
npm run dev
```

---

### 🚀 Usage

1. **Dashboard**: View all delivery centers and active orders on the map.
2. **Generate Routes**: Select a delivery center and click **"Generate Route"**. Choose between "Shortest" or "Fastest" paths.
3. **Simulation**: Click **"Start Route"** on an optimized path to begin the delivery simulation.
4. **Management**: Use the sidebar navigation to add new Vehicles, Delivery Centers, or Orders.

---

### 📸 Screenshots / Demo

> [!NOTE]
> *Dashboard previews and video demos can be added here once the application is deployed.*

---

### 🔮 Future Improvements

- [ ] **AI-Powered Traffic Integration**: Integrate real-time traffic APIs (Google Maps/Mapbox) for dynamic routing.
- [ ] **Mobile App for Drivers**: Dedicated React Native app for real-time delivery confirmations and GPS tracking.
- [ ] **Advanced Analytics**: Detailed reporting on fuel savings and driver performance metrics.
- [ ] **Multi-Carrier Support**: Assign routes to third-party logistics providers automatically.

---

### 🤝 Contributing

Contributions are welcome! Please follow these steps:
1. Fork the Project.
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`).
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`).
4. Push to the Branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.

---

### 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---
<p align="center">Made with ❤️ for Logistics Efficiency</p>
