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
├── <img src="https://cdn-icons-png.flaticon.com/512/14090/14090367.png" alt="Folder" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> .zed
│   └── <img src="https://cdn-icons-png.flaticon.com/512/11580/11580838.png" alt="JSON" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> debug.json
├── <img src="https://cdn-icons-png.flaticon.com/512/14090/14090367.png" alt="Folder" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> docs
│   └── <img src="https://logo.svgcdn.com/l/markdown.svg" alt="Markdown" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> README.md
├── <img src="https://cdn-icons-png.flaticon.com/512/14090/14090367.png" alt="Folder" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> requests
│   ├── <img src="https://cdn-icons-png.flaticon.com/512/14090/14090367.png" alt="Folder" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> tests
│   │   ├── <img src="https://logo.svgcdn.com/l/javascript.svg" alt="JavaScript" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> auth.test.js
│   │   └── <img src="https://logo.svgcdn.com/l/javascript.svg" alt="JavaScript" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> urls.test.js
│   ├── <img src="https://cdn-icons-png.flaticon.com/512/4194/4194717.png" alt="File" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> auth.request.http
│   ├── <img src="https://cdn-icons-png.flaticon.com/512/4194/4194717.png" alt="File" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> health.request.http
│   ├── <img src="https://cdn-icons-png.flaticon.com/512/4194/4194717.png" alt="File" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> session.request.http
│   ├── <img src="https://cdn-icons-png.flaticon.com/512/4194/4194717.png" alt="File" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> urls.request.http
│   └── <img src="https://cdn-icons-png.flaticon.com/512/4194/4194717.png" alt="File" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> user.request.http
├── <img src="https://cdn-icons-png.flaticon.com/512/14090/14090367.png" alt="Folder" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> src
│   ├── <img src="https://cdn-icons-png.flaticon.com/512/14090/14090367.png" alt="Folder" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> account
│   │   ├── <img src="https://cdn-icons-png.flaticon.com/512/14090/14090367.png" alt="Folder" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> dto
│   │   │   └── <img src="https://logo.svgcdn.com/l/typescript-icon.svg" alt="TypeScript" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> account.dto.ts
│   │   ├── <img src="https://logo.svgcdn.com/l/typescript-icon.svg" alt="TypeScript" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> account-verify.service.ts
│   │   ├── <img src="https://logo.svgcdn.com/l/typescript-icon.svg" alt="TypeScript" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> account.controller.ts
│   │   ├── <img src="https://logo.svgcdn.com/l/typescript-icon.svg" alt="TypeScript" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> account.module.ts
│   │   └── <img src="https://logo.svgcdn.com/l/typescript-icon.svg" alt="TypeScript" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> account.service.ts
│   ├── <img src="https://cdn-icons-png.flaticon.com/512/14090/14090367.png" alt="Folder" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> auth
│   │   ├── <img src="https://cdn-icons-png.flaticon.com/512/14090/14090367.png" alt="Folder" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> dto
│   │   │   ├── <img src="https://logo.svgcdn.com/l/typescript-icon.svg" alt="TypeScript" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> authenticated.dto.ts
│   │   │   ├── <img src="https://logo.svgcdn.com/l/typescript-icon.svg" alt="TypeScript" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> change-password.dto.ts
│   │   │   ├── <img src="https://logo.svgcdn.com/l/typescript-icon.svg" alt="TypeScript" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> login.dto.ts
│   │   │   ├── <img src="https://logo.svgcdn.com/l/typescript-icon.svg" alt="TypeScript" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> register.dto.ts
│   │   │   ├── <img src="https://logo.svgcdn.com/l/typescript-icon.svg" alt="TypeScript" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> token.dto.ts
│   │   │   └── <img src="https://logo.svgcdn.com/l/typescript-icon.svg" alt="TypeScript" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> user-info.dto.ts
│   │   ├── <img src="https://cdn-icons-png.flaticon.com/512/14090/14090367.png" alt="Folder" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> guards
│   │   │   ├── <img src="https://logo.svgcdn.com/l/typescript-icon.svg" alt="TypeScript" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> jwt-refresh.guard.ts
│   │   │   ├── <img src="https://logo.svgcdn.com/l/typescript-icon.svg" alt="TypeScript" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> jwt.guard.ts
│   │   │   └── <img src="https://logo.svgcdn.com/l/typescript-icon.svg" alt="TypeScript" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> local.guard.ts
│   │   ├── <img src="https://cdn-icons-png.flaticon.com/512/14090/14090367.png" alt="Folder" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> strategies
│   │   │   ├── <img src="https://logo.svgcdn.com/l/typescript-icon.svg" alt="TypeScript" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> jwt-refresh.strategy.ts
│   │   │   ├── <img src="https://logo.svgcdn.com/l/typescript-icon.svg" alt="TypeScript" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> jwt.strategy.ts
│   │   │   └── <img src="https://logo.svgcdn.com/l/typescript-icon.svg" alt="TypeScript" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> local.strategy.ts
│   │   ├── <img src="https://logo.svgcdn.com/l/typescript-icon.svg" alt="TypeScript" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> auth.controller.ts
│   │   ├── <img src="https://logo.svgcdn.com/l/typescript-icon.svg" alt="TypeScript" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> auth.module.ts
│   │   └── <img src="https://logo.svgcdn.com/l/typescript-icon.svg" alt="TypeScript" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> auth.service.ts
│   ├── <img src="https://cdn-icons-png.flaticon.com/512/14090/14090367.png" alt="Folder" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> common
│   │   ├── <img src="https://cdn-icons-png.flaticon.com/512/14090/14090367.png" alt="Folder" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> cache
│   │   │   ├── <img src="https://logo.svgcdn.com/l/typescript-icon.svg" alt="TypeScript" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> cache-health.indicator.ts
│   │   │   └── <img src="https://logo.svgcdn.com/l/typescript-icon.svg" alt="TypeScript" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> cache.service.ts
│   │   ├── <img src="https://cdn-icons-png.flaticon.com/512/14090/14090367.png" alt="Folder" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> decorators
│   │   │   ├── <img src="https://logo.svgcdn.com/l/typescript-icon.svg" alt="TypeScript" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> authenticated-user.dto.ts
│   │   │   ├── <img src="https://logo.svgcdn.com/l/typescript-icon.svg" alt="TypeScript" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> cached.decorator.ts
│   │   │   ├── <img src="https://logo.svgcdn.com/l/typescript-icon.svg" alt="TypeScript" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> client-url.decorator.ts
│   │   │   ├── <img src="https://logo.svgcdn.com/l/typescript-icon.svg" alt="TypeScript" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> invalidate-cache.decorator.ts
│   │   │   └── <img src="https://logo.svgcdn.com/l/typescript-icon.svg" alt="TypeScript" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> public.decorator.ts
│   │   ├── <img src="https://cdn-icons-png.flaticon.com/512/14090/14090367.png" alt="Folder" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> dto
│   │   │   ├── <img src="https://logo.svgcdn.com/l/typescript-icon.svg" alt="TypeScript" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> error-response.dto.ts
│   │   │   └── <img src="https://logo.svgcdn.com/l/typescript-icon.svg" alt="TypeScript" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> response.dto.ts
│   │   ├── <img src="https://cdn-icons-png.flaticon.com/512/14090/14090367.png" alt="Folder" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> enums
│   │   │   ├── <img src="https://logo.svgcdn.com/l/typescript-icon.svg" alt="TypeScript" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> cache-prefix.enum.ts
│   │   │   ├── <img src="https://logo.svgcdn.com/l/typescript-icon.svg" alt="TypeScript" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> payment-method-status.enum.ts
│   │   │   ├── <img src="https://logo.svgcdn.com/l/typescript-icon.svg" alt="TypeScript" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> payment-method-type.enum.ts
│   │   │   ├── <img src="https://logo.svgcdn.com/l/typescript-icon.svg" alt="TypeScript" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> payment-type.enum.ts
│   │   │   ├── <img src="https://logo.svgcdn.com/l/typescript-icon.svg" alt="TypeScript" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> Period.enum.ts
│   │   │   ├── <img src="https://logo.svgcdn.com/l/typescript-icon.svg" alt="TypeScript" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> plans.enum.ts
│   │   │   ├── <img src="https://logo.svgcdn.com/l/typescript-icon.svg" alt="TypeScript" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> provider.enum.ts
│   │   │   ├── <img src="https://logo.svgcdn.com/l/typescript-icon.svg" alt="TypeScript" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> recurring-cycle-status.enum.ts
│   │   │   ├── <img src="https://logo.svgcdn.com/l/typescript-icon.svg" alt="TypeScript" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> recurring-cycle-type.enum.ts
│   │   │   ├── <img src="https://logo.svgcdn.com/l/typescript-icon.svg" alt="TypeScript" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> roles.enum.ts
│   │   │   ├── <img src="https://logo.svgcdn.com/l/typescript-icon.svg" alt="TypeScript" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> subscription-end-reason.enum.ts
│   │   │   ├── <img src="https://logo.svgcdn.com/l/typescript-icon.svg" alt="TypeScript" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> subscription-history-status.enum.ts
│   │   │   ├── <img src="https://logo.svgcdn.com/l/typescript-icon.svg" alt="TypeScript" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> subscription-history-type.enum.ts
│   │   │   ├── <img src="https://logo.svgcdn.com/l/typescript-icon.svg" alt="TypeScript" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> subscription-status.enum.ts
│   │   │   ├── <img src="https://logo.svgcdn.com/l/typescript-icon.svg" alt="TypeScript" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> trasaction-status.enum.ts
│   │   │   ├── <img src="https://logo.svgcdn.com/l/typescript-icon.svg" alt="TypeScript" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> upgrade-status.enum.ts
│   │   │   └── <img src="https://logo.svgcdn.com/l/typescript-icon.svg" alt="TypeScript" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> upgrade-strategy.enum.ts
│   │   ├── <img src="https://cdn-icons-png.flaticon.com/512/14090/14090367.png" alt="Folder" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> filters
│   │   │   ├── <img src="https://logo.svgcdn.com/l/typescript-icon.svg" alt="TypeScript" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> catch-everything.filter.ts
│   │   │   └── <img src="https://logo.svgcdn.com/l/typescript-icon.svg" alt="TypeScript" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> http-exception.filter.ts
│   │   ├── <img src="https://cdn-icons-png.flaticon.com/512/14090/14090367.png" alt="Folder" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> interceptors
│   │   │   ├── <img src="https://logo.svgcdn.com/l/typescript-icon.svg" alt="TypeScript" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> cache.interceptor.ts
│   │   │   ├── <img src="https://logo.svgcdn.com/l/typescript-icon.svg" alt="TypeScript" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> invalidate-cache.interceptor.ts
│   │   │   ├── <img src="https://logo.svgcdn.com/l/typescript-icon.svg" alt="TypeScript" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> logging.interceptor.ts
│   │   │   ├── <img src="https://logo.svgcdn.com/l/typescript-icon.svg" alt="TypeScript" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> snake-case-transform.interceptor.ts
│   │   │   ├── <img src="https://logo.svgcdn.com/l/typescript-icon.svg" alt="TypeScript" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> throttle.interceptor.ts
│   │   │   ├── <img src="https://logo.svgcdn.com/l/typescript-icon.svg" alt="TypeScript" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> transform.interceptor.ts
│   │   │   └── <img src="https://logo.svgcdn.com/l/typescript-icon.svg" alt="TypeScript" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> url-analytic.interceptor.ts
│   │   ├── <img src="https://cdn-icons-png.flaticon.com/512/14090/14090367.png" alt="Folder" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> interfaces
│   │   │   ├── <img src="https://logo.svgcdn.com/l/typescript-icon.svg" alt="TypeScript" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> api-response.intercace.ts
│   │   │   ├── <img src="https://logo.svgcdn.com/l/typescript-icon.svg" alt="TypeScript" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> cache-context.interface.ts
│   │   │   ├── <img src="https://logo.svgcdn.com/l/typescript-icon.svg" alt="TypeScript" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> client-identity.interface.ts
│   │   │   ├── <img src="https://logo.svgcdn.com/l/typescript-icon.svg" alt="TypeScript" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> jwt-payload.interface.ts
│   │   │   ├── <img src="https://logo.svgcdn.com/l/typescript-icon.svg" alt="TypeScript" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> mail.interface.ts
│   │   │   ├── <img src="https://logo.svgcdn.com/l/typescript-icon.svg" alt="TypeScript" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> throttle.interface.ts
│   │   │   └── <img src="https://logo.svgcdn.com/l/typescript-icon.svg" alt="TypeScript" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> xendit.interface.ts
│   │   ├── <img src="https://cdn-icons-png.flaticon.com/512/14090/14090367.png" alt="Folder" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> logger
│   │   │   ├── <img src="https://logo.svgcdn.com/l/typescript-icon.svg" alt="TypeScript" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> logger.instance.ts
│   │   │   └── <img src="https://logo.svgcdn.com/l/typescript-icon.svg" alt="TypeScript" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> logger.service.ts
│   │   ├── <img src="https://cdn-icons-png.flaticon.com/512/14090/14090367.png" alt="Folder" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> middlewares
│   │   │   └── <img src="https://logo.svgcdn.com/l/typescript-icon.svg" alt="TypeScript" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> client-url.middleware.ts
│   │   ├── <img src="https://cdn-icons-png.flaticon.com/512/14090/14090367.png" alt="Folder" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> schemas
│   │   │   └── <img src="https://logo.svgcdn.com/l/typescript-icon.svg" alt="TypeScript" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> base.schema.ts
│   │   ├── <img src="https://cdn-icons-png.flaticon.com/512/14090/14090367.png" alt="Folder" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> throttle
│   │   │   ├── <img src="https://cdn-icons-png.flaticon.com/512/14090/14090367.png" alt="Folder" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> decorators
│   │   │   │   ├── <img src="https://logo.svgcdn.com/l/typescript-icon.svg" alt="TypeScript" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> skip-throttle.decorator.ts
│   │   │   │   ├── <img src="https://logo.svgcdn.com/l/typescript-icon.svg" alt="TypeScript" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> throttle-plan.decorator.ts
│   │   │   │   └── <img src="https://logo.svgcdn.com/l/typescript-icon.svg" alt="TypeScript" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> throttle-scope.decorator.ts
│   │   │   ├── <img src="https://cdn-icons-png.flaticon.com/512/14090/14090367.png" alt="Folder" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> guards
│   │   │   │   ├── <img src="https://logo.svgcdn.com/l/typescript-icon.svg" alt="TypeScript" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> throttle-plan.guard.ts
│   │   │   │   ├── <img src="https://logo.svgcdn.com/l/typescript-icon.svg" alt="TypeScript" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> throttle-scope.guard.ts
│   │   │   │   └── <img src="https://logo.svgcdn.com/l/typescript-icon.svg" alt="TypeScript" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> throttle.guard.ts
│   │   │   ├── <img src="https://logo.svgcdn.com/l/typescript-icon.svg" alt="TypeScript" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> throttle-policy.resolver.ts
│   │   │   ├── <img src="https://logo.svgcdn.com/l/typescript-icon.svg" alt="TypeScript" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> throttle.constans.ts
│   │   │   └── <img src="https://logo.svgcdn.com/l/typescript-icon.svg" alt="TypeScript" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> throttle.service.ts
│   │   ├── <img src="https://cdn-icons-png.flaticon.com/512/14090/14090367.png" alt="Folder" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> utils
│   │   │   ├── <img src="https://logo.svgcdn.com/l/typescript-icon.svg" alt="TypeScript" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> aws-s3.util.ts
│   │   │   ├── <img src="https://logo.svgcdn.com/l/typescript-icon.svg" alt="TypeScript" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> bcrypt.util.ts
│   │   │   ├── <img src="https://logo.svgcdn.com/l/typescript-icon.svg" alt="TypeScript" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> case-transform.util.ts
│   │   │   ├── <img src="https://logo.svgcdn.com/l/typescript-icon.svg" alt="TypeScript" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> client-identity.util.ts
│   │   │   ├── <img src="https://logo.svgcdn.com/l/typescript-icon.svg" alt="TypeScript" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> ip.util.ts
│   │   │   ├── <img src="https://logo.svgcdn.com/l/typescript-icon.svg" alt="TypeScript" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> jwt.util.ts
│   │   │   ├── <img src="https://logo.svgcdn.com/l/typescript-icon.svg" alt="TypeScript" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> mail.util.ts
│   │   │   ├── <img src="https://logo.svgcdn.com/l/typescript-icon.svg" alt="TypeScript" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> short-code.util.ts
│   │   │   ├── <img src="https://logo.svgcdn.com/l/typescript-icon.svg" alt="TypeScript" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> token.util.ts
│   │   │   └── <img src="https://logo.svgcdn.com/l/typescript-icon.svg" alt="TypeScript" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> xendit.util.ts
│   │   ├── <img src="https://cdn-icons-png.flaticon.com/512/14090/14090367.png" alt="Folder" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> xendit
│   │   │   └── <img src="https://logo.svgcdn.com/l/typescript-icon.svg" alt="TypeScript" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> xendit.service.ts
│   │   └── <img src="https://logo.svgcdn.com/l/typescript-icon.svg" alt="TypeScript" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> common.module.ts
│   ├── <img src="https://cdn-icons-png.flaticon.com/512/14090/14090367.png" alt="Folder" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> config
│   │   ├── <img src="https://logo.svgcdn.com/l/typescript-icon.svg" alt="TypeScript" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> cache.config.ts
│   │   ├── <img src="https://logo.svgcdn.com/l/typescript-icon.svg" alt="TypeScript" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> database.config.ts
│   │   ├── <img src="https://logo.svgcdn.com/l/typescript-icon.svg" alt="TypeScript" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> env.config.ts
│   │   ├── <img src="https://logo.svgcdn.com/l/typescript-icon.svg" alt="TypeScript" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> jwt.config.ts
│   │   ├── <img src="https://logo.svgcdn.com/l/typescript-icon.svg" alt="TypeScript" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> mail.config.ts
│   │   ├── <img src="https://logo.svgcdn.com/l/typescript-icon.svg" alt="TypeScript" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> signed-url.config.ts
│   │   ├── <img src="https://logo.svgcdn.com/l/typescript-icon.svg" alt="TypeScript" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> swagger.config.ts
│   │   └── <img src="https://logo.svgcdn.com/l/typescript-icon.svg" alt="TypeScript" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> winston.config.ts
│   ├── <img src="https://cdn-icons-png.flaticon.com/512/14090/14090367.png" alt="Folder" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> database
│   │   ├── <img src="https://cdn-icons-png.flaticon.com/512/14090/14090367.png" alt="Folder" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> entities
│   │   │   ├── <img src="https://logo.svgcdn.com/l/typescript-icon.svg" alt="TypeScript" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> account.entity.ts
│   │   │   ├── <img src="https://logo.svgcdn.com/l/typescript-icon.svg" alt="TypeScript" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> analytic.entity.ts
│   │   │   ├── <img src="https://logo.svgcdn.com/l/typescript-icon.svg" alt="TypeScript" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> base.entity.ts
│   │   │   ├── <img src="https://logo.svgcdn.com/l/typescript-icon.svg" alt="TypeScript" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> channel.entity.ts
│   │   │   ├── <img src="https://logo.svgcdn.com/l/typescript-icon.svg" alt="TypeScript" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> payment-method.entity.ts
│   │   │   ├── <img src="https://logo.svgcdn.com/l/typescript-icon.svg" alt="TypeScript" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> plan-usage-history.entity.ts
│   │   │   ├── <img src="https://logo.svgcdn.com/l/typescript-icon.svg" alt="TypeScript" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> plan-usage.entity.ts
│   │   │   ├── <img src="https://logo.svgcdn.com/l/typescript-icon.svg" alt="TypeScript" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> plan.entity.ts
│   │   │   ├── <img src="https://logo.svgcdn.com/l/typescript-icon.svg" alt="TypeScript" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> session.entity.ts
│   │   │   ├── <img src="https://logo.svgcdn.com/l/typescript-icon.svg" alt="TypeScript" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> subscription-cycle.entity.ts
│   │   │   ├── <img src="https://logo.svgcdn.com/l/typescript-icon.svg" alt="TypeScript" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> subscription-history.entity.ts
│   │   │   ├── <img src="https://logo.svgcdn.com/l/typescript-icon.svg" alt="TypeScript" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> subscription.entity.ts
│   │   │   ├── <img src="https://logo.svgcdn.com/l/typescript-icon.svg" alt="TypeScript" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> transaction.entity.ts
│   │   │   ├── <img src="https://logo.svgcdn.com/l/typescript-icon.svg" alt="TypeScript" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> url.entity.ts
│   │   │   ├── <img src="https://logo.svgcdn.com/l/typescript-icon.svg" alt="TypeScript" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> Url.ts
│   │   │   └── <img src="https://logo.svgcdn.com/l/typescript-icon.svg" alt="TypeScript" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> user.entity.ts
│   │   ├── <img src="https://cdn-icons-png.flaticon.com/512/14090/14090367.png" alt="Folder" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> repositories
│   │   │   ├── <img src="https://logo.svgcdn.com/l/typescript-icon.svg" alt="TypeScript" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> account.repository.ts
│   │   │   ├── <img src="https://logo.svgcdn.com/l/typescript-icon.svg" alt="TypeScript" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> analytic.repository.ts
│   │   │   ├── <img src="https://logo.svgcdn.com/l/typescript-icon.svg" alt="TypeScript" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> channel.repository.ts
│   │   │   ├── <img src="https://logo.svgcdn.com/l/typescript-icon.svg" alt="TypeScript" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> payment-method.repository.ts
│   │   │   ├── <img src="https://logo.svgcdn.com/l/typescript-icon.svg" alt="TypeScript" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> plan-usage-history.repository.ts
│   │   │   ├── <img src="https://logo.svgcdn.com/l/typescript-icon.svg" alt="TypeScript" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> plan.reposiotry.ts
│   │   │   ├── <img src="https://logo.svgcdn.com/l/typescript-icon.svg" alt="TypeScript" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> session.repository.ts
│   │   │   ├── <img src="https://logo.svgcdn.com/l/typescript-icon.svg" alt="TypeScript" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> subscription-cycle.repository.ts
│   │   │   ├── <img src="https://logo.svgcdn.com/l/typescript-icon.svg" alt="TypeScript" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> subscription-history.repository.ts
│   │   │   ├── <img src="https://logo.svgcdn.com/l/typescript-icon.svg" alt="TypeScript" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> subscription.repository.ts
│   │   │   ├── <img src="https://logo.svgcdn.com/l/typescript-icon.svg" alt="TypeScript" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> transaction.repository.ts
│   │   │   ├── <img src="https://logo.svgcdn.com/l/typescript-icon.svg" alt="TypeScript" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> url.repository.ts
│   │   │   └── <img src="https://logo.svgcdn.com/l/typescript-icon.svg" alt="TypeScript" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> user.repository.ts
│   │   ├── <img src="https://cdn-icons-png.flaticon.com/512/14090/14090367.png" alt="Folder" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> seeders
│   │   │   └── <img src="https://logo.svgcdn.com/l/typescript-icon.svg" alt="TypeScript" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> plan.seeder.ts
│   │   └── <img src="https://logo.svgcdn.com/l/typescript-icon.svg" alt="TypeScript" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> database.module.ts
│   ├── <img src="https://cdn-icons-png.flaticon.com/512/14090/14090367.png" alt="Folder" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> health
│   │   ├── <img src="https://logo.svgcdn.com/l/typescript-icon.svg" alt="TypeScript" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> health.controller.ts
│   │   ├── <img src="https://logo.svgcdn.com/l/typescript-icon.svg" alt="TypeScript" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> health.module.ts
│   │   └── <img src="https://logo.svgcdn.com/l/typescript-icon.svg" alt="TypeScript" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> ip-health.indicator.ts
│   ├── <img src="https://cdn-icons-png.flaticon.com/512/14090/14090367.png" alt="Folder" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> payment-methods
│   │   ├── <img src="https://cdn-icons-png.flaticon.com/512/14090/14090367.png" alt="Folder" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> dto
│   │   │   ├── <img src="https://logo.svgcdn.com/l/typescript-icon.svg" alt="TypeScript" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> create-payment-method.dto.ts
│   │   │   ├── <img src="https://logo.svgcdn.com/l/typescript-icon.svg" alt="TypeScript" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> payment-method.dto.ts
│   │   │   ├── <img src="https://logo.svgcdn.com/l/typescript-icon.svg" alt="TypeScript" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> request-payment-method.dto.ts
│   │   │   ├── <img src="https://logo.svgcdn.com/l/typescript-icon.svg" alt="TypeScript" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> sort-payment-methods.dto.ts
│   │   │   └── <img src="https://logo.svgcdn.com/l/typescript-icon.svg" alt="TypeScript" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> validate-payment-method.dto.ts
│   │   ├── <img src="https://cdn-icons-png.flaticon.com/512/14090/14090367.png" alt="Folder" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> mapper
│   │   │   └── <img src="https://logo.svgcdn.com/l/typescript-icon.svg" alt="TypeScript" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> payment-methods.mapper.ts
│   │   ├── <img src="https://cdn-icons-png.flaticon.com/512/14090/14090367.png" alt="Folder" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> public
│   │   │   └── <img src="https://logo.svgcdn.com/l/typescript-icon.svg" alt="TypeScript" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> payment-methods.controller.ts
│   │   ├── <img src="https://logo.svgcdn.com/l/typescript-icon.svg" alt="TypeScript" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> payment-methods.controller.ts
│   │   ├── <img src="https://logo.svgcdn.com/l/typescript-icon.svg" alt="TypeScript" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> payment-methods.module.ts
│   │   └── <img src="https://logo.svgcdn.com/l/typescript-icon.svg" alt="TypeScript" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> payment-methods.service.ts
│   ├── <img src="https://cdn-icons-png.flaticon.com/512/14090/14090367.png" alt="Folder" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> queue
│   │   ├── <img src="https://cdn-icons-png.flaticon.com/512/14090/14090367.png" alt="Folder" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> interfaces
│   │   │   ├── <img src="https://logo.svgcdn.com/l/typescript-icon.svg" alt="TypeScript" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> mail-subscription.interface.ts
│   │   │   ├── <img src="https://logo.svgcdn.com/l/typescript-icon.svg" alt="TypeScript" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> mail-verify.interface.ts
│   │   │   ├── <img src="https://logo.svgcdn.com/l/typescript-icon.svg" alt="TypeScript" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> url-analytic.interface.ts
│   │   │   └── <img src="https://logo.svgcdn.com/l/typescript-icon.svg" alt="TypeScript" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> url-metadata.interface.ts
│   │   ├── <img src="https://cdn-icons-png.flaticon.com/512/14090/14090367.png" alt="Folder" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> workers
│   │   │   ├── <img src="https://cdn-icons-png.flaticon.com/512/14090/14090367.png" alt="Folder" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> mail
│   │   │   │   ├── <img src="https://logo.svgcdn.com/l/typescript-icon.svg" alt="TypeScript" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> mail-subscription.processor.ts
│   │   │   │   ├── <img src="https://logo.svgcdn.com/l/typescript-icon.svg" alt="TypeScript" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> mail-subscription.service.ts
│   │   │   │   ├── <img src="https://logo.svgcdn.com/l/typescript-icon.svg" alt="TypeScript" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> mail-verify.processor.ts
│   │   │   │   └── <img src="https://logo.svgcdn.com/l/typescript-icon.svg" alt="TypeScript" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> mail-verify.service.ts
│   │   │   ├── <img src="https://cdn-icons-png.flaticon.com/512/14090/14090367.png" alt="Folder" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> url-analytic
│   │   │   │   ├── <img src="https://logo.svgcdn.com/l/typescript-icon.svg" alt="TypeScript" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> url-analytic.processor.ts
│   │   │   │   └── <img src="https://logo.svgcdn.com/l/typescript-icon.svg" alt="TypeScript" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> url-analytic.service.ts
│   │   │   └── <img src="https://cdn-icons-png.flaticon.com/512/14090/14090367.png" alt="Folder" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> url-metadata
│   │   │       ├── <img src="https://logo.svgcdn.com/l/typescript-icon.svg" alt="TypeScript" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> url-metadata.processor.ts
│   │   │       └── <img src="https://logo.svgcdn.com/l/typescript-icon.svg" alt="TypeScript" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> url-metadata.service.ts
│   │   ├── <img src="https://logo.svgcdn.com/l/typescript-icon.svg" alt="TypeScript" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> queue.constans.ts
│   │   └── <img src="https://logo.svgcdn.com/l/typescript-icon.svg" alt="TypeScript" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> queue.module.ts
│   ├── <img src="https://cdn-icons-png.flaticon.com/512/14090/14090367.png" alt="Folder" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> session
│   │   ├── <img src="https://cdn-icons-png.flaticon.com/512/14090/14090367.png" alt="Folder" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> dto
│   │   │   └── <img src="https://logo.svgcdn.com/l/typescript-icon.svg" alt="TypeScript" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> session.dto.ts
│   │   ├── <img src="https://logo.svgcdn.com/l/typescript-icon.svg" alt="TypeScript" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> session.controller.ts
│   │   ├── <img src="https://logo.svgcdn.com/l/typescript-icon.svg" alt="TypeScript" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> session.module.ts
│   │   └── <img src="https://logo.svgcdn.com/l/typescript-icon.svg" alt="TypeScript" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> session.service.ts
│   ├── <img src="https://cdn-icons-png.flaticon.com/512/14090/14090367.png" alt="Folder" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> subscriptions
│   │   ├── <img src="https://cdn-icons-png.flaticon.com/512/14090/14090367.png" alt="Folder" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> dto
│   │   │   ├── <img src="https://logo.svgcdn.com/l/typescript-icon.svg" alt="TypeScript" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> subscription-cycle.dto.ts
│   │   │   ├── <img src="https://logo.svgcdn.com/l/typescript-icon.svg" alt="TypeScript" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> subscription.dto.ts
│   │   │   ├── <img src="https://logo.svgcdn.com/l/typescript-icon.svg" alt="TypeScript" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> upgrade-plan-option.dto.ts
│   │   │   └── <img src="https://logo.svgcdn.com/l/typescript-icon.svg" alt="TypeScript" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> upgrade-subscription.ts
│   │   ├── <img src="https://logo.svgcdn.com/l/typescript-icon.svg" alt="TypeScript" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> subscriptions-callback.service.ts
│   │   ├── <img src="https://logo.svgcdn.com/l/typescript-icon.svg" alt="TypeScript" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> subscriptions-cycles.service.ts
│   │   ├── <img src="https://logo.svgcdn.com/l/typescript-icon.svg" alt="TypeScript" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> subscriptions.controller.ts
│   │   ├── <img src="https://logo.svgcdn.com/l/typescript-icon.svg" alt="TypeScript" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> subscriptions.module.ts
│   │   └── <img src="https://logo.svgcdn.com/l/typescript-icon.svg" alt="TypeScript" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> subscriptions.service.ts
│   ├── <img src="https://cdn-icons-png.flaticon.com/512/14090/14090367.png" alt="Folder" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> transactions
│   │   ├── <img src="https://cdn-icons-png.flaticon.com/512/14090/14090367.png" alt="Folder" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> dto
│   │   │   └── <img src="https://logo.svgcdn.com/l/typescript-icon.svg" alt="TypeScript" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> transaction.dto.ts
│   │   ├── <img src="https://logo.svgcdn.com/l/typescript-icon.svg" alt="TypeScript" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> transactions.controller.ts
│   │   ├── <img src="https://logo.svgcdn.com/l/typescript-icon.svg" alt="TypeScript" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> transactions.module.ts
│   │   └── <img src="https://logo.svgcdn.com/l/typescript-icon.svg" alt="TypeScript" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> transactions.service.ts
│   ├── <img src="https://cdn-icons-png.flaticon.com/512/14090/14090367.png" alt="Folder" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> urls
│   │   ├── <img src="https://cdn-icons-png.flaticon.com/512/14090/14090367.png" alt="Folder" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> dto
│   │   │   ├── <img src="https://logo.svgcdn.com/l/typescript-icon.svg" alt="TypeScript" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> analytic.dto.ts
│   │   │   ├── <img src="https://logo.svgcdn.com/l/typescript-icon.svg" alt="TypeScript" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> channel.dto.ts
│   │   │   ├── <img src="https://logo.svgcdn.com/l/typescript-icon.svg" alt="TypeScript" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> shorten.dto.ts
│   │   │   └── <img src="https://logo.svgcdn.com/l/typescript-icon.svg" alt="TypeScript" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> url.dto.ts
│   │   ├── <img src="https://cdn-icons-png.flaticon.com/512/14090/14090367.png" alt="Folder" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> public
│   │   │   └── <img src="https://logo.svgcdn.com/l/typescript-icon.svg" alt="TypeScript" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> urls.controller.ts
│   │   ├── <img src="https://logo.svgcdn.com/l/typescript-icon.svg" alt="TypeScript" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> urls.controller.ts
│   │   ├── <img src="https://logo.svgcdn.com/l/typescript-icon.svg" alt="TypeScript" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> urls.module.ts
│   │   └── <img src="https://logo.svgcdn.com/l/typescript-icon.svg" alt="TypeScript" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> urls.service.ts
│   ├── <img src="https://cdn-icons-png.flaticon.com/512/14090/14090367.png" alt="Folder" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> user
│   │   ├── <img src="https://cdn-icons-png.flaticon.com/512/14090/14090367.png" alt="Folder" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> dto
│   │   │   ├── <img src="https://logo.svgcdn.com/l/typescript-icon.svg" alt="TypeScript" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> image-upload.dto.ts
│   │   │   └── <img src="https://logo.svgcdn.com/l/typescript-icon.svg" alt="TypeScript" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> user.dto.ts
│   │   ├── <img src="https://cdn-icons-png.flaticon.com/512/14090/14090367.png" alt="Folder" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> mapper
│   │   │   └── <img src="https://logo.svgcdn.com/l/typescript-icon.svg" alt="TypeScript" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> user.mapper.ts
│   │   ├── <img src="https://logo.svgcdn.com/l/typescript-icon.svg" alt="TypeScript" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> user.controller.ts
│   │   ├── <img src="https://logo.svgcdn.com/l/typescript-icon.svg" alt="TypeScript" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> user.module.ts
│   │   └── <img src="https://logo.svgcdn.com/l/typescript-icon.svg" alt="TypeScript" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> user.service.ts
│   ├── <img src="https://cdn-icons-png.flaticon.com/512/14090/14090367.png" alt="Folder" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> webhooks
│   │   ├── <img src="https://logo.svgcdn.com/l/typescript-icon.svg" alt="TypeScript" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> webhooks.controller.ts
│   │   ├── <img src="https://logo.svgcdn.com/l/typescript-icon.svg" alt="TypeScript" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> webhooks.module.ts
│   │   └── <img src="https://logo.svgcdn.com/l/typescript-icon.svg" alt="TypeScript" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> webhooks.service.ts
│   ├── <img src="https://logo.svgcdn.com/l/typescript-icon.svg" alt="TypeScript" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> app.module.ts
│   └── <img src="https://logo.svgcdn.com/l/typescript-icon.svg" alt="TypeScript" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> main.ts
├── <img src="https://cdn-icons-png.flaticon.com/512/14090/14090367.png" alt="Folder" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> test
│   ├── <img src="https://logo.svgcdn.com/l/typescript-icon.svg" alt="TypeScript" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> app.e2e-spec.ts
│   └── <img src="https://cdn-icons-png.flaticon.com/512/11580/11580838.png" alt="JSON" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> jest-e2e.json
├── <img src="https://cdn-icons-png.flaticon.com/512/14090/14090367.png" alt="Folder" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> types
│   ├── <img src="https://logo.svgcdn.com/l/typescript-icon.svg" alt="TypeScript" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> express.d.ts
│   ├── <img src="https://logo.svgcdn.com/l/typescript-icon.svg" alt="TypeScript" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> ip2location-io-nodejs.d.ts
│   └── <img src="https://logo.svgcdn.com/l/typescript-icon.svg" alt="TypeScript" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> zeptomail.d.ts
├── <img src="https://cdn-icons-png.flaticon.com/512/14090/14090367.png" alt="Folder" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> views
│   └── <img src="https://cdn-icons-png.flaticon.com/512/4194/4194717.png" alt="File" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> card.html
├── <img src="https://logo.svgcdn.com/l/git-icon.svg" alt=".gitignore" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> .gitignore
├── <img src="https://cdn-icons-png.flaticon.com/512/4194/4194717.png" alt="File" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> .prettierrc
├── <img src="https://logo.svgcdn.com/l/yaml.svg" alt="YAML" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> docker-compose.dev.yml
├── <img src="https://logo.svgcdn.com/l/yaml.svg" alt="YAML" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> docker-compose.prod.yml
├── <img src="https://logo.svgcdn.com/l/yaml.svg" alt="YAML" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> docker-compose.yml
├── <img src="https://logo.svgcdn.com/l/docker-icon.svg" alt="Dockerfile" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> Dockerfile
├── <img src="https://cdn-icons-png.flaticon.com/512/4194/4194717.png" alt="File" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> Dockerfile.dev
├── <img src="https://logo.svgcdn.com/l/javascript.svg" alt="JavaScript" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; padding: 2px 0;" /> ecosystem.config.js
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
