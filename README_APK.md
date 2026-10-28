# Smart Cash – APK banane ke steps (GitHub Actions, free)

1. Firebase Console > Project settings > Android app (package: com.smartcash.app) se `google-services.json` download karo
   aur is project ke root mein upload karo (workflow ise dhoondta hai; ye file zip mein NAHI hai).
2. Firebase Console > Authentication: Email/Password aur Google ON rakho. Google ke liye debug.keystore ka SHA-1
   Android app mein add karo (ye repo mein diya hua fixed debug key hai).
3. Poora folder GitHub repo mein push karo > Actions > "Build APK" > artifact `smart-cash-apk` download karo.

## Rules deploy (APK test se pehle, Firebase Console > Realtime Database > Rules)
- Pehle Rules Playground mein `database.rules.json` test karo (docs/DATA_CONTRACTS.md dekho). Purane rules: docs/database.rules.OLD.json.
- Firebase Console > Realtime Database mein `admins/<aapka-uid>` = true haath se banao (sirf console se).
- `appSettings/coinToRupee` aur `appSettings/minWithdraw` set hone par hi withdrawal chalega.
- Optional `appSettings/hero` (img https URL, title, cta, link, order), `appSettings/referral` {reward, conditions, link}, `appSettings/heroAutoplay`: true.

## Limits (Spark plan, no Cloud Functions)
Games practice-only hain. Task/referral/withdrawal ki approval aur coins jodna Admin Panel (baad mein) se hoga.
