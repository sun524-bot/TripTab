🇨🇳 [中文版 README](README_ZH.md)

# ✈️ TripTab — Travel Expense Sharing App

**TripTab** is a modern, responsive Progressive Web Application (PWA) designed to make splitting travel expenses and group debts effortless, transparent, and beautifully organized.

![Theme](https://img.shields.io/badge/Theme-Sunset%20Voyage-ff6b6b)
![PWA](https://img.shields.io/badge/PWA-Ready-10b981)
![i18n](https://img.shields.io/badge/Language-EN%20%7C%20ZH-ffd93d)

---

## ✨ Features

- ✈️ **Trip Management**: Create, edit, and archive trips with base currency settings (USD, MYR, SGD, EUR, JPY, GBP, CNY, etc.).
- 👥 **Group & Virtual Members**: Add registered friends via email or assign virtual member names to start tracking expenses immediately.
- 💳 **Flexible Expense Splitting**:
  - Equal split among all members
  - Custom individual split amounts
  - Selective member participation
  - **Show Split Details Toggle**: A quick switch in the expense list to dynamically expand cards and show individual member share chips inline (persisted via `localStorage`).
- ⚡ **Smart Debt Simplification**:
  - **Direct Pairwise Mode**: Shows exact itemized debts between any two members.
  - **Group Debt Simplification**: Greedy algorithm that minimizes total transfer steps across the entire group.
  - **Calculation Breakdown Modal**: Detailed breakdown showing `Y paid for X` minus `X paid for Y` with step-by-step math explanations.
- 📄 **PDF & Print Summary**: Generate printable calculation breakdowns and export trip summaries for easy record-keeping.
- 🌐 **Global i18n Translation**: Real-time instant toggle between **English** and **中文 (Simplified Chinese)** across all pages, modals, and dynamic lists.
- 🌙 **Dark & Light Modes**: Sunset Voyage design system with glassmorphism, dynamic gradients, and comfortable dark mode colors.
- 📱 **PWA & Offline Capable**: Add to your phone's Home Screen (`Add to Home Screen`) to use full-screen like a native mobile app with Service Worker caching.

---

## 🛠️ Tech Stack

- **Frontend**: HTML5, Vanilla JavaScript (ES6+)
- **Styling**: Modern CSS3 (Custom Design Tokens, Flexbox/Grid, Glassmorphism, Responsive Media Queries)
- **Backend & Storage**: Firebase Authentication & Firestore NoSQL Database
- **Offline / App Installation**: Web App Manifest (`manifest.json`) & Service Worker (`sw.js`)

---

## 📂 Project Structure

```
Travel Apps/
├── add-expense.html    # Add / edit expense form & category selection
├── dashboard.html      # Main user dashboard & active trips
├── index.html          # Landing page & entry point
├── login.html          # User authentication login page
├── profile.html        # User profile, statistics & theme preferences
├── register.html       # Sign up page (Private access control)
├── trip.html           # Main trip detail view (Expenses, Members, Settle tabs)
├── manifest.json       # PWA web app manifest
├── sw.js               # Service Worker for offline asset caching
├── css/
│   ├── base.css        # Core design system tokens, themes, typography
│   ├── components.css  # Buttons, cards, modals, app-bars, bottom nav
│   └── pages.css       # Page-specific layouts
└── js/
    ├── auth.js         # Firebase Auth helpers
    ├── expenses.js     # Expense processing & grouping logic
    ├── firebase-config.js # Firebase project configuration
    ├── i18n.js         # Internationalisation (EN / ZH translations)
    ├── theme.js        # Light / Dark mode state manager
    ├── trips.js        # Firestore CRUD operations for trips
    └── utils.js        # Currency, date formatting & helper functions
```

---

## 🚀 How to Run Locally

1. **Option A: Direct File Opening**
   - Open `dashboard.html` directly in any modern browser (Chrome, Safari, Edge, Firefox).

2. **Option B: Local Development Server**
   - Run a lightweight HTTP server in the project directory:
     ```bash
     npx http-server ./
     ```
   - Open `http://localhost:8080` in your web browser.

---

## 📲 Installing on Mobile (Add to Home Screen)

- **iPhone (Safari)**: Open the web link → tap Share `[↑]` → select **"Add to Home Screen"**.
- **Android (Chrome)**: Open the web link → tap 3 dots `⋮` → select **"Add to Home Screen"** or **"Install App"**.

---

## 🔧 Configuring Your Own Firebase API (For Developers)

If you clone or fork this repository to host your own instance of TripTab:

1. Create a free project at [console.firebase.google.com](https://console.firebase.google.com/).
2. Enable **Email/Password Authentication** in *Build -> Authentication -> Sign-in method*.
3. Create a **Cloud Firestore Database** in *Build -> Firestore Database*.
4. Replace the credentials in `js/firebase-config.js` with your own Firebase web config:
   ```javascript
   const firebaseConfig = {
     apiKey: "YOUR_FIREBASE_API_KEY",
     authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
     projectId: "YOUR_PROJECT_ID",
     storageBucket: "YOUR_PROJECT_ID.appspot.com",
     messagingSenderId: "YOUR_SENDER_ID",
     appId: "YOUR_APP_ID"
   };
   ```

---

## 👤 Creating Your First User Account

> **Important**: Public registration is disabled by default to keep the app private. You must create your first account manually via the Firebase Console.

**Step-by-step:**

1. Go to your Firebase project at [console.firebase.google.com](https://console.firebase.google.com/)
2. Navigate to **Build → Authentication → Users**
3. Click **"Add user"**
4. Enter an **Email** and **Password**
5. Click **"Add user"** to confirm
6. Open your app and sign in with those credentials — you're in! 🎉

> **To invite others**: Repeat the same steps above for each person you want to give access to. They can then log in using the email and password you set for them, and update their password from the Profile page inside the app.

---

## 📝 License

Distributed under the MIT License. See `LICENSE` for more information.

