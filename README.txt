Cash Reward v1.4.0 - app files (GitHub repo: cash-reward)

Is folder mein 10 files hain:
index.html, style.css, script.js, native.js   -> app (demo hata diya, privacy/terms buttons, back button, no-internet patti)
package.json, capacitor.config.json            -> Capacitor settings (package name com.smartcash.user01 - mat badalna)
make_icons.py, APK_Logo_512x512_Transparent.png -> logo/icons
build-apk.yml                                   -> FINAL workflow: signed release APK banata hai
README.txt                                      -> ye file

Privacy Policy: https://junaidbhai781-lang.github.io/smart-cash-privacy/
Poore steps: Smart-Cash-FINAL-Guide.pdf

LOGO UPDATE: APK_Logo_512x512_Transparent.png ab naya "Cash Reward" logo hai (rounded transparent corners).
Yehi logo splash, login/register, forgot password, About, maintenance, sidebar, home greeting, favicon aur APK icon me use hota hai.

v1.4.0 UPDATE
1) Coin icon: poore app me (top pill, offers, wallet, refer, reward popup) asli gold coin jaisa (rim, emboss, shine).
2) Google sign-in (APK): @capacitor-firebase/authentication plugin add hua. Isko chalane ke liye 3 kaam (ek baar):
   a) Firebase Console -> Authentication -> Sign-in method -> Google ENABLE.
   b) Firebase -> Project settings -> Android app (com.smartcash.user01) -> apni RELEASE keystore ka SHA-1 (aur SHA-256) add karo.
      (Uptodown ke liye khud sign kiya hua keystore - GitHub secret wala wahi keystore.)
      Phir wahan se google-services.json download karo.
   c) GitHub -> Settings -> Secrets -> Actions -> naya secret GOOGLE_SERVICES_JSON = google-services.json ka poora text paste.

v1.4.0: Wallet card ke kone mein sirf "100 Coins = ₹1" chip (aur kahin rupee value nahi).
v1.4.0: Redeem popup mein wallet ki rupee value + amount type karte hi live value.
