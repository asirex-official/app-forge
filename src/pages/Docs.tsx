import { Card } from "@/components/ui/card";
import Layout from "@/components/site/Layout";

const Docs = () => (
  <Layout>
    <section className="container py-12 max-w-3xl space-y-8">
      <div>
        <h1 className="text-4xl font-bold tracking-tight">Docs & <span className="text-gradient">FAQ</span></h1>
        <p className="text-muted-foreground mt-2">APKForge ke baare me sab kuch jo aapko jaanna chahiye.</p>
      </div>

      {sections.map((s) => (
        <Card key={s.title} className="p-6 bg-gradient-card border-border/60 space-y-3">
          <h2 className="text-2xl font-semibold">{s.title}</h2>
          <div className="prose prose-invert prose-sm max-w-none text-muted-foreground space-y-3">
            {s.body}
          </div>
        </Card>
      ))}
    </section>
  </Layout>
);

const sections = [
  {
    title: "APKForge actually karta kya hai?",
    body: <>
      <p>APKForge ek <strong className="text-foreground">no-code interface</strong> hai jo aapke local Capacitor + Gradle pipeline ko drive karta hai. Aap UI me app details bharte ho — APKForge un details ko ek temporary Capacitor project me convert karta hai aur <code>./gradlew assembleDebug</code> chala ke real APK file generate karta hai.</p>
    </>,
  },
  {
    title: "Mujhe coding aani chahiye?",
    body: <>
      <p>Nahi! Bas ek-baar terminal me 4-5 commands chalane hain (Server page dekho). Uske baad sab kuch UI se hota hai — clicks aur form fields.</p>
    </>,
  },
  {
    title: "Generated APKs Play Store pe daal sakte hain?",
    body: <>
      <p><strong className="text-foreground">Debug APK</strong> sirf testing ke liye hai — wo Play Store pe nahi jaayegi.</p>
      <p><strong className="text-foreground">Release APK</strong> Play Store ke liye chahiye, lekin usse aapko apni signing key se sign karna padega (<code>jarsigner</code> ya Android Studio se). APKForge release me unsigned APK deta hai.</p>
    </>,
  },
  {
    title: "Build fail ho gayi, ab kya?",
    body: <>
      <p>Builder page ke build panel me logs dikhte hain. Common issues:</p>
      <ul className="list-disc pl-5 space-y-1">
        <li><code>JAVA_HOME not set</code> — Server page ke step 2 dobara dekho</li>
        <li><code>SDK location not found</code> — <code>ANDROID_HOME</code> set nahi hai</li>
        <li><code>Failed to install platform 34</code> — Android Studio SDK Manager me Platform 34 install karo</li>
      </ul>
    </>,
  },
  {
    title: "Generated app me kaisa code hota hai?",
    body: <>
      <p>APKForge ek <strong className="text-foreground">Capacitor</strong> project banata hai jo basically ek native Android shell hai jismein WebView chalti hai. Agar aapne URL diya — WebView wo URL load karti hai. Agar aapne HTML diya — wo HTML bundled ho ke locally load hota hai (offline bhi chal sakta hai).</p>
      <p>Generated source code <code>~/.apkforge/projects/&lt;packageName&gt;/</code> me save rehta hai — chaaho toh Android Studio me open karke aage customize karo.</p>
    </>,
  },
  {
    title: "Native features (camera, GPS) kaise add karein?",
    body: <>
      <p>Builder ke "Permissions" tab me toggle karo — APKForge automatically AndroidManifest.xml me daal dega aur respective Capacitor plugin install kar dega (camera ke liye <code>@capacitor/camera</code>, etc).</p>
      <p>JavaScript se use karne ke liye apne web code me <code>import {`{Camera}`} from '@capacitor/camera'</code> kar ke standard Capacitor API call karo.</p>
    </>,
  },
];

export default Docs;
