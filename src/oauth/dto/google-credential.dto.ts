import { createZodDto } from 'nestjs-zod';
import z from 'zod';

export const googleCredentialsSchema = z.object({
  credential: z.string(),
});

export class GoogleCredential extends createZodDto(googleCredentialsSchema) {}

export class GoogleCredentialRequest extends GoogleCredential {}
