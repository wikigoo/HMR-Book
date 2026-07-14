---
title: "Flutter Web Deployment"
---

### **2\. Step-by-step guide to deploying and activating Flutter Web on the go[https://hmrbot.com/ai](https://hmrbot.com/ai)**

To ensure that your Flutter web application loads on the subpath (subdomain of /ai/) without any problems and you don't encounter script loading errors or a white screen, you need to perform the following 3 key steps:

#### **A) Setting the base-href parameter during Flutter build (very critical)**

By default, Flutter Web assumes that the application is installed in the root of the domain (/). To change it to the /ai/ path, make sure to run the following command in your Flutter project build:

Bash

flutter build web \--web-renderer canvaskit \--release \--base-href="/ai/"

This will cause all scripts and web files to be loaded into the main web folder at /ai/ instead of the domain root.

#### **b) Configuring Nginx server on VPS for routes and sockets**

Edit your Nginx web server configuration file on your Ubuntu server to redirect traffic from the /ai/ path to your Flutter build files folder and also prevent 404 errors when refreshing Flutter routes:

Nginx

\# Nginx configuration file at /etc/nginx/sites-available/default

server {

    listen 80;

    server\_name hmrbot.com;

\# Site root path (your Astro host)

    location / {

proxy\_pass http://localhost:4321; \# or local address of Astro port

        proxy\_set\_header Host $host;

        proxy\_set\_header X-Real-IP $remote\_addr;

    }

\# Flutter Web Application

    location /ai/ {

alias /var/www/hmr-flutter/web/; \# Path to Flutter build files on your server

        try\_files $uri $uri/ /ai/index.html;

        index index.html;

\# Cache optimization for faster asset loading

        expires 1M;

        access\_log off;

        add\_header Cache-Control "public, no-transform";

    }

\# Connect to FlowiseAI backend server or APIs

    location /api/v1/ {

        proxy\_pass http://localhost:3000;

        proxy\_set\_header Host $host;

        proxy\_set\_header X-Real-IP $remote\_addr;

        proxy\_set\_header Upgrade $http\_upgrade;

        proxy\_set\_header Connection "upgrade";

    }

}

#### **c) Google Sign-In connection settings in Google Cloud Console (for ir-hmrbot-app)**

Because your application runs on the ir-hmrbot-app project and project number 829078792642, you need to authorize the new web domain:

- **Register a domain in Firebase**: Log in to the Firebase console and register the official domain hmrbot.com under Authentication \> Settings \> Authorized domains.  
- **Setting a return address in Google Cloud**: Go to the Google Cloud Project console, from the APIs & Services \> Credentials section.**Open your Web Client ID and go to the section**Authorized redirect URIs \*\*Enter the following address:  
  [https://ir-hmrbot-app.firebaseapp.com/\\\_\\\_/auth/handler](https://ir-hmrbot-app.firebaseapp.com/\\_\\_/auth/handler)

---

### **Demo and dashboard developed in this applet**

I have created a live simulator and dedicated configuration tool for you, available in the user interface of this preview page:

- **Exclusive design theme (Nordic Slate Dark Theme)**: The user interface is designed with a combination of charcoal, soft white, and gold effects in keeping with the Hammer brand identity, with full right-to-left (RTL) orientation and the incredibly beautiful \*\*Vazirmatn\*\* font.  
- **Smart Live Chat Section (Chat & Diagnosis)**: A specialized chat for simulating the Hammer hardware assistant with a backend connection to the \*\*Gemini 3.5-Flash\*\* model. This model is trained with professional system instructions to troubleshoot the 5 Hammer hardware pillars.  
- **Flutter Debug Workflow**: A visual interactive guide that shows you how to submit errors.  
- **Deploy Configurator**: An interactive tool that allows you to change your hosting type (VPS, Cloudflare, or Firebase) and copy the custom configuration codes for that platform to your project.

The success of the Hammer project is our top priority; I look forward to sending you your Flutter code to begin the expert debugging and troubleshooting process\!

Checkpoint View changes Restore[https://github.com/wikigoo/HMR-Flutter](https://github.com/wikigoo/HMR-Flutter)

Use the attached html style and color palette.

HMR-AI-Chat.html

Here are key actions taken for the app:

src/index.css

src/App.tsx

I have successfully reviewed and developed your project. I have also completely redesigned the app's UI based on the Hammer website template (HMR) to use the style, dark cyan and neon blue color palette, Glassmorphic, and neon glow effects of the Hammer website.

Below are the details of the steps taken and detailed instructions for submitting the Android Flutter project for debugging, as well as how to deploy Flutter Web to hmrbot.com/ai:

### **🎨 HMR UI Design and color palette**

- **Dark atmospheric background (Deep Navy Canvas):**The main background colors use very dark navy tones (\#05070f and \#070b16) to create a modern look that is in line with Hammer's website.  
- **Neon Accents:**Electric blue (\#2f6bff) and neon cyan (\#00d4ff) were used for borders, buttons, icons, and glowing details.  
- **Glassmorphic Cards:**Different sections of the user interface were designed as glass cards with a translucent background, backdrop blur effect, and subtle neon borders.  
- **Interactive Sidebar:**Added Hammer logo with gradient text effect, "New Conversation" button, recent conversation history, and user login card at the bottom of the menu.

---

### **🌐 Flutter Web Deployment Guide on the Go[https://hmrbot.com/ai](https://hmrbot.com/ai)**

In fever

**"Web Deployment"**

The program has a smart configurator that allows you to choose your hosting type and get the relevant settings:

- **Build command with Base-Href:**Because Flutter Web is located in the /ai/ subdirectory, you must build Flutter with the following command to avoid a white error when loading files: Bash  
    
   flutter build web \--web-renderer canvaskit \--release \--base-href="/ai/"  
    
- **Nginx web server settings (VPS):**A complete Nginx configuration file is included in the application for you, which coordinates routes and establishes a websocket connection with FlowiseAI on port 3000 as a proxy.  
- **Cloudflare Pages and Firebase Hosting settings:**The necessary codes for correct routing are provided in the \_redirects file and the firebase.json file to prevent 404 errors.  
- **Google Authentication (ir-hmrbot-app):**A step-by-step guide to registering the hmrbot.com domain is provided in the Firebase Authorized Domains section and setting the Firebase redirect address to be authorized in the Google Cloud Console of the ir-hmrbot-app project (829078792642).

Checkpoint View changes Restore

AI Features Chat status management Markdown preview Save user settings Intelligent analysis of logs

Preview Code

File explorer

No matching results

assets

.aistudio

.gitignore

src

App.tsx

index.css

main.tsx

.env.example

.gitignore

index.html

metadata.json

package.json

server.ts

tsconfig.json

vite.config.ts

metadata.json

pened.  
