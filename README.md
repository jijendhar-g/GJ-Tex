<<<<<<< HEAD
# Tiruppur Garments B2B Platform

A modern, full-stack web application designed for Tiruppur garment manufacturers to receive and manage bulk wholesale orders from B2B clients.

## Tech Stack
- **Frontend**: React.js (Vite), Tailwind CSS, React Router, Context API
- **Backend**: Node.js, Express.js
- **Database**: MongoDB (Mongoose)
- **Features**: JWT Authentication, Image Uploads (Multer), RESTful API, Admin Dashboard

---

## 🚀 Setup Instructions

Since this project was generated remotely, follow these steps to set up the project on your local machine and install the required dependencies.

### 1. Prerequisites
Make sure you have installed:
- [Node.js](https://nodejs.org/) (v16+)
- [MongoDB](https://www.mongodb.com/try/download/community) (Running locally on `mongodb://127.0.0.1:27017` or use MongoDB Atlas)

### 2. Backend Setup
Open a terminal in the root folder (`tiruppur-garments`), then type:
```bash
cd backend
npm install
```

Once installed, verify the `.env` file in the `backend` folder has the correct settings:
```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/tiruppur-garments
JWT_SECRET=supersecretjwtkeyforgarments
NODE_ENV=development
```

### 3. Frontend Setup
Open a new terminal in the root folder (`tiruppur-garments`), then type:
```bash
cd frontend
npm install
```

### 4. Running the Application
You need to run both the frontend and backend servers simultaneously.

**Terminal 1 (Backend):**
```bash
cd backend
npm run dev
```
*(Server should run on http://localhost:5000 and connect to MongoDB)*

**Terminal 2 (Frontend):**
```bash
cd frontend
npm run dev
```
*(Vite will generate a local URL like http://localhost:5173 - open this in your browser)*

---

## 🛠 Features Implemented

### Customer Portal
- **Home**: Banner, feature highlights, and categories.
- **Product Catalog**: View products with MOQ (Minimum Order Quantity), price ranges, and fabric details.
- **Bulk Inquiry**: Send detailed inquiries with sizes, custom requirements, and attach logos/tech packs.
- **My Dashboard**: Track the status of your inquiries (Pending, Processing, Completed).

### Admin Panel
- **Overview**: View total orders and active requests.
- **Order Management**: Review incoming bulk orders, download attachments, and update order statuses.
- **Authentication**: JWT secured protected routes.

Enjoy building with GJ TEX!
=======
# GJ-Tex
>>>>>>> 31a3a346a711a6b234574923469bf61c619ec0bd
