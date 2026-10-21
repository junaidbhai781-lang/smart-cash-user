Smart Cash v1.1.0 (FINAL) - app + game ek saath (GitHub repo: smart-cash-user)

REPO KE ROOT MEIN SIRF YE FILES CHAHIYE (koi game/ folder nahi):
index.html, style.css, script.js, native.js        -> app. GAME (Super77Pro + GreedyBaby) script.js ke andar hai (GAME_DOC)
package.json, capacitor.config.json                 -> Capacitor settings (package: com.smartcash.user1)
make_icons.py, APK_Logo_512x512_Transparent.png     -> logo/icons
.github/workflows/build-apk.yml                     -> APK workflow
README.txt                                          -> ye file

APK BANANE KE STEPS:
1. Ye saari files + .github folder repo ke ROOT mein upload/commit karo (purani game/ folder ho to delete kar do).
2. Settings -> Secrets and variables -> Actions: KEYSTORE_BASE64, KEYSTORE_PASSWORD, KEY_ALIAS (release signed APK ke liye).
   Secrets na ho to workflow DEBUG APK bana deta hai (phone par test ke liye).
3. Actions -> Build APK -> Run workflow -> version code daalo -> Run.
4. Run khatam hone par neeche Artifacts se "smart-cash-user-apk" download karo.

GAME ADMIN PANEL SE CONTROL (live, app update ki zarurat nahi):
Firebase Realtime Database -> /config -> "game" naam ka object (admin panel jahan baaki config likhta hai wahin):
  game: {
    enabled: true,            // false = Game tab poora hide, khula hua game bhi band (chalti round ke bets refund)
    notice: "",               // game home par patti ka text (khali = patti nahi)
    message: "",              // band hone par user ko dikhne wala message
    wheel:  { enabled: true, betTime: 10, maxRoundBet: 0 },   // Super77Pro
    greedy: { enabled: true, betTime: 15, maxRoundBet: 0 }    // GreedyBaby
  }
enabled=false karne par game/card "Closed" dikhta hai. betTime = 5 se 60 second. maxRoundBet = ek round mein total bet limit (0 = limit nahi).
Koi field na ho to default chalta hai. Baaki saare admin controls (tasks, banners, config, broadcasts, maintenance...) pehle jaise hi hain.

ZAROORI: script.js mein Firebase config (CFGJ, "PASTE_NEW_..." wali line) apna naya Firebase config paste karna hai,
warna login/tasks cloud se load nahi honge.

Privacy Policy: https://junaidbhai781-lang.github.io/smart-cash-privacy/
