---
title: "HMR Project Deployment Automation and Daily Backup Instructions"
---

دستورالعمل اتوماسیون استقرار (Deployment) و بک‌آپ‌گیری روزانه پروژه HMR  
  
این دستورالعمل شامل دو بخش اصلی جهت مدیریت خودکار سرور از طریق GitHub Actions است.۱. پیش‌نیازهای مشترک (تنظیمات Secret در GitHub)  
  
برای امنیت و دسترسی، موارد زیر را در مسیر `Settings > Secrets and variables > Actions` مخزن گیت‌هاب تعریف کنید:

- **VPS_HOST**: آی‌پی یا دامنه سرور.
- **VPS_USER**: نام کاربری سرور (معمولاً `root`).
- **VPS_PORT**: پورت SSH (پیش‌فرض 22).
- **VPS_SSH_KEY**: محتوای کلید خصوصی SSH.
- **TELEGRAM_BOT_TOKEN**: توکن ربات دریافتی از BotFather.
- **TELEGRAM_CHAT_ID**: شناسه عددی اکانت تلگرام شما.

۲. بخش اول: استقرار خودکار کد (CI/CD)  
  
هدف: به‌روزرسانی خودکار سرور پس از هر Push به شاخه `main`.

1. **اتصال SSH**: در سرور یک کلید SSH ایجاد کرده (`ssh-keygen`) و کلید عمومی (`.pub`) را در `Deploy keys` مخزن گیت‌هاب ثبت کنید.
2. **ایجاد Workflow**: فایل `.github/workflows/deploy.yml` را در پروژه بسازید:
    
    ```
    name: Deploy to VPS
    on:
      push:
        branches: [ main ]
    jobs:
      deploy:
        runs-on: ubuntu-latest
        steps:
          - uses: appleboy/ssh-action@v1.0.3
            with:
              host: ${{ secrets.VPS_HOST }}
              username: ${{ secrets.VPS_USER }}
              key: ${{ secrets.VPS_SSH_KEY }}
              script: |
                cd /path/to/project
                git pull origin main
                # افزودن دستورات ریستارت سرویس (مثل pm2 restart flowise)
    ```
    

۳. بخش دوم: بک‌آپ‌گیری خودکار به تلگرام  
  
هدف: فشرده‌سازی دیتابیس و فایل‌ها و ارسال به تلگرام.

1. **ایجاد اسکریپت در سرور**: فایل `/root/backup_hmr.sh` را ایجاد و سطح دسترسی اجرا (`chmod +x`) به آن بدهید:
    
    ```
    #!/bin/bash
    BACKUP_NAME="HMR_Backup_$(date +%Y-%m-%d).tar.gz"
    tar -czf "/tmp/$BACKUP_NAME" ~/.flowise /path/to/project
    echo "/tmp/$BACKUP_NAME"
    ```
    
2. **ایجاد Workflow**: فایل `.github/workflows/daily-backup.yml` را بسازید:
    
    ```
    name: Daily Backup
    on:
      schedule:
        - cron: '0 3 * * *'
      workflow_dispatch:
    jobs:
      backup:
        runs-on: ubuntu-latest
        steps:
          - name: Execute Script
            uses: appleboy/ssh-action@v1.0.3
            with: { ... اتصال به سرور و اجرای backup_hmr.sh ... }
          - name: Download & Send to Telegram
            run: |
              # دستور cURL برای ارسال فایل به API تلگرام
    ```
    

نکته حیاتی برای Flowise  
  
تغییرات رابط کاربری Flowise (پرامپت‌ها و نودها) در دیتابیس داخلی ذخیره می‌شوند و با git pull روی فایل‌های کد اعمال نمی‌شوند. برای حفظ تاریخچه، حتماً پس از تغییرات، فایل چت‌فلو را **Export (JSON)** کرده و در مخزن گیت‌هاب Push کنید.  


  دستورالعمل اتوماسیون استقرار (CI/CD) و بک‌آپ‌گیری روزانه پروژه HMR  
  
این دستورالعمل بر اساس مستندات فنی پروژه برای خودکارسازی فرآیند آپدیت سرور و تهیه نسخه پشتیبان تنظیم شده است.فاز ۱: آماده‌سازی محیط و امنیت (Secrets)  
  
قبل از هر اقدامی، متغیرهای حساس زیر را در گیت‌هاب (مسیر: `Settings > Secrets and variables > Actions`) ذخیره کنید:

- **VPS_HOST**: آدرس دامنه یا IP سرور.
- **VPS_USER**: نام کاربری (معمولاً `root`).
- **VPS_SSH_KEY**: محتوای کلید خصوصی SSH.
- **VPS_PORT**: پورت اتصال (معمولاً `22`).
- **TELEGRAM_BOT_TOKEN**: توکن ربات دریافتی از BotFather.
- **TELEGRAM_CHAT_ID**: شناسه عددی تلگرام شما.

فاز ۲: اتصال امن SSH

1. در ترمینال سرور، یک کلید SSH ایجاد کنید:
    
    ```
    ssh-keygen -t ed25519 -C "vps-hmr-server"
    ```
    
2. کلید عمومی (`~/.ssh/id_ed25519.pub`) را در بخش **Deploy keys** مخزن گیت‌هاب ثبت کنید.

فاز ۳: استقرار خودکار کد (CI/CD)  
  
برای به‌روزرسانی خودکار سرور پس از Push به شاخه `main`، فایل `.github/workflows/deploy.yml` را با محتوای زیر در پروژه بسازید:

```
name: Deploy to Ubuntu VPS
on:
  push:
    branches: [ main ]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - name: Deploying changes
      uses: appleboy/ssh-action@v1.0.3
      with:
        host: ${{ secrets.VPS_HOST }}
        username: ${{ secrets.VPS_USER }}
        key: ${{ secrets.VPS_SSH_KEY }}
        port: ${{ secrets.VPS_PORT }}
        script: |
          cd /path/to/your/project
          git reset --hard
          git pull origin main
```

فاز ۴: بک‌آپ‌گیری روزانه به تلگرام

1. **اسکریپت سرور:** فایل `/root/backup_hmr.sh` را ایجاد و سطح دسترسی آن را (`chmod +x`) تنظیم کنید:
    
    ```
    #!/bin/bash
    BACKUP_NAME="HMR_Backup_$(date +%Y-%m-%d_%H-%M).tar.gz"
    BACKUP_PATH="/tmp/$BACKUP_NAME"
    tar -czf "$BACKUP_PATH" ~/.flowise /path/to/your/project
    echo "$BACKUP_PATH"
    ```
    
2. **اکشن گیت‌هاب:** فایل `.github/workflows/daily-backup.yml` را برای زمان‌بندی (ساعت ۳ بامداد) ایجاد کنید:

```
name: Daily VPS Backup to Telegram
on:
  schedule:
    - cron: '0 3 * * *'
  workflow_dispatch:
jobs:
  backup-and-send:
    runs-on: ubuntu-latest
    steps:
      - name: Execute Backup
        uses: appleboy/ssh-action@v1.0.3
        with:
          host: ${{ secrets.VPS_HOST }}
          username: ${{ secrets.VPS_USER }}
          key: ${{ secrets.VPS_SSH_KEY }}
          script: /root/backup_hmr.sh
      - name: Send to Telegram
        run: |
          # دستور curl برای ارسال فایل به تلگرام با استفاده از توکن و چت‌آیدی
```

**نکته حیاتی:** تغییرات رابط کاربری Flowise (پرامپت‌ها و نودها) در دیتابیس داخلی سرور ذخیره می‌شوند. برای حفظ آن‌ها، پس از هر تغییر در وب، خروجی **JSON** چت‌فلو را دانلود، در پوشه پروژه ذخیره و به گیت‌هاب Push کنید.  
  
---

این دستورالعمل بر اساس مستندات فنی پروژه تنظیم شده و شامل تمامی مراحل لازم برای راه‌اندازی سیستم استقرار خودکار (CI/CD) و پشتیبان‌گیری (Backup) روزانه برای سرور HMR است.-----دستورالعمل جامع اتوماسیون (CI/CD) و پشتیبان‌گیری خودکار سرور HMR۱. تنظیمات امنیتی (GitHub Secrets)  
  
قبل از هر اقدامی، اطلاعات حساس اتصال به سرور و ربات تلگرام را در مسیر `Settings > Secrets and variables > Actions` در مخزن گیت‌هاب خود اضافه کنید:

- **VPS_HOST**: آی‌پی سرور یا دامنه (مانند srv.hmrbot.com)
- **VPS_USER**: نام کاربری سرور (root)
- **VPS_SSH_KEY**: محتوای کامل کلید خصوصی SSH
- **VPS_PORT**: پورت SSH (معمولاً ۲۲)
- **TELEGRAM_BOT_TOKEN**: توکن دریافتی از BotFather
- **TELEGRAM_CHAT_ID**: شناسه عددی تلگرام شما (یا گروه)

-----۲. پیکربندی ارتباط SSH  
  
برای اتصال بدون پسورد و امن سرور به گیت‌هاب:

1. در ترمینال سرور، کلید بسازید: `ssh-keygen -t ed25519 -C "vps-hmr-server"`
2. محتوای کلید عمومی (`cat ~/.ssh/id_ed25519.pub`) را در بخش **Deploy keys** در تنظیمات مخزن گیت‌هاب ثبت کنید.
3. یک‌بار دستور `git clone` را در سرور اجرا کنید تا ارتباط اولیه برقرار شود.

-----۳. پیاده‌سازی استقرار خودکار (CI/CD)  
  
هدف: به‌روزرسانی خودکار سرور با هر Push به شاخه `main`.

- فایل جدید `.github/workflows/deploy.yml` را در پروژه بسازید:

```
name: Deploy to Ubuntu VPS
on:
  push:
    branches: [ main ]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - name: Deploying changes
      uses: appleboy/ssh-action@v1.0.3
      with:
        host: ${{ secrets.VPS_HOST }}
        username: ${{ secrets.VPS_USER }}
        key: ${{ secrets.VPS_SSH_KEY }}
        port: ${{ secrets.VPS_PORT }}
        script: |
          cd /path/to/your/project
          git reset --hard
          git pull origin main
```

-----۴. پیاده‌سازی پشتیبان‌گیری خودکار (Telegram)  
  
هدف: تهیه خروجی از دیتابیس و فایل‌ها و ارسال به تلگرام.گام الف: ایجاد اسکریپت روی سرور  
  
فایل `/root/backup_hmr.sh` را ایجاد کرده و کد زیر را در آن قرار دهید:

```
#!/bin/bash
BACKUP_NAME="HMR_Backup_$(date +%Y-%m-%d_%H-%M).tar.gz"
BACKUP_PATH="/tmp/$BACKUP_NAME"
# فشرده‌سازی دیتابیس و پروژه
tar -czf "$BACKUP_PATH" ~/.flowise /path/to/your/project
echo "$BACKUP_PATH"
```

_(فراموش نکنید دسترسی اجرا بدهید: `chmod +x /root/backup_hmr.sh`)_گام ب: تنظیم اکشن در گیت‌هاب  
  
فایل `.github/workflows/daily-backup.yml` را ایجاد کنید:

```
name: Daily Backup to Telegram
on:
  schedule:
    - cron: '0 3 * * *' # اجرای خودکار ساعت ۳ بامداد
  workflow_dispatch:
jobs:
  backup:
    runs-on: ubuntu-latest
    steps:
      - name: Execute Backup on Server
        uses: appleboy/ssh-action@v1.0.3
        with:
          # (استفاده از secrets)
          script: /root/backup_hmr.sh
      - name: Send to Telegram
        run: |
          # دستور curl برای ارسال فایل بک‌آپ به تلگرام
```

-----۵. نکته حیاتی مدیریت Flowise  
  
تغییرات رابط کاربری در **Flowise** (مثل ویرایش پرامپت‌ها و نودها) در دیتابیس داخلی سرور ذخیره می‌شوند و جزو "فایل‌های کد" نیستند.

- **الزام:** پس از هر ویرایش مهم در وب‌سایت Flowise، حتماً گزینه **Export (JSON)** را بزنید، فایل را در پوشه پروژه در کامپیوتر خود کپی کرده و به گیت‌هاب **Push** کنید تا نسخه پشتیبان آن در مخزن شما همیشه موجود باشد.
