Smart Cash - APK BANANE KE STEPS (sirf phone se)

IS FOLDER MEIN 7 FILES HAIN:
index.html, style.css, script.js   -> aapka app (kuch badla nahi)
package.json, capacitor.config.json -> Capacitor ki settings
build-apk.yml                       -> GitHub ko APK banana batata hai
README.txt                          -> ye file

STEP 1: github.com par login karo -> New repository banao.
        Naam: smart-cash-user
        Private ya Public, aapki marzi.

STEP 2: Repository mein "Add file" -> "Upload files" dabao.
        In 5 files ko ek saath chuno aur upload karo, phir "Commit changes":
        index.html, style.css, script.js, package.json, capacitor.config.json
        (zip upload mat karo, pehle zip ko Files app mein extract karo)

STEP 3: "Add file" -> "Create new file" dabao.
        Naam wali jagah EXACT ye likho:
        .github/workflows/build-apk.yml
        (slash likhte hi folder ban jaate hain)
        Phir is folder ki build-apk.yml file kholkar poora text copy karo
        aur yahan paste karo. "Commit changes" dabao.

STEP 4: Repository ke upar "Actions" tab kholo.
        Agar "I understand my workflows, enable them" dikhe to dabao.
        Left mein "Build APK" chuno -> "Run workflow" -> green "Run workflow".

STEP 5: 5-10 minute ruko. Green tick aaye to us run par click karo.
        Neeche "Artifacts" mein smart-cash-user-apk dikhega, use download karo.
        Ye ek zip hogi, Files app mein extract karo -> app-debug.apk milegi.

STEP 6: app-debug.apk par tap karo. Phone "Install unknown apps" allow
        karne ko bolega - allow karo. Install ho jayega.

AGAR RED CROSS AAYE:
        Run kholo, red step ka error text copy karke mujhe bhej do.

DHYAN RAKHO:
- Har naye build ki signing key alag hoti hai, isliye naya APK dalne se
  pehle purana app uninstall karo. Data Firebase mein hai, kuch nahi jayega.
- Ye TEST APK hai (Play Store ke liye nahi). Icon default Capacitor wala
  hoga. Play Store wala signed AAB baad mein alag se banayenge.
