// APKForge — Local Native Android Build Server
// Runs on your Mac. Receives a generated Kotlin/Compose project spec from
// the web UI, scaffolds a REAL NATIVE Android Studio project on disk, runs
// `./gradlew assembleDebug`, and serves the resulting .apk back as a download.
//
// NOT Capacitor. NOT WebView. Real native Kotlin + Jetpack Compose.
//
// Usage:  cd server && npm install && node index.js
// Default port: 5174

import express from "express";
import cors from "cors";
import fs from "fs-extra";
import path from "path";
import os from "os";
import { spawn, execFile } from "child_process";
import { nanoid } from "nanoid";
import multer from "multer";
import AdmZip from "adm-zip";

const PORT = process.env.PORT || 5174;
const ROOT = path.join(os.homedir(), ".apkforge");
const PAIR_FILE = path.join(ROOT, "pairing.json");
fs.ensureDirSync(ROOT);

// ---------- PAIRING ----------
// One-time 6-digit code printed on Mac terminal. User enters it in preview /connect.
// Once paired, preview stores tunnelUrl + token in localStorage and uses for all calls.
function loadOrCreatePairing() {
  try {
    if (fs.existsSync(PAIR_FILE)) return fs.readJsonSync(PAIR_FILE);
  } catch {}
  const data = {
    code: String(Math.floor(100000 + Math.random() * 900000)),
    token: nanoid(32),
    createdAt: Date.now(),
  };
  fs.writeJsonSync(PAIR_FILE, data, { spaces: 2 });
  return data;
}
const PAIRING = loadOrCreatePairing();
let TUNNEL_URL = null; // set after cloudflared starts
const PROJECTS_DIR = path.join(ROOT, "native-projects"); // generated Android Studio projects
const SOURCES_DIR  = path.join(ROOT, "sources");         // imported user website source (read-only)
const OUTPUTS_DIR  = path.join(ROOT, "outputs");         // built APKs
fs.ensureDirSync(PROJECTS_DIR);
fs.ensureDirSync(SOURCES_DIR);
fs.ensureDirSync(OUTPUTS_DIR);

const app = express();
app.use(cors());
app.use(express.json({ limit: "20mb" }));

// Auth middleware — every request (except /health, /pair) must carry pairing token
app.use((req, res, next) => {
  if (req.path === "/health" || req.path === "/pair" || req.path.startsWith("/apk/")) return next();
  const tok = req.headers["x-apkforge-token"] || req.query.token;
  if (tok !== PAIRING.token) return res.status(401).json({ error: "Unauthorized — pair your Mac at /connect" });
  next();
});

const upload = multer({ dest: path.join(os.tmpdir(), "apkforge-uploads") });

const jobs = new Map(); // jobId -> { status, logs, progress, error?, apkPath? }

app.get("/health", (_, res) => {
  res.json({
    ok: true,
    version: "0.3.0-native",
    mode: "native-kotlin",
    tunnelUrl: TUNNEL_URL,
    javaHome: process.env.JAVA_HOME || null,
    androidHome: process.env.ANDROID_HOME || process.env.ANDROID_SDK_ROOT || null,
  });
});

// Pair: client posts { code }, gets back token + tunnel info if code matches
app.post("/pair", (req, res) => {
  const { code } = req.body ?? {};
  if (String(code) !== PAIRING.code) return res.status(403).json({ error: "Wrong pairing code" });
  res.json({ token: PAIRING.token, tunnelUrl: TUNNEL_URL, version: "0.3.0-native" });
});

// ---------- SOURCE IMPORT (GitHub clone or ZIP upload) ----------
// User's website source code is stored read-only under ~/.apkforge/sources/<id>
// AI reads it to understand features. We never write to it.

app.post("/import/github", async (req, res) => {
  const { url } = req.body ?? {};
  if (!url || !/^https?:\/\/(github|gitlab)\.com\//i.test(url)) {
    return res.status(400).json({ error: "Valid GitHub/GitLab https URL required" });
  }
  const id = nanoid(10);
  const dir = path.join(SOURCES_DIR, id);
  try {
    await new Promise((resolve, reject) => {
      execFile("git", ["clone", "--depth", "1", url, dir], (err, _stdout, stderr) => {
        if (err) return reject(new Error(stderr || err.message));
        resolve();
      });
    });
    const summary = await summarizeSource(dir);
    res.json({ id, dir, ...summary });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

app.post("/import/zip", upload.single("file"), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "ZIP file required (field name: file)" });
  const id = nanoid(10);
  const dir = path.join(SOURCES_DIR, id);
  try {
    await fs.ensureDir(dir);
    const zip = new AdmZip(req.file.path);
    zip.extractAllTo(dir, true);
    await fs.unlink(req.file.path).catch(() => {});
    const summary = await summarizeSource(dir);
    res.json({ id, dir, ...summary });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

app.get("/sources", async (_req, res) => {
  const items = await fs.readdir(SOURCES_DIR).catch(() => []);
  const out = [];
  for (const id of items) {
    const dir = path.join(SOURCES_DIR, id);
    const stat = await fs.stat(dir).catch(() => null);
    if (!stat?.isDirectory()) continue;
    out.push({ id, dir, mtime: stat.mtimeMs, ...(await summarizeSource(dir).catch(() => ({}))) });
  }
  res.json(out.sort((a, b) => b.mtime - a.mtime));
});

async function summarizeSource(dir) {
  const exists = (p) => fs.pathExists(path.join(dir, p));
  const pkgPath = path.join(dir, "package.json");
  let name = path.basename(dir);
  let deps = [];
  if (await exists("package.json")) {
    try {
      const pkg = await fs.readJson(pkgPath);
      name = pkg.name || name;
      deps = Object.keys({ ...(pkg.dependencies || {}), ...(pkg.devDependencies || {}) });
    } catch {}
  }
  return {
    name,
    framework: detectFramework(deps),
    deps,
    hasReact: deps.some((d) => d === "react"),
    hasNext:  deps.some((d) => d === "next"),
    hasVite:  deps.some((d) => d === "vite"),
  };
}

function detectFramework(deps) {
  if (deps.includes("next")) return "next";
  if (deps.includes("vite")) return "vite-react";
  if (deps.includes("react")) return "react";
  if (deps.includes("vue")) return "vue";
  return "unknown";
}

// ---------- READ-ONLY SOURCE BROWSER ----------
function safeJoin(root, rel) {
  const abs = path.resolve(root, rel || "");
  const r = path.resolve(root);
  if (!abs.startsWith(r)) throw new Error("Path escapes root");
  return abs;
}

app.get("/source/:id/list", async (req, res) => {
  try {
    const root = path.join(SOURCES_DIR, req.params.id);
    const rel  = String(req.query.path || "");
    const dir = safeJoin(root, rel);
    const entries = await fs.readdir(dir, { withFileTypes: true });
    const items = entries
      .filter((e) => !e.name.startsWith(".") && e.name !== "node_modules")
      .map((e) => ({ name: e.name, isDir: e.isDirectory(), path: path.posix.join(rel.replaceAll("\\", "/"), e.name) }))
      .sort((a, b) => (a.isDir === b.isDir ? a.name.localeCompare(b.name) : a.isDir ? -1 : 1));
    res.json({ root, path: rel, items });
  } catch (e) { res.status(400).json({ error: e.message }); }
});

app.get("/source/:id/read", async (req, res) => {
  try {
    const root = path.join(SOURCES_DIR, req.params.id);
    const rel  = String(req.query.path || "");
    const file = safeJoin(root, rel);
    const stat = await fs.stat(file);
    if (stat.size > 2 * 1024 * 1024) return res.status(413).json({ error: "File too large (>2MB)" });
    const content = await fs.readFile(file, "utf8");
    res.json({ root, path: rel, content, size: stat.size });
  } catch (e) { res.status(400).json({ error: e.message }); }
});

// ---------- NATIVE KOTLIN BUILD ----------
// Spec sent by frontend after AI generates Kotlin files.
// {
//   appName, packageName, versionName, versionCode, themeColor,
//   minSdk, targetSdk, permissions: [...],
//   files: [ { path: "app/src/main/java/com/x/MainActivity.kt", content: "..." }, ... ],
//   gradleDeps: ["androidx.compose.material3:material3:1.2.1", ...]
// }

app.post("/build", (req, res) => {
  const cfg = req.body;
  if (!cfg?.packageName || !cfg?.appName) {
    return res.status(400).json({ error: "appName and packageName required" });
  }
  const jobId = nanoid(10);
  jobs.set(jobId, { status: "running", logs: [], progress: 5, startedAt: Date.now() });
  runNativeBuild(jobId, cfg).catch((err) => {
    const job = jobs.get(jobId);
    if (job) {
      job.status = "error";
      job.error = err?.message ?? String(err);
      job.logs.push(`💥 ${job.error}`);
    }
  });
  res.json({ jobId });
});

app.get("/build/:id", (req, res) => {
  const job = jobs.get(req.params.id);
  if (!job) return res.status(404).json({ error: "Job not found" });
  const out = { status: job.status, progress: job.progress, logs: job.logs, error: job.error };
  if (job.status === "done") out.apkUrl = `/apk/${req.params.id}`;
  res.json(out);
});

app.get("/apk/:id", (req, res) => {
  const job = jobs.get(req.params.id);
  if (!job?.apkPath || !fs.existsSync(job.apkPath)) return res.status(404).send("APK not found");
  res.download(job.apkPath);
});

app.listen(PORT, () => {
  console.log(`\n🔨 APKForge NATIVE build server: http://localhost:${PORT}`);
  console.log(`   Mode: Native Kotlin + Jetpack Compose (NO Capacitor)`);
  console.log(`   Projects: ${PROJECTS_DIR}`);
  console.log(`   Sources:  ${SOURCES_DIR}`);
  console.log(`   JAVA_HOME: ${process.env.JAVA_HOME || "(not set!)"}`);
  console.log(`   ANDROID_HOME: ${process.env.ANDROID_HOME || process.env.ANDROID_SDK_ROOT || "(not set!)"}\n`);
});

// ---------- NATIVE BUILD PIPELINE ----------

async function runNativeBuild(jobId, cfg) {
  const job = jobs.get(jobId);
  const log = (line) => {
    job.logs.push(line);
    if (job.logs.length > 800) job.logs.splice(0, job.logs.length - 800);
  };
  const setProgress = (p) => { job.progress = p; };

  const projectDir = path.join(PROJECTS_DIR, sanitizeId(cfg.packageName));
  log(`📁 Native project: ${projectDir}`);
  setProgress(10);

  await scaffoldNativeProject(projectDir, cfg, log);
  setProgress(30);

  // Write AI-generated files (they overwrite scaffold defaults where they overlap)
  if (Array.isArray(cfg.files)) {
    for (const f of cfg.files) {
      if (!f?.path || typeof f.content !== "string") continue;
      const dest = safeJoin(projectDir, f.path);
      await fs.ensureDir(path.dirname(dest));
      await fs.writeFile(dest, f.content, "utf8");
      log(`✏️  wrote ${f.path}`);
    }
  }
  setProgress(45);

  log(`🏗  Running: ./gradlew assembleDebug`);
  await runCmd("./gradlew", ["assembleDebug", "--no-daemon"], projectDir, log);
  setProgress(95);

  const apkDir = path.join(projectDir, "app", "build", "outputs", "apk", "debug");
  const files = await fs.readdir(apkDir).catch(() => []);
  const apkFile = files.find((f) => f.endsWith(".apk"));
  if (!apkFile) throw new Error(`APK not found in ${apkDir}`);

  const finalName = `${slug(cfg.appName)}-v${cfg.versionName || "1.0"}-debug.apk`;
  const finalPath = path.join(OUTPUTS_DIR, `${jobId}-${finalName}`);
  await fs.copy(path.join(apkDir, apkFile), finalPath);

  job.apkPath = finalPath;
  job.status = "done";
  setProgress(100);
  log(`✅ Native APK ready: ${finalName}`);
}

function runCmd(cmd, args, cwd, log) {
  return new Promise((resolve, reject) => {
    log(`$ ${cmd} ${args.join(" ")}`);
    const child = spawn(cmd, args, { cwd, env: process.env, shell: false });
    child.stdout.on("data", (d) => d.toString().split("\n").filter(Boolean).forEach((l) => log(l)));
    child.stderr.on("data", (d) => d.toString().split("\n").filter(Boolean).forEach((l) => log(l)));
    child.on("error", reject);
    child.on("close", (code) => (code === 0 ? resolve() : reject(new Error(`${cmd} exited ${code}`))));
  });
}

// ---------- NATIVE ANDROID PROJECT SCAFFOLD ----------
// Creates a minimal valid Android Studio project (Kotlin DSL + Compose).
// AI-generated Kotlin files get overlaid on top via cfg.files[].

async function scaffoldNativeProject(dir, cfg, log) {
  const pkg = cfg.packageName;
  const pkgPath = pkg.replaceAll(".", "/");
  const appName = cfg.appName;
  const versionName = cfg.versionName || "1.0.0";
  const versionCode = cfg.versionCode || 1;
  const minSdk = cfg.minSdk || 24;
  const targetSdk = cfg.targetSdk || 34;
  const themeColor = (cfg.themeColor || "#22c55e").replace("#", "");
  const perms = Array.isArray(cfg.permissions) ? cfg.permissions : ["android.permission.INTERNET"];
  const extraDeps = Array.isArray(cfg.gradleDeps) ? cfg.gradleDeps : [];

  await fs.ensureDir(dir);
  log("🆕 Scaffolding native Android Studio project…");

  // settings.gradle.kts
  await fs.writeFile(path.join(dir, "settings.gradle.kts"), `pluginManagement {
    repositories { google(); mavenCentral(); gradlePluginPortal() }
}
dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)
    repositories { google(); mavenCentral() }
}
rootProject.name = "${appName.replace(/"/g, "")}"
include(":app")
`, "utf8");

  // root build.gradle.kts
  await fs.writeFile(path.join(dir, "build.gradle.kts"), `plugins {
    id("com.android.application") version "8.2.2" apply false
    id("org.jetbrains.kotlin.android") version "1.9.22" apply false
}
`, "utf8");

  // gradle.properties
  await fs.writeFile(path.join(dir, "gradle.properties"), `org.gradle.jvmargs=-Xmx2048m -Dfile.encoding=UTF-8
android.useAndroidX=true
kotlin.code.style=official
android.nonTransitiveRClass=true
`, "utf8");

  // gradle wrapper (use system gradle to generate, OR write wrapper jar by hand-shaped script)
  // Simpler: rely on system gradle once to bootstrap wrapper
  if (!await fs.pathExists(path.join(dir, "gradlew"))) {
    try {
      log("⚙️  Generating gradle wrapper…");
      await runCmd("gradle", ["wrapper", "--gradle-version", "8.5"], dir, log);
    } catch {
      log("⚠️  `gradle` CLI not found — install with `brew install gradle`. Skipping wrapper for now.");
    }
  }

  // app/build.gradle.kts
  await fs.ensureDir(path.join(dir, "app"));
  await fs.writeFile(path.join(dir, "app/build.gradle.kts"), `plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
}

android {
    namespace = "${pkg}"
    compileSdk = ${targetSdk}

    defaultConfig {
        applicationId = "${pkg}"
        minSdk = ${minSdk}
        targetSdk = ${targetSdk}
        versionCode = ${versionCode}
        versionName = "${versionName}"
    }

    buildTypes {
        release { isMinifyEnabled = false }
    }
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
    kotlinOptions { jvmTarget = "17" }
    buildFeatures { compose = true }
    composeOptions { kotlinCompilerExtensionVersion = "1.5.8" }
}

dependencies {
    implementation("androidx.core:core-ktx:1.12.0")
    implementation("androidx.lifecycle:lifecycle-runtime-ktx:2.7.0")
    implementation("androidx.activity:activity-compose:1.8.2")
    implementation(platform("androidx.compose:compose-bom:2024.02.00"))
    implementation("androidx.compose.ui:ui")
    implementation("androidx.compose.ui:ui-graphics")
    implementation("androidx.compose.ui:ui-tooling-preview")
    implementation("androidx.compose.material3:material3")
    implementation("androidx.navigation:navigation-compose:2.7.6")
    implementation("com.squareup.retrofit2:retrofit:2.9.0")
    implementation("com.squareup.retrofit2:converter-gson:2.9.0")
${extraDeps.map((d) => `    implementation("${d}")`).join("\n")}
}
`, "utf8");

  // AndroidManifest.xml
  const mainDir = path.join(dir, "app/src/main");
  await fs.ensureDir(mainDir);
  const permsXml = perms.map((p) => `    <uses-permission android:name="${p}" />`).join("\n");
  await fs.writeFile(path.join(mainDir, "AndroidManifest.xml"), `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android">
${permsXml}
    <application
        android:allowBackup="true"
        android:label="${appName}"
        android:icon="@mipmap/ic_launcher"
        android:roundIcon="@mipmap/ic_launcher"
        android:theme="@style/Theme.App">
        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:theme="@style/Theme.App">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>
</manifest>
`, "utf8");

  // MainActivity.kt (default — AI overrides via cfg.files if it generates one)
  const javaDir = path.join(mainDir, "java", pkgPath);
  await fs.ensureDir(javaDir);
  await fs.writeFile(path.join(javaDir, "MainActivity.kt"), `package ${pkg}

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            MaterialTheme {
                Surface(modifier = Modifier.fillMaxSize()) {
                    Column(
                        modifier = Modifier.fillMaxSize().padding(24.dp),
                        verticalArrangement = Arrangement.Center,
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        Text(text = "${appName}", style = MaterialTheme.typography.headlineMedium)
                        Spacer(Modifier.height(8.dp))
                        Text(text = "Native Android app — generated by APKForge")
                    }
                }
            }
        }
    }
}
`, "utf8");

  // res / values / strings.xml + themes.xml + colors.xml
  const valuesDir = path.join(mainDir, "res/values");
  await fs.ensureDir(valuesDir);
  await fs.writeFile(path.join(valuesDir, "strings.xml"), `<resources>
    <string name="app_name">${escapeXml(appName)}</string>
</resources>
`, "utf8");
  await fs.writeFile(path.join(valuesDir, "colors.xml"), `<resources>
    <color name="primary">#${themeColor}</color>
</resources>
`, "utf8");
  await fs.writeFile(path.join(valuesDir, "themes.xml"), `<resources>
    <style name="Theme.App" parent="android:Theme.Material.Light.NoActionBar" />
</resources>
`, "utf8");

  // Icon (default — AI can override)
  if (cfg.iconDataUrl) await writeIcon(dir, cfg.iconDataUrl, log);
}

async function writeIcon(dir, dataUrl, log) {
  const m = dataUrl.match(/^data:image\/[a-z]+;base64,(.+)$/);
  if (!m) return;
  const buf = Buffer.from(m[1], "base64");
  for (const d of ["mdpi", "hdpi", "xhdpi", "xxhdpi", "xxxhdpi"]) {
    const p = path.join(dir, "app/src/main/res", `mipmap-${d}`, "ic_launcher.png");
    await fs.ensureDir(path.dirname(p));
    await fs.writeFile(p, buf);
    await fs.writeFile(path.join(path.dirname(p), "ic_launcher_round.png"), buf);
  }
  log(`🖼  App icon written to all mipmap densities`);
}

// ---------- helpers ----------
function sanitizeId(s) { return String(s).replace(/[^a-zA-Z0-9._-]/g, "_"); }
function slug(s) { return String(s).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "app"; }
function escapeXml(s) { return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;" }[c])); }
