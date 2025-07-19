import {
    ArgumentMetadata, BadRequestException,
    HttpException,
    Injectable,
    PipeTransform,
} from '@nestjs/common';
import * as z from 'zod';

@Injectable()
export class ZodValidationPipe implements PipeTransform {
    constructor(private readonly schema?: z.ZodSchema<any>) {}

    transform(value: any, metadata: ArgumentMetadata): any {
        const schema = this.schema ?? (metadata.metatype as any)?.schema;

        if (!schema || typeof schema.parse !== 'function') {
            return value;
        }

        const result = schema.safeParse(value);

        if (result.success) {
            return result.data;
        }

        const { formErrors, fieldErrors } = z.flattenError(result.error);

        throw new BadRequestException({
            message: 'Validation failed.',
            error: {
                ...fieldErrors,
                ...(formErrors.length > 0 ? { _global: formErrors } : {}),
            },
        });
    }
}
