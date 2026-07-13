---
title: "HMR-web-Flutter"
---


### مرحله ۱: آماده‌سازی و گرفتن خروجی (Build) در پروژه فلاتر (`HMR-Flutter`)

برای اینکه خروجی فلاتر وب به درستی در یک مسیر فرعی (Sub-path) درون سایت Astro لود شود و خطای ۴۰۴ برای فایل‌های جاوااسکریپت و اسِت‌ها (Assets) ندهد، تنظیم پارامتر `--base-href` **بسیار حیاتی** است.

1. **فعال‌سازی پشتیبانی وب (در صورت عدم وجود پوشه `web`):**
    
    ترمینال را در مسیر پروژه فلاتر (`HMR-Flutter`) باز کنید و دستور زیر را اجرا کنید:
    
    Bash
    
    ```
    flutter create . --platform web
    ```
    
2. **گرفتن خروجی وب با مسیر پایه اختصاصی:**
    
    فرض می‌کنیم فایل‌های فلاتر قرار است در پوشه `/chat-app/` در هاست قرار بگیرند. دستور زیر را برای بیلد نهایی اجرا کنید:
    
    Bash
    
    ```
    flutter build web --base-href "/chat-app/" --release
    ```
    
    _پس از اتمام این دستور، تمام فایل‌های بهینه‌شده‌ی وب در مسیر `build/web` در پروژه فلاتر ساخته می‌شوند._
    

### مرحله ۲: انتقال فایل‌های بیلد به مخزن وب‌سایت (`HMR-Astro`)

در فریم‌ورک Astro، پوشه‌ی `public/` برای فایل‌های استاتیک استفاده می‌شود که بدون تغییر مستقیم روی سرور قرار می‌گیرند.

1. در مخزن پروژه وب‌سایت (`HMR-Astro`)، به پوشه `public/` بروید.
    
2. یک پوشه‌ی جدید به نام `chat-app` ایجاد کنید:
    
    Plaintext
    
    ```
    HMR-Astro/
    ├── public/
    │   ├── chat-app/  <-- پوشه جدید
    │   └── ...
    └── src/
    ```
    
3. **تمام محتویات** موجود در پوشه‌ی `build/web` (از پروژه فلاتر) را کپی کرده و درون پوشه‌ی `public/chat-app/` در پروژه Astro پیست (Paste) کنید.
    

### مرحله ۳: ساخت صفحه `/ai` در پروژه Astro

برای اینکه کاربر با ورود به آدرس `hmrbot.com/ai` چت‌بات را ببیند و در عین حال هدر (Header)، منوها و فوتر (Footer) وب‌سایت همر حفظ شود، بهترین روش استفاده از تگ `<iframe>` به صورت واکنش‌گرا (Responsive) است.

در پروژه Astro خود، به مسیر `src/pages/` بروید و یک فایل جدید به نام `ai.astro` ایجاد کنید و کد زیر را در آن قرار دهید:

Code snippet

```
---
// وارد کردن قالب اصلی سایت (Layout) جهت حفظ هدر و فوتر
// نام و مسیر Layout خود را بر اساس ساختار پروژه‌تان تنظیم کنید
import MainLayout from '../layouts/MainLayout.astro';
---

<MainLayout title="چت‌بات هوشمند همر | مشاور تخصصی موبایل">
  <main class="container mx-auto px-4 py-8">
    <div class="max-w-4xl mx-auto text-center mb-6">
      <h1 class="text-3xl font-bold text-gray-800 dark:text-white mb-2">
        مشاور هوشمند خرید و عیب‌یابی موبایل
      </h1>
      <p class="text-gray-600 dark:text-gray-300">
        سؤالات خود را درباره خرید گوشی جدید، تشخیص سلامت سخت‌افزار و راهنمای لوازم جانبی بپرسید.
      </p>
    </div>

    <div class="w-full max-w-4xl mx-auto bg-white dark:bg-gray-900 rounded-2xl shadow-xl overflow-hidden border border-gray-200 dark:border-gray-700" style="height: 750px;">
      <iframe 
        src="/chat-app/index.html" 
        class="w-full h-full border-0"
        title="HMR AI Chatbot"
        allow="microphone; camera">
      </iframe>
    </div>
  </main>
</MainLayout>
```

> **نکته طراحی واکنش‌گرا (Responsive):** چون اپلیکیشن‌های موبایلی در عرض‌های زیاد روی دسکتاپ ممکن است کشیده و غیرطبیعی به نظر برسند، در کد بالا با کلاس `max-w-4xl` عرض کادر چت‌بات محدود شده و در وسط صفحه قرار گرفته است تا تجربه‌ی کاربری (UX) شبیه به یک پنل چت حرفه‌ای باشد.

### مرحله ۴: بررسی تنظیمات CORS روی سرور FlowiseAI (`srv.hmrbot.com`)

چون اکنون چت‌بات شما از داخل مرورگر کاربر (کلاینت‌ساید) و از دامنه‌ی `hmrbot.com` به سرور FlowiseAI روی VPS (آدرس `srv.hmrbot.com`) درخواست (API Request) می‌فرستد، مرورگر قوانین امنیتی CORS را بررسی می‌کند.

1. مطمئن شوید که در تنظیمات سرور FlowiseAI (یا Reverse Proxy مثل Nginx/Traefik در VPS)، دامنه‌ی سایت شما مجاز شده باشد:
    
    HTTP
    
    ```
    Access-Control-Allow-Origin: https://hmrbot.com
    Access-Control-Allow-Methods: GET, POST, OPTIONS
    Access-Control-Allow-Headers: Content-Type, Authorization
    ```
    
2. اگر از Firebase Authentication (Google Sign-In) استفاده می‌کنید، حتماً دامنه‌ی `hmrbot.com` را در کنسول Firebase در بخش **Authentication > Settings > Authorized domains** اضافه کنید تا ورود با گوگل در نسخه وب با خطا مواجه نشود.
    

### مرحله ۵: انتشار (Deployment) روی Cloudflare Pages

با توجه به اینکه میزبانی سایت روی **Cloudflare Pages** است، فرآیند انتشار بسیار ساده است:

1. تغییرات انجام‌شده در مخزن `HMR-Astro` (شامل پوشه `public/chat-app/` و فایل `src/pages/ai.astro`) را در گیت‌هاب کامیت (Commit) و پوش (Push) کنید.
    
2. کلاودفلر به صورت خودکار وب‌سایت Astro را مجدداً بیلد می‌کند.
    
3. پس از اتمام استقرار، با مراجعه به آدرس `https://hmrbot.com/ai`، چت‌بات فلاتر به صورت کاملاً روان و هماهنگ با طراحی سایت شما بارگذاری خواهد شد.