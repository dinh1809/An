# Deployment & Verification Guide

## 🚀 Step 1: Configure Supabase Secret

You need to set the OpenRouter API key as a Supabase secret. Choose **ONE** of these methods:

### Method A: Using Supabase CLI (Recommended)

**First, enable PowerShell scripts** (if you get execution policy errors):
```powershell
# Run PowerShell as Administrator, then:
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

**Then configure the secret:**
```bash
# Login to Supabase
npx supabase login

# Link your project (replace with your project reference)
npx supabase link --project-ref your-project-ref

# Set the API key secret
npx supabase secrets set OPENROUTER_API_KEY=sk-or-v1-YOUR_ACTUAL_KEY_HERE

# Deploy the Edge Function
npx supabase functions deploy generate-advice
```

### Method B: Using Supabase Dashboard (Easier if CLI doesn't work)

1. Go to https://supabase.com/dashboard
2. Select your project: **An Career Passport**
3. Navigate to: **Project Settings** → **Edge Functions** → **Secrets**
4. Click **"Add New Secret"**
   - **Name**: `OPENROUTER_API_KEY`
   - **Value**: `sk-or-v1-YOUR_ACTUAL_KEY_HERE` (paste your real key)
5. Click **Save**

6. **Deploy the Edge Function manually:**
   - Go to **Edge Functions** in sidebar
   - Find `generate-advice` (or create new function)
   - Upload the file: `supabase/functions/generate-advice/index.ts`
   - Or use the Supabase CLI after enabling PowerShell scripts

---

## ✅ Step 2: Verify Deployment

### 2.1 Check Secret is Set

**CLI Method:**
```bash
npx supabase secrets list
```
Expected output: You should see `OPENROUTER_API_KEY` in the list

**Dashboard Method:**
- Go to Project Settings → Edge Functions → Secrets
- Verify `OPENROUTER_API_KEY` is listed

### 2.2 Test Edge Function Manually

**Using `curl` (Git Bash or WSL):**
```bash
curl -i --location --request POST \
  'https://YOUR_PROJECT_REF.supabase.co/functions/v1/generate-advice' \
  --header 'Authorization: Bearer YOUR_ANON_KEY' \
  --header 'Content-Type: application/json' \
  --data '{
    "metrics": {
      "visual": 85,
      "logic": 75,
      "memory": 65,
      "speed": 70,
      "focus": 80
    }
  }'
```

**Expected Response:**
```json
{
  "advice": "🎯 NHẬN ĐỊNH CHUYÊN GIA\n..."
}
```

### 2.3 Test Frontend Integration

1. **Start your development server:**
   ```bash
   npm run dev
   ```

2. **Complete an assessment:**
   - Navigate to http://localhost:5173/assessment
   - Complete any assessment (e.g., Matrix Raven)
   - Go to the results page

3. **Verify AI Advice Appears:**
   - You should see "Consulting AN AI Vocational Brain..." loading message
   - After 3-5 seconds, Vietnamese career advice should appear
   - Check browser DevTools Console for logs:
     - Should see: `AiVocationalService: Calling Supabase Edge Function`
     - Should NOT see any errors about API keys

---

## 🔍 Step 3: Security Verification

### 3.1 Verify API Key is NOT in Frontend

**Build the production bundle:**
```bash
npm run build
```

**Search for API key in build output:**
```bash
# In Git Bash or PowerShell:
grep -r "sk-or-v1" dist/
# Or in PowerShell:
Select-String -Path "dist\*" -Pattern "sk-or-v1" -Recurse
```

**Expected Result:** No matches found! ✅

### 3.2 Check Network Requests

1. Open browser DevTools (F12)
2. Go to **Network** tab
3. Complete an assessment
4. **Verify:**
   - ✅ You see a request to `https://YOUR_PROJECT.supabase.co/functions/v1/generate-advice`
   - ✅ NO requests to `https://openrouter.ai/api/v1/chat/completions`
   - ✅ NO Authorization header contains `sk-or-v1-*` in the frontend request

### 3.3 Check Local Storage / Session Storage

1. Open DevTools → **Application** tab
2. Check **Local Storage** and **Session Storage**
3. **Verify:** No API keys are stored anywhere ✅

---

## 🧪 Step 4: Error Scenario Testing

Test that the system handles errors gracefully:

### Test 1: Missing Secret
1. Temporarily unset the Supabase secret:
   ```bash
   npx supabase secrets unset OPENROUTER_API_KEY
   ```
2. Run the app and complete an assessment
3. **Expected:** Fallback message appears: "Lỗi cấu hình máy chủ..."
4. **Restore the secret** afterward

### Test 2: Invalid API Key
1. Set an invalid key:
   ```bash
   npx supabase secrets set OPENROUTER_API_KEY=invalid-key-12345
   ```
2. Test the app
3. **Expected:** Fallback message: "AN AI đang bận xử lý dữ liệu..."
4. **Restore the correct key** afterward

### Test 3: Network Failure
1. Turn off your internet connection
2. Try to get advice
3. **Expected:** Error message: "Lỗi kết nối..."

---

## 📋 Verification Checklist

Copy this checklist and check off each item:

- [ ] PowerShell execution policy enabled (if using CLI)
- [ ] Supabase secret `OPENROUTER_API_KEY` is set
- [ ] Edge Function `generate-advice` is deployed
- [ ] Supabase secret list shows `OPENROUTER_API_KEY`
- [ ] Manual curl test to Edge Function returns Vietnamese advice
- [ ] Frontend dev server runs without errors
- [ ] Completing assessment shows AI advice on results page
- [ ] Browser console shows "Calling Supabase Edge Function" log
- [ ] Production build does NOT contain `sk-or-v1` strings
- [ ] Network tab shows NO direct calls to openrouter.ai
- [ ] Authorization header in frontend requests does NOT contain API key
- [ ] Local/Session Storage does NOT contain API keys
- [ ] Error scenario 1 (missing secret) shows proper fallback
- [ ] Error scenario 2 (invalid key) shows proper fallback
- [ ] Error scenario 3 (network failure) shows proper fallback

---

## 🎉 Success Criteria

All of these should be TRUE:

1. ✅ AI advice generates successfully on assessment results page
2. ✅ Advice is in Vietnamese with proper formatting (🎯, 🏭, 🛠, 💡 emojis)
3. ✅ No OpenRouter API key visible in frontend source code
4. ✅ No OpenRouter API key visible in network requests
5. ✅ Error messages are user-friendly in Vietnamese
6. ✅ `.env` and `.env.local` are NOT tracked by Git
7. ✅ Documentation (`SECURITY_SETUP.md`) exists and is clear

---

## 🆘 Troubleshooting

### Issue: "PowerShell execution policy error"
**Solution:** Run PowerShell as Administrator:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Issue: "Function not found" error
**Solution:** Ensure you deployed the function:
```bash
npx supabase functions deploy generate-advice
```

### Issue: AI advice shows "Lỗi cấu hình máy chủ"
**Solution:** The secret is not set. Follow Step 1 above.

### Issue: AI advice shows "AN AI đang bận xử lý dữ liệu"
**Solution:** 
- Check your OpenRouter API key is valid
- Check you have credits on OpenRouter
- Check the Edge Function logs: Dashboard → Edge Functions → `generate-advice` → Logs

### Issue: Network request shows 401 Unauthorized
**Solution:** Your Supabase anon key might be wrong. Check `.env`:
```env
VITE_SUPABASE_ANON_KEY=eyJxxxx...
```

---

## 📞 Next Steps After Verification

Once all checks pass:

1. **Commit your changes:**
   ```bash
   git add .
   git commit -m "feat: migrate AI system to secure Edge Function architecture"
   ```

2. **Push to GitHub** (API keys are safe now!):
   ```bash
   git push origin main
   ```

3. **Celebrate! 🎉** Your AI system is now production-ready and secure!
