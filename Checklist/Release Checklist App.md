---
title: Release Checklist  App
description: Complete checklist of essentials for publishing the HMR project's Android app (Flutter) and website (Astro/Cloudflare)
---

راهنمای علامت‌ها: 🔴 **مسدودکننده** (بدون آن انتشار نکن) · 🟡 **مهم** · 🟢 **توصیه‌شده**.

> منبع: مانوال دو ایجنت مسئول انتشار (Flutter Dev Agent + Astro Web Agent) و وضعیت زندهٔ سرور در تاریخ تهیه.

---

## 📱 بخش ۱ — اپلیکیشن (Flutter Android → Google Play / کافه‌بازار)

مخزن: `wikigoo/HMR-Flutter` · پکیج: `ir.hmrbot.app`

### الف) کیفیت و بیلد
- [ ] 🔴 `flutter build appbundle --release` بدون خطا خروجی AAB بدهد
- [ ] 🔴 `flutter build apk --release` (APK یونیورسال برای توزیع مستقیم)
- [ ] 🟡 `flutter analyze` و `flutter test` سبز باشند
- [ ] 🟡 `flutter doctor` بدون ایراد بحرانی
- [ ] 🟡 بیلد با `--obfuscate --split-debug-info` برای جلوگیری از مهندسی معکوس
- [ ] 🟢 اجرای واقعی روی دستگاه/امولاتور (نه فقط بیلد شدن)
- [ ] 🟢 آیکون لانچر با کیفیت بالا + splash screen برای همهٔ نسخه‌های اندروید

### ب) امضا و کلید (Signing)
- [ ] 🔴 keystore موجود و `key.properties` درست پیکربندی شده
- [ ] 🔴 **Play App Signing** فعال + بکاپ امن upload key (گم شدن کلید = عدم امکان آپدیت)
- [ ] 🟡 `versionCode`/`versionName` نسبت به نسخهٔ قبلی افزایش یافته
- [ ] 🟢 SHA-1/SHA-256 امضا در Google Cloud Console ثبت (برای Google Sign-In)

### ج) اتصال به بک‌اند
- [ ] 🔴 base URL = `api.hmrbot.com` / `srv.hmrbot.com` روی HTTPS (نه cleartext)
- [ ] 🔴 endpoint prediction معتبر (`/api/v1/prediction/463b566b...`) و پاسخ زنده
- [ ] 🟡 توکن Bearer به‌درستی تزریق و **در بستهٔ اپ لو نرود** (secrets در کد hard-code نشده)
- [ ] 🟡 مدیریت خطا/timeout و پیام آفلاین فارسی

### د) الزامات فروشگاه
- [ ] 🔴 آیکون، feature graphic، حداقل ۲ اسکرین‌شات، توضیحات فارسی
- [ ] 🔴 **Privacy Policy URL** عمومی و در دسترس (اجباری Google)
- [ ] 🔴 فرم **Data Safety** پر شده (اپ چه داده‌ای جمع می‌کند)
- [ ] 🔴 Content rating (پرسشنامه IARC) تکمیل شده
- [ ] 🟡 Target API level مطابق حداقل فعلی Google Play
- [ ] 🟡 مجوزهای `AndroidManifest` حداقلی و توجیه‌شده (INTERNET کافی است)
- [ ] 🟡 نسخهٔ **کافه‌بازار** (بازار هدف ایران) با متادیتا و قوانین مربوطه
- [ ] 🟢 صفحهٔ Store listing، دسته‌بندی، ایمیل پشتیبانی

### ه) انتشار و CI
- [ ] 🟡 CI `build-release.yml` روی تگ `v*` → GitHub Release با AAB + APK
- [ ] 🟢 اول **Internal testing / Closed track**، بعد Production
- [ ] 🟢 مسیر rollback / staged rollout (مثلاً ۱۰٪ کاربران)

> ✅ **حل شد (۲۰۲۶-۰۷-۱۱):** ورود با گوگل اکنون کار می‌کند — از طریق Firebase / Google Cloud (پروژهٔ `ir-hmrbot-app`). این مورد دیگر بلاکر نیست.

---

## 🌐 بخش ۲ — سایت (Astro → Cloudflare Workers · hmrbot.com + /chat)

مخزن: `wikigoo/HMR-Astro`

### الف) بیلد و پیکربندی
- [ ] 🔴 `npm run build` بدون خطا
- [ ] 🟡 متغیرهای محیطی/URL بک‌اند در build درست تنظیم شده
- [ ] 🟢 لینک‌ها و asset ها با base-path درست

### ب) DNS / SSL / CORS
- [ ] 🔴 رکوردهای A/CNAME برای `hmrbot.com`, `srv.hmrbot.com` صحیح + پروکسی Cloudflare (ابر نارنجی)
- [ ] 🔴 گواهی SSL معتبر و پوشش‌دهندهٔ همهٔ ساب‌دامین‌ها
- [ ] 🔴 هدرهای **CORS** بین فرانت و `api.hmrbot.com` درست (بدون خطای console)
- [ ] 🟡 بدون mixed-content؛ همهٔ درخواست‌ها HTTPS

### ج) اتصال چت به بک‌اند
- [ ] 🔴 `/chat` بارگذاری شود و به بک‌اند وصل شود و پاسخ فارسی بگیرد
- [ ] 🟡 وب‌اپ Flutter در `hmrbot.com/ai` (اگر منتشر می‌شود) با `web-latest` سالم دیپلوی شده و توکن در باندل عمومی خالی است (nginx تزریق می‌کند)

### د) عملکرد، SEO، حقوقی
- [ ] 🟡 Core Web Vitals قابل‌قبول
- [ ] 🟡 متا تگ‌ها، عنوان/توضیحات فارسی، `sitemap.xml`, `robots.txt`
- [ ] 🟡 صفحهٔ **Privacy Policy** و شرایط استفاده (همان URL که Play لازم دارد)
- [ ] 🟢 favicon، OG image، رندر درست RTL

### ه) دیپلوی و رول‌بک
- [ ] 🔴 **مسیر rollback قبل از دیپلوی مشخص باشد** (`wrangler rollback` / `wrangler versions`)
- [ ] 🟡 `wrangler deploy` موفق و URL زنده تأیید شود
- [ ] 🟢 console مرورگر تمیز (بدون error/warning بحرانی)

---

## 🔧 بخش ۳ — پیش‌نیازهای مشترک (بک‌اند/سرور/سکرت)

- [ ] 🔴 چت‌فلو فعال درست روی سرور تنظیم باشد — ⚠️ ناسازگاری نام: `AGENTS.md` می‌گوید `HMR-MultiAgent-V6` ولی اسکیل/حافظه `HMR-Agentflows-v2`؛ باید قطعی شود
- [ ] 🔴 همهٔ secretها فقط سمت سرور: توکن Bearer در `hmr-auth.conf`، کلید OpenRouter، `VPS_SSH_KEY` درست
- [ ] 🟡 endpoint یکسان بین اپ، سایت و وب‌اپ (`api.hmrbot.com` vs `srv.hmrbot.com`) هماهنگ باشد
- [ ] 🟡 محدودیت نرخ/هزینهٔ OpenRouter و مانیتورینگ خطای ۵xx
- [x] ✅ VPS بالا · دیسک ~۲۹٪ · nginx معتبر
- [x] ✅ `docker-flowise-1` (healthy) · `srv.hmrbot.com` → 200
- [x] ✅ بکاپ شبانه (`daily-backup.yml` → تلگرام) + `state-snapshot.yml` فعال

---


