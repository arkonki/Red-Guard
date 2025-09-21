# Veebimajutus Webmail Client

This is a modern, responsive webmail client interface designed with a clean three-column layout, inspired by Veebimajutus.ee branding. It features a live backend that connects to IMAP and SMTP servers for real mail functionality.

## Features

-   **Live Mail Server Connection:** Authenticates, fetches folders, and sends email using real IMAP/SMTP servers.
-   **JWT Authentication:** Secure, persistent user sessions using JSON Web Tokens.
-   **Responsive Design:** A three-column layout that adapts to desktop, tablet, and mobile screens.
-   **Dynamic UI:** Built with React, Redux Toolkit, and Material-UI for a modern, state-driven user experience.
-   **Compose and Send:** A fully functional email composition dialog for writing and sending new messages.

---

## Prerequisites

Before you begin, ensure you have the following installed on your server:

-   **Node.js** (v16 or later recommended)
-   **npm** (usually included with Node.js)
-   **Apache 2.4** web server

---

## Setup & Installation

The project is divided into two main parts: the Node.js backend and the static frontend.

### 1. Backend Setup

The backend handles authentication and communication with the mail servers.

1.  **Navigate to the backend directory:**
    ```bash
    cd backend
    ```

2.  **Create the environment configuration file:**
    Create a file named `.env` in the `backend` directory and add the following content. This file stores your mail server settings and secret keys.

    ```dotenv
    # Server port
    PORT=3003

    # IMAP Server Configuration (for reading mail)
    IMAP_HOST=imap.veebimajutus.ee
    IMAP_PORT=993
    IMAP_TLS=true

    # SMTP Server Configuration (for sending mail)
    SMTP_HOST=smtp.veebimajutus.ee
    SMTP_PORT=465
    SMTP_SECURE=true

    # JWT Secret Key (change this to a long, random string)
    JWT_SECRET=your-super-secret-and-long-key-for-jwt
    ```

3.  **Install dependencies:**
    ```bash
    npm install
    ```

4.  **Start the backend server:**
    ```bash
    npm start
    ```
    The server should now be running on `http://localhost:3003`.

### 2. Frontend Setup

The frontend is a modern React application built using Vite. It requires a build step to compile the source code into static files that can be served by a web server.

1.  **Navigate to the project root directory** (the one containing `package.json`).

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Build the application for production:**
    ```bash
    npm run build
    ```
    This command will create a `dist` directory in your project root. This directory contains the optimized, static HTML, CSS, and JavaScript files for your application.

4.  **Deployment:** You will deploy the contents of this `dist` folder to your web server. See the `DEPLOYMENT.md` guide for detailed instructions on configuring Apache.

---

## Apache 2.4 Deployment Guide

This guide explains how to deploy the application using Apache as a web server for the frontend and a reverse proxy for the backend API.

### Step 1: Enable Apache Proxy Modules

First, ensure the necessary Apache modules are enabled.

```bash
sudo a2enmod proxy
sudo a2enmod proxy_http
sudo systemctl restart apache2
```

### Step 2: Configure Apache Virtual Host

Create a new Apache configuration file for your site. For example, `veebimail.conf`.

```bash
sudo nano /etc/apache2/sites-available/veebimail.conf
```

Paste the following configuration into the file. **Remember to replace `/path/to/your/project/dist` with the actual absolute path to the project's `dist` directory.**

```apache
<VirtualHost *:80>
    ServerName your-domain.com
    ServerAdmin webmaster@localhost
    DocumentRoot /path/to/your/project/dist

    <Directory /path/to/your/project/dist>
        Options Indexes FollowSymLinks
        AllowOverride All
        Require all granted
        # Fallback for client-side routing
        FallbackResource /index.html
    </Directory>

    # Reverse proxy for the API
    # All requests to /api/... will be forwarded to the Node.js backend
    ProxyPreserveHost On
    ProxyPass /api/ http://localhost:3003/api/
    ProxyPassReverse /api/ http://localhost:3003/api/

    ErrorLog ${APACHE_LOG_DIR}/veebimail-error.log
    CustomLog ${APACHE_LOG_DIR}/veebimail-access.log combined
</VirtualHost>
```

**Explanation:**
-   `DocumentRoot`: Points to your project's `dist` directory where the built `index.html` is located.
-   `FallbackResource /index.html`: Crucial for single-page applications. It ensures that any direct navigation to a route like `/folder/inbox` is handled by your React app instead of Apache looking for a file.
-   `ProxyPass`: Forwards any request that starts with `/api/` to your backend Node.js server.

### Step 3: Enable the Site and Restart Apache

1.  **Enable your new site configuration:**
    ```bash
    sudo a2ensite veebimail.conf
    ```

2.  **Restart Apache to apply the changes:**
    ```bash
    sudo systemctl restart apache2
    ```

Your Veebimajutus webmail client should now be live and accessible at your domain. The frontend is served directly by Apache, and all API calls are securely proxied to the backend server.