این یک دستورالعمل **نهایی، بازبینی‌شده و حرفه‌ای** برای پیاده‌سازی سیستم احراز هویت پروژه **HMRbot** است. تمام خطاها (از جمله خطای بیلد کلودفلر) در این نسخه اصلاح شده است.

---

### ۱. تنظیمات Google Cloud Console

در بخش **OAuth 2.0 Client IDs**:
```
- **Authorized JavaScript origins:** `https://hmrbot.com` (و `http://localhost:4321` برای تست)
- **Authorized redirect URIs:** `https://hmrbot.com/api/auth/callback/google`
```
---

### ۲. تنظیم متغیرها در Cloudflare (محیط Production)

در پنل کلودفلر (Pages > Settings > Variables)، ۳ متغیر زیر را اضافه کنید:

1. **`GOOGLE_CLIENT_ID`**: کدی که از گوگل گرفتید.
2. **`GOOGLE_CLIENT_SECRET`**: کد محرمانه گوگل.
3. **`AUTH_SECRET`**: یک عبارت تصادفی و طولانی (تولید شده با `openssl rand -base64 32`).

---

### ۳. نصب و پیکربندی Astro

ابتدا کتابخانه را نصب کنید:
```
 npx astro add auth-astro
```
Generated code may be subject to license restrictions not shown here. Use code with care. [Learn more](https://cloud.google.com/duet-ai/docs/discover/code-generation-source-citation#how_helps_with_coding)

#### الف) ایجاد فایل تنظیمات (بسیار مهم - ریشه پروژه)

فایل **`auth.config.mjs`** را دقیقاً در **Root** پروژه (کنار `package.json`) بسازید:
```
 // auth.config.mjs

import Google from "@auth/core/providers/google";

import { defineConfig } from "auth-astro";

export default defineConfig({

    providers: \[

        Google({

            clientId: process.env.GOOGLE\_CLIENT\_ID,

            clientSecret: process.env.GOOGLE\_CLIENT\_SECRET,

        }),

    \],

});
```
Generated code may be subject to license restrictions not shown here. Use code with care. [Learn more](https://cloud.google.com/duet-ai/docs/discover/code-generation-source-citation#how_helps_with_coding)

#### ب) ایجاد مسیر API (هندلر اصلی)

فایل را در این مسیر بسازید: **`src/pages/api/auth/[...auth].ts`**

 import { Auth } from "auth-astro";

export const { GET, POST } \= Auth;

Generated code may be subject to license restrictions not shown here. Use code with care. [Learn more](https://cloud.google.com/duet-ai/docs/discover/code-generation-source-citation#how_helps_with_coding)

---

### ۴. طراحی صفحه هوشمند چت‌بات (src/pages/ai.astro)

این نسخه نهایی و حرفه‌ای است که هم لاگین را مدیریت می‌کند و هم فلاتر را بارگذاری می‌کند:

 \---

import Layout from '../layouts/Layout.astro';

import { getSession } from 'auth-astro/server';

import { SignIn } from 'auth-astro/components';

const session = await getSession(Astro.request);

// آماده‌سازی داده‌ها برای پل ارتباطی با فلاتر
```
const userProfile = session ? {

  name: session.user?.name,

  email: session.user?.email,

  photo: session.user?.image,

} : null;

\---

\<Layout title="HMRbot AI - ورود به هوش مصنوعی">

  \<main>

    {session ? (

      /\* --- کاربر وارد شده است: نمایش اپلیکیشن فلاتر --- \*/

      \<div id="ai-app-container">

        \<script is:inline define:vars={{ userProfile }}>

          // داده‌ها را برای خواندن توسط فلاتر در ویندوز قرار می‌دهیم

          window.HMR\_USER\_DATA = userProfile;

        \</script>

        \<div id="flutter\_container">

          \<p class="loading-text">در حال راه‌اندازی محیط هوش مصنوعی...\</p>

        \</div>

        <!-- لودر استاندارد فلاتر وب -->

        \<script src="/flutter\_bootstrap.js" async>\</script>

      \</div>

    ) : (

      /\* --- کاربر وارد نشده است: نمایش گیت ورودی --- \*/

      \<div class="welcome-gate">

        \<div class="glass-card">

          \<div class="logo-area">🤖\</div>

          \<h1>به HMRbot خوش آمدید\</h1>

          \<p>برای امنیت داده‌ها و دسترسی به چت‌بات، لطفاً با حساب گوگل خود وارد شوید.\</p>

          \<SignIn provider="google" class="google-login-btn">

            \<img src="https://authjs.dev/img/providers/google.svg" width="20" alt="" />

            \<span>ورود با حساب گوگل\</span>

          \</SignIn>

          \<div class="footer-links">

             \<a href="/privacy">حریم خصوصی\</a> • \<a href="/terms">شرایط\</a>

          \</div>

        \</div>

      \</div>

    )}

  \</main>

\</Layout>

\<style>

  .welcome-gate {

    display: flex;

    justify-content: center;

    align-items: center;

    min-height: 85vh;

    background: #0f172a;

    font-family: 'Vazirmatn', sans-serif;

  }

  .glass-card {

    background: rgba(255, 255, 255, 0.03);

    backdrop-filter: blur(12px);

    border-radius: 24px;

    padding: 3rem 2rem;

    text-align: center;

    border: 1px solid rgba(255, 255, 255, 0.1);

    color: white;

    max-width: 400px;

    box-shadow: 0 20px 50px rgba(0,0,0,0.3);

  }

  .google-login-btn {

    display: flex;

    align-items: center;

    justify-content: center;

    gap: 10px;

    background: white;

    color: #1e293b;

    width: 100%;

    padding: 14px;

    border-radius: 12px;

    border: none;

    font-weight: 700;

    cursor: pointer;

    margin-top: 2rem;

    transition: all 0.2s;

  }

  .google-login-btn:hover { background: #f1f5f9; transform: scale(1.02); }

  .loading-text { color: #94a3b8; text-align: center; margin-top: 20%; }

\</style>

Generated code may be subject to license restrictions not shown here. Use code with care. [Learn more](https://cloud.google.com/duet-ai/docs/discover/code-generation-source-citation#how_helps_with_coding)
```
---

### ۵. اتصال در سمت Flutter (Dart)

در پروژه فلاتر خود، از پکیج `js` برای خواندن داده‌هایی که Astro فرستاده استفاده کنید:
```
 // lib/auth\_service.dart

import 'dart:js' as js;

class AstroAuth {

  static Map<String, dynamic\>? getUser() {

    // خواندن متغیری که در Astro تعریف کردیم

    final userData \= js.context\['HMR\_USER\_DATA'\];

    if (userData != null) {

      return {

        'name': userData\['name'\],

        'email': userData\['email'\],

        'photo': userData\['photo'\],

      };

    }

    return null;

  }

}

Generated code may be subject to license restrictions not shown here. Use code with care. [Learn more](https://cloud.google.com/duet-ai/docs/discover/code-generation-source-citation#how_helps_with_coding)
```
---

### ۶. نکات حیاتی برای جلوگیری از خطای بیلد

1. **محل فایل `auth.config.mjs`:** حتماً مطمئن شوید این فایل در پوشه `src` **نیست**. باید در پوشه اصلی پروژه باشد.
2. **فایل‌های فلاتر:** فایل `flutter_bootstrap.js` و تمام محتویات `build/web` فلاتر باید در پوشه **`public/`** پروژه Astro کپی شده باشند تا در دسترس مرورگر باشند.
3. **تست محلی:** برای تست در سیستم خودتان، فایل **`.env`** بسازید و متغیرهای گوگل را در آن قرار دهید: GOOGLE\_CLIENT\_ID=...
	GOOGLE\_CLIENT\_SECRET=...
	AUTH\_SECRET=...
	Generated code may be subject to license restrictions not shown here. Use code with care. [Learn more](https://cloud.google.com/duet-ai/docs/discover/code-generation-source-citation#how_helps_with_coding)

**با انجام این مراحل، سیستم شما به صورت کاملاً استاندارد (OIDC Flow) و ایمن پیاده‌سازی خواهد شد.**

آیا در مورد نحوه کپی کردن فایل‌های فلاتر به پوشه public سوالی دارید؟
