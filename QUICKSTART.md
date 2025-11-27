# CareerConnect - Quick Start Guide

Get the CareerConnect application up and running in minutes with this quick start guide.

## Prerequisites

Ensure you have the following installed on your system:

- **Python 3.8 or higher** - Download from [python.org](https://www.python.org/downloads/)
- **Node.js 16 or higher** - Download from [nodejs.org](https://nodejs.org/)
- **Git** - Download from [git-scm.com](https://git-scm.com/)

## Local Development Setup

Follow these steps to run the application locally on your machine.

### Step 1: Clone or Extract the Project

If you have the project as a compressed file, extract it. If you have a Git repository, clone it:

```bash
git clone https://github.com/YOUR_USERNAME/careerconnect.git
cd careerconnect
```

### Step 2: Backend Setup

Open a terminal and navigate to the backend directory:

```bash
cd backend
```

Create a virtual environment:

```bash
python3 -m venv venv
```

Activate the virtual environment:

**On macOS/Linux**:
```bash
source venv/bin/activate
```

**On Windows**:
```bash
venv\Scripts\activate
```

Install Python dependencies:

```bash
pip install -r requirements.txt
```

Run the Flask application:

```bash
python app.py
```

The backend API will start on `http://127.0.0.1:5000`. Keep this terminal open.

### Step 3: Frontend Setup

Open a **new terminal** and navigate to the frontend directory:

```bash
cd frontend
```

Install Node.js dependencies:

```bash
npm install
```

Start the React development server:

```bash
npm start
```

The frontend will automatically open in your browser at `http://localhost:3000`.

### Step 4: Access the Application

The application is now running! You can access it at `http://localhost:3000`.

**Default Admin Credentials**:
- Email: `admin@careerconnect.com`
- Password: `admin123`

**Create New Accounts**:
- Click "Register" to create a student or mentor account
- Fill in the required information
- For mentors, wait for admin verification before accessing mentor features

## Testing the Application

Once the application is running, you can test the following features:

### As a Student

1. Register a new student account
2. Complete the career assessment
3. Search for mentors
4. Send mentorship requests
5. Create progress trackers
6. Schedule sessions

### As a Mentor

1. Register a new mentor account
2. Log in as admin and verify your mentor account
3. Log back in as the mentor
4. Update your mentor profile
5. View and respond to mentorship requests
6. Upload resources
7. Manage sessions

### As an Admin

1. Log in with the default admin credentials
2. View dashboard statistics
3. Verify pending mentor accounts
4. Manage users
5. View session reports

## Stopping the Application

To stop the application:

1. In the frontend terminal, press `Ctrl+C`
2. In the backend terminal, press `Ctrl+C`
3. Deactivate the virtual environment: `deactivate`

## Troubleshooting

### Port Already in Use

If you see an error that port 3000 or 5000 is already in use:

**Frontend (Port 3000)**:
```bash
# Find and kill the process using port 3000
lsof -ti:3000 | xargs kill -9
```

**Backend (Port 5000)**:
```bash
# Find and kill the process using port 5000
lsof -ti:5000 | xargs kill -9
```

### Module Not Found Errors

If you encounter "module not found" errors:

**Backend**:
```bash
cd backend
source venv/bin/activate
pip install -r requirements.txt
```

**Frontend**:
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
```

### Database Errors

If you encounter database errors, delete the database file and restart:

```bash
cd backend
rm -rf instance/
python app.py
```

The database will be recreated automatically with the default admin user.

## Building for Production

To create a production build:

### Frontend Build

```bash
cd frontend
npm run build
```

This creates an optimized production build in the `frontend/build` directory.

### Backend Production Server

For production, use Gunicorn instead of the Flask development server:

```bash
cd backend
pip install gunicorn
gunicorn "app:create_app()"
```

## Deploying to Render

For detailed deployment instructions, see the [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) file.

**Quick Deploy Steps**:

1. Push your code to GitHub
2. Create a new Web Service on Render
3. Connect your GitHub repository
4. Use the provided build and start commands
5. Add environment variables
6. Deploy!

## Next Steps

Now that you have the application running:

- Explore all features as different user roles
- Customize the application to your needs
- Review the [FEATURES.md](FEATURES.md) for a complete feature list
- Check the [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) for production deployment
- Read the [README.md](README.md) for project overview

## Getting Help

If you encounter issues:

1. Check the terminal output for error messages
2. Review the troubleshooting section above
3. Ensure all prerequisites are correctly installed
4. Verify that all dependencies are installed
5. Check that ports 3000 and 5000 are available

## Summary

You now have a fully functional CareerConnect application running locally. The application includes all features specified in the SRS document and is ready for development, testing, or deployment to production.

Happy mentoring!
