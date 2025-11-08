# 🚀 Quick Start - Get Running in 5 Minutes

## Prerequisites
- Node.js 18+ installed
- A Clerk account (free)

## Step-by-Step Setup

### 1️⃣ Install Dependencies (1 min)
```bash
npm install
```

### 2️⃣ Get Your Clerk Key (2 min)

1. **Sign up at Clerk**: https://clerk.com/sign-up
2. **Create a new application**
3. **Copy your Publishable Key**:
   - Go to "API Keys" in the sidebar
   - Copy the key starting with `pk_test_...`

### 3️⃣ Create .env File (1 min)

Create a file named `.env` in the project root:

```bash
# Create the file
touch .env

# Or on Windows
type nul > .env
```

Add this content (replace with your actual key):

```env
VITE_CLERK_PUBLISHABLE_KEY=pk_test_your_key_here
```

### 4️⃣ Start the App (1 min)

```bash
npm run dev
```

Open http://localhost:8080 in your browser 🎉

## First Time Using the App

1. **Click "Get Started"** on the landing page
2. **Sign up** with your email
3. **Verify your email** (check inbox)
4. You'll be automatically redirected to the workspace!

## That's It! 🎊

You now have:
- ✅ Full authentication system
- ✅ Protected workspace
- ✅ User profile management
- ✅ Sign in/Sign out functionality

## Need Help?

- See [CLERK_SETUP.md](./CLERK_SETUP.md) for detailed instructions
- See [AUTHENTICATION_SUMMARY.md](./AUTHENTICATION_SUMMARY.md) for implementation details
- Check the [README.md](./README.md) for full documentation

---

**Having issues?** Make sure:
1. Your `.env` file is in the project root (not in `/src`)
2. The Clerk key is correct (no extra spaces)
3. You've restarted the dev server after creating `.env`

