# Clerk Authentication Setup Guide

This project uses Clerk for authentication. Follow these steps to set up Clerk:

## Step 1: Create a Clerk Account

1. Go to [clerk.com](https://clerk.com) and sign up for a free account
2. Create a new application in the Clerk Dashboard
3. Choose your preferred authentication methods (Email, Google, GitHub, etc.)

## Step 2: Get Your Publishable Key

1. In your Clerk Dashboard, go to **API Keys**
2. Copy your **Publishable Key** (starts with `pk_test_` or `pk_live_`)

## Step 3: Set Up Environment Variables

1. Create a `.env` file in the root of your project:

```bash
# In the project root directory
touch .env
```

2. Add your Clerk Publishable Key to the `.env` file:

```env
VITE_CLERK_PUBLISHABLE_KEY=pk_test_your_key_here
```

**Important**: Replace `pk_test_your_key_here` with your actual Clerk Publishable Key from the dashboard.

## Step 4: Run the Application

```bash
# Install dependencies (if not already done)
npm install

# Start the development server
npm run dev
```

The app will be available at `http://localhost:8080`

## How Authentication Works

### Public Routes (No Auth Required)
- `/` - Landing page
- `/sign-in` - Sign in page
- `/sign-up` - Sign up page

### Protected Routes (Auth Required)
- `/workspace` - Main workspace (redirects to sign-in if not authenticated)
- `/workspace/:sessionId` - Workspace with session ID

### Authentication Flow

1. **New User**:
   - Visits landing page → Clicks "Get Started"
   - Redirected to `/sign-up`
   - Creates account via Clerk
   - Automatically redirected to `/workspace`

2. **Returning User**:
   - Visits landing page → Clicks "Sign In"
   - Redirected to `/sign-in`
   - Signs in via Clerk
   - Automatically redirected to `/workspace`

3. **Protected Route Access**:
   - User tries to access `/workspace` without login
   - Automatically redirected to `/sign-in`
   - After sign-in, redirected back to workspace

### User Profile & Sign Out

- User profile button (top-right in workspace header)
- Click avatar to access:
  - Profile settings
  - Sign out option

## Customization

### Clerk Component Appearance

You can customize the look of Clerk components in the sign-in/sign-up pages:

```tsx
<SignIn 
  appearance={{
    elements: {
      rootBox: "mx-auto",
      card: "shadow-lg",
      // Add more customizations
    },
  }}
/>
```

See [Clerk's theming docs](https://clerk.com/docs/components/customization/overview) for more options.

## Troubleshooting

### Error: "Missing Clerk Publishable Key"

**Solution**: Make sure you've created a `.env` file with the correct key:
```env
VITE_CLERK_PUBLISHABLE_KEY=pk_test_your_actual_key_here
```

### Authentication not working

1. Check that your Clerk application is active in the dashboard
2. Verify your API key is correct
3. Make sure `.env` file is in the project root
4. Restart the dev server after adding `.env` file

### Sign-in redirects not working

Make sure the URLs in your Clerk Dashboard match your app URLs:
- Development: `http://localhost:8080`
- Production: Your deployed URL

## Additional Resources

- [Clerk Documentation](https://clerk.com/docs)
- [Clerk React SDK](https://clerk.com/docs/references/react/overview)
- [Clerk Dashboard](https://dashboard.clerk.com)

