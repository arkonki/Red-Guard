# Production Deployment Guide

This guide provides a step-by-step plan for deploying the Veebimajutus webmail client to a production Linux server environment.

**Assumptions:**
*   You have a Linux server (e.g., running Ubuntu/Debian or CentOS).
*   You have SSH access and sudo privileges on the server.
*   You have a domain name pointing to your server's IP address.
*   Node.js, npm, and a web server (Nginx is recommended) are installed.

---

## 1. Frontend Deployment (Static Site)

The frontend is a static React application. The goal is to build it for production and have Nginx serve the resulting files.

1.  **Build the Frontend:**
    On your local machine, run the build command in the frontend's root directory:
    ```bash
    npm run build
    ```
    This command will create an optimized, static version of your app in a new `dist` directory.

2.  **Copy Files to Server:**
    Securely copy the contents of the `dist` directory to a folder on your server. A common location is `/var/www/your-domain.com`.
    ```bash
    # Example using scp
    scp -r dist/* user@your-server-ip:/var/www/webmail
    ```

3.  **Configure Nginx:**
    Create an Nginx server block (virtual host) configuration file for your application.
    ```bash
    sudo nano /etc/nginx/sites-available/webmail
    ```

    Paste and customize the following configuration:

    ```nginx
    server {
        listen 80;
        server_name your-domain.com;

        root /var/www/webmail;
        index index.html;

        location / {
            try_files $uri /index.html;
        }

        # Reverse proxy for the backend API
        # All requests to /api/* will be forwarded to the Node.js backend
        location /api/ {
            proxy_pass http://localhost:3001;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_cache_bypass $http_upgrade;
        }
    }
    ```
    *   **`try_files $uri /index.html;`** is crucial for a single-page application. It ensures that if a user directly visits a URL like `your-domain.com/folder/inbox`, Nginx will serve `index.html`, allowing React Router to handle the routing.
    *   **`location /api/`** block forwards all API requests to your backend server, avoiding CORS issues.

4.  **Enable the Nginx Site:**
    ```bash
    sudo ln -s /etc/nginx/sites-available/webmail /etc/nginx/sites-enabled/
    sudo nginx -t # Test for syntax errors
    sudo systemctl restart nginx
    ```

---

## 2. Backend Deployment (Node.js Application)

The backend is a Node.js application that needs to run continuously. We will use **PM2**, a process manager, to ensure it stays online.

1.  **Copy Files to Server:**
    Copy the entire `backend` directory to a suitable location on your server, such as `/opt/webmail-api`.
    ```bash
    # Example using scp
    scp -r backend user@your-server-ip:/opt/webmail-api
    ```

2.  **Install Production Dependencies:**
    Navigate into the backend directory on the server and install *only* the production dependencies.
    ```bash
    cd /opt/webmail-api
    npm install --production
    ```

3.  **Create Production `.env` file:**
    Create and edit the `.env` file with your production mail server credentials and a strong, unique JWT secret.
    ```bash
    nano .env
    ```
    ```dotenv
    PORT=3001
    IMAP_HOST=your-imap-host.com
    IMAP_PORT=993
    IMAP_TLS=true
    SMTP_HOST=your-smtp-host.com
    SMTP_PORT=465
    SMTP_SECURE=true
    JWT_SECRET=generate-a-very-long-and-random-secret-key
    VAPID_PUBLIC_KEY=your-public-vapid-key
    VAPID_PRIVATE_KEY=your-private-vapid-key
    ```
    **Security Note:** Ensure this file's permissions are restrictive.

4.  **Install and Use PM2:**
    Install PM2 globally on your server.
    ```bash
    sudo npm install pm2 -g
    ```

5.  **Start the Backend with PM2:**
    From within the `/opt/webmail-api` directory, start the server.
    ```bash
    pm2 start server.js --name webmail-api
    ```
    PM2 will now run your application in the background and automatically restart it if it crashes.

6.  **Enable PM2 Startup Script:**
    To ensure PM2 restarts on server reboots, run:
    ```bash
    pm2 startup
    ```
    It will provide a command you need to copy and run with sudo privileges.

Your application is now fully deployed!
