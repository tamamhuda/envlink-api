# EnvLink-API (NestJS)

A fast and reliable URL shortening service built with NestJS, enabling easy link generation, management, and usage tracking.

<p align="center">
  <a href="https://nestjs.com/" target="_blank"><img src="https://img.shields.io/badge/NestJS-8DA0F8?logo=nestjs&logoColor=white&style=flat-square" alt="NestJS" /></a>
  <a href="https://typeorm.io/" target="_blank"><img src="https://img.shields.io/badge/TypeORM-3178C6?logo=typeorm&logoColor=white&style=flat-square" alt="TypeORM" /></a>
  <a href="https://redis.io/" target="_blank"><img src="https://img.shields.io/badge/Redis-DC382D?logo=redis&logoColor=white&style=flat-square" alt="Redis" /></a>
  <a href="https://bullmq.io/" target="_blank"><img src="https://img.shields.io/badge/BullMQ-00BFFF?logo=node.js&logoColor=white&style=flat-square" alt="BullMQ" /></a>
  <a href="https://www.passportjs.org/" target="_blank"><img src="https://img.shields.io/badge/Passport.js-34495E?logo=passport&logoColor=white&style=flat-square" alt="Passport.js" /></a>
  <a href="https://www.zoho.com/id/zeptomail/" target="_blank"><img src="https://img.shields.io/badge/ZeptoMail-9F3EDD?logo=zoho&logoColor=white&style=flat-square" alt="ZeptoMail" /></a>
  <a href="https://handlebarsjs.com/" target="_blank"><img src="https://img.shields.io/badge/Handlebars-E34F26?logo=handlebarsdotjs&logoColor=white&style=flat-square" alt="Handlebars" /></a>
  <a href="https://playwright.dev/" target="_blank"><img src="https://img.shields.io/badge/Playwright-000000?logo=playwright&logoColor=white&style=flat-square" alt="Playwright" /></a>
  <a href="https://github.com/typestack/class-validator" target="_blank"><img src="https://img.shields.io/badge/class--validator-7B1FA2?logo=typescript&logoColor=white&style=flat-square" alt="class-validator" /></a>
</p>

---

## Project Structure

<pre>
<img src="https://cdn-icons-png.flaticon.com/512/14090/14090367.png" alt="Folder" style="width:15px; height:15px; object-fit:contain; vertical-align:middle; padding: 2px 5px 2px 0;" />envlink-api
├── <img src="https://cdn-icons-png.flaticon.com/512/14090/14090367.png" alt="Folder" style="width:15px; height:15px; object-fit:contain; vertical-align:middle; padding: 2px 5px 2px 0;" /> docs
├── <img src="https://cdn-icons-png.flaticon.com/512/14090/14090367.png" alt="Folder" style="width:15px; height:15px; object-fit:contain; vertical-align:middle; padding: 2px 5px 2px 0;" /> requests
│   └── <img src="https://cdn-icons-png.flaticon.com/512/14090/14090367.png" alt="Folder" style="width:15px; height:15px; object-fit:contain; vertical-align:middle; padding: 2px 5px 2px 0;" /> tests
├── <img src="https://cdn-icons-png.flaticon.com/512/14090/14090367.png" alt="Folder" style="width:15px; height:15px; object-fit:contain; vertical-align:middle; padding: 2px 5px 2px 0;" /> src
│   ├── <img src="https://cdn-icons-png.flaticon.com/512/14090/14090367.png" alt="Folder" style="width:15px; height:15px; object-fit:contain; vertical-align:middle; padding: 2px 5px 2px 0;" /> account
│   │   └── <img src="https://cdn-icons-png.flaticon.com/512/14090/14090367.png" alt="Folder" style="width:15px; height:15px; object-fit:contain; vertical-align:middle; padding: 2px 5px 2px 0;" /> dto
│   ├── <img src="https://cdn-icons-png.flaticon.com/512/14090/14090367.png" alt="Folder" style="width:15px; height:15px; object-fit:contain; vertical-align:middle; padding: 2px 5px 2px 0;" /> auth
│   │   ├── <img src="https://cdn-icons-png.flaticon.com/512/14090/14090367.png" alt="Folder" style="width:15px; height:15px; object-fit:contain; vertical-align:middle; padding: 2px 5px 2px 0;" /> dto
│   │   ├── <img src="https://cdn-icons-png.flaticon.com/512/14090/14090367.png" alt="Folder" style="width:15px; height:15px; object-fit:contain; vertical-align:middle; padding: 2px 5px 2px 0;" /> guards
│   │   └── <img src="https://cdn-icons-png.flaticon.com/512/14090/14090367.png" alt="Folder" style="width:15px; height:15px; object-fit:contain; vertical-align:middle; padding: 2px 5px 2px 0;" /> strategies
│   ├── <img src="https://cdn-icons-png.flaticon.com/512/14090/14090367.png" alt="Folder" style="width:15px; height:15px; object-fit:contain; vertical-align:middle; padding: 2px 5px 2px 0;" /> common
│   │   ├── <img src="https://cdn-icons-png.flaticon.com/512/14090/14090367.png" alt="Folder" style="width:15px; height:15px; object-fit:contain; vertical-align:middle; padding: 2px 5px 2px 0;" /> cache
│   │   ├── <img src="https://cdn-icons-png.flaticon.com/512/14090/14090367.png" alt="Folder" style="width:15px; height:15px; object-fit:contain; vertical-align:middle; padding: 2px 5px 2px 0;" /> decorators
│   │   ├── <img src="https://cdn-icons-png.flaticon.com/512/14090/14090367.png" alt="Folder" style="width:15px; height:15px; object-fit:contain; vertical-align:middle; padding: 2px 5px 2px 0;" /> dto
│   │   ├── <img src="https://cdn-icons-png.flaticon.com/512/14090/14090367.png" alt="Folder" style="width:15px; height:15px; object-fit:contain; vertical-align:middle; padding: 2px 5px 2px 0;" /> enums
│   │   ├── <img src="https://cdn-icons-png.flaticon.com/512/14090/14090367.png" alt="Folder" style="width:15px; height:15px; object-fit:contain; vertical-align:middle; padding: 2px 5px 2px 0;" /> filters
│   │   ├── <img src="https://cdn-icons-png.flaticon.com/512/14090/14090367.png" alt="Folder" style="width:15px; height:15px; object-fit:contain; vertical-align:middle; padding: 2px 5px 2px 0;" /> interceptors
│   │   ├── <img src="https://cdn-icons-png.flaticon.com/512/14090/14090367.png" alt="Folder" style="width:15px; height:15px; object-fit:contain; vertical-align:middle; padding: 2px 5px 2px 0;" /> interfaces
│   │   ├── <img src="https://cdn-icons-png.flaticon.com/512/14090/14090367.png" alt="Folder" style="width:15px; height:15px; object-fit:contain; vertical-align:middle; padding: 2px 5px 2px 0;" /> logger
│   │   ├── <img src="https://cdn-icons-png.flaticon.com/512/14090/14090367.png" alt="Folder" style="width:15px; height:15px; object-fit:contain; vertical-align:middle; padding: 2px 5px 2px 0;" /> middlewares
│   │   ├── <img src="https://cdn-icons-png.flaticon.com/512/14090/14090367.png" alt="Folder" style="width:15px; height:15px; object-fit:contain; vertical-align:middle; padding: 2px 5px 2px 0;" /> schemas
│   │   ├── <img src="https://cdn-icons-png.flaticon.com/512/14090/14090367.png" alt="Folder" style="width:15px; height:15px; object-fit:contain; vertical-align:middle; padding: 2px 5px 2px 0;" /> throttle
│   │   │   ├── <img src="https://cdn-icons-png.flaticon.com/512/14090/14090367.png" alt="Folder" style="width:15px; height:15px; object-fit:contain; vertical-align:middle; padding: 2px 5px 2px 0;" /> decorators
│   │   │   └── <img src="https://cdn-icons-png.flaticon.com/512/14090/14090367.png" alt="Folder" style="width:15px; height:15px; object-fit:contain; vertical-align:middle; padding: 2px 5px 2px 0;" /> guards
│   │   ├── <img src="https://cdn-icons-png.flaticon.com/512/14090/14090367.png" alt="Folder" style="width:15px; height:15px; object-fit:contain; vertical-align:middle; padding: 2px 5px 2px 0;" /> utils
│   │   └── <img src="https://cdn-icons-png.flaticon.com/512/14090/14090367.png" alt="Folder" style="width:15px; height:15px; object-fit:contain; vertical-align:middle; padding: 2px 5px 2px 0;" /> xendit
│   ├── <img src="https://cdn-icons-png.flaticon.com/512/14090/14090367.png" alt="Folder" style="width:15px; height:15px; object-fit:contain; vertical-align:middle; padding: 2px 5px 2px 0;" /> config
│   ├── <img src="https://cdn-icons-png.flaticon.com/512/14090/14090367.png" alt="Folder" style="width:15px; height:15px; object-fit:contain; vertical-align:middle; padding: 2px 5px 2px 0;" /> database
│   │   ├── <img src="https://cdn-icons-png.flaticon.com/512/14090/14090367.png" alt="Folder" style="width:15px; height:15px; object-fit:contain; vertical-align:middle; padding: 2px 5px 2px 0;" /> entities
│   │   ├── <img src="https://cdn-icons-png.flaticon.com/512/14090/14090367.png" alt="Folder" style="width:15px; height:15px; object-fit:contain; vertical-align:middle; padding: 2px 5px 2px 0;" /> repositories
│   │   └── <img src="https://cdn-icons-png.flaticon.com/512/14090/14090367.png" alt="Folder" style="width:15px; height:15px; object-fit:contain; vertical-align:middle; padding: 2px 5px 2px 0;" /> seeders
│   ├── <img src="https://cdn-icons-png.flaticon.com/512/14090/14090367.png" alt="Folder" style="width:15px; height:15px; object-fit:contain; vertical-align:middle; padding: 2px 5px 2px 0;" /> health
│   ├── <img src="https://cdn-icons-png.flaticon.com/512/14090/14090367.png" alt="Folder" style="width:15px; height:15px; object-fit:contain; vertical-align:middle; padding: 2px 5px 2px 0;" /> payment-methods
│   │   ├── <img src="https://cdn-icons-png.flaticon.com/512/14090/14090367.png" alt="Folder" style="width:15px; height:15px; object-fit:contain; vertical-align:middle; padding: 2px 5px 2px 0;" /> dto
│   │   ├── <img src="https://cdn-icons-png.flaticon.com/512/14090/14090367.png" alt="Folder" style="width:15px; height:15px; object-fit:contain; vertical-align:middle; padding: 2px 5px 2px 0;" /> mapper
│   │   └── <img src="https://cdn-icons-png.flaticon.com/512/14090/14090367.png" alt="Folder" style="width:15px; height:15px; object-fit:contain; vertical-align:middle; padding: 2px 5px 2px 0;" /> public
│   ├── <img src="https://cdn-icons-png.flaticon.com/512/14090/14090367.png" alt="Folder" style="width:15px; height:15px; object-fit:contain; vertical-align:middle; padding: 2px 5px 2px 0;" /> queue
│   │   ├── <img src="https://cdn-icons-png.flaticon.com/512/14090/14090367.png" alt="Folder" style="width:15px; height:15px; object-fit:contain; vertical-align:middle; padding: 2px 5px 2px 0;" /> interfaces
│   │   └── <img src="https://cdn-icons-png.flaticon.com/512/14090/14090367.png" alt="Folder" style="width:15px; height:15px; object-fit:contain; vertical-align:middle; padding: 2px 5px 2px 0;" /> workers
│   │       ├── <img src="https://cdn-icons-png.flaticon.com/512/14090/14090367.png" alt="Folder" style="width:15px; height:15px; object-fit:contain; vertical-align:middle; padding: 2px 5px 2px 0;" /> mail
│   │       ├── <img src="https://cdn-icons-png.flaticon.com/512/14090/14090367.png" alt="Folder" style="width:15px; height:15px; object-fit:contain; vertical-align:middle; padding: 2px 5px 2px 0;" /> url-analytic
│   │       └── <img src="https://cdn-icons-png.flaticon.com/512/14090/14090367.png" alt="Folder" style="width:15px; height:15px; object-fit:contain; vertical-align:middle; padding: 2px 5px 2px 0;" /> url-metadata
│   ├── <img src="https://cdn-icons-png.flaticon.com/512/14090/14090367.png" alt="Folder" style="width:15px; height:15px; object-fit:contain; vertical-align:middle; padding: 2px 5px 2px 0;" /> session
│   │   └── <img src="https://cdn-icons-png.flaticon.com/512/14090/14090367.png" alt="Folder" style="width:15px; height:15px; object-fit:contain; vertical-align:middle; padding: 2px 5px 2px 0;" /> dto
│   ├── <img src="https://cdn-icons-png.flaticon.com/512/14090/14090367.png" alt="Folder" style="width:15px; height:15px; object-fit:contain; vertical-align:middle; padding: 2px 5px 2px 0;" /> subscriptions
│   │   └── <img src="https://cdn-icons-png.flaticon.com/512/14090/14090367.png" alt="Folder" style="width:15px; height:15px; object-fit:contain; vertical-align:middle; padding: 2px 5px 2px 0;" /> dto
│   ├── <img src="https://cdn-icons-png.flaticon.com/512/14090/14090367.png" alt="Folder" style="width:15px; height:15px; object-fit:contain; vertical-align:middle; padding: 2px 5px 2px 0;" /> transactions
│   │   └── <img src="https://cdn-icons-png.flaticon.com/512/14090/14090367.png" alt="Folder" style="width:15px; height:15px; object-fit:contain; vertical-align:middle; padding: 2px 5px 2px 0;" /> dto
│   ├── <img src="https://cdn-icons-png.flaticon.com/512/14090/14090367.png" alt="Folder" style="width:15px; height:15px; object-fit:contain; vertical-align:middle; padding: 2px 5px 2px 0;" /> urls
│   │   ├── <img src="https://cdn-icons-png.flaticon.com/512/14090/14090367.png" alt="Folder" style="width:15px; height:15px; object-fit:contain; vertical-align:middle; padding: 2px 5px 2px 0;" /> dto
│   │   └── <img src="https://cdn-icons-png.flaticon.com/512/14090/14090367.png" alt="Folder" style="width:15px; height:15px; object-fit:contain; vertical-align:middle; padding: 2px 5px 2px 0;" /> public
│   ├── <img src="https://cdn-icons-png.flaticon.com/512/14090/14090367.png" alt="Folder" style="width:15px; height:15px; object-fit:contain; vertical-align:middle; padding: 2px 5px 2px 0;" /> user
│   │   ├── <img src="https://cdn-icons-png.flaticon.com/512/14090/14090367.png" alt="Folder" style="width:15px; height:15px; object-fit:contain; vertical-align:middle; padding: 2px 5px 2px 0;" /> dto
│   │   └── <img src="https://cdn-icons-png.flaticon.com/512/14090/14090367.png" alt="Folder" style="width:15px; height:15px; object-fit:contain; vertical-align:middle; padding: 2px 5px 2px 0;" /> mapper
│   └── <img src="https://cdn-icons-png.flaticon.com/512/14090/14090367.png" alt="Folder" style="width:15px; height:15px; object-fit:contain; vertical-align:middle; padding: 2px 5px 2px 0;" /> webhooks
├── <img src="https://cdn-icons-png.flaticon.com/512/14090/14090367.png" alt="Folder" style="width:15px; height:15px; object-fit:contain; vertical-align:middle; padding: 2px 5px 2px 0;" /> types
└── <img src="https://cdn-icons-png.flaticon.com/512/14090/14090367.png" alt="Folder" style="width:15px; height:15px; object-fit:contain; vertical-align:middle; padding: 2px 5px 2px 0;" /> views
</pre>

## 🔐 Key Modules & Features

### ✅ Authentication

- JWT & Refresh Token strategy
- Local login & OAuth (Google, GitHub)
- Passport.js integration with guards and strategies

### 👤 Users

- Profile management
- Avatar uploads (S3-ready)
- Email verification via ZeptoMail templates

### 🔗 URLs

- URL shortening and resolution
- Public and private URL access
- QR code generation
- Expiration and cleanup service
- Metadata extraction via background job

### 💳 Payments

- Manages payment methods, subscriptions, and transactions
- Handles recurring payments and subscription cycles
- Xendit integration for billing and payment webhooks

### 📄 Metadata

- Extracts OpenGraph and Twitter metadata
- Uses **Playwright** to render and scrape dynamic content
- Processed asynchronously via **BullMQ workers**

### ✉️ Email (via ZeptoMail)

- Configured using `mail.config.ts`
- Template-based delivery system (verification, reset, upgrade)
- Worker-dispatched via **BullMQ** under `queue/workers/mail`
- Built with **Handlebars** for dynamic templating

### ⚙️ Jobs

- Background processing with **BullMQ**
- Handles mail, metadata, and cleanup tasks

### 📊 Analytics

- URL click tracking and user analytics via Redis cache
- Integrated with interceptors for lightweight performance tracking

### 🛡️ Rate Limiting

- Global request throttling and role-based guards

### ❤️ Health Checks

- Provides health check endpoints for API, cache, and queue services

---

## 🛠️ Tech Stack

- **NestJS** – Core framework
- **TypeORM** – ORM for PostgreSQL/MySQL
- **Redis + BullMQ** – Queue and cache system
- **Playwright** – Metadata extraction and dynamic rendering
- **Passport.js** – Authentication
- **ZeptoMail + Handlebars** – Production-grade email templating
- **Zod + zod-dto** – Schema and DTO validation
- **Winston** – Structured logging
- **Swagger** – API documentation

---

## 💡 Highlights

- 🔄 **Asynchronous jobs** with BullMQ (email, metadata, cleanup)
- 🧠 **Dynamic metadata scraping** using Playwright
- 💳 **Payments & Subscriptions** system with recurring billing (Xendit)
- ✉️ **ZeptoMail integration** for reliable transactional email delivery
- ✅ **Typed and validated configs** using **Zod schemas**
- 📦 **Domain-driven modular architecture** for scalability and maintainability

---

## 📚 Documentation

For full setup, guides, and API references, visit:
**[https://docs.envlink.one](https://docs.envlink.one)**

---

### 🤝 Special Thanks

EnvLink API gratefully acknowledges the following third-party platforms and services that power its core infrastructure, integrations, and developer experience — many of which provide generous free tiers or sandbox environments for testing and development:

- **[IP2Location](https://www.ip2location.io/)** – IP geolocation and analytics enrichment
- **[ZeptoMail](https://www.zeptomail.com/)** – Transactional email delivery and templating
- **[Logtail](https://betterstack.com/logtail)** – Structured logging and observability
- **[Cloudflare Tunnel](https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/)** – Secure local-to-public tunneling for development
- **[Xendit](https://xendit.co/)** – Payment gateway and recurring billing integration
- **[AWS S3](https://aws.amazon.com/s3/)** – Object storage for file and asset management

---

### Developer Contact

- **Name:** Tamam Huda (Uta Dev)
- **Email:** [tamamhuda11@gmail.com](mailto:tamamhuda11@gmail.com)
- **GitHub:** [https://github.com/tamamhuda](https://github.com/tamamhuda)
- **LinkedIn:** [https://linkedin.com/in/tamamhuda](https://linkedin.com/in/tamamhuda)

Feel free to open issues, submit pull requests, or reach out for collaboration.

---

© 2025 Tamam Huda. All rights reserved.
