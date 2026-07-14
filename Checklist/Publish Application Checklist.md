---
title: Publish Application Checklist
description: Here is the comprehensive pre-launch checklist translated into English, organized logically, and enhanced with a few crucial additional steps (marked as **[NEW]**) that professionals always verify before pushing an app to production.
---
## 🚀 Pre-Launch Checklist for HMR App & Infrastructure

### 1. Flutter App & UI/UX Optimization

* [ ] **Build App Bundle (AAB):** Generate an `.aab` file instead of `.apk` to reduce app size, which is highly recommended for Cafe Bazaar and Google Play.
* [ ] **Code Obfuscation:** Run the build command with `--obfuscate` and `--split-debug-info` flags to prevent reverse engineering.
* [ ] **Keyboard Handling:** Ensure `resizeToAvoidBottomInset: true` is set in the `Scaffold` so the keyboard doesn't overlap chat messages.
* [ ] **Memory Management:** Close all `StreamController`s and animations in the `dispose` method to prevent memory leaks and battery drain.
* [ ] **Local Caching:** Implement local storage (using Hive, Sqflite, or SharedPreferences) to cache chat history so users don't wait for server loads upon opening the app.
* [ ] **[NEW] App Icon & Splash Screen:** Verify that high-resolution launcher icons and a seamless splash screen are properly configured for all Android versions.
* [ ] **[NEW] Dependency Audit:** Run `flutter pub outdated` and upgrade critical packages to patch known vulnerabilities before launch.

### 2. Security & API Protection

* [ ] **Environment Variables:** Remove all hardcoded API keys, Flowise endpoints, and sensitive data from Dart code. Use a `.env` file via `flutter_dotenv`.
* [ ] **Server-Side API Calls:** Ensure the Flutter app only handles user authentication tokens and sends requests to your VPS (`srv.hmrbot.com`), rather than calling OpenRouter/Flowise directly.
* [ ] **Keystore Management:** Securely backup your `key.jks` (Keystore) and passwords. Losing this means you can never publish an update to the app.
* [ ] **Permission Audit:** Review `android/app/src/main/AndroidManifest.xml` and strictly remove any unused permissions (e.g., camera, contacts) to avoid rejection by Cafe Bazaar.
* [ ] **[NEW] Rate Limiting:** Implement server-side rate limiting on your VPS to prevent malicious users from spamming the AI and draining your OpenRouter credits.

### 3. Authentication & Error Handling

* [ ] **Network Resiliency (Iran Context):** Wrap Firebase/Google Sign-In logic in robust `try-catch` blocks.
* [ ] **Localized Error Messages:** Provide clear Persian error messages for network timeouts (e.g., prompting the user to check their connection or VPN status).
* [ ] **Global Error Catching:** Override `FlutterError.onError` and `PlatformDispatcher.instance.onError` in `main.dart` to prevent the grey "Red Screen of Death" from showing to users.
* [ ] **Crash Reporting:** Integrate a crash reporting tool like **Sentry** (recommended for Iran) or Firebase Crashlytics to monitor live app crashes.

### 4. Infrastructure, Monitoring & Backups

* [ ] **VPS Resource Monitoring:** Install tools like **Netdata** or Prometheus+Grafana to monitor CPU and RAM usage on your Ubuntu server, ensuring Flowise and Docker don't crash from out-of-memory errors.
* [ ] **LLM Prompt Logging:** Set up an observability tool (like **Langfuse**) to monitor AI responses, user prompts, latency, and OpenRouter API costs.
* [ ] **Automated Backups (3-2-1 Rule):** Create a Cronjob on the VPS to zip Docker volumes (Flowise DB/configs) and automatically upload them to a secondary, external cloud storage (using Rclone or BorgBackup).
* [ ] **Uptime Checks:** Ensure UptimeRobot is correctly monitoring both the landing page (`hmrbot.com`) and the API health endpoints (`srv.hmrbot.com`).

### 5. Deployment & Documentation

* [ ] **CI/CD Pipeline:** Set up **GitHub Actions** to automate Flutter builds and testing whenever code is pushed to the `main` branch.
* [ ] **Developer Documentation (SOP):** Write a comprehensive `README.md` or GitHub Wiki containing:
* Architecture diagram
* Local setup instructions (`docker-compose up`, `flutter run`)
* Required `.env` variables template
* Emergency Runbook (steps to restart the server or fix API outages)


* [ ] **Privacy Policy & Disclaimer Link:** Ensure the `/privacy` and `/disclaimer` URLs are live on your website and correctly submitted to the Cafe Bazaar developer console.
* [ ] **[NEW] Analytics Setup:** Integrate basic event tracking (e.g., PostHog or Firebase Analytics) to understand user retention and which hardware topics are most frequently searched.
      
---
# AI Chatbot (Flutter + FlowiseAI + Astro + CodeFlutter) Pre-Release Guide

---

# Checklist for Pre-Release Tasks

---

# 1. Architecture & Infrastructure

* [ ] Production server is provisioned.
* [ ] Docker installed.
* [ ] Docker Compose configured.
* [ ] FlowiseAI runs successfully in production.
* [ ] Database persistence configured.
* [ ] Volumes configured for Flowise data.
* [ ] Automatic server restart enabled.
* [ ] HTTPS enabled.
* [ ] Reverse proxy configured (Nginx or Caddy).
* [ ] Cloudflare DNS configured.
* [ ] Cloudflare SSL mode set correctly.
* [ ] Firewall configured.
* [ ] Only required ports exposed.
* [ ] SSH secured.
* [ ] Automatic OS security updates enabled.
* [ ] Backup strategy implemented.

---

# 2. FlowiseAI

## Chatflows

* [ ] All chatflows exported.
* [ ] Chatflows stored in Git.
* [ ] Production chatflows imported.
* [ ] Version history documented.

## API

* [ ] Production API endpoint configured.
* [ ] API keys rotated.
* [ ] Rate limits configured.
* [ ] Authentication enabled.
* [ ] API responses validated.
* [ ] Error responses tested.

## Models

* [ ] LLM selected.
* [ ] Context window verified.
* [ ] Temperature reviewed.
* [ ] Max Tokens optimized.
* [ ] Streaming enabled.
* [ ] Fallback model configured.

## Memory

* [ ] Conversation memory tested.
* [ ] Session expiration verified.
* [ ] Token usage optimized.

## Vector Database

* [ ] Embeddings generated.
* [ ] Documents indexed.
* [ ] Retrieval accuracy tested.
* [ ] Metadata filtering tested.

---

# 3. Flutter Application

## Build

* [ ] Release mode builds successfully.
* [ ] No debug logs.
* [ ] Tree shaking enabled.
* [ ] Obfuscation enabled if required.
* [ ] Split APK/App Bundle configured.

## Environment

* [ ] Production API URL.
* [ ] Production keys.
* [ ] Environment variables separated.
* [ ] Secrets not stored in repository.

## UI

* [ ] Responsive layouts.
* [ ] Dark Mode tested.
* [ ] Light Mode tested.
* [ ] Tablet layout.
* [ ] Desktop layout.
* [ ] Web layout.
* [ ] Foldable devices tested.

## Performance

* [ ] Startup time optimized.
* [ ] Image caching.
* [ ] Lazy loading.
* [ ] Network caching.
* [ ] Minimize rebuilds.
* [ ] Remove unused assets.

## Localization

* [ ] All translations complete.
* [ ] RTL tested.
* [ ] Font rendering verified.
* [ ] Date/time localization.

---

# 4. Chat Experience

* [ ] Typing animation.
* [ ] Streaming response tested.
* [ ] Markdown rendering.
* [ ] Code blocks.
* [ ] Tables.
* [ ] Copy button.
* [ ] Regenerate response.
* [ ] Stop generation.
* [ ] Retry message.
* [ ] Message editing.
* [ ] Conversation history.
* [ ] Search conversations.
* [ ] Delete conversation.
* [ ] Clear chat.

---

# 5. Flutter Web (Astro + CodeFlutter)

* [ ] Astro production build.
* [ ] Static assets compressed.
* [ ] Route handling.
* [ ] SEO metadata.
* [ ] robots.txt.
* [ ] sitemap.xml.
* [ ] Open Graph tags.
* [ ] favicon.
* [ ] PWA manifest.
* [ ] Service Worker.
* [ ] Browser compatibility.
* [ ] Mobile browser testing.

---

# 6. Authentication

* [ ] Login.
* [ ] Registration.
* [ ] Password reset.
* [ ] Email verification.
* [ ] OAuth tested.
* [ ] Session expiration.
* [ ] Token refresh.
* [ ] Logout.

---

# 7. Security

* [ ] HTTPS only.
* [ ] CSP headers.
* [ ] HSTS.
* [ ] XSS protection.
* [ ] CSRF protection.
* [ ] SQL Injection prevention.
* [ ] Prompt Injection tests.
* [ ] Rate limiting.
* [ ] IP throttling.
* [ ] Input validation.
* [ ] Output sanitization.
* [ ] API key protection.

---

# 8. Performance Testing

* [ ] Cold start measured.
* [ ] Hot reload not included in release.
* [ ] Memory leaks checked.
* [ ] CPU profiling.
* [ ] Frame drops.
* [ ] GPU rendering.
* [ ] Network latency tested.
* [ ] Large conversations tested.
* [ ] Multiple concurrent users tested.

---

# 9. AI Quality Assurance

* [ ] Hallucination testing.
* [ ] Prompt Injection testing.
* [ ] Jailbreak attempts.
* [ ] Toxicity testing.
* [ ] Sensitive content testing.
* [ ] Empty prompt.
* [ ] Long prompt.
* [ ] Invalid prompt.
* [ ] Unicode input.
* [ ] Emoji input.
* [ ] Large file uploads.
* [ ] Markdown formatting.

---

# 10. Analytics

* [ ] Firebase Analytics.
* [ ] Crashlytics.
* [ ] User sessions.
* [ ] Custom events.
* [ ] AI latency metrics.
* [ ] Token usage.
* [ ] API usage.
* [ ] Daily Active Users.
* [ ] Retention.

---

# 11. Monitoring

* [ ] Server monitoring.
* [ ] Docker monitoring.
* [ ] CPU alerts.
* [ ] RAM alerts.
* [ ] Disk alerts.
* [ ] SSL expiration alerts.
* [ ] Uptime monitoring.
* [ ] API monitoring.
* [ ] Flowise health check.

---

# 12. Logging

* [ ] Structured logs.
* [ ] Request logs.
* [ ] Error logs.
* [ ] AI response logs (without sensitive content).
* [ ] Docker logs.
* [ ] Nginx logs.
* [ ] Cloudflare logs.

---

# 13. Store Release

## Android

* [ ] App Bundle (.aab)
* [ ] Release keystore.
* [ ] Version Code.
* [ ] Version Name.
* [ ] App Icon.
* [ ] Adaptive Icon.
* [ ] Splash Screen.
* [ ] Feature Graphic.
* [ ] Screenshots.
* [ ] Privacy Policy.
* [ ] Terms of Service.
* [ ] Data Safety Form.
* [ ] Content Rating.

## iOS

* [ ] Archive build.
* [ ] Certificates.
* [ ] Provisioning profile.
* [ ] Privacy Manifest.
* [ ] Screenshots.
* [ ] App Store description.
* [ ] App Review notes.

---

# 14. Documentation

* [ ] README updated.
* [ ] API documentation.
* [ ] Deployment guide.
* [ ] Backup guide.
* [ ] Disaster recovery guide.
* [ ] Environment variables documented.
* [ ] Release notes.
* [ ] Changelog.

---

# 15. Final Go-Live Checklist

* [ ] Smoke test completed.
* [ ] Production database backed up.
* [ ] Rollback plan ready.
* [ ] Monitoring enabled.
* [ ] DNS verified.
* [ ] SSL verified.
* [ ] API tested.
* [ ] Payment system tested (if applicable).
* [ ] Team notified.
* [ ] Launch approved.

---

# Useful Tools

| Tool                    | Purpose                                  |
| ----------------------- | ---------------------------------------- |
| Flutter DevTools        | Performance profiling, memory, rendering |
| Dart DevTools           | Debugging                                |
| Android Studio Profiler | CPU and memory analysis                  |
| Chrome DevTools         | Flutter Web debugging                    |
| Postman                 | API testing                              |
| Bruno                   | Offline API collections                  |
| Insomnia                | REST testing                             |
| Docker Desktop          | Container management                     |
| Docker Compose          | Multi-container deployment               |
| Portainer               | Docker web management                    |
| Nginx Proxy Manager     | Reverse proxy management                 |
| Caddy                   | Automatic HTTPS                          |
| Cloudflare              | DNS, CDN, DDoS protection                |
| Uptime Kuma             | Uptime monitoring                        |
| Grafana                 | Dashboards                               |
| Prometheus              | Metrics collection                       |
| Loki                    | Log aggregation                          |
| Sentry                  | Error monitoring                         |
| Firebase Crashlytics    | Mobile crash reporting                   |
| Firebase Analytics      | Usage analytics                          |
| Lighthouse              | Web performance and accessibility audits |
| OWASP ZAP               | Security testing                         |
| k6                      | Load testing                             |
| Apache JMeter           | Stress testing                           |
| GitHub Actions          | CI/CD                                    |
| Fastlane                | Android and iOS automation               |
| Dependabot              | Dependency updates                       |
| Renovate                | Automated dependency management          |
| Trivy                   | Docker image vulnerability scanning      |

---

# Cheat Sheet

## Flutter

```bash
flutter doctor

flutter clean

flutter pub get

flutter analyze

dart format .

flutter test

flutter build apk --release

flutter build appbundle

flutter build web

flutter build ios
```

---

## Dart

```bash
dart fix --apply

dart analyze
```

---

## Docker

```bash
docker ps

docker compose up -d

docker compose down

docker compose logs -f

docker restart flowise

docker stats

docker image prune -a
```

---

## Flowise

```bash
Export Chatflow

Import Chatflow

Backup Database

Rotate API Key

Health Check:
/api/v1/ping
```

---

## Git

```bash
git pull

git add .

git commit

git push

git tag v1.0.0
```

---

## Flutter Release

```text
Version Name:
1.0.0

Version Code:
1
```

---

## Android Signing

```properties
storePassword=*****
keyPassword=*****
keyAlias=release
storeFile=release.keystore
```

---

## Cloudflare

* SSL Mode: Full (Strict)
* Always Use HTTPS: Enabled
* HTTP/3: Enabled
* Brotli Compression: Enabled
* Auto Minify: Enabled
* Caching Rules configured for static assets
* DNS Proxy: Enabled
* Web Application Firewall (WAF): Enabled
* Rate Limiting configured for API endpoints

---

## Nginx

```nginx
proxy_set_header Host $host;
proxy_set_header X-Real-IP $remote_addr;
proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
proxy_set_header X-Forwarded-Proto https;
```

---

## Production Environment Variables

```env
API_URL=

FLOWISE_API_KEY=

OPENAI_API_KEY=

DATABASE_URL=

JWT_SECRET=

APP_ENV=production

LOG_LEVEL=info
```

---

## Performance Targets

| Metric                   | Target                               |
| ------------------------ | ------------------------------------ |
| App startup              | < 2 s                                |
| AI first token           | < 2 s                                |
| AI full response         | < 8 s                                |
| API latency              | < 300 ms (excluding model inference) |
| Memory usage             | < 250 MB                             |
| Crash-free sessions      | > 99.5%                              |
| Flutter frame rate       | 60 FPS                               |
| Lighthouse Performance   | > 90                                 |
| Lighthouse Accessibility | > 95                                 |
| Uptime                   | > 99.9%                              |

---

## Emergency Rollback

1. Stop new deployments.
2. Restore the previous Flowise chatflow export if needed.
3. Redeploy the last known-good Flutter web build.
4. Roll back the Docker image or container tag.
5. Restore the latest database backup if data corruption occurred.
6. Verify health endpoints and monitoring dashboards.
7. Re-enable traffic after smoke testing succeeds.

This checklist is tailored to a production stack using **Flutter**, **FlowiseAI**, **Astro**, and **CodeFlutter**, and covers infrastructure, AI behavior, security, quality assurance, deployment, and operational readiness.

---
Based on your stack (Flutter + FlowiseAI + Astro + CodeFlutter), here is a practical, technology-specific pre-release guide, tool list, and cheat sheet.

***

## Checklist for Pre-Release Tasks

### 1. Architecture & Integration Readiness

1. Confirm FlowiseAI API endpoints (chat, templates, variables) are documented and versioned.  
2. Ensure Astro frontend exposes a stable, documented API contract to Flutter (e.g., via CodeFlutter or a shared backend).  
3. Define authentication flow: tokens, refresh strategy, and role-based access for chatbot users.  
4. Verify CORS, rate limiting, and security headers for all public endpoints (Flowise, Astro, Flutter web).  
5. Validate environment configuration strategy: separate configs for dev/staging/prod, with secret injection via env vars.  

### 2. FlowiseAI Production Configuration

6. Run Flowise in **Queue mode** with at least 2 load-balanced main servers and 4 workers (as recommended for production). [docs.flowiseai](https://docs.flowiseai.com/configuration/running-in-production)
7. Configure persistent storage (database, object storage) for flows, templates, and chat history.  
8. Set up logging, monitoring, and alerting for Flowise (e.g., request latency, error rates, LLM timeouts). [deepwiki](https://deepwiki.com/FlowiseAI/Flowise/11-deployment-and-operations)
9. Enable HTTPS and configure domain routing for Flowise (e.g., via reverse proxy likenginx or cloud provider).  
10. Perform end-to-end API tests: send sample questions via `?ask=` and `?goal=` parameters and verify responses. [docs.flowiseai](https://docs.flowiseai.com/configuration/running-in-production)

### 3. Astro Web Frontend Checks

11. Set `site` and `base` in `astro.config.mjs` to match production URL and subpath. [devcraftly](https://www.devcraftly.com/astro/deployment-overview/)
12. Run `npm run build` and then `npm run preview` to validate the production build locally. [devcraftly](https://www.devcraftly.com/astro/deployment-overview/)
13. Ensure all dynamic routes that need server logic use `export const prerender = false` and have the correct adapter installed (e.g., `@astrojs/node`, `@astrojs/vercel`). [devcraftly](https://www.devcraftly.com/astro/deployment-overview/)
14. Verify that all API calls from Astro to Flowise use production URLs and proper auth headers.  
15. Test SEO artifacts: sitemaps, canonical tags, and RSS feeds use correct absolute URLs. [devcraftly](https://www.devcraftly.com/astro/deployment-overview/)

### 4. Flutter Web Application Checks

16. Run `flutter analyze` and fix all warnings/errors that could affect runtime behavior. [reddit](https://www.reddit.com/r/FlutterDev/comments/1re5jvy/my_flutter_prerelease_checklist_android_ios_after/)
17. Run `flutter test` and ensure all unit and widget tests pass. [reddit](https://www.reddit.com/r/FlutterDev/comments/1re5jvy/my_flutter_prerelease_checklist_android_ios_after/)
18. Build the app with `flutter build web --release` (or `--wasm` if using WebAssembly). [docs.flutter](https://docs.flutter.dev/deployment/web)
19. Validate the release build locally using a static server (e.g., `python3 -m http.server 8000`) and browse `/build/web`. [sangama.hashnode](https://sangama.hashnode.dev/chapter-13a-flutter-web-deployment-launching-your-app-on-the-web)
20. Test on multiple browsers (Chrome, Safari, Firefox, Edge) and devices (mobile, tablet, desktop). [sangama.hashnode](https://sangama.hashnode.dev/chapter-13a-flutter-web-deployment-launching-your-app-on-the-web)

### 5. CodeFlutter Deployment Configuration

21. Confirm CodeFlutter deployment target (e.g., Firebase, cloud provider) and that it points to the correct Flutter build directory (`build/web`).  
22. Verify CodeFlutter build command matches your stack (e.g., `flutter build web` before deploy).  
23. Test deep links and navigation: ensure the app opens correctly from terminated/background states and handles URL routes. [reddit](https://www.reddit.com/r/FlutterDev/comments/1re5jvy/my_flutter_prerelease_checklist_android_ios_after/)
24. Validate environment variable injection in CodeFlutter (e.g., Flowise API base URL, auth tokens).  
25. Confirm that deployment produces a signed, stable artifact and that rollback is possible.  

### 6. User Experience & Performance Testing

26. Simulate poor network conditions (2G/3G, timeouts, retries, offline states) and verify graceful handling. [reddit](https://www.reddit.com/r/FlutterDev/comments/1re5jvy/my_flutter_prerelease_checklist_android_ios_after/)
27. Review loading, error, and empty states on all critical screens (chat input, history, settings). [reddit](https://www.reddit.com/r/FlutterDev/comments/1re5jvy/my_flutter_prerelease_checklist_android_ios_after/)
28. Profile startup time and performance on a low-end device or slow network. [reddit](https://www.reddit.com/r/FlutterDev/comments/1re5jvy/my_flutter_prerelease_checklist_android_ios_after/)
29. Test text overflow, dynamic text sizes, and small-screen layouts. [reddit](https://www.reddit.com/r/FlutterDev/comments/1re5jvy/my_flutter_prerelease_checklist_android_ios_after/)
30. Run a final smoke test using the exact signed release build deployed to production. [reddit](https://www.reddit.com/r/FlutterDev/comments/1re5jvy/my_flutter_prerelease_checklist_android_ios_after/)

### 7. Compliance, Security & Analytics

31. Ensure privacy policy and terms of service are accessible in the app and web UI.  
32. Implement data retention and deletion policies for chat history and user data.  
33. Audit permissions flows: test denying and then granting permissions via settings. [reddit](https://www.reddit.com/r/FlutterDev/comments/1re5jvy/my_flutter_prerelease_checklist_android_ios_after/)
34. Enable analytics/error tracking (e.g., Sentry, Google Analytics) for Flutter and Astro.  
35. Run a security review: check for exposed secrets, insecure API calls, and missing headers.  

### 8. Operational & Launch Prep

36. Prepare release notes, versioning scheme, and changelog.  
37. Set up CI/CD pipelines (build → test → deploy) for Flutter, Astro, and Flowise.  
38. Define monitoring dashboards and alert rules for production (Flowise, Astro, Flutter web).  
39. Create a runbook for common incidents (API failures, high latency, auth issues).  
40. Schedule marketing announcement, support channels, and user onboarding flows.  

***

## Useful Tools

- **Flutter CLI**: Build, test, analyze, and run Flutter web apps.  
- **Flowise CLI / Docker**: Install and run Flowise locally or in production; use Docker Compose for orchestrated deployments. [docs.flowiseai](https://docs.flowiseai.com/getting-started)
- **Astro CLI (`npm run build`, `npm run preview`)**: Build and preview production Astro sites. [devcraftly](https://www.devcraftly.com/astro/deployment-overview/)
- **CodeFlutter**: Deployment tool configured to publish Flutter web builds to your chosen hosting platform.  
- **Firebase CLI**: Deploy Flutter web and Astro apps to Firebase Hosting with automatic builds. [docs.flutter](https://docs.flutter.dev/deployment/web)
- **Chrome DevTools / Flutter DevTools**: Debug performance, layout, and runtime issues in Flutter web and Astro. [docs.flutter](https://docs.flutter.dev/platform-integration/web/building)
- **Postman / HTTPie**: Test Flowise API endpoints and Astro APIs with custom headers and payloads.  
- **Sentry**: Error tracking and monitoring for Flutter and Astro applications.  
- **cypress / Playwright**: Browser-based integration tests for Astro and Flutter web UIs.  
- **ngrok / localtunnel**: Temporarily expose local Flowise/Astro/Flutter instances for external testing.  
- **linters & formatters**: `flutter_lints`, `eslint`, and Prettier for consistent code quality.  
- **GitHub Actions / GitLab CI**: CI/CD pipelines for automated builds, tests, and deployments.  

***

## Cheat Sheet

### Flutter Web Build & Run

- **Enable web support**:  
  `flutter config --enable-web`  
- **Run in Chrome**:  
  `flutter run -d chrome`  
- **Run with WebAssembly**:  
  `flutter run -d chrome --wasm`  
- **Build release**:  
  `flutter build web`  
- **Build release with WebAssembly**:  
  `flutter build web --wasm`  
- **Build profile (for performance)**:  
  `flutter build web --profile`  
- **Analyze code**:  
  `flutter analyze`  
- **Run tests**:  
  `flutter test`  

### Astro Build & Preview

- **Install adapter (example: Vercel)**:  
  `npx astro add vercel`  
- **Configure site & base**:  
  In `astro.config.mjs`:
  ```js
  export default defineConfig({
    site: "https://your-domain.com",
    base: "/subpath", // if not at domain root
  });
  ```
- **Build production**:  
  `npm run build`  
- **Preview production build**:  
  `npm run preview`  
- **Add dynamic route**:  
  In page component:
  ```js
  export const prerender = false;
  ```

### FlowiseAI Production & API

- **Start Flowise (npm)**:  
  `npx flowise start`  
- **Docker Compose**:  
  ```bash
  cd docker
  cp .env.example .env
  docker compose up -d
  ```  
- **Test chat API**:  
  ```bash
  curl "https://your-flowise-domain.com/api/v1/prediction/<flow-id>?ask=Hello&goal=Summarize"
  ```  
- **Queue mode (env)**:  
  Ensure `FLOWISE_QUEUE_MODE=true` and configure workers in production deployment. [docs.flowiseai](https://docs.flowiseai.com/configuration/running-in-production)

### CodeFlutter Deployment (Typical Flow)

- **Build Flutter web**:  
  `flutter build web`  
- **Deploy via CodeFlutter** (example):  
  `codeflutter deploy --target firebase --build-dir build/web`  
  *(adapt command to your actual CodeFlutter docs/config.)*  

### Testing & Debugging

- **throttle network in Chrome**:  
  DevTools → Network → Throttling → select “Slow 3G”.  
- **inspect Flutter widgets**:  
  Open DevTools: `flutter devtools` or via Chrome DevTools “Flutter” panel.  
- **lint Astro**:  
  `npm run lint` (or `eslint` if configured).  

### Common Env Variables

- **Flowise API base URL**:  
  `FLOWISE_API_BASE_URL=https://your-flowise-domain.com`  
- **Astro public env**:  
  `PUBLIC_FLOWISE_API_BASE_URL` (prefixed with `PUBLIC_` for client use). [devcraftly](https://www.devcraftly.com/astro/deployment-overview/)
- **Flutter env (via dart-define or JSON)**:  
  `FLUTTER_FLOWISE_API_BASE_URL` injected at build time.  

This checklist, tool list, and cheat sheet are specifically aligned with Flutter, FlowiseAI, Astro, and CodeFlutter, and can be reused as a reference for future releases.

----

 # Pre-Release Checklist & Guide: AI Chatbot App (Flutter + FlowiseAI + Astro + CodeFlutter)

---

## Checklist for Pre-Release Tasks

### I. Technical Readiness

#### 1. FlowiseAI Backend Validation
- [ ] **Verify chatbot flow logic** — Test all conversation branches, fallback intents, and edge cases in FlowiseAI
- [ ] **Validate API endpoints** — Confirm all REST API calls return expected JSON responses; test with Postman/Insomnia
- [ ] **Check rate limiting** — Ensure FlowiseAI instance handles expected concurrent user load
- [ ] **Test webhook integrations** — Verify external service connections (databases, third-party APIs) within FlowiseAI flows
- [ ] **Backup FlowiseAI configuration** — Export and version-control your flow JSON files
- [ ] **Environment variable security** — Confirm no hardcoded API keys; use `.env` files or secure vaults
- [ ] **Logging & monitoring setup** — Enable FlowiseAI logs; integrate with monitoring tool (e.g., Datadog, Sentry)

#### 2. Astro Web Integration (CodeFlutter)
- [ ] **Build Astro static site** — Run `npm run build` and verify no build errors
- [ ] **Optimize Astro output** — Check bundle size, remove unused components, enable image optimization
- [ ] **Test Astro-Flutter bridge** — Verify `CodeFlutter` integration correctly renders the Flutter web embed
- [ ] **Cross-browser testing** — Test Astro page on Chrome, Safari, Firefox, Edge (latest 2 versions)
- [ ] **Responsive design audit** — Confirm mobile, tablet, and desktop layouts render correctly
- [ ] **SEO meta tags** — Add Open Graph, Twitter Cards, and structured data for the chatbot landing page
- [ ] **Performance audit** — Run Lighthouse; target scores: Performance >90, Accessibility >95, SEO >90

#### 3. Flutter Application
- [ ] **Flutter version lock** — Pin Flutter SDK version in `pubspec.yaml` and document in README
- [ ] **Dependency audit** — Run `flutter pub outdated`; update critical packages; remove unused dependencies
- [ ] **State management review** — Verify no memory leaks in chat state (Provider/Riverpod/Bloc)
- [ ] **Chat UI polish** — Test message bubbles, typing indicators, error states, and empty states
- [ ] **Error handling** — Implement graceful fallbacks for network failures, API timeouts, and malformed responses
- [ ] **Offline mode** — Add local caching for chat history; test behavior without internet
- [ ] **Push notifications** — Configure Firebase Cloud Messaging for chat alerts (if applicable)
- [ ] **Deep linking** — Test URL schemes for direct chat access (e.g., `yourapp://chat`)
- [ ] **Accessibility** — Verify screen reader support, text scaling, and color contrast ratios
- [ ] **Internationalization (i18n)** — Test all supported languages; verify RTL layouts if applicable

#### 4. API & Integration Testing
- [ ] **End-to-end chat flow** — Simulate full user journey from app open to conversation completion
- [ ] **Load testing** — Use k6 or Artillery to simulate 100+ concurrent chat sessions
- [ ] **Security testing** — Run OWASP ZAP or Burp Suite against FlowiseAI endpoints
- [ ] **Input sanitization** — Test for XSS, injection attacks, and prompt injection vulnerabilities
- [ ] **CORS configuration** — Verify Astro/Flutter origins are whitelisted in FlowiseAI server settings

### II. User Experience Testing

#### 5. Functional QA
- [ ] **Onboarding flow** — Test first-time user experience, permissions requests, and tutorial screens
- [ ] **Chat history persistence** — Verify messages survive app restart and sync across devices
- [ ] **File upload handling** — Test image/document upload limits, formats, and error messages
- [ ] **Voice input** — Test speech-to-text integration (if applicable) across devices
- [ ] **Dark/light mode** — Verify theme switching and persistence
- [ ] **Keyboard handling** — Test input field behavior with software keyboard open/close

#### 6. Performance & Stability
- [ ] **Startup time** — Target <3 seconds cold start; profile with Flutter DevTools
- [ ] **Memory profiling** — Check for leaks during extended chat sessions (>30 min)
- [ ] **Battery drain** — Monitor background activity and network polling frequency
- [ ] **Frame rate** — Maintain 60fps during message list scrolling; check with Performance Overlay
- [ ] **App size optimization** — Target <50MB APK; use `flutter build apk --split-debug-info`

### III. Compliance & Legal

#### 7. Data Privacy & Security
- [ ] **GDPR/CCPA compliance** — Add privacy policy, data retention settings, and user data export/deletion
- [ ] **Terms of Service** — Publish ToS covering AI-generated content liability
- [ ] **Consent management** — Implement cookie consent banner on Astro web page
- [ ] **Data encryption** — Verify TLS 1.3 for all API calls; encrypt local chat storage
- [ ] **PII handling** — Audit FlowiseAI logs for accidental PII exposure; implement redaction

#### 8. App Store & Distribution
- [ ] **App Store screenshots** — Generate for all required device sizes (iPhone, iPad, Android phones/tablets)
- [ ] **App description & keywords** — Optimize for ASO (App Store Optimization)
- [ ] **Age rating** — Complete questionnaire accurately (likely 12+ for AI chat)
- [ ] **Content guidelines** — Review Apple App Store §4.2 (AI content) and Google Play AI policies
- [ ] **Beta testing** — Deploy via TestFlight (iOS) and Google Play Internal Testing (Android)
- [ ] **Crashlytics integration** — Verify Firebase Crashlytics is capturing and reporting crashes
- [ ] **Analytics setup** — Configure Firebase Analytics or Mixpanel for user behavior tracking

### IV. Deployment & DevOps

#### 9. CodeFlutter Deployment Pipeline
- [ ] **CI/CD configuration** — Verify GitHub Actions/GitLab CI builds pass for all platforms
- [ ] **Environment separation** — Confirm dev/staging/prod environments with distinct FlowiseAI endpoints
- [ ] **Rollback plan** — Document procedure for reverting to previous app version
- [ ] **Domain & SSL** — Verify custom domain points to Astro deployment; SSL certificate valid
- [ ] **CDN configuration** — Enable Cloudflare or similar for Astro static assets
- [ ] **Database migrations** — If using persistent storage, test migration scripts on staging

#### 10. Documentation & Handoff
- [ ] **Runbook creation** — Document incident response, scaling procedures, and on-call rotation
- [ ] **API documentation** — Generate OpenAPI/Swagger docs for FlowiseAI custom endpoints
- [ ] **Developer onboarding** — Write setup guide for new team members (Flutter + FlowiseAI local dev)
- [ ] **Changelog** — Draft release notes covering new features, fixes, and known issues
- [ ] **Support documentation** — Create FAQ and troubleshooting guide for customer support team

---

## Useful Tools

| Tool | Purpose |
|------|---------|
| **Postman / Insomnia** | Test FlowiseAI REST API endpoints, validate request/response schemas, and automate integration tests |
| **Flutter DevTools** | Profile widget rebuilds, inspect network requests, analyze memory usage, and debug UI layouts |
| **FlowiseAI Built-in Chat** | Rapidly test conversation flows and debug intent matching without the Flutter frontend |
| **Lighthouse (Chrome DevTools)** | Audit Astro web page performance, accessibility, SEO, and best practices |
| **k6 / Artillery** | Load test FlowiseAI backend to validate concurrent user handling and identify bottlenecks |
| **OWASP ZAP** | Security scan FlowiseAI endpoints for vulnerabilities (XSS, injection, misconfigurations) |
| **Sentry** | Real-time error tracking and performance monitoring for Flutter app and FlowiseAI backend |
| **Firebase Crashlytics** | Capture and analyze native crashes across iOS and Android Flutter builds |
| **Firebase Analytics / Mixpanel** | Track user engagement, retention, and chatbot interaction funnels |
| **Figma / Zeplin** | Verify Flutter UI matches design specs; share annotated designs with QA team |
| **Codemagic / GitHub Actions** | CI/CD pipeline for automated Flutter builds, tests, and CodeFlutter deployments |
| **Cloudflare** | CDN and DDoS protection for Astro static site; optimize asset delivery |
| **Docker** | Containerize FlowiseAI instance for consistent staging/production deployments |
| **ngrok** | Expose local FlowiseAI/Flutter dev server for remote testing and webhook debugging |
| **Charles Proxy / Proxyman** | Inspect HTTPS traffic between Flutter app and FlowiseAI to debug API issues |

---

## Cheat Sheet

### Flutter Commands
- **`flutter build apk --release --split-per-abi`** — Build optimized Android APKs split by architecture (arm64-v8a, armeabi-v7a)
- **`flutter build ios --release`** — Build iOS release archive for App Store submission
- **`flutter build web --release`** — Build Flutter web app for CodeFlutter/Astro embedding
- **`flutter test --coverage`** — Run all unit/widget tests and generate LCOV coverage report
- **`flutter pub run build_runner build --delete-conflicting-outputs`** — Regenerate code-generated files (JSON serialization, Riverpod, etc.)
- **`flutter analyze`** — Static analysis; catch type errors, unused imports, and style violations
- **`flutter pub outdated`** — List outdated dependencies; review before release

### Astro Commands
- **`npm run dev`** — Start Astro dev server with hot reload
- **`npm run build`** — Production build with static site generation
- **`npm run preview`** — Preview production build locally before deployment
- **`astro add tailwind`** — Add Tailwind CSS integration for styling
- **`astro check`** — TypeScript type checking across all `.astro` files

### FlowiseAI Configuration
- **Export Flow:** Settings → Export Chatflow → Save JSON to version control
- **Environment Variables:** `FLOWISE_USERNAME`, `FLOWISE_PASSWORD`, `DATABASE_PATH`, `APIKEY_PATH`
- **API Base URL:** `http://localhost:3000/api/v1/prediction/{chatflow-id}`
- **CORS Whitelist:** Add Astro/Flutter production domains in `FLOWISE_ALLOWED_ORIGINS`
- **Rate Limiting:** Configure `FLOWISE_RATE_LIMIT_MAX` and `FLOWISE_RATE_LIMIT_WINDOW_MS`

### CodeFlutter Deployment
- **Build Trigger:** Push to `main` branch → auto-deploy via configured CI pipeline
- **Environment Switch:** Set `CODEFLUTTER_ENV=production` in deployment settings
- **Custom Domain:** Configure CNAME record pointing to CodeFlutter edge servers
- **Rollback:** Revert commit on `main` → auto-rollback to previous stable build

### Critical File Paths
- **Flutter:** `lib/main.dart`, `pubspec.yaml`, `android/app/build.gradle`, `ios/Runner/Info.plist`
- **Astro:** `astro.config.mjs`, `src/pages/index.astro`, `public/robots.txt`
- **FlowiseAI:** `.env`, `packages/server/.flowise`, `docker-compose.yml`

### Debugging Quick Fixes
- **Chat not loading in Flutter Web:** Check CORS headers on FlowiseAI; verify `flutter build web` output is served over HTTPS
- **Astro build fails:** Delete `node_modules` and `dist`, run `npm install`, retry `npm run build`
- **FlowiseAI 502 errors:** Check Docker container health; verify `DATABASE_PATH` has write permissions
- **iOS app crashes on launch:** Review `Info.plist` for missing `NSAppTransportSecurity` settings or camera/microphone permissions

### Release Check Quick Reference
| Check | Command/Action | Target |
|-------|---------------|--------|
| APK size | `flutter build apk --analyze-size` | <50MB |
| Test coverage | `flutter test --coverage` | >80% |
| Lighthouse score | Chrome DevTools → Lighthouse | Performance >90 |
| API latency | Postman Collection Runner | <500ms p95 |
| Load capacity | k6 script with 100 VUs | 0% error rate |

---

**Pro Tip:** Run through this checklist in a staging environment that mirrors production before any production release. Schedule a "go/no-go" review meeting with stakeholders after completing all technical checks but before App Store submission.

---
### Checklist for Pre-Release Tasks

**1. FlowiseAI Backend & API Configuration**
*   Secure API endpoints by generating and rotating API keys within the FlowiseAI dashboard.
*   Configure Cross-Origin Resource Sharing (CORS) in Flowise to strictly allow only your specific Astro/Flutter web domains.
*   Set up a Vector Database (e.g., Pinecone, Qdrant) and verify document chunking/embedding pipelines for Retrieval-Augmented Generation (RAG) accuracy.
*   Implement rate limiting and timeout configurations to prevent LLM API abuse and handle provider outages gracefully.
*   Configure chat memory (e.g., Redis or PostgreSQL integration) to maintain conversational context across user sessions.

**2. Flutter Web Application Readiness**
*   Integrate FlowiseAI API using secure environment variables; ensure no API keys are exposed in the client-side Flutter web bundle.
*   Implement streaming response handling to render real-time token generation from FlowiseAI, improving perceived latency.
*   Optimize the Flutter web renderer (choose between `canvaskit` for rich UI fidelity or `html` for faster initial load times) based on Lighthouse metrics.
*   Add comprehensive error handling and fallback UI for network failures, LLM timeouts, or invalid user inputs.
*   Ensure responsive layout and touch-target sizing for mobile web users interacting with the chat interface.

**3. Astro Web Page & Integration**
*   Configure SEO metadata, Open Graph tags, and structured data for the landing pages to ensure proper social sharing and search visibility.
*   Generate `sitemap.xml` and `robots.txt` using Astro integrations to guide search engine crawlers.
*   Implement seamless client-side routing or iframe integration between the Astro static pages and the Flutter web app container.
*   Optimize image assets using Astro's built-in `<Image />` component for automatic format conversion (WebP/AVIF) and lazy loading.

**4. CodeFlutter Deployment & CI/CD**
*   Configure production environment variables (Flowise URL, API keys, feature flags) within the CodeFlutter dashboard or environment files.
*   Set up automated build triggers linked to the main branches of the Flutter and Astro repositories.
*   Configure custom domain mapping, SSL certificate provisioning, and CDN routing in CodeFlutter.
*   Establish a staging environment in CodeFlutter to test production builds and FlowiseAI integrations before public release.

**5. User Experience & Performance Testing**
*   Conduct cross-browser testing (Chrome, Safari, Firefox, Edge) to verify Flutter web canvas rendering consistency and font loading.
*   Perform End-to-End (E2E) testing on the chat flow using automated scripts to validate message sending, receiving, and history loading.
*   Run Lighthouse audits on both the Astro pages and Flutter web app, targeting scores >90 for Performance, Accessibility, and Best Practices.
*   Test the chatbot with edge-case and adversarial prompts to verify FlowiseAI's guardrails, content filtering, and fallback mechanisms.

**6. Compliance, Security, and Legal**
*   Draft and publish a Privacy Policy explicitly detailing how user prompts and chat histories are processed, stored, and potentially used by the AI.
*   Implement a cookie consent banner compliant with GDPR/ePrivacy directives for the Astro landing pages.
*   Ensure FlowiseAI logging is configured to redact or exclude sensitive PII (Personally Identifiable Information) from user prompts in backend logs.
*   Add Terms of Service and an "AI Disclaimer" notifying users that chatbot responses are AI-generated and may be inaccurate.

---

### Useful Tools

*   **LangFuse / LangSmith:** For tracing LLM calls, debugging FlowiseAI prompts, and monitoring token usage, costs, and latency.
*   **Postman / Insomnia:** For testing FlowiseAI API endpoints, webhook payloads, and authentication headers before integrating them into Flutter.
*   **Flutter DevTools:** For widget inspection, network profiling, and debugging the Flutter web application state and memory leaks.
*   **Lighthouse (Chrome DevTools):** For auditing web performance, PWA compliance, and SEO of the Astro and Flutter web builds.
*   **Playwright / Cypress:** For automated End-to-End (E2E) testing of the chatbot UI, simulating user typing, and verifying API interactions across browsers.
*   **Docker & Docker Compose:** For containerizing and reliably deploying the FlowiseAI backend and its associated databases (Vector DB, Redis).
*   **Sentry:** For real-time error tracking and performance monitoring for both the Flutter web frontend and Astro pages.
*   **Astro Integrations (`@astrojs/sitemap`, `astro-robots-txt`):** For automated generation and updating of critical SEO files during the build process.

---

### Cheat Sheet

**Flutter Web Commands**
*   **Release Build:** `flutter build web --release --web-renderer canvaskit --dart-define=FLOWISE_API_URL=<url>` (Use `html` instead of `canvaskit` for faster initial load times).
*   **Local Run:** `flutter run -d chrome --web-port=8080 --web-hostname localhost --dart-define=FLOWISE_API_URL=<url>`.

**Astro Commands**
*   **Dev Server:** `npm run dev` (Starts local server, typically at `http://localhost:4321`).
*   **Production Build:** `npm run build` (Outputs static files to the `dist/` directory).
*   **Environment Variables:** Use `import.meta.env.PUBLIC_FLOWISE_URL` for client-side access, and `import.meta.env.FLOWISE_API_KEY` for server-side API routes.

**FlowiseAI API & Configuration**
*   **Chat Endpoint:** `POST https://<your-flowise-domain>/api/v1/prediction/<chatflow-id>`
*   **Auth Header:** `Authorization: Bearer <your-flowise-api-key>`
*   **Enable Streaming:** Include `"streaming": true` in the JSON request body to enable real-time token streaming.
*   **Docker CORS Config:** `docker run -d -p 3000:3000 --env FLOWISE_CORS_ORIGINS=https://your-astro-domain.com flowiseai/flowise`

**CodeFlutter Deployment**
*   **Deploy Command:** `codeflutter deploy --env production --message "Release v1.0"` (Adjust flags based on your specific CodeFlutter CLI version).
*   **Environment Variables:** Define `FLOWISE_API_URL` and `ASTRO_PUBLIC_API_URL` in the CodeFlutter project settings to inject them at build time.
---
# Pre-Release Checklist & Guide for Flutter + FlowiseAI Chatbot Application


## Checklist for Pre-Release Tasks

### Phase 1: Environment & Code Readiness

**1. Configure Flavors and Environments**
- Set up separate flavors for development, staging, and production
- Ensure production API base URL is configured in release flavor (not staging)
- Verify secrets are not committed to version control; CI injects keys for release builds
- Confirm `pubspec.yaml` version matches store intent (`version: 1.2.0+42`)

**2. FlowiseAI Production Configuration**
- Switch Flowise to **Queue mode** with load balancing (recommended: 2 main servers with 4vCPU/8GB RAM each, 4 workers with 4vCPU/8GB RAM each)
- Configure **PostgreSQL** as production database (replace default SQLite)
- Set up **AWS S3** for persistent file and log storage
- Enable **AWS Secrets Manager** for credential encryption (OpenAI API keys, etc.)
- Configure **rate limiting** with appropriate `NUMBER_OF_PROXIES` environment variable
- Set JWT authentication environment variables (`JWT_AUTH_TOKEN_SECRET`)

**3. Flutter Build Configuration**
- Ensure Flutter 3.38+ for latest API support
- Set `compileSdk = 35` and `targetSdk = 35` (mandatory as of August 2025)
- Configure obfuscation / ProGuard rules and test thoroughly (common crash cause in release)
- Test feature flags default safely for public release
- Build release mode: `flutter build apk --release` and `flutter build ios --release` (or CI equivalents)

### Phase 2: Mobile Platform Submission

**4. Android (Google Play Store)**
- Generate **Android App Bundle (AAB)** — APK no longer allowed
- Enable **Play App Signing**; secure upload key
- Verify `applicationId` matches Play Store listing
- Complete **Data Safety Form** accurately (SDKs, data collection, sharing)
- Complete **Content Rating** questionnaire
- Prepare screenshots and feature graphic for required form factors
- Add launcher icon using `flutter_launcher_icons` package or manual placement in `android/app/src/main/res/`
- Run **internal testing track** first; review pre-launch crash reports

**5. iOS (Apple App Store)**
- Enroll in **Apple Developer Program**
- Register unique **Bundle ID** in Apple Developer account
- Create application record on **App Store Connect**
- Verify **distribution certificate** and provisioning profile are valid
- Confirm icons at all required sizes; no alpha channel on App Store icon
- Configure launch screen (not blank flash)
- Complete **Privacy Nutrition Labels** / privacy manifest for SDKs used
- Provide **Privacy Policy URL** (live and accessible)
- Answer **export compliance** questions
- Add review notes with test account credentials if login required
- Test with **TestFlight** internal testers on physical device
- Audit iOS pods and `Info.plist` permissions; add purpose strings for camera, photos, location, tracking

### Phase 3: Web & Astro Deployment

**6. Flutter Web Build**
- Build web app: `flutter build web --release`
- Consider `--wasm` flag for WebAssembly support to enable both skwasm and canvaskit renderers
- Verify `web/index.html` is properly configured
- Test profile or debug builds for testing: `flutter build web --profile` or `--debug`

**7. Astro Web Page (CodeFlutter Integration)**
- Run `astro build` to generate production build
- Verify all environment variables are configured for production
- Implement SEO best practices: meta tags, Open Graph tags, sitemap
- Configure Core Web Vitals optimization
- Set up custom domain and SSL certificate
- Configure caching headers for CDN and browser caching

### Phase 4: Testing & Quality Assurance

**8. Performance Testing**
- Load test FlowiseAI deployment using **Artillery** (example script available in Flowise repo)
- Profile Flutter app using **DevTools** for UI jank and performance issues
- Run **Flashlight** for mobile performance scoring
- Test cold start performance on physical devices (not just simulators)
- Verify production backend is scaled for review period traffic

**9. Accessibility Testing**
- Test screen reader compatibility (Flutter translates Semantics tree to accessible HTML DOM)
- Verify all active interactions do something
- Run Flutter's Accessibility Guideline API to check text contrast, target size, and target labels
- Test keyboard navigation for web deployment
- For web: ensure accessibility is enabled (users press invisible button with `aria-label="Enable accessibility"`)

**10. User Experience Testing**
- Manually test app across multiple devices
- Test back button, permissions flows, and offline behavior
- Verify push notifications (if used) with production APNs entitlement
- Test in-app purchases in sandbox (if applicable)
- Confirm account creation flows work without manual approval
- Validate rate limits won't block Apple/Google reviewers

### Phase 5: Monitoring & Analytics

**11. Error Monitoring & Crash Reporting**
- Implement crash reporting (e.g., **Sentry**, **Firebase Crashlytics**)
- Set up error monitoring for production
- Review pre-launch crash reports from internal testing

**12. Analytics & User Feedback**
- Implement analytics to understand user interactions
- Set up in-app user feedback mechanism
- Configure in-app reviews to improve visibility and ranking
- Set up force update mechanism to ensure users stay on latest version

### Phase 6: Compliance & Legal

**13. Privacy & Data Compliance**
- **GDPR/CCPA compliance**: Ensure user data handling follows regulations
- Review **iOS Privacy Manifest** for all SDKs used
- Complete **Google Play Data Safety** section accurately
- Ensure **Privacy Policy URL** is live and accessible in both stores
- Audit all third-party SDKs for data collection practices

**14. Store Listing Assets**
- Prepare app description, keywords, and promotional text
- Create screenshots for all required form factors
- Design feature graphic and store icon
- Prepare app preview video (optional but recommended)

### Phase 7: Deployment & Launch

**15. Final Pre-Launch Checks**
- Run `flutter clean` and build from clean checkout
- Verify production API keys are set (not staging)
- Confirm app name displays correctly (AndroidManifest label / iOS CFBundleDisplayName)
- Test deep links in store build (associated domains and intent filters)
- Optimize binary size: split per ABI, strip debug symbols
- Set appropriate cache headers for web deployment

**16. Launch Execution**
- Submit to **Google Play Console** internal testing track first
- Submit to **TestFlight** for beta testing
- After internal validation, submit for production review
- Monitor review process and respond to any issues promptly
- Prepare rollback plan in case of critical issues


## Useful Tools

### Development Tools
| Tool | Purpose |
|------|---------|
| **flutter_launcher_icons** | Generate app icons for all platforms |
| **flutter_flavorizr** | Automate flavor setup for multiple environments |
| **FVM (Flutter Version Management)** | Manage Flutter SDK versions across projects |
| **fastlane** | Automate beta deployments and releases |
| **Codemagic** | CI/CD for Flutter apps |

### FlowiseAI Tools
| Tool | Purpose |
|------|---------|
| **Artillery** | Load testing for deployed Flowise applications |
| **AWS Secrets Manager** | Secure credential storage and rotation |
| **AWS S3** | Persistent file and log storage |
| **PostgreSQL** | Production database (replace SQLite) |
| **Flowise Python SDK** | Create Streamlit apps and custom integrations |

### Testing & Debugging Tools
| Tool | Purpose |
|------|---------|
| **Flutter DevTools** | Performance profiling, UI inspection, jank diagnosis |
| **Flashlight** | Mobile performance scoring for Android apps |
| **flutter_perf_guard** | Enterprise-grade performance monitoring (frame analysis, jank detection, memory leak detection) |
| **Sentry / Firebase Crashlytics** | Production error monitoring and crash reporting |
| **Accessibility Guideline API** | Automated accessibility testing |
| **Flutter Driver** | Benchmarking and integration testing |

### Deployment & Hosting Tools
| Tool | Purpose |
|------|---------|
| **Firebase Hosting** | Web app deployment with CDN |
| **Vercel** | Automatic builds and deploys from Git pushes |
| **Netlify** | Astro site deployment with preview and production deploys |
| **Railway** | Astro deployment with environment variable management |
| **GitHub Actions** | CI/CD automation |

### Monitoring & Analytics Tools
| Tool | Purpose |
|------|---------|
| **Firebase Analytics** | User behavior tracking |
| **@nuasite/checks** | Astro build-time SEO, GEO, performance, and accessibility validation |


## Cheat Sheet

### Flutter Commands

```bash
# Build for production
flutter build apk --release                    # Android AAB
flutter build appbundle --release             # Android App Bundle (preferred)
flutter build ios --release                   # iOS (requires Xcode)
flutter build web --release                   # Web
flutter build web --release --wasm            # Web with WebAssembly support

# Testing builds
flutter build web --profile                   # Profile build for testing
flutter build web --debug                     # Debug build for testing

# Clean and rebuild
flutter clean
flutter pub get

# Run with specific flavor
flutter run --flavor production -t lib/main_production.dart

# Version management
# Update in pubspec.yaml: version: 1.2.0+42  # 1.2.0 = version, 42 = build number
```

### Astro Commands

```bash
# Development
npm run dev                                   # Start development server

# Build for production
npm run build                                 # Generate production build

# Preview production build
npm run preview

# Deploy to Netlify
netlify deploy --prod                         # Production deploy
netlify deploy                                # Preview deploy
```

### FlowiseAI Production Environment Variables

```bash
# .env file in packages/server folder

# Queue Mode Configuration
# (Set via hosting platform or .env)

# Database - Production
DATABASE_TYPE=postgres
DATABASE_HOST=<your-postgres-host>
DATABASE_PORT=5432
DATABASE_NAME=<database-name>
DATABASE_USER=<username>
DATABASE_PASSWORD=<password>

# Storage - AWS S3
STORAGE_TYPE=s3
S3_BUCKET=<your-bucket>
S3_REGION=<region>
AWS_ACCESS_KEY_ID=<key>
AWS_SECRET_ACCESS_KEY=<secret>

# Credentials Encryption - AWS Secrets Manager
SECRET_KEY_PATH=/path/to/encryption/key
# Or use AWS Secrets Manager via environment

# Rate Limiting
NUMBER_OF_PROXIES=0                           # Set based on proxy/load balancer count

# Security - JWT
JWT_AUTH_TOKEN_SECRET=<your-secret-key>

# API Configuration
PORT=3000
```

### FlowiseAI Rate Limit Configuration

| Setting | Description | Example |
|---------|-------------|---------|
| Message Limit | Max messages per duration | 20 |
| Duration | Time window in seconds | 60 |
| Limit Message | Response when exceeded | "Quota Exceeded" |

### Key Store Requirements (2026)

**Android (Google Play)** 
- Flutter 3.38+
- `compileSdk = 35`
- `targetSdk = 35`
- AAB format only (no APK)
- Complete Data Safety Form
- Play App Signing enabled

**iOS (App Store)** 
- Apple Developer Program enrollment
- Unique Bundle ID
- Distribution certificate
- Privacy manifest for SDKs
- Privacy Policy URL
- Export compliance answers

### Common Release Gotchas

| Issue | Check |
|-------|-------|
| White screen on release | `--dart-define` missing in CI release job |
| Plugin crash only in release | ProGuard keep rules for plugin |
| Wrong app name on home screen | AndroidManifest label / iOS CFBundleDisplayName |
| Deep links broken | Associated domains and intent filters in release manifest |
| Huge binary size | Split per ABI; strip debug symbols |
| Data safety mismatch | Audit analytics and login SDK behavior |

### Accessibility Checklist
- [ ] All interactive elements are actionable
- [ ] Screen reader can describe all UI elements
- [ ] Sufficient color contrast
- [ ] Keyboard navigation works
- [ ] For web: accessibility enabled (aria-label="Enable accessibility")

### Pre-Launch Validation Commands

```bash
# Check Flutter version
flutter --version                              # Should be 3.38+

# Validate Android build
flutter build appbundle --release --dry-run

# Check for Dart analysis issues
flutter analyze

# Run all tests
flutter test

# Run accessibility checks
flutter test --dart-define=FLUTTER_TEST_ALL_ACCESSIBILITY=true
```

---
Building a high-performance chatbot application with **Flutter**, **FlowiseAI**, **Astro**, and **CodeFlutter** requires a multi-layered approach to ensure stability, security, and a seamless user experience. 

This guide provides a comprehensive roadmap to take your application from development to a successful production release.

---

### Checklist for Pre-Release Tasks

#### 1. Technical Readiness & Flutter Optimization
- [ ] **Release Mode Compilation:** Verify the app is built using `flutter build web --release` to enable tree shaking and minification.
- [ ] **Renderer Selection:** Choose between `html` (smaller bundle, better for text-heavy chatbots) or `canvaskit` (pixel-perfect, better for complex animations). For Astro integration, `html` often integrates more cleanly with the DOM.
- [ ] **Wasm Support:** Test if your app can be compiled to WebAssembly (`--wasm`) for faster execution, ensuring all dependencies (like `dart:html` alternatives) are compatible.
- [ ] **Deferred Loading:** Implement lazy loading for large chatbot components or specialized UI views to reduce initial load time.
- [ ] **Dependency Audit:** Run `flutter pub outdated` and upgrade critical packages, especially those handling networking (e.g., `dio` or `http`).

#### 2. FlowiseAI Backend & Chatbot Logic
- [ ] **Database Migration:** Switch from the default SQLite to **PostgreSQL** for production-grade reliability and scalability.
- [ ] **Queue Mode Activation:** Enable Worker Queue mode in Flowise to handle concurrent user requests without blocking the main server thread.
- [ ] **Credential Security:** Ensure all LLM API keys (OpenAI, Anthropic, etc.) are stored as Environment Variables and not hardcoded in the Flowise flow.
- [ ] **Rate Limiting:** Configure `NUMBER_OF_PROXIES` and request limits in Flowise to prevent API abuse and cost overruns.
- [ ] **Flow Validation:** Test the chatbot against "Prompt Injection" and verify that system prompts correctly constrain the AI's behavior.

#### 3. Astro & Web Integration
- [ ] **SEO & Meta Tags:** Configure Astro's `layout.astro` with dynamic OpenGraph tags, titles, and descriptions for the chatbot landing page.
- [ ] **Hydration Strategy:** If embedding Flutter as a component, use `client:only="flutter"` (if using a custom wrapper) or ensure the iframe/container handles resizing correctly.
- [ ] **Build Folder Routing:** Ensure the Flutter `build/web` assets are correctly referenced within the Astro `public/` or `src/` directory so CodeFlutter can locate them during the build.
- [ ] **Error Boundaries:** Implement a fallback UI in Astro for cases where the Flutter engine fails to load or the Flowise API is unreachable.

#### 4. Compliance & Security
- [ ] **CORS Configuration:** Restrict Flowise API access to only allow requests from your Astro application's domain.
- [ ] **HTTPS Enforcement:** Verify that both the Flutter frontend and Flowise backend are served over TLS 1.3.
- [ ] **Data Privacy:** Add a "Privacy Policy" link in the chat interface disclosing how user prompts are processed and whether they are stored in your Postgres database.

---

### Useful Tools

- **Development & Performance:**
    - **Flutter DevTools:** Essential for profiling widget rebuilds and monitoring "jank" in the web browser.
    - **Lighthouse:** Use this to audit the Astro site's performance, accessibility, and SEO.
- **Testing & Debugging:**
    - **Artillery:** High-performance load testing tool to simulate thousands of concurrent chat sessions on your Flowise server.
    - **Postman/Insomnia:** For testing Flowise API endpoints (`/api/v1/prediction`) independently of the frontend.
- **Monitoring & Deployment:**
    - **Prometheus & Grafana:** Flowise has native support for these to track API request counts and system health.
    - **Sentry/LogRocket:** For catching runtime JavaScript errors in the Flutter web build and Astro frontend.

---

### Cheat Sheet

#### Critical Commands
- **Build Flutter Web:** `flutter build web --web-renderer html --release` (Optimized for Astro integration).
- **Check Dependencies:** `flutter pub deps` (Visualize the dependency graph).
- **Clean Cache:** `flutter clean && flutter pub get` (Fixes many "missing asset" issues in web builds).
- **Run Flowise (Docker):** `docker-compose up -d` (Standard production deployment).

#### Configuration Settings
- **Flowise Production Env:**
    - `DATABASE_TYPE=postgres`
    - `FLOWISE_USERNAME=admin` / `FLOWISE_PASSWORD=secure_pass`
    - `ENABLE_METRICS=true`
- **Astro Build Config:**
    - `outDir: './dist'`
    - `base: '/'` (Ensure this matches your CodeFlutter deployment path).

#### Optimization Tips
- **Pre-caching Assets:** Use a `ServiceWorker` in your Flutter web build to cache the chatbot's main font and iconography.
- **Prompt Caching:** In Flowise, enable "Message History" or external vector stores (like Pinecone/Milvus) to reduce LLM latency for returning users.
- **CodeFlutter Deploy:** Ensure your `config.yml` or deployment script includes an environment variable check for the `FLOWISE_API_ENDPOINT` to allow easy switching between staging and production.