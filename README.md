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

## Project Structure
<pre>
<img src="https://logo.svgcdn.com/l/nestjs.svg" alt="NestJS" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding-bottom: 4px;" /> envlink-api
├── <img src="https://cdn-icons-png.flaticon.com/512/14090/14090367.png" alt="Folder" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> src
│   ├── <img src="https://cdn-icons-png.flaticon.com/512/14090/14090367.png" alt="Folder" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> account
│   │   ├── <img src="https://logo.svgcdn.com/l/typescript-icon.svg" alt="TypeScript" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> account.controller.ts
│   │   ├── <img src="https://logo.svgcdn.com/l/typescript-icon.svg" alt="TypeScript" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> account.module.ts
│   │   └── <img src="https://logo.svgcdn.com/l/typescript-icon.svg" alt="TypeScript" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> account.service.ts
│   ├── <img src="https://cdn-icons-png.flaticon.com/512/14090/14090367.png" alt="Folder" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> auth
│   │   ├── <img src="https://logo.svgcdn.com/l/typescript-icon.svg" alt="TypeScript" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> auth.controller.ts
│   │   ├── <img src="https://logo.svgcdn.com/l/typescript-icon.svg" alt="TypeScript" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> auth.module.ts
│   │   └── <img src="https://logo.svgcdn.com/l/typescript-icon.svg" alt="TypeScript" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> auth.service.ts
│   ├── <img src="https://cdn-icons-png.flaticon.com/512/14090/14090367.png" alt="Folder" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> common
│   │   ├── <img src="https://cdn-icons-png.flaticon.com/512/14090/14090367.png" alt="Folder" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> enums
│   │   │   ├── <img src="https://logo.svgcdn.com/l/typescript-icon.svg" alt="TypeScript" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> provider.enum.ts
│   │   │   └── <img src="https://logo.svgcdn.com/l/typescript-icon.svg" alt="TypeScript" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> roles.enum.ts
│   │   ├── <img src="https://cdn-icons-png.flaticon.com/512/14090/14090367.png" alt="Folder" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> filters
│   │   │   ├── <img src="https://logo.svgcdn.com/l/typescript-icon.svg" alt="TypeScript" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> catch-everything.filter.ts
│   │   │   └── <img src="https://logo.svgcdn.com/l/typescript-icon.svg" alt="TypeScript" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> http-exception.filter.ts
│   │   ├── <img src="https://cdn-icons-png.flaticon.com/512/14090/14090367.png" alt="Folder" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> interceptors
│   │   │   └── <img src="https://logo.svgcdn.com/l/typescript-icon.svg" alt="TypeScript" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> logging.interceptor.ts
│   │   ├── <img src="https://cdn-icons-png.flaticon.com/512/14090/14090367.png" alt="Folder" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> interfaces
│   │   │   └── <img src="https://logo.svgcdn.com/l/typescript-icon.svg" alt="TypeScript" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> healthz.interface.ts
│   │   ├── <img src="https://cdn-icons-png.flaticon.com/512/14090/14090367.png" alt="Folder" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> logger
│   │   │   └── <img src="https://logo.svgcdn.com/l/typescript-icon.svg" alt="TypeScript" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> logger.service.ts
│   │   ├── <img src="https://cdn-icons-png.flaticon.com/512/14090/14090367.png" alt="Folder" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> pipes
│   │   │   └── <img src="https://logo.svgcdn.com/l/typescript-icon.svg" alt="TypeScript" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> global-validation.pipe.ts
│   │   └── <img src="https://cdn-icons-png.flaticon.com/512/14090/14090367.png" alt="Folder" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> providers
│   │       └── <img src="https://logo.svgcdn.com/l/typescript-icon.svg" alt="TypeScript" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> global.providers.ts
│   ├── <img src="https://cdn-icons-png.flaticon.com/512/14090/14090367.png" alt="Folder" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> config
│   │   ├── <img src="https://logo.svgcdn.com/l/typescript-icon.svg" alt="TypeScript" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> database.config.ts
│   │   ├── <img src="https://logo.svgcdn.com/l/typescript-icon.svg" alt="TypeScript" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> env.type.ts
│   │   ├── <img src="https://logo.svgcdn.com/l/typescript-icon.svg" alt="TypeScript" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> env.validation.ts
│   │   ├── <img src="https://logo.svgcdn.com/l/typescript-icon.svg" alt="TypeScript" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> jwt.config.ts
│   │   ├── <img src="https://logo.svgcdn.com/l/typescript-icon.svg" alt="TypeScript" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> redis.config.ts
│   │   ├── <img src="https://logo.svgcdn.com/l/typescript-icon.svg" alt="TypeScript" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> winston-config.service.ts
│   │   └── <img src="https://logo.svgcdn.com/l/typescript-icon.svg" alt="TypeScript" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> winston.logger.ts
│   ├── <img src="https://cdn-icons-png.flaticon.com/512/14090/14090367.png" alt="Folder" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> database
│   │   ├── <img src="https://cdn-icons-png.flaticon.com/512/14090/14090367.png" alt="Folder" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> entities
│   │   │   ├── <img src="https://logo.svgcdn.com/l/typescript-icon.svg" alt="TypeScript" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> account.entity.ts
│   │   │   ├── <img src="https://logo.svgcdn.com/l/typescript-icon.svg" alt="TypeScript" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> session.entity.ts
│   │   │   └── <img src="https://logo.svgcdn.com/l/typescript-icon.svg" alt="TypeScript" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> user.entity.ts
│   │   ├── <img src="https://logo.svgcdn.com/l/typescript-icon.svg" alt="TypeScript" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> database.module.ts
│   │   └── <img src="https://logo.svgcdn.com/l/typescript-icon.svg" alt="TypeScript" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> database.service.ts
│   ├── <img src="https://cdn-icons-png.flaticon.com/512/14090/14090367.png" alt="Folder" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> redis
│   │   ├── <img src="https://logo.svgcdn.com/l/typescript-icon.svg" alt="TypeScript" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> redis.module.ts
│   │   └── <img src="https://logo.svgcdn.com/l/typescript-icon.svg" alt="TypeScript" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> redis.service.ts
│   ├── <img src="https://cdn-icons-png.flaticon.com/512/14090/14090367.png" alt="Folder" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> session
│   │   ├── <img src="https://logo.svgcdn.com/l/typescript-icon.svg" alt="TypeScript" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> session.controller.ts
│   │   ├── <img src="https://logo.svgcdn.com/l/typescript-icon.svg" alt="TypeScript" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> session.module.ts
│   │   └── <img src="https://logo.svgcdn.com/l/typescript-icon.svg" alt="TypeScript" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> session.service.ts
│   ├── <img src="https://cdn-icons-png.flaticon.com/512/14090/14090367.png" alt="Folder" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> user
│   │   ├── <img src="https://logo.svgcdn.com/l/typescript-icon.svg" alt="TypeScript" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> user.controller.ts
│   │   ├── <img src="https://logo.svgcdn.com/l/typescript-icon.svg" alt="TypeScript" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> user.module.ts
│   │   └── <img src="https://logo.svgcdn.com/l/typescript-icon.svg" alt="TypeScript" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> user.service.ts
│   ├── <img src="https://logo.svgcdn.com/l/typescript-icon.svg" alt="TypeScript" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> app.controller.spec.ts
│   ├── <img src="https://logo.svgcdn.com/l/typescript-icon.svg" alt="TypeScript" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> app.controller.ts
│   ├── <img src="https://logo.svgcdn.com/l/typescript-icon.svg" alt="TypeScript" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> app.module.ts
│   ├── <img src="https://logo.svgcdn.com/l/typescript-icon.svg" alt="TypeScript" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> app.service.ts
│   └── <img src="https://logo.svgcdn.com/l/typescript-icon.svg" alt="TypeScript" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> main.ts
├── <img src="https://cdn-icons-png.flaticon.com/512/14090/14090367.png" alt="Folder" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> test
│   ├── <img src="https://logo.svgcdn.com/l/typescript-icon.svg" alt="TypeScript" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> app.e2e-spec.ts
│   └── <img src="https://cdn-icons-png.flaticon.com/512/11580/11580838.png" alt="JSON" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> jest-e2e.json
├── <img src="https://logo.svgcdn.com/l/git-icon.svg" alt=".gitignore" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> .gitignore
├── <img src="https://cdn-icons-png.flaticon.com/512/4194/4194717.png" alt="File" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> .prettierrc
├── <img src="https://logo.svgcdn.com/l/yaml.svg" alt="YAML" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> docker-compose.dev.yml
├── <img src="https://logo.svgcdn.com/l/yaml.svg" alt="YAML" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> docker-compose.prod.yml
├── <img src="https://logo.svgcdn.com/l/yaml.svg" alt="YAML" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> docker-compose.yml
├── <img src="https://logo.svgcdn.com/l/docker-icon.svg" alt="Dockerfile" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> Dockerfile
├── <img src="https://cdn-icons-png.flaticon.com/512/4194/4194717.png" alt="File" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> Dockerfile.dev
├── <img src="https://logo.svgcdn.com/l/bash-icon.svg" alt="Shell" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> entrypoint.dev.sh
├── <img src="https://logo.svgcdn.com/l/bash-icon.svg" alt="Shell" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> entrypoint.sh
├── <img src="https://logo.svgcdn.com/l/javascript.svg" alt="JavaScript" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> eslint.config.mjs
├── <img src="https://logo.svgcdn.com/l/github.svg" alt="LICENSE" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> LICENSE
├── <img src="https://cdn-icons-png.flaticon.com/512/11580/11580838.png" alt="JSON" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> nest-cli.json
├── <img src="https://logo.svgcdn.com/l/nodejs-icon.svg" alt="Node.js" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> package-lock.json
├── <img src="https://logo.svgcdn.com/l/nodejs-icon.svg" alt="Node.js" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> package.json
├── <img src="https://logo.svgcdn.com/l/markdown.svg" alt="Markdown" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> README.md
├── <img src="https://cdn-icons-png.flaticon.com/512/11580/11580838.png" alt="JSON" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> tsconfig.build.json
└── <img src="https://cdn-icons-png.flaticon.com/512/11580/11580838.png" alt="JSON" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> tsconfig.json
</pre>
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
