# CareerConnect - Full-Stack Application

This repository contains the complete source code for the CareerConnect application, a full-stack platform built with React, Flask, and SQLite. The project is designed to be easily deployed on Render.

## Features

- **User Roles**: Student, Mentor, and Admin
- **Authentication**: JWT-based authentication with registration and login
- **Student Features**: Career assessment, mentor search, mentorship requests, progress tracking
- **Mentor Features**: Profile management, request approval/rejection, resource sharing
- **Communication**: Messaging and session scheduling
- **Admin Dashboard**: User management, mentor verification, platform statistics

## Project Structure

```
/CareerConnect
├── backend/
│   ├── routes/
│   ├── app.py
│   ├── config.py
│   ├── models.py
│   └── requirements.txt
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── App.js
│   │   └── index.js
│   ├── package.json
│   └── tailwind.config.js
└── README.md
```

## Local Setup Instructions

### Prerequisites

- Python 3.8+
- Node.js 16+
- `pip` and `npm`

### 1. Backend Setup

```bash
# Navigate to the backend directory
cd backend

# Create a virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run the Flask application
flask run
```

The backend will be running at `http://127.0.0.1:5000`.

### 2. Frontend Setup

```bash
# Navigate to the frontend directory
cd ../frontend

# Install dependencies
npm install

# Start the React development server
npm start
```

The frontend will be running at `http://localhost:3000` and will proxy API requests to the backend.

### 3. Default Admin User

- **Email**: `admin@careerconnect.com`
- **Password**: `admin123`

## Deployment on Render

This project is configured for seamless deployment on Render. The Flask backend serves both the API and the static frontend build.

### 1. Create a New Web Service

- In your Render dashboard, click **New +** and select **Web Service**.
- Connect your GitHub repository.

### 2. Configure the Service

- **Name**: `careerconnect` (or your preferred name)
- **Root Directory**: Leave blank (Render will detect the monorepo structure)
- **Environment**: `Python 3`
- **Region**: Choose your preferred region
- **Branch**: `main`

### 3. Build and Start Commands

- **Build Command**:

  ```bash
  # Build the frontend
  cd frontend && npm install && npm run build && cd ..
  
  # Install backend dependencies
  pip install -r backend/requirements.txt
  ```

- **Start Command**:

  ```bash
  gunicorn "backend.app:create_app()"
  ```

### 4. Environment Variables

- Click **Advanced** and add the following environment variables:

  - `PYTHON_VERSION`: `3.11.0` (or your preferred Python version)
  - `FLASK_APP`: `backend/app.py`
  - `FLASK_ENV`: `production`

### 5. Deploy

- Click **Create Web Service**. Render will automatically build and deploy your application.
- Once deployed, your application will be available at the URL provided by Render.

## How It Works

The Flask application is configured to serve the static files from the `frontend/build` directory. The `serve` function in `backend/app.py` handles routing, ensuring that any path not recognized by the API is directed to the React application.

This monorepo setup simplifies deployment by combining the frontend and backend into a single web service on Render.
