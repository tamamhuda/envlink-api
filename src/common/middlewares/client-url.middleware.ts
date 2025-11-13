import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { ZodValidationException } from 'nestjs-zod';
import * as z from 'zod';

@Injectable()
export class ClientUrlMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const clientUrl = req.headers['x-client-url'];
    if (typeof clientUrl === 'string') {
      if (clientUrl) {
        const { error } = z
          .string()
          .url('invalid url, value of x-client-url')
          .safeParse(clientUrl);
        if (error) {
          throw new ZodValidationException(error);
        }
        req['clientUrl'] = clientUrl.trim();
      }
    }
    next();
  }
}
