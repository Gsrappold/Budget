# Deployment Guide for BudgetFlow

This guide covers deploying BudgetFlow to different platforms.

## Table of Contents
- [Netlify Deployment (Recommended for this setup)](#netlify-deployment)
- [Traditional Server Deployment](#traditional-server-deployment)
- [Environment Variables](#environment-variables)

---

## Netlify Deployment

Netlify provides serverless hosting with automatic builds from GitHub.

### Prerequisites

1. **GitHub Account** - Your code must be in a GitHub repository
2. **Netlify Account** - Sign up at [netlify.com](https://netlify.com)
3. **Neon Database** - PostgreSQL database at [neon.tech](https://neon.tech)
4. **Firebase Project** - Authentication at [firebase.google.com](https://firebase.google.com)

### Step 1: Set Up External Services

#### Database (Neon)
1. Create account at [Neon](https://neon.tech)
2. Create a new project
3. Copy your connection string (starts with `postgresql://`)
4. Run initial migration:
   ```bash
   DATABASE_URL="your-connection-string" npm run db:push
   ```

#### Firebase Setup
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create new project
3. Enable Authentication:
   - Click "Authentication" → "Get Started"
   - Enable "Email/Password" provider
   - Enable "Google" provider (optional but recommended)
4. Register web app:
   - Project Settings → Your apps → Add app → Web
   - Copy the config values (you'll need these)
5. Set up service account (for backend):
   - Project Settings → Service Accounts
   - Click "Generate new private key"
   - Save the JSON file securely

### Step 2: Push to GitHub

```bash
# Initialize git if not already done
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - ready for deployment"

# Add remote (create repo on GitHub first)
git remote add origin https://github.com/yourusername/budgetflow.git

# Push
git push -u origin main
```

### Step 3: Configure Netlify

1. **Connect Repository**
   - Log in to [Netlify](https://app.netlify.com)
   - Click "Add new site" → "Import an existing project"
   - Choose "Deploy with GitHub"
   - Authorize Netlify to access your repositories
   - Select your BudgetFlow repository

2. **Configure Build Settings**
   
   These should auto-populate from `netlify.toml`, but verify:
   - **Build command**: `vite build`
   - **Publish directory**: `dist/public`
   - **Functions directory**: `netlify/functions`

3. **Add Environment Variables**
   
   In Netlify dashboard → Site settings → Environment variables:

   ```
   DATABASE_URL=postgresql://user:password@host.neon.tech/database
   VITE_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXX
   VITE_FIREBASE_PROJECT_ID=your-project-id
   VITE_FIREBASE_APP_ID=1:123456789:web:abcdef123456
   NODE_ENV=production
   ```

   For Firebase Admin (backend authentication), choose ONE of these options:

   **Option A: Using Service Account JSON (Recommended for Netlify)**
   - Download service account JSON from Firebase Console
   - Base64 encode it:
     ```bash
     cat serviceAccountKey.json | base64
     ```
   - Add environment variable in Netlify:
     ```
     FIREBASE_SERVICE_ACCOUNT_BASE64=<paste-base64-output-here>
     ```

   **Option B: Individual Environment Variables**
   - Extract values from your service account JSON file and add each individually:
     ```
     FIREBASE_PROJECT_ID=your-project-id
     FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
     FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour actual private key here\n-----END PRIVATE KEY-----\n"
     ```
   - Note: The private key must include the `\n` characters and be wrapped in quotes

   **⚠️ Important**: You MUST configure one of these options for authentication to work in production.

4. **Deploy**
   - Click "Deploy site"
   - Wait for build to complete (2-3 minutes)
   - Your site will be live at `https://random-name-123.netlify.app`

5. **Custom Domain (Optional)**
   - Site settings → Domain management
   - Add custom domain
   - Follow DNS configuration instructions

### Step 4: Verify Deployment

1. Visit your Netlify URL
2. Create an account using email/password
3. Try creating a transaction
4. Check that data persists (database connection working)
5. Test Google sign-in if enabled

### Troubleshooting Netlify Deployment

**Build Fails**
- Check Netlify build logs for specific errors
- Verify all environment variables are set
- Ensure `netlify.toml` is in repository root

**Database Connection Issues**
- Verify `DATABASE_URL` format is correct
- Check Neon database is running
- Test connection locally first

**Firebase Authentication Fails**
- Verify all `VITE_FIREBASE_*` variables are correct
- Check Firebase project has Authentication enabled
- Ensure authorized domains include your Netlify domain
  - Firebase Console → Authentication → Settings → Authorized domains
  - Add your `*.netlify.app` domain

**Functions Not Working**
- Check function logs in Netlify dashboard
- Verify `netlify/functions/index.ts` exists
- Check for TypeScript compilation errors

---

## Traditional Server Deployment

For deploying to a VPS, cloud server, or platform like Railway, Render, etc.

### Prerequisites
- Node.js 20.x installed
- PostgreSQL database
- Process manager (PM2 recommended)

### Build Command

```bash
npm run build:server
```

This creates:
- `dist/public/` - Frontend static files
- `dist/index.js` - Backend server bundle

### Environment Variables

Create `.env` file:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/budgetflow
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_APP_ID=your_app_id
NODE_ENV=production
PORT=5000
```

### Run with PM2

```bash
# Install PM2
npm install -g pm2

# Start application
pm2 start dist/index.js --name budgetflow

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
```

### Nginx Configuration (Optional)

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## Environment Variables

### Required Variables

| Variable | Description | Example | Where Used |
|----------|-------------|---------|------------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:5432/db` | Backend |
| `VITE_FIREBASE_API_KEY` | Firebase web API key | `AIzaSyXXXXXXXXXXXX` | Frontend |
| `VITE_FIREBASE_PROJECT_ID` | Firebase project ID | `my-project-123` | Frontend & Backend |
| `VITE_FIREBASE_APP_ID` | Firebase app ID | `1:123:web:abc` | Frontend |
| `NODE_ENV` | Environment mode | `production` or `development` | Both |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `5000` |
| `FIREBASE_SERVICE_ACCOUNT_BASE64` | Base64 encoded service account | - |
| `GOOGLE_APPLICATION_CREDENTIALS` | Path to service account JSON | - |

### Setting Variables in Different Environments

**Local Development (.env file)**
```env
DATABASE_URL=postgresql://localhost:5432/budgetflow
VITE_FIREBASE_API_KEY=your_key
VITE_FIREBASE_PROJECT_ID=your_project
VITE_FIREBASE_APP_ID=your_app_id
NODE_ENV=development
```

**Netlify (Dashboard)**
- Site settings → Environment variables → Add variable

**Render/Railway (Dashboard)**
- Environment → Add environment variable

**Docker (.env file or docker-compose.yml)**
```yaml
environment:
  - DATABASE_URL=postgresql://...
  - VITE_FIREBASE_API_KEY=...
```

---

## Post-Deployment Checklist

- [ ] Database migrations completed
- [ ] All environment variables set
- [ ] Firebase authentication working
- [ ] Database connection successful
- [ ] User registration working
- [ ] Transaction creation working
- [ ] Admin panel accessible (if using designated admin email)
- [ ] Theme toggle working
- [ ] Charts and analytics displaying correctly
- [ ] Mobile responsive design verified

---

## Support

If you encounter issues:
1. Check logs (Netlify Functions logs or server logs)
2. Verify environment variables
3. Test database connection separately
4. Check Firebase console for auth errors
5. Review build output for compilation errors

For production issues, never expose:
- Database credentials
- Firebase private keys
- Service account JSON files
- Environment variable values

Keep these secure and only in environment variable configurations.
