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

```
├── 📁 .jetclient
│   ├── 📁 API
│   │   ├── 📄 _folder.md
│   │   └── 📄 healthz.md
│   └── 📄 jetclient.md
├── 📁 src
│   ├── 📁 account
│   │   ├── 📄 account.controller.ts
│   │   ├── 📄 account.module.ts
│   │   └── 📄 account.service.ts
│   ├── 📁 auth
│   │   ├── 📄 auth.controller.ts
│   │   ├── 📄 auth.module.ts
│   │   └── 📄 auth.service.ts
│   ├── 📁 common
│   │   ├── 📁 filters
│   │   │   ├── 📄 catch-everything.filter.ts
│   │   │   └── 📄 http-exception.filter.ts
│   │   ├── 📁 interceptors
│   │   │   └── 📄 logging.interceptor.ts
│   │   ├── 📁 logger
│   │   │   └── 📄 logger.service.ts
│   │   ├── 📁 providers
│   │   │   └── 📄 global.providers.ts
│   │   └── 📄 global-validation.pipe.ts
│   ├── 📁 config
│   │   ├── 📄 database.config.ts
│   │   ├── 📄 env.type.ts
│   │   ├── 📄 env.validation.ts
│   │   ├── 📄 jwt.config.ts
│   │   ├── 📄 redis.config.ts
│   │   ├── 📄 winston-config.service.ts
│   │   └── 📄 winston.logger.ts
│   ├── 📁 database
│   │   ├── 📄 database.controller.ts
│   │   ├── 📄 database.module.ts
│   │   └── 📄 database.service.ts
│   ├── 📁 session
│   │   ├── 📄 session.controller.ts
│   │   ├── 📄 session.module.ts
│   │   └── 📄 session.service.ts
│   ├── 📁 user
│   │   ├── 📄 user.controller.ts
│   │   ├── 📄 user.module.ts
│   │   └── 📄 user.service.ts
│   ├── 📄 app.controller.spec.ts
│   ├── 📄 app.controller.ts
│   ├── 📄 app.module.ts
│   ├── 📄 app.service.ts
│   └── 📄 main.ts
├── 📁 test
│   ├── 📄 app.e2e-spec.ts
│   └── 📄 jest-e2e.json
├── 📄 .gitignore
├── 📄 .prettierrc
├── 📄 docker-compose.dev.yml
├── 📄 docker-compose.prod.yml
├── 📄 docker-compose.yml
├── 📄 Dockerfile
├── 📄 Dockerfile.dev
├── 📄 entrypoint.dev.sh
├── 📄 entrypoint.sh
├── 📄 eslint.config.mjs
├── 📄 LICENSE
├── 📄 nest-cli.json
├── 📄 package-lock.json
├── 📄 package.json
├── 📄 README.md
├── 📄 tsconfig.build.json
└── 📄 tsconfig.json
```

*Last updated: 2025-07-09T13:15:28.075Z*

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