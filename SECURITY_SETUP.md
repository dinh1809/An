# Security Setup Guide - AN Career Passport

## 🔐 API Key Management Best Practices

This guide explains how to properly manage sensitive API keys to prevent security breaches.

---

## Local Development Setup

### 1. Create Your `.env` File

**NEVER commit this file to Git!** The `.gitignore` file is already configured to exclude it.

```bash
# Copy the example file
cp .env.example .env

# Then edit .env with your actual keys
```

### 2. Required Environment Variables

Edit your `.env` file with these values:

```env
# Get these from https://supabase.com/dashboard
VITE_SUPABASE_URL=https://xxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJxxxxxxxxxxxx

# Get this from https://openrouter.ai/keys
# NOTE: This is only for local development testing
# Production should use Supabase secrets (see below)
VITE_OPENROUTER_API_KEY=sk-or-v1-xxxxxxxxxxxx
```

### 3. Restart Development Server

After creating/modifying `.env`:

```bash
# Stop the server (Ctrl+C)
# Then restart
npm run dev
```

**Important**: Environment variables are only loaded when the server starts!

---

## Production Deployment (Supabase Edge Functions)

For production, **DO NOT** use the `VITE_OPENROUTER_API_KEY` in `.env`. Instead, configure it as a Supabase secret:

### Option 1: Using Supabase CLI (Recommended)

```bash
# Install Supabase CLI if you haven't
npm install -g supabase

# Login to your project
npx supabase login

# Link to your project
npx supabase link --project-ref your-project-ref

# Set the secret (replace with your actual key)
npx supabase secrets set OPENROUTER_API_KEY=sk-or-v1-xxxxxxxxxxxx

# Deploy the Edge Function
npx supabase functions deploy generate-advice
```

### Option 2: Using Supabase Dashboard

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Navigate to **Project Settings** → **Edge Functions** → **Secrets**
4. Click **Add New Secret**:
   - **Name**: `OPENROUTER_API_KEY`
   - **Value**: `sk-or-v1-xxxxxxxxxxxx`
5. Click **Save**
6. Redeploy your Edge Function

---

## 🚨 What If You Accidentally Committed an API Key?

If you accidentally pushed a `.env` file or exposed an API key in your Git history:

### Immediate Actions:

1. **Revoke the Key Immediately**
   - OpenRouter: Go to https://openrouter.ai/keys and delete the exposed key
   - Create a new key

2. **Remove from Git History**
   ```bash
   # Remove the file from Git tracking (keeps local copy)
   git rm --cached .env
   
   # Commit the removal
   git commit -m "Remove accidentally committed .env file"
   
   # Push the changes
   git push origin main
   ```

3. **Clean Git History (Advanced)**
   ```bash
   # If the key was committed in previous commits, use filter-branch
   # WARNING: This rewrites history! Coordinate with your team first.
   git filter-branch --force --index-filter \
     "git rm --cached --ignore-unmatch .env" \
     --prune-empty --tag-name-filter cat -- --all
   
   # Force push (dangerous!)
   git push origin --force --all
   ```

4. **Update All Environments**
   - Update `.env.local` on your machine
   - Update Supabase secrets with the new key
   - Notify team members to pull changes and update their keys

---

## Verification Checklist

Before pushing code to GitHub:

- [ ] `.gitignore` includes `.env` and `.env.local`
- [ ] No API keys are hardcoded in source files
- [ ] `.env.example` exists with empty placeholder values
- [ ] Run `git status` to ensure `.env` is not staged
- [ ] Test that app works with environment variables
- [ ] Production Edge Functions use Supabase secrets, not `.env`

---

## Security Architecture

```
┌─────────────────┐
│  React Frontend │
│  (Public Code)  │
└────────┬────────┘
         │ No API Keys Here!
         │
         ▼
┌─────────────────────┐
│ Supabase Edge Func  │
│  (Server-side)      │
│  ✅ Has API Key     │
└────────┬────────────┘
         │
         ▼
┌─────────────────┐
│  OpenRouter API │
└─────────────────┘
```

**Key Principle**: Sensitive keys stay on the server. Frontend only talks to Supabase.

---

## Troubleshooting

### "VITE_OPENROUTER_API_KEY is missing" Error

1. Check if `.env` file exists in project root
2. Verify the key is spelled correctly: `VITE_OPENROUTER_API_KEY=sk-or-v1-xxx`
3. Restart your dev server (`npm run dev`)
4. Check file encoding (should be UTF-8)

### AI Advice Not Generating in Production

1. Verify Edge Function secret is set: `npx supabase secrets list`
2. Check Edge Function logs: Project Dashboard → Edge Functions → Logs
3. Ensure Edge Function is deployed: `npx supabase functions deploy generate-advice`
4. Test the function directly with curl (see implementation plan)

---

## Need Help?

- Supabase Docs: https://supabase.com/docs/guides/functions/secrets
- OpenRouter Docs: https://openrouter.ai/docs
- GitHub .gitignore Guide: https://docs.github.com/en/get-started/getting-started-with-git/ignoring-files
