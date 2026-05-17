# AutoMart Static Site — Complete Deployment Guide

## 🏗 Project Structure
```
automart-static/
├── index.html                    ← Homepage
├── 404.html                      ← Error page (GitHub Pages uses this)
├── robots.txt                    ← SEO crawl rules
├── .nojekyll                     ← Required for GitHub Pages
├── admin-secret-panel/
│   └── index.html                ← Admin dashboard (Firebase auth protected)
├── assets/
│   ├── css/
│   │   ├── style.css             ← Main theme styles (preserved from WP theme)
│   │   └── gallery.css           ← Gallery, lightbox & admin styles
│   ├── js/
│   │   ├── firebase-config.js    ← ⚠️ Add YOUR Firebase config here
│   │   └── app.js                ← Shared utilities, data layer, car renderer
│   └── images/
│       ├── hero-car.svg          ← Hero section car image
│       └── car-placeholder.svg   ← Fallback image for listings
└── pages/
    ├── cars.html                 ← Listings with filters
    ├── car-detail.html           ← Single car page with gallery
    ├── sell.html                 ← Sell your car form
    ├── loan.html                 ← EMI calculator
    ├── valuation.html            ← Free car valuation
    ├── about.html                ← About us
    ├── contact.html              ← Contact form
    └── faq.html                  ← FAQ accordion
```

---

## 🔥 Step 1 — Firebase Setup (REQUIRED)

### 1.1 Create Project
1. Go to [console.firebase.google.com](https://console.firebase.google.com)
2. Click **Add Project** → Name it `automart`
3. Disable Google Analytics (optional) → **Create Project**

### 1.2 Enable Firestore Database
1. Go to **Build → Firestore Database**
2. Click **Create Database**
3. Choose **Start in test mode** (we'll add rules later)
4. Select a region close to your users (e.g. `asia-south1` for India)

### 1.3 Enable Firebase Storage
1. Go to **Build → Storage**
2. Click **Get Started**
3. Choose test mode → Select same region

### 1.4 Enable Authentication
1. Go to **Build → Authentication**
2. Click **Get Started**
3. Go to **Sign-in method** → Enable **Email/Password**
4. Go to **Users** → **Add User**
   - Email: `admin@automart.in` (or your preferred admin email)
   - Password: Create a strong password (min 8 chars, mix of upper/lower/numbers/symbols)

### 1.5 Get Your Config
1. Go to **Project Settings** (⚙️ gear icon)
2. Scroll to **Your Apps** → Click **Web** (</> icon)
3. Register app name as `AutoMart Web`
4. Copy the `firebaseConfig` object

### 1.6 Add Config to Your Project
Open `assets/js/firebase-config.js` and replace:
```javascript
const firebaseConfig = {
  apiKey:            "YOUR_ACTUAL_API_KEY",
  authDomain:        "your-project-id.firebaseapp.com",
  projectId:         "your-project-id",
  storageBucket:     "your-project-id.appspot.com",
  messagingSenderId: "123456789",
  appId:             "1:123456789:web:abc123def456"
};
```

### 1.7 Set Security Rules

**Firestore Rules** — Go to Firestore → Rules tab → Paste:
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /cars/{carId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    match /collections/{colId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    match /settings/{doc} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    match /enquiries/{id} {
      allow create: if true;
      allow read, update, delete: if request.auth != null;
    }
  }
}
```

**Storage Rules** — Go to Storage → Rules tab → Paste:
```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /cars/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

**Click Publish after pasting each rule.**

---

## 🐙 Step 2 — GitHub Pages Deployment

### 2.1 Create GitHub Repository
1. Go to [github.com/new](https://github.com/new)
2. Repository name: `automart` (or your preferred name)
3. Set to **Public** (required for free GitHub Pages)
4. Click **Create Repository**

### 2.2 Upload Files
**Option A — GitHub Web Upload:**
1. In your new repo, click **Add file → Upload files**
2. Drag the entire `automart-static` folder contents
3. Commit with message: `Initial AutoMart deployment`

**Option B — Git CLI:**
```bash
cd automart-static
git init
git add .
git commit -m "Initial AutoMart deployment"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/automart.git
git push -u origin main
```

### 2.3 Enable GitHub Pages
1. Go to your repo → **Settings**
2. Click **Pages** in the left sidebar
3. Under **Source** → Select **Deploy from a branch**
4. Branch: `main` / Folder: `/ (root)`
5. Click **Save**

### 2.4 Update Base URL
If your site is at `https://username.github.io/automart/` (with a subdirectory):

Open `assets/js/app.js` and change:
```javascript
baseUrl: '/automart',  // ← your repo name
```

If it's at the root `https://username.github.io/`:
```javascript
baseUrl: '',  // leave empty
```

### 2.5 Your Site is Live! 🎉
Visit: `https://YOUR_USERNAME.github.io/automart/`
Admin: `https://YOUR_USERNAME.github.io/automart/admin-secret-panel/`

---

## 🔐 Step 3 — Admin Panel Usage

### Accessing the Admin
1. Go to `https://yoursite.github.io/automart/admin-secret-panel/`
2. Sign in with the email/password you created in Firebase Auth (Step 1.4)

### Adding Car Listings
1. Click **Add New Car** in the sidebar
2. Upload images first (drag & drop or click to upload)
   - Click ★ on an image to set it as the main thumbnail
   - Drag to reorder (optional)
   - Click ✕ to remove an image
3. Fill in all car details
4. Set Status: `Available` and Featured: `Yes` for homepage display
5. Click **Save Listing**

### Managing Listings
- **Edit**: Click ✏️ Edit on any listing
- **Mark Sold**: Click "Mark Sold" button — it removes from active listings
- **Feature/Unfeature**: Toggle ⭐ to show/hide on homepage featured section
- **Delete**: Click 🗑 Delete (permanent — cannot be undone)

### Collections
- Create themed groups (e.g. "SUVs Under ₹10L", "Premium Cars")
- Used to organise cars into browseable categories

### Enquiries
- All form submissions from Sell Your Car, Contact, and homepage appear here
- View customer details, delete after follow-up

---

## 🎨 Step 4 — Customisation

### Changing Site Name, Phone, Colors
Open `assets/js/app.js` and edit the `SITE` object:
```javascript
export const SITE = {
  name:        'Your Dealership Name',
  phone:       '+91 YOUR_PHONE',
  email:       'your@email.com',
  whatsapp:    '91XXXXXXXXXX',  // no + prefix
  primaryColor:'#C0392B',       // change brand color
  baseUrl:     '/your-repo-name',
};
```

### Changing Primary Color
In `assets/css/style.css`, find `:root` and update:
```css
:root {
  --color-primary: #C0392B;      /* Your brand color */
  --color-primary-dark: #96281B;
  --color-primary-light: #E74C3C;
}
```

### Adding Car Brands
In `index.html` and `pages/cars.html`, add to the brands array:
```javascript
const brands = ['Your Brand', 'Another Brand', ...];
```

---

## 🔄 Step 5 — Updating Content

### Adding cars via Admin Panel (recommended)
Use the admin panel at `/admin-secret-panel/` — changes appear instantly.

### Redeploying Code Changes
```bash
git add .
git commit -m "Update site content"
git push
```
GitHub Pages automatically rebuilds within ~1 minute.

---

## 🛡 Security Recommendations

1. **Never commit Firebase config to public repo** if your Firestore rules are permissive
   - For production: use Firebase environment variables or restrict rules strictly
   - Current rules require authentication for all writes — this is safe

2. **Admin URL is "security by obscurity"** — for better security:
   - Change the admin folder name from `admin-secret-panel` to something harder to guess
   - Add IP restrictions in Firebase Console if needed

3. **Firebase API Key**: The web API key in `firebase-config.js` is intentionally public — it's safe as long as your Firestore/Storage rules are correct. The rules are the real security layer.

4. **Change admin password regularly** in Firebase Console → Authentication → Users

5. **Enable Firebase App Check** for production to prevent unauthorized API access

---

## ❓ Troubleshooting

| Problem | Solution |
|---------|----------|
| Cars not loading | Check Firebase config in `firebase-config.js` |
| Admin login fails | Verify email/password in Firebase Auth → Users |
| Images not uploading | Check Firebase Storage rules (must allow write when authenticated) |
| Site shows 404 | Ensure `.nojekyll` file exists in root |
| Styles broken | Check `baseUrl` in `app.js` matches your GitHub repo path |
| Forms not submitting | Check Firestore rules allow `create` for `enquiries` |
| CORS errors | Firebase automatically handles CORS — check if Firebase config is correct |

---

## 📊 Free Tier Limits (Firebase Spark Plan)

| Feature | Free Limit |
|---------|-----------|
| Firestore reads | 50,000/day |
| Firestore writes | 20,000/day |
| Storage | 5 GB total |
| Storage downloads | 1 GB/day |
| Hosting | N/A (using GitHub Pages) |

These limits are **more than enough** for a typical dealership with hundreds of listings and thousands of visitors per day.

---

*AutoMart Static v1.0 — Built for GitHub Pages + Firebase*
