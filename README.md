# CodeRaider Web

A web version of CodeRaider. Works on phone, tablet, and desktop.
Host it for free on GitHub Pages, share a link with your friends.

---

## What you'll do (overview)

1. Create a Firebase project (free, 5 minutes) — this is what syncs your group
2. Create a GitHub repo and upload these files
3. Turn on GitHub Pages
4. Share your link

Total time: about 15 minutes.

---

## Step 1 — Set up Firebase (for multi-user sync)

If you skip this step, the app works in **solo mode** (no sync between people).
For a group, you need Firebase.

### 1.1 — Create a Firebase project

1. Go to https://console.firebase.google.com
2. Sign in with any Google account
3. Click **Add project**
4. Name it anything (e.g. `coderaider`) → Continue
5. Disable Google Analytics (not needed) → Create project
6. Wait for it to finish, then click **Continue**

### 1.2 — Create a Realtime Database

1. In the left sidebar, click **Build** → **Realtime Database**
2. Click **Create Database**
3. Pick any location near you (e.g. `us-central1`) → Next
4. Select **Start in test mode** → Enable
   - Test mode means anyone with your link can read/write. That's what you want.
   - It expires after 30 days — see Step 1.5 to fix that.

### 1.3 — Register a web app

1. Go back to the project overview (click the gear icon → **Project settings**,
   or click the Firebase logo at the top left)
2. Scroll down to **Your apps**
3. Click the **</>** (web) icon
4. Give it a nickname (e.g. `coderaider-web`) → Register app
5. You'll see a block of code that looks like this:
   ```js
   const firebaseConfig = {
     apiKey: "AIzaSyD...",
     authDomain: "coderaider-abc12.firebaseapp.com",
     databaseURL: "https://coderaider-abc12-default-rtdb.firebaseio.com",
     projectId: "coderaider-abc12",
     storageBucket: "coderaider-abc12.appspot.com",
     messagingSenderId: "123456789",
     appId: "1:123:web:abc"
   };
   ```
6. **Copy this entire object.** You'll paste it in the next step.
7. Click **Continue to console**.

### 1.4 — Paste your config into the app

1. Open the file **firebase-config.js** (in the folder you downloaded)
2. Replace the fake values with the real ones you just copied from Firebase.
   Make sure to keep `export const FIREBASE_CONFIG = { ... };` wrapped around it.
3. Save the file.

### 1.5 — (Optional) Make test mode permanent

Test mode expires in 30 days. To keep it working forever:

1. Back in Firebase → Realtime Database → **Rules** tab
2. Replace whatever's there with:
   ```json
   {
     "rules": {
       "sessions": {
         ".read": true,
         ".write": true
       }
     }
   }
   ```
3. Click **Publish**

This lets anyone read/write sessions but nothing else. Good enough for a
friends-only tool. Don't store anything sensitive in Firebase, obviously.

---

## Step 2 — Put it on GitHub Pages

### 2.1 — Create a GitHub account
If you don't have one: https://github.com/signup — takes 30 seconds.

### 2.2 — Create a new repo

1. Go to https://github.com/new
2. Repository name: `coderaider` (or whatever you want)
3. Public (required for free GitHub Pages)
4. Do NOT check "Add a README"
5. Click **Create repository**

### 2.3 — Upload the files

Easiest way (no git needed):

1. On the empty repo page, click **uploading an existing file**
2. Drag in these three files from your downloaded folder:
   - `index.html`
   - `firebase-config.js` (the one you edited in Step 1.4)
   - `README.md`
3. Scroll down and click **Commit changes**

### 2.4 — Turn on GitHub Pages

1. In your repo, click **Settings** (top right)
2. In the left sidebar, click **Pages**
3. Under **Build and deployment**:
   - Source: **Deploy from a branch**
   - Branch: **main** / **(root)** → Save
4. Wait 1–2 minutes. GitHub will show a green box with your link:
   `https://yourusername.github.io/coderaider/`

That's your live URL. Open it on your phone, desktop, or send to friends.

---

## Step 3 — How to use it

1. Open the URL on your phone/computer
2. Type any **room code** (e.g. `RAID1`) — anyone with the same code joins the same session
3. Type your **name**
4. Tap **JOIN SESSION**
5. You'll see a 4-digit code. Tap **NEXT ▶** (or press → arrow key on desktop) to advance
6. Tap **◀ BACK** (or ← arrow) to go back

Everyone in the same room gets unique codes in order, no repeats, late joiners work.

### Controls

| Action | Desktop key | Mobile |
|--------|-------------|--------|
| Next code | → or `+` | Tap NEXT button |
| Back | ← or `-` | Tap BACK button |
| Exit | — | Tap EXIT button |

---

## Updating the app later

If you change any file:
1. Go to your GitHub repo
2. Click the file → pencil icon to edit, or delete it and drag the new version in
3. Commit changes
4. Your site updates within ~1 minute

---

## Troubleshooting

**"Sync not configured" banner shows up**
You haven't edited firebase-config.js yet, or you pasted the values wrong.
Check that the config values don't still say `YOUR_API_KEY_HERE`.

**Status dot stays offline / SOLO MODE**
Same as above — Firebase config isn't loading. Open browser devtools (F12)
and check the Console tab for errors.

**"Permission denied" errors in the console**
Your Firebase database rules are too strict. Go back to Step 1.5 and paste
the rules I gave you.

**People see different codes / repeats happen**
They're probably in different room codes. Make sure everyone types the exact
same room code (it's case-insensitive in this app — auto-uppercased).

---

## Costs

Free. Firebase's free tier gives you 100 simultaneous connections and
1GB of storage, which is massive overkill for this. GitHub Pages is free
for public repos.
