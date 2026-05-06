// APKForge — Local Build Server
// Runs on your Mac. Receives app config from the web UI, scaffolds a Capacitor
// Android project on disk, runs `./gradlew assembleDebug` (or assembleRelease),
// and serves the resulting .apk back as a download.
//
// Usage:  cd server && npm install && node index.js
// Default port: 5174

import express from "express";
import cors from "cors";
import fs from "fs-extra";
import path from "path";
import os from "os";
import { spawn } from "child_process";
import { nanoid } from "nanoid";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 5174;
const ROOT = path.join(os.homedir(), ".apkforge");
const PROJECTS_DIR = path.join(ROOT, "projects");
const OUTPUTS_DIR = path.join(ROOT, "outputs");
fs.ensureDirSync(PROJECTS_DIR);
fs.ensureDirSync(OUTPUTS_DIR);

const app = express();
app.use(cors());
app.use(express.json({ limit: "20mb" }));

const jobs = new Map(); // jobId -> { status, logs, progress, error?, apkPath? }

app.get("/health", (_, res) => {
  res.json({
    ok: true,
    version: "0.1.0",
    javaHome: process.env.JAVA_HOME || null,
    androidHome: process.env.ANDROID_HOME || process.env.ANDROID_SDK_ROOT || null,
    projectsDir: PROJECTS_DIR,
  });
});

app.post("/build", (req, res) => {
  const cfg = req.body;
  if (!cfg?.packageName || !cfg?.appName) {
    return res.status(400).json({ error: "appName and packageName are required" });
  }
  const jobId = nanoid(10);
  jobs.set(jobId, { status: "running", logs: [], progress: 5, startedAt: Date.now() });
  // run async
  runBuild(jobId, cfg).catch((err) => {
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
  const out = {
    status: job.status,
    progress: job.progress,
    logs: job.logs,
    error: job.error,
  };
  if (job.status === "done") out.apkUrl = `/apk/${req.params.id}`;
  res.json(out);
});

app.get("/apk/:id", (req, res) => {
  const job = jobs.get(req.params.id);
  if (!job?.apkPath || !fs.existsSync(job.apkPath)) return res.status(404).send("APK not found");
  res.download(job.apkPath);
});

app.listen(PORT, () => {
  console.log(`\n🔨 APKForge build server: http://localhost:${PORT}`);
  console.log(`   Projects: ${PROJECTS_DIR}`);
  console.log(`   JAVA_HOME: ${process.env.JAVA_HOME || "(not set!)"}`);
  console.log(`   ANDROID_HOME: ${process.env.ANDROID_HOME || process.env.ANDROID_SDK_ROOT || "(not set!)"}\n`);
});

// ---------- BUILD PIPELINE ----------

async function runBuild(jobId, cfg) {
  const job = jobs.get(jobId);
  const log = (line) => {
    job.logs.push(line);
    if (job.logs.length > 500) job.logs.splice(0, job.logs.length - 500);
  };
  const setProgress = (p) => { job.progress = p; };

  const projectDir = path.join(PROJECTS_DIR, sanitizeId(cfg.packageName));

  log(`📁 Project dir: ${projectDir}`);
  setProgress(10);

  await scaffoldCapacitorProject(projectDir, cfg, log);
  setProgress(30);

  await runCmd("npm", ["install", "--no-audit", "--no-fund"], projectDir, log);
  setProgress(45);

  log("⚡ Running: npx cap sync android");
  await runCmd("npx", ["cap", "sync", "android"], projectDir, log);
  setProgress(60);

  const androidDir = path.join(projectDir, "android");
  const gradleTask = cfg.buildType === "release" ? "assembleRelease" : "assembleDebug";
  log(`🏗  Running: ./gradlew ${gradleTask}`);
  await runCmd("./gradlew", [gradleTask, "--no-daemon"], androidDir, log);
  setProgress(95);

  // locate APK
  const apkDir = path.join(androidDir, "app", "build", "outputs", "apk", cfg.buildType);
  const files = await fs.readdir(apkDir).catch(() => []);
  const apkFile = files.find(f => f.endsWith(".apk"));
  if (!apkFile) throw new Error(`APK not found in ${apkDir}`);

  const finalName = `${slug(cfg.appName)}-v${cfg.versionName || "1.0"}-${cfg.buildType}.apk`;
  const finalPath = path.join(OUTPUTS_DIR, `${jobId}-${finalName}`);
  await fs.copy(path.join(apkDir, apkFile), finalPath);

  job.apkPath = finalPath;
  job.status = "done";
  setProgress(100);
  log(`✅ APK ready: ${finalName}`);
}

function runCmd(cmd, args, cwd, log) {
  return new Promise((resolve, reject) => {
    log(`$ ${cmd} ${args.join(" ")}`);
    const child = spawn(cmd, args, { cwd, env: process.env, shell: false });
    child.stdout.on("data", (d) => d.toString().split("\n").filter(Boolean).forEach(l => log(l)));
    child.stderr.on("data", (d) => d.toString().split("\n").filter(Boolean).forEach(l => log(l)));
    child.on("error", reject);
    child.on("close", (code) => code === 0 ? resolve() : reject(new Error(`${cmd} exited with code ${code}`)));
  });
}

// ---------- CAPACITOR SCAFFOLD ----------

async function scaffoldCapacitorProject(dir, cfg, log) {
  const fresh = !fs.existsSync(path.join(dir, "package.json"));
  await fs.ensureDir(dir);
  await fs.ensureDir(path.join(dir, "www"));

  // package.json
  const pkg = {
    name: slug(cfg.appName),
    version: cfg.versionName || "1.0.0",
    private: true,
    dependencies: {
      "@capacitor/core": "^6.1.2",
      "@capacitor/android": "^6.1.2",
      ...(cfg.permissions?.camera ? { "@capacitor/camera": "^6.0.2" } : {}),
      ...(cfg.permissions?.location ? { "@capacitor/geolocation": "^6.0.1" } : {}),
      ...(cfg.permissions?.notifications ? { "@capacitor/push-notifications": "^6.0.2" } : {}),
    },
    devDependencies: {
      "@capacitor/cli": "^6.1.2",
    },
  };
  await fs.writeJson(path.join(dir, "package.json"), pkg, { spaces: 2 });

  // capacitor.config.json
  const capConfig = {
    appId: cfg.packageName,
    appName: cfg.appName,
    webDir: "www",
    bundledWebRuntime: false,
    ...(cfg.sourceType === "url" ? { server: { url: cfg.url, cleartext: true } } : {}),
    android: {
      backgroundColor: cfg.bgColor || "#0f172a",
    },
  };
  await fs.writeJson(path.join(dir, "capacitor.config.json"), capConfig, { spaces: 2 });

  // www/index.html
  if (cfg.sourceType === "html") {
    await fs.writeFile(path.join(dir, "www", "index.html"), cfg.html, "utf8");
  } else {
    await fs.writeFile(
      path.join(dir, "www", "index.html"),
      `<!doctype html><meta charset="utf-8"><title>${escapeHtml(cfg.appName)}</title><body style="font-family:sans-serif;display:grid;place-items:center;height:100vh;margin:0;background:${cfg.bgColor};color:#fff"><p>Loading…</p></body>`,
      "utf8"
    );
  }

  if (fresh) {
    log("🆕 New project — initializing Android platform…");
    await runCmd("npm", ["install", "--no-audit", "--no-fund"], dir, log);
    await runCmd("npx", ["cap", "add", "android"], dir, log);
  }

  // Patch AndroidManifest with permissions
  await patchManifest(dir, cfg, log);

  // Patch icon if provided
  if (cfg.iconDataUrl) {
    await writeIcon(dir, cfg.iconDataUrl, log);
  }

  // Patch strings.xml with the app name
  await patchAppName(dir, cfg);

  // Patch versions in build.gradle
  await patchVersions(dir, cfg);
}

async function patchManifest(dir, cfg, log) {
  const file = path.join(dir, "android", "app", "src", "main", "AndroidManifest.xml");
  if (!await fs.pathExists(file)) return;
  let xml = await fs.readFile(file, "utf8");

  const perms = [];
  if (cfg.permissions?.internet) perms.push("android.permission.INTERNET");
  if (cfg.permissions?.camera) perms.push("android.permission.CAMERA");
  if (cfg.permissions?.location) perms.push("android.permission.ACCESS_FINE_LOCATION", "android.permission.ACCESS_COARSE_LOCATION");
  if (cfg.permissions?.notifications) perms.push("android.permission.POST_NOTIFICATIONS");
  if (cfg.permissions?.storage) perms.push("android.permission.READ_EXTERNAL_STORAGE", "android.permission.WRITE_EXTERNAL_STORAGE");

  // strip existing uses-permission lines we manage
  xml = xml.replace(/\s*<uses-permission[^/]*\/>/g, "");
  const block = perms.map(p => `    <uses-permission android:name="${p}" />`).join("\n");
  xml = xml.replace("<manifest", `<!-- apkforge: permissions -->\n<manifest`)
           .replace(/(<manifest[^>]*>)/, `$1\n${block}`);
  await fs.writeFile(file, xml, "utf8");
  log(`🔐 Manifest updated with ${perms.length} permission(s)`);
}

async function patchAppName(dir, cfg) {
  const file = path.join(dir, "android", "app", "src", "main", "res", "values", "strings.xml");
  if (!await fs.pathExists(file)) return;
  let xml = await fs.readFile(file, "utf8");
  xml = xml.replace(/<string name="app_name">[^<]*<\/string>/, `<string name="app_name">${escapeHtml(cfg.appName)}</string>`);
  xml = xml.replace(/<string name="title_activity_main">[^<]*<\/string>/, `<string name="title_activity_main">${escapeHtml(cfg.appName)}</string>`);
  await fs.writeFile(file, xml, "utf8");
}

async function patchVersions(dir, cfg) {
  const file = path.join(dir, "android", "app", "build.gradle");
  if (!await fs.pathExists(file)) return;
  let g = await fs.readFile(file, "utf8");
  g = g.replace(/versionCode \d+/, `versionCode ${cfg.versionCode || 1}`);
  g = g.replace(/versionName "[^"]*"/, `versionName "${cfg.versionName || "1.0.0"}"`);
  await fs.writeFile(file, g, "utf8");
}

async function writeIcon(dir, dataUrl, log) {
  const m = dataUrl.match(/^data:image\/[a-z]+;base64,(.+)$/);
  if (!m) return;
  const buf = Buffer.from(m[1], "base64");
  // For simplicity write the same icon to all mipmap densities. Production
  // builders should resize per-density; we keep it simple and rely on Android
  // to scale.
  const densities = ["mdpi", "hdpi", "xhdpi", "xxhdpi", "xxxhdpi"];
  for (const d of densities) {
    const p = path.join(dir, "android", "app", "src", "main", "res", `mipmap-${d}`, "ic_launcher.png");
    await fs.ensureDir(path.dirname(p));
    await fs.writeFile(p, buf);
    const round = path.join(dir, "android", "app", "src", "main", "res", `mipmap-${d}`, "ic_launcher_round.png");
    await fs.writeFile(round, buf);
  }
  log(`🖼  App icon written to all mipmap densities`);
}

// ---------- helpers ----------
function sanitizeId(s) { return String(s).replace(/[^a-zA-Z0-9._-]/g, "_"); }
function slug(s) { return String(s).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "app"; }
function escapeHtml(s) { return String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])); }
