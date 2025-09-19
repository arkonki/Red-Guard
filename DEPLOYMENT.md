# Production Deployment Guide (FreeBSD & Apache 2.4)

This guide provides a step-by-step plan for deploying the Veebimajutus webmail client to a production FreeBSD server running Apache 2.4.

**Assumptions:**
*   Your domain is `your-domain.com`.
*   Your frontend build files are ready in the `dist` directory.
*   Your backend Node.js application will run on `localhost:3001`, managed by PM2.

---

## Step 1: Apache Module Prerequisites

First, ensure the necessary Apache modules for reverse proxying are enabled. The required modules are `mod_proxy` and `mod_proxy_http`. You can typically check if they are loaded by looking for `LoadModule` directives in your main Apache configuration file (`/usr/local/etc/apache24/httpd.conf`). They are often enabled by default in a standard installation.

---

## Step 2: Deploy Frontend Files

Copy the contents of your frontend `dist` directory to the location where Apache serves files on FreeBSD. A common path is `/usr/local/www/`.

```bash
# Example command to copy files
# Run this from your frontend project directory
cp -R dist/ /usr/local/www/webmail/
```

---

## Step 3: Deploy and Run Backend Application

1.  Copy your entire `backend` project directory to a location on your server, such as `/usr/home/your-user/webmail-api`.
2.  Navigate into the directory: `cd /usr/home/your-user/webmail-api`.
3.  Install production-only dependencies: `npm install --production`.
4.  Create the `.env` file with your production configuration (mail server details, JWT secret, etc.).
5.  Use PM2 to start your application and ensure it restarts on server reboots:

```bash
# Start the server
pm2 start server.js --name webmail-api

# Save the current PM2 process list to run on startup
pm2 save

# Create the startup script for FreeBSD
pm2 startup
# (Follow the instructions output by the pm2 startup command).
```

---

## Step 4: Create Apache Virtual Host Configuration

Create a new configuration file for your webmail site. For example: `/usr/local/etc/apache24/Includes/webmail.conf`.

Place the following configuration inside this file. This config will serve your React application and forward all API traffic to your backend.

```apache
<VirtualHost *:80>
    ServerName your-domain.com
    DocumentRoot "/usr/local/www/webmail"

    # Settings for the frontend application directory
    <Directory "/usr/local/www/webmail">
        # Allow .htaccess files if needed
        AllowOverride All
        # Grant access to all visitors
        Require all granted
    </Directory>

    # This is critical for Single Page Applications like React.
    # It ensures that direct visits to routes like /inbox/123 are
    # handled by index.html, letting React Router take over.
    FallbackResource /index.html

    # Reverse Proxy configuration for the API
    # All requests to your-domain.com/api/... will be forwarded
    # to your Node.js application running on port 3001.
    ProxyPass /api/ http://localhost:3001/api/
    ProxyPassReverse /api/ http://localhost:3001/api/

</VirtualHost>
```

---

## Step 5: Apply Configuration and Restart Apache

After saving the configuration file, check it for syntax errors and then restart Apache to apply the changes.

```bash
# Check Apache configuration syntax
apachectl configtest

# If syntax is OK, restart Apache
service apache24 restart
```

Your webmail application should now be live. Visiting `http://your-domain.com` will load the React frontend, and any API calls made by the app will be seamlessly routed to your backend Node.js service. The next logical step would be to secure the site by adding an SSL certificate using a tool like Let's Encrypt / Certbot.
