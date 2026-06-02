# Connecting TellaTrust to Firebase

The app runs in **preview mode** without Firebase (splash + landing + marketing work).
To enable **signup, login, wallet, savings and transactions**, connect a Firebase project.
The free **Spark** plan is enough — this prototype writes simulated money straight to
Firestore, so you do **not** need the paid Blaze plan or Cloud Functions.

Takes about 5 minutes.

---

## 1. Create a Firebase project
1. Go to <https://console.firebase.google.com> and sign in with a Google account.
2. Click **Add project** → name it `tellatrust` (or anything) → continue.
3. Google Analytics is optional — you can disable it. Click **Create project**.

## 2. Register a Web app
1. On the project home, click the **Web** icon `</>`.
2. App nickname: `TellaTrust Web` → **Register app** (skip Hosting).
3. Firebase shows a `firebaseConfig` block. Keep this tab open — you'll copy these values next.

## 3. Add the keys to the app
1. In your project, open `apps/web/.env` (already created for you).
2. Fill each value from the `firebaseConfig`:

```
VITE_FIREBASE_API_KEY=AIza...            (apiKey)
VITE_FIREBASE_AUTH_DOMAIN=xxx.firebaseapp.com   (authDomain)
VITE_FIREBASE_PROJECT_ID=tellatrust-xxxx        (projectId)
VITE_FIREBASE_STORAGE_BUCKET=xxx.appspot.com    (storageBucket)
VITE_FIREBASE_MESSAGING_SENDER_ID=1234567890    (messagingSenderId)
VITE_FIREBASE_APP_ID=1:1234:web:abcd            (appId)
VITE_USE_EMULATORS=false
```

## 4. Turn on Email/Password sign-in
1. Left sidebar → **Build → Authentication** → **Get started**.
2. **Sign-in method** tab → **Email/Password** → enable the first toggle → **Save**.

## 5. Create the database
1. Left sidebar → **Build → Firestore Database** → **Create database**.
2. Choose **Start in production mode** → pick a location (e.g. `eur3` or `nam5`) → **Enable**.

## 6. Publish the security rules
The repo's `firestore.rules` already has the correct rules. Either:

- **Quick way:** Firestore → **Rules** tab → paste the contents of `firestore.rules` → **Publish**.
- **CLI way:** `npm i -g firebase-tools`, then `firebase login`, then from the repo root
  `firebase use --add` (pick your project) and `firebase deploy --only firestore:rules`.

## 7. Restart the dev server
```
npm run dev:web
```
Open <http://localhost:5173>, click **Sign up**, create an account — you'll land in the
dashboard. Use **Fund wallet** to add simulated money, then create a savings plan.

---

### What works once connected
- Email signup / login / logout, with a route guard on `/app`.
- A profile + wallet document created automatically on signup.
- **Fund wallet** (simulated) → updates balance, writes a transaction + a notification.
- **Savings plans** → create plans, initial deposit moves to "locked", progress tracked.
- **Transactions** and **Notifications** pages update live (Firestore listeners).
- **₦ / $ toggle** in the top bar switches every figure between Naira and USD.

### Going to production later
For a real deployment, money movement moves server-side into the Cloud Functions in
`/functions` (already written), and the Firestore rules tighten wallet/transaction writes
back to server-only. That needs the Blaze plan. Not required for this prototype.
