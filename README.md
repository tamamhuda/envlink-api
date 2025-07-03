# EnvLink-API (NestJS)

A fast and reliable URL shortening service built with NestJS, enabling easy link generation, management, and usage tracking.

<p align="center">
  <a href="https://nestjs.com/" target="_blank"><img src="https://img.shields.io/badge/NestJS-8DA0F8?logo=nestjs&logoColor=white&style=flat-square" alt="NestJS" /></a>
  <a href="https://typeorm.io/" target="_blank"><img src="https://img.shields.io/badge/TypeORM-3178C6?logo=typeorm&logoColor=white&style=flat-square" alt="TypeORM" /></a>
  <a href="https://redis.io/" target="_blank"><img src="https://img.shields.io/badge/Redis-DC382D?logo=redis&logoColor=white&style=flat-square" alt="Redis" /></a>
  <a href="https://bullmq.io/" target="_blank"><img src="https://img.shields.io/badge/BullMQ-00BFFF?logo=node.js&logoColor=white&style=flat-square" alt="BullMQ" /></a>
  <a href="https://www.passportjs.org/" target="_blank"><img src="https://img.shields.io/badge/Passport.js-34495E?logo=passport&logoColor=white&style=flat-square" alt="Passport.js" /></a>
  <a href="https://mailtrap.io/" target="_blank"><img src="https://img.shields.io/badge/Mailtrap-9F3EDD?logo=mailtrap&logoColor=white&style=flat-square" alt="Mailtrap" /></a>
  <a href="https://handlebarsjs.com/" target="_blank"><img src="https://img.shields.io/badge/Handlebars-E34F26?logo=handlebarsdotjs&logoColor=white&style=flat-square" alt="Handlebars" /></a>
  <a href="https://playwright.dev/" target="_blank"><img src="https://img.shields.io/badge/Playwright-000000?logo=playwright&logoColor=white&style=flat-square" alt="Playwright" /></a>
  <a href="https://github.com/typestack/class-validator" target="_blank"><img src="https://img.shields.io/badge/class--validator-7B1FA2?logo=typescript&logoColor=white&style=flat-square" alt="class-validator" /></a>
</p>

---

## 📁 Project Structure

````
src/
├── main.ts
├── app.module.ts
│
├── config/
│ ├── app.config.ts
│ ├── redis.config.ts
│ ├── bullmq.config.ts
│ ├── mail.config.ts // Mailtrap config
│ ├── auth.config.ts
│ ├── env.type.ts
│ ├── env.validation.ts
│ ├── database.config.ts
│ ├── jwt.config.ts
│ └── redis.config.ts
│
├── database/
│   ├── database.module.ts
│   ├── database.service.ts
│   └── entities/
│       └── url.entity.ts
│
├── redis/
│   ├── redis.module.ts
│   └── redis.service.ts
│
├── auth/
│   ├── auth.module.ts
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   ├── dto/
│   │   ├── login.dto.ts
│   │   ├── register.dto.ts
│   │   ├── refresh-token.dto.ts
│   │   └── oauth.dto.ts
│   ├── oauth/
│   │   ├── google.strategy.ts
│   │   └── github.strategy.ts
│   └── strategies/
│       ├── jwt.strategy.ts
│       └── local.strategy.ts
│
├── users/
│   ├── users.module.ts
│   ├── users.controller.ts
│   ├── users.service.ts
│   └── dto/
│       ├── update-user-response.dto.ts
│       └── verify-email.dto.ts
│
├── urls/
│   ├── urls.module.ts
│   ├── urls.controller.ts
│   ├── urls.service.ts
│   ├── entities/
│   │   └── url.entity.ts
│   ├── dto/
│   │   ├── create-url.dto.ts
│   │   ├── update-url.dto.ts
│   │   └── resolve-url.dto.ts
│   ├── services/
│   │   ├── url-generator.service.ts
│   │   ├── url-expiration.service.ts
│   │   └── qr-code.service.ts
│   └── utils/
│       └── short-code-generator.ts
│
├── metadata/
│   ├── metadata.module.ts
│   ├── metadata.service.ts
│   └── jobs/
│       └── fetch-url-metadata.job.ts
│
├── mail/
│   ├── mail.module.ts
│   ├── mail.service.ts
│   └── templates/
│       ├── verification-email.hbs
│       └── password-reset.hbs
│
├── jobs/
│   ├── metadata/
│   │   └── fetch-url-metadata.job.ts
│   ├── mail/
│   │   └── send-email.job.ts
│   ├── urls/
│   │   └── cleanup-url.job.ts
│   ├── job.processor.ts
│   ├── queues.ts
│   └── queue-types.enum.ts
│
├── bullboard/
│   ├── bull-board.module.ts
│   └── bull-board.controller.ts
│
├── analytics/
│   ├── analytics.module.ts
│   ├── analytics.service.ts
│   └── dto/
│       └── log-click.dto.ts
│
├── rate-limit/
│   ├── rate-limit.module.ts
│   └── rate-limit.guard.ts
│
├── common/
│   ├── decorators/
│   │   └── some.decorator.ts
│   ├── guards/
│   │   └── some.guard.ts
│   ├── interceptors/
│   │   └── some.interceptor.ts
│   └── filters/
│       └── some.filter.ts
│
├── enums/
│   ├── role.enum.ts
│   └── provider.enum.ts
│
├── interfaces/
│   ├── user.interface.ts
│   └── url.interface.ts
│
├── middleware/
│   └── request-logger.middleware.ts

````

---

## 🔐 Key Modules & Features

### ✅ Authentication
- JWT & refresh token strategy
- Local login & OAuth (Google, GitHub)
- Passport.js integration

### 👤 Users
- Profile management
- Email verification logic

### 🔗 URLs
- URL shortening and resolution
- QR code generation
- Expiration and cleanup service
- Metadata extraction via background job

### 📄 Metadata
- Extracts OpenGraph and Twitter metadata
- Uses Playwright to render and scrape dynamic content

### ✉️ Email (via Mailtrap)
- Configured using `mail.config.ts`
- Uses `@nestjs-modules/mailer` + Nodemailer
- Handlebars template engine
- Built-in support for verification & reset emails

### ⚙️ Jobs
- Background processing with BullMQ
- Handles email, metadata, and cleanup tasks

### 📊 Analytics
- Track URL clicks and usage

### 🛡️ Rate Limiting
- Global request protection via guards

---

## ⚙️ Configuration

All env config is validated and typed via `@nestjs/config` + `joi`.

| File | Purpose |
|------|---------|
| `database.config.ts` | TypeORM connection |
| `auth.config.ts` | JWT settings |
| `mail.config.ts` | Mailtrap SMTP settings |
| `redis.config.ts` | Redis host/port |
| `bullmq.config.ts` | BullMQ setup |
| `env.validation.ts` | Joi validation |
| `env.type.ts` | Type-safe config contracts |

---

## 🛠️ Tech Stack

- **NestJS** – backend framework
- **TypeORM** – ORM with PostgreSQL/MySQL
- **Redis** – for caching and job queue
- **BullMQ** – background job processing
- **Playwright** – for scraping page metadata
- **Passport.js** – for authentication
- **Mailtrap + Nodemailer** – for secure email testing
- **Handlebars** – email templating
- **class-validator** – for DTO validation

---

## 💡 Highlights

- 🔄 **Async jobs** with BullMQ (metadata, email, cleanup)
- 🧠 **Dynamic metadata** extraction with Playwright
- ✉️ **Email** system is safely testable using **Mailtrap**
- ✅ **Typed environment config** with `joi` + TypeScript
- 📦 **Modular architecture** for easy scaling & testing


## Credits

This project was created and is maintained by **Tamam Huda**.

Special thanks to the open-source community and the developers of the libraries and tools used in this project, including but not limited to:

- [NestJS](https://nestjs.com/)
- [TypeORM](https://typeorm.io/)
- [Redis](https://redis.io/)
- [BullMQ](https://bullmq.io/)
- [Passport.js](https://www.passportjs.org/)
- [Nodemailer](https://nodemailer.com/)
- [Handlebars](https://handlebarsjs.com/)
- [Playwright](https://playwright.dev/)
- [class-validator](https://github.com/typestack/class-validator)

---

### Developer Contact

- **Name:** Tamam Huda (Uta Dev)
- **Email:** tamamhuda11@gmail.com
- **GitHub:** [https://github.com/tamamhuda](https://github.com/tamamhuda)
- **LinkedIn:** [https://linkedin.com/in/tamamhuda](https://linkedin.com/in/tamamhuda)
- **Website:** -

Feel free to open issues, submit pull requests, or reach out via email for collaboration and feedback!

---

© 2025 Tamam Huda. All rights reserved.