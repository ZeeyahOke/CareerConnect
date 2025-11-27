# CareerConnect Deployment Guide

This document provides comprehensive instructions for deploying the CareerConnect application on Render.

## Overview

The CareerConnect application is a full-stack web application with a React frontend and Flask backend. The deployment strategy uses a single Render web service that serves both the API and the static frontend files.

## Architecture

**Frontend**: React with Tailwind CSS and React Router, built into static files.

**Backend**: Flask REST API with SQLite database, serving both API endpoints and static frontend files.

**Database**: SQLite (file-based database, automatically created on first run).

**Authentication**: JWT-based authentication with secure password hashing.

## Prerequisites

Before deploying, ensure you have the following:

- A GitHub account with your code pushed to a repository
- A Render account (free tier is sufficient)
- Git installed locally

## Step-by-Step Deployment on Render

### Step 1: Push Your Code to GitHub

First, initialize a Git repository and push your code to GitHub:

```bash
cd CareerConnect
git init
git add .
git commit -m "Initial commit: CareerConnect application"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/careerconnect.git
git push -u origin main
```

### Step 2: Create a New Web Service on Render

Navigate to your Render dashboard and follow these steps:

1. Click the **New +** button in the top right corner.
2. Select **Web Service** from the dropdown menu.
3. Connect your GitHub account if you haven't already.
4. Select the repository containing your CareerConnect code.
5. Click **Connect**.

### Step 3: Configure the Web Service

On the configuration page, enter the following details:

**Basic Settings**:

- **Name**: `careerconnect` (or any name you prefer)
- **Region**: Select the region closest to your users
- **Branch**: `main`
- **Root Directory**: Leave blank
- **Environment**: `Python 3`
- **Build Command**: `./build.sh`
- **Start Command**: `cd backend && gunicorn -b 0.0.0.0:$PORT app:create_app()`

**Advanced Settings** (click "Advanced"):

Add the following environment variables:

- `PYTHON_VERSION`: `3.11.0`
- `SECRET_KEY`: Generate a random secret key (e.g., using `python -c "import secrets; print(secrets.token_hex(32))"`)
- `FLASK_ENV`: `production`

### Step 4: Deploy

Click **Create Web Service**. Render will:

1. Clone your repository
2. Run the build script to install dependencies and build the frontend
3. Start the Flask application
4. Assign a public URL to your application

The deployment process typically takes 3-5 minutes. You can monitor the progress in the Render dashboard logs.

### Step 5: Verify Deployment

Once the deployment is complete, Render will provide a URL like `https://careerconnect.onrender.com`. Visit this URL to verify that your application is running correctly.

**Default Admin Credentials**:

- Email: `admin@careerconnect.com`
- Password: `admin123`

**Important**: Change the admin password immediately after first login.

## Post-Deployment Configuration

### Database Persistence

By default, SQLite stores data in a file (`careerconnect.db`) in the backend directory. On Render's free tier, the filesystem is ephemeral, meaning data will be lost when the service restarts.

**To enable persistent storage**:

1. In your Render dashboard, go to your web service.
2. Navigate to the **Disks** tab.
3. Click **Add Disk**.
4. Set the mount path to `/opt/render/project/src/backend/data`.
5. Update `config.py` to use this path for the database.

### Environment Variables

You can add or update environment variables at any time:

1. Go to your web service in the Render dashboard.
2. Click on the **Environment** tab.
3. Add or modify variables as needed.
4. Click **Save Changes**. Render will automatically redeploy your service.

### Custom Domain

To use a custom domain:

1. Go to the **Settings** tab in your Render dashboard.
2. Scroll to the **Custom Domain** section.
3. Click **Add Custom Domain**.
4. Follow the instructions to configure your DNS settings.

## Troubleshooting

### Build Fails

**Issue**: The build command fails during deployment.

**Solution**: Check the build logs in the Render dashboard. Common issues include:

- Missing dependencies in `requirements.txt` or `package.json`
- Node.js or Python version mismatch
- Syntax errors in the build script

### Application Won't Start

**Issue**: The application builds successfully but fails to start.

**Solution**: Check the runtime logs. Common issues include:

- Incorrect start command
- Missing environment variables
- Port binding issues (ensure the app binds to `0.0.0.0:$PORT`)

### Database Errors

**Issue**: Database-related errors on startup.

**Solution**: Ensure the database file path is writable. If using persistent storage, verify the disk is correctly mounted.

### Frontend Not Loading

**Issue**: The API works but the frontend doesn't load.

**Solution**: Verify that:

- The frontend build completed successfully
- The Flask app is configured to serve static files from `frontend/build`
- The catch-all route in `app.py` is correctly configured

## Updating the Application

To deploy updates:

1. Make changes to your code locally.
2. Commit and push to GitHub:

   ```bash
   git add .
   git commit -m "Description of changes"
   git push origin main
   ```

3. Render will automatically detect the changes and redeploy your application.

You can also enable **Auto-Deploy** in the Render dashboard to automatically deploy whenever you push to your repository.

## Monitoring and Logs

Render provides built-in monitoring and logging:

- **Logs**: View real-time logs in the **Logs** tab of your web service.
- **Metrics**: Monitor CPU, memory, and request metrics in the **Metrics** tab.
- **Alerts**: Set up alerts for downtime or performance issues in the **Settings** tab.

## Security Best Practices

After deployment, follow these security best practices:

1. **Change Default Credentials**: Immediately change the default admin password.
2. **Use Strong Secret Keys**: Generate a strong, random secret key for JWT tokens.
3. **Enable HTTPS**: Render provides free SSL certificates. Ensure HTTPS is enabled.
4. **Limit Admin Access**: Create separate admin accounts and disable the default admin if not needed.
5. **Regular Updates**: Keep dependencies up to date to patch security vulnerabilities.

## Support

For issues or questions:

- Check the Render documentation: https://render.com/docs
- Review the application logs in the Render dashboard
- Contact support through the Render dashboard

## Conclusion

Your CareerConnect application is now deployed and accessible to users worldwide. Monitor the application regularly and update it as needed to ensure optimal performance and security.
