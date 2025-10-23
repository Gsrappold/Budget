# Pre-Deployment Checklist

Complete this checklist before deploying BudgetFlow to production.

## ✅ Code Customization

- [ ] **Change admin email** in `server/routes.ts` (lines 26 and 48)
  - Replace `gabe.rappold@gmail.com` with your email
- [ ] **Update branding** (optional)
  - Site title in `client/index.html`
  - Favicon in `client/public/favicon.png`
  - Colors in `client/src/index.css`
- [ ] **Review default categories** in `server/routes.ts` (lines 33-41)
  - Add, remove, or modify as needed

## ✅ External Services Setup

### Database (Neon)
- [ ] Create account at [neon.tech](https://neon.tech)
- [ ] Create new PostgreSQL database
- [ ] Copy connection string (save for environment variables)
- [ ] Test connection locally:
  ```bash
  DATABASE_URL="your-connection-string" npm run db:push
  ```

### Firebase
- [ ] Create project at [console.firebase.google.com](https://console.firebase.google.com)
- [ ] Enable Authentication:
  - [ ] Enable Email/Password provider
  - [ ] Enable Google provider (optional)
- [ ] Register web app and copy credentials:
  - [ ] API Key (`VITE_FIREBASE_API_KEY`)
  - [ ] Project ID (`VITE_FIREBASE_PROJECT_ID`)
  - [ ] App ID (`VITE_FIREBASE_APP_ID`)
- [ ] Generate service account for backend:
  - [ ] Go to Project Settings → Service Accounts
  - [ ] Click "Generate new private key"
  - [ ] Download JSON file (DO NOT commit to git!)
  - [ ] Base64 encode for Netlify:
    ```bash
    cat serviceAccountKey.json | base64
    ```
  - [ ] Save output for environment variables

### GitHub
- [ ] Create new repository on GitHub
- [ ] Don't include README (you already have one)
- [ ] Public or Private (your choice)
- [ ] Copy repository URL

## ✅ GitHub Push

```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit - BudgetFlow ready for deployment"

# Add GitHub remote
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git

# Push to GitHub
git push -u origin main
```

- [ ] Code pushed to GitHub successfully
- [ ] Verify all files are present (check on GitHub website)

## ✅ Netlify Deployment

### Connect Repository
- [ ] Log in to [app.netlify.com](https://app.netlify.com)
- [ ] Click "Add new site" → "Import an existing project"
- [ ] Choose "Deploy with GitHub"
- [ ] Authorize Netlify
- [ ] Select your repository

### Verify Build Settings
These should auto-populate from `netlify.toml`:
- [ ] Build command: `vite build`
- [ ] Publish directory: `dist/public`
- [ ] Functions directory: (auto-detected)

### Add Environment Variables
In Site settings → Environment variables, add:

**Required Variables:**
- [ ] `DATABASE_URL` - Your Neon connection string
- [ ] `VITE_FIREBASE_API_KEY` - From Firebase console
- [ ] `VITE_FIREBASE_PROJECT_ID` - From Firebase console
- [ ] `VITE_FIREBASE_APP_ID` - From Firebase console
- [ ] `NODE_ENV` = `production`

**Firebase Admin (choose ONE option):**
- [ ] Option A: `FIREBASE_SERVICE_ACCOUNT_BASE64` - Base64-encoded service account JSON
- [ ] Option B: Individual variables:
  - `FIREBASE_PROJECT_ID`
  - `FIREBASE_CLIENT_EMAIL`
  - `FIREBASE_PRIVATE_KEY`

### Deploy
- [ ] Click "Deploy site"
- [ ] Wait for deployment (usually 2-3 minutes)
- [ ] Check deployment logs for errors

## ✅ Post-Deployment Verification

### Test Deployment
- [ ] Visit your Netlify URL
- [ ] Page loads without errors
- [ ] No console errors (press F12)

### Test Authentication
- [ ] Create new account with email/password
- [ ] Account creation succeeds
- [ ] Automatically logged in after signup
- [ ] Can log out
- [ ] Can log back in
- [ ] If enabled: Google sign-in works

### Test Database Operations
- [ ] Create a transaction
- [ ] Transaction appears in list
- [ ] Edit a transaction
- [ ] Delete a transaction
- [ ] Create a budget
- [ ] Create a goal
- [ ] Data persists after refresh

### Test Features
- [ ] Dashboard displays correctly
- [ ] Transactions page works
- [ ] Budgets page works
- [ ] Goals page works
- [ ] Analytics charts render
- [ ] Settings page accessible
- [ ] Dark/light mode toggle works
- [ ] Mobile responsive (test on phone or resize browser)

### Test Admin Access
- [ ] Log in with your designated admin email
- [ ] Navigate to `/admin`
- [ ] Admin dashboard accessible
- [ ] Can view user list
- [ ] Can disable/enable users

### Firebase Console Setup
- [ ] Add authorized domain:
  - Firebase Console → Authentication → Settings → Authorized domains
  - Add your `*.netlify.app` domain
  - Add custom domain if configured

### Custom Domain (Optional)
- [ ] Go to Site settings → Domain management
- [ ] Click "Add custom domain"
- [ ] Follow DNS configuration instructions
- [ ] Wait for DNS propagation (can take 24-48 hours)
- [ ] HTTPS certificate auto-issued by Netlify
- [ ] Update Firebase authorized domains with custom domain

## ✅ Security

- [ ] Verify `.env` is in `.gitignore`
- [ ] Never committed service account JSON to git
- [ ] All secrets configured in Netlify dashboard only
- [ ] Test that unauthorized API access returns 401
- [ ] Test that non-admin cannot access `/admin`

## ✅ Documentation

- [ ] Update README with your project name (if customized)
- [ ] Add screenshot to README (optional)
- [ ] Update repository description on GitHub
- [ ] Add live URL to repository description

## 🚨 Common Issues

### Build Fails
**Symptom**: Netlify deployment fails
**Fix**: Check build logs, ensure all dependencies in package.json, verify environment variables

### Authentication Fails
**Symptom**: Can't create account or login
**Fix**: 
- Verify Firebase environment variables are correct
- Check Firebase Admin service account is configured
- Check Netlify function logs for Firebase errors

### Database Connection Error
**Symptom**: Transactions/budgets don't save
**Fix**:
- Verify `DATABASE_URL` is correct
- Check Neon database is running
- Test connection with `npm run db:push` locally

### Functions Return 500
**Symptom**: API calls fail with 500 error
**Fix**:
- Check Netlify function logs
- Verify Firebase Admin initialization
- Check for missing environment variables

## 📝 Notes

- First deployment takes longer (3-5 minutes)
- Subsequent deployments are faster (1-2 minutes)
- Netlify auto-deploys on every git push to main
- You can disable auto-deploy in Netlify settings if needed

## 🎉 Deployment Complete!

Once all items are checked:
1. Share your live URL
2. Monitor Netlify analytics
3. Check Netlify function logs occasionally
4. Set up error monitoring (optional: Sentry, LogRocket)

Your BudgetFlow app is now live and ready for users!
