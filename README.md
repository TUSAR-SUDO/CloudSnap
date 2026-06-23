<div align="center">

# ☁️ CloudSnap

**A full-stack image sharing platform with cloud-powered delivery and a fire-themed landing experience.**

[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Express-5-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/atlas)
[![ImageKit](https://img.shields.io/badge/ImageKit-CDN-FF4D4D)](https://imagekit.io/)
[![License](https://img.shields.io/badge/license-MIT-blue)](#license)

[Live Demo](#) · [Report Bug](../../issues) · [Request Feature](../../issues)

</div>

---

## 📖 Table of Contents

- [About](#about)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Folder Structure](#folder-structure)
- [API Reference](#api-reference)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Deployment](#deployment)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [License](#license)

---

## About

**CloudSnap** is a full-stack image sharing web application where users can register, log in, upload images with captions, and browse a shared gallery feed. All images are stored and served through **ImageKit CDN** for fast, global delivery. The landing page features a custom fire-themed hero section with a real-time canvas particle animation system.

This project demonstrates a complete MERN-style stack (MongoDB, Express, React, Node) combined with third-party cloud storage, JWT authentication, and a single-service deployment model on Render.

---

## ✨ Features

### 🔐 Authentication
- Register with full name, email, and password (bcrypt-hashed, 6+ char minimum)
- Login returns a JWT token (7-day expiry)
- Session auto-restore via `/auth/me` on page load
- Protected routes for Feed and Upload pages

### 📸 Image Upload
- Drag-and-drop or click-to-browse upload
- Live image preview before submission
- Caption input with 200-character counter
- Images uploaded as base64 to ImageKit and served via CDN URL
- Toast notifications for upload progress/success/failure

### 🖼️ Gallery Feed
- Responsive grid layout of all posts
- Post cards with image, caption, author avatar, and "Cloud stored" badge
- Animated like/toggle button
- Loading skeletons and empty-state CTA

### 🔥 Landing Page
- Full-screen hero with custom FIREEYE background
- Real-time canvas particle system (~150 flame + 30 ember particles)
- Responsive particle scaling for mobile vs. desktop
- Glassmorphism navbar with live user avatar when authenticated

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Frontend** | React 19 + Vite 7 | SPA with client-side routing |
| **Styling** | Vanilla CSS | Dark theme, glassmorphism, gradients, animations |
| **Routing** | React Router v7 | Client-side navigation (`/`, `/auth`, `/feed`, `/create-post`) |
| **HTTP Client** | Axios | API requests to backend |
| **Backend** | Express 5 (Node.js) | REST API server |
| **Database** | MongoDB (Mongoose 9) | User accounts & post metadata |
| **Image Storage** | ImageKit SDK | Cloud image upload & CDN delivery |
| **Auth** | JWT + bcryptjs | Token-based authentication with password hashing |
| **File Upload** | Multer | Multipart form handling |
| **Deployment** | Render | Single web service serving frontend + backend |

---

## 🏗️ Architecture

```mermaid
graph TB
    subgraph Client["Frontend (React SPA)"]
        LP["Landing Page<br/>Fire particle canvas"]
        AP["Auth Page<br/>Login / Register"]
        CP["Create Post<br/>Image upload + caption"]
        FP["Feed Page<br/>Gallery grid"]
    end

    subgraph Server["Backend (Express 5)"]
        STATIC["Static File Server<br/>public/"]
        AUTH["/auth routes<br/>register, login, me"]
        POSTS["/posts<br/>GET all posts"]
        CREATE["/create-post<br/>POST upload image"]
        MW["Auth Middleware<br/>JWT verification"]
    end

    subgraph External["External Services"]
        MONGO[("MongoDB Atlas")]
        IK["ImageKit CDN"]
    end

    LP --> AP
    AP -->|login/register| AUTH
    CP -->|upload| MW --> CREATE
    FP -->|fetch| POSTS
    CREATE -->|store image| IK
    CREATE -->|save metadata| MONGO
    AUTH -->|verify/create user| MONGO
    POSTS -->|query| MONGO
    STATIC -->|serves| Client
```

---

## 📁 Folder Structure

<details>
<summary><strong>Click to expand full project tree</strong></summary>

```
cloudsnap/
├── Backend/
│   ├── server.js                    # Entry point — starts Express & connects DB
│   ├── package.json                 # Backend dependencies & start script
│   ├── .env                         # Environment variables (not committed)
│   ├── public/                      # Built frontend assets (auto-generated)
│   │   ├── index.html
│   │   ├── vite.svg
│   │   └── assets/
│   │       ├── index-*.js           # Bundled React app
│   │       ├── index-*.css          # Bundled styles
│   │       └── FIREEYE-*.png        # Hero background image
│   └── src/
│       ├── app.js                   # Express app config, routes, static serving
│       ├── db/
│       │   └── db.js                # MongoDB connection
│       ├── middleware/
│       │   └── auth.middleware.js   # JWT token verification
│       ├── models/
│       │   ├── user.model.js        # User schema (fullName, email, password)
│       │   └── post.model.js        # Post schema (image URL, caption, user ref)
│       ├── routes/
│       │   └── auth.routes.js       # /auth/register, /auth/login, /auth/me
│       └── services/
│           └── storage.service.js   # ImageKit upload logic
│
├── Frontend/
│   ├── index.html                   # Vite entry HTML
│   ├── vite.config.js               # Vite config with dev proxy
│   ├── package.json                 # Frontend dependencies & build script
│   ├── public/
│   │   └── vite.svg
│   ├── dist/                        # Build output (auto-generated)
│   └── src/
│       ├── main.jsx                 # React root mount
│       ├── App.jsx                  # Router setup & page layout
│       ├── index.css                # Full app styles (~48KB)
│       ├── context/
│       │   └── AuthContext.jsx      # Auth state management (login, register, logout)
│       ├── components/
│       │   ├── Navbar.jsx           # Top navigation bar
│       │   ├── ProtectedRoute.jsx   # Auth guard component
│       │   └── FireBackground.jsx   # Reusable canvas fire particle effect
│       ├── pages/
│       │   ├── LandingPage.jsx      # Hero page with fire animation (~520 lines)
│       │   ├── AuthPage.jsx         # Login/Register with tab switching
│       │   ├── CreatePost.jsx       # Drag & drop image upload form
│       │   └── Feed.jsx             # Gallery grid with like buttons
│       └── images/
│           └── FIREEYE.png          # Hero background image asset
│
├── scripts/
│   └── copy-build.js                # Cross-platform build copy script
│
└── package.json                     # Root orchestration scripts
```

</details>

---

## 🔌 API Reference

| Method | Endpoint | Auth Required | Description |
|---|---|:---:|---|
| `POST` | `/auth/register` | ✗ | Create a new user account |
| `POST` | `/auth/login` | ✗ | Login and receive a JWT token |
| `GET` | `/auth/me` | ✓ | Get the current user from token |
| `POST` | `/create-post` | ✓ | Upload an image + caption (multipart) |
| `GET` | `/posts` | ✗ | Fetch all posts with user info |

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) ≥ 18
- A [MongoDB Atlas](https://www.mongodb.com/atlas) cluster (or local MongoDB instance)
- An [ImageKit](https://imagekit.io/) account for image storage/CDN

### Installation

```bash
# Clone the repo
git clone https://github.com/<your-username>/cloudsnap.git
cd cloudsnap

# 1. Install backend dependencies
cd Backend && npm install

# 2. Install frontend dependencies
cd ../Frontend && npm install
```

### Running Locally

```bash
# Terminal 1 — start the backend
cd Backend && npm start

# Terminal 2 — start the frontend dev server
cd Frontend && npm run dev
```

- Frontend: `http://localhost:5173` (proxies API requests to `:3000`)
- Backend: `http://localhost:3000`

---

## 🔑 Environment Variables

Create a `.env` file inside `Backend/` with the following:

```env
MONGO_URI=mongodb+srv://<user>:<pass>@<cluster>.mongodb.net/<dbname>
JWT_SECRET=your_jwt_secret_key
IMAGEKIT_PUBLIC_KEY=your_imagekit_public_key
IMAGEKIT_PRIVATE_KEY=your_imagekit_private_key
IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/your_endpoint
```

> [!CAUTION]
> Never commit your `.env` file to version control. Make sure it is listed in `.gitignore`.

---

## ☁️ Deployment (Render)

### Option A — Deploy Backend Only *(Recommended)*

1. Push the project to GitHub as `cloudsnap`.
2. On Render, create a **Web Service**.
3. Configure:

   | Setting | Value |
   |---|---|
   | Root Directory | `Backend` |
   | Build Command | `npm install` |
   | Start Command | `npm start` |
   | Environment | Add all 5 variables from `.env` |

4. Before deploying, run `npm run build` from the project root so `Backend/public/` contains the latest frontend build.
5. Commit the `Backend/public/` folder to Git.

### Option B — Auto-Build Frontend on Render

   | Setting | Value |
   |---|---|
   | Root Directory | *(leave empty / project root)* |
   | Build Command | `cd Frontend && npm install && cd ../Backend && npm install && cd .. && npm run build` |
   | Start Command | `npm start` |

---

## 🗺️ Roadmap

- [ ] Comments on posts
- [ ] User profile pages
- [ ] Image search & tagging
- [ ] Infinite scroll for the feed
- [ ] Dark/light theme toggle

Feel free to open an issue to suggest more!

---

## 🤝 Contributing

Contributions are welcome! To contribute:

1. Fork the repo
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

<div align="center">

Built with ❤️ using React, Express, MongoDB & ImageKit.

</div>
