import {ArgumentMetadata, BadRequestException, HttpStatus, Injectable, PipeTransform} from "@nestjs/common";
import {validate, ValidationError, ValidatorOptions} from "class-validator";
import {ClassConstructor, plainToInstance} from "class-transformer";


@Injectable()
export class GlobalValidationPipe implements PipeTransform {
    constructor(private options: ValidatorOptions & {transform?: boolean} = {}) {}

    async transform(value: any, {metatype}: ArgumentMetadata): Promise<any> {
        if (!metatype || !this.toValidate(metatype)) {
            return value;
        }

        const object: object = plainToInstance(metatype as ClassConstructor<any>, value, {
            enableImplicitConversion: this.options.transform ?? false
        });

        const errors : ValidationError[] = await validate(object, this.options)

        if (errors.length > 0) {

            const formattedErrors: Record<string, string[]> = {};

            errors.forEach((err) => {
                if(err.constraints) {
                    formattedErrors[err.property] = Object.values(err.constraints)
                }
            })

            throw new BadRequestException({
                message: formattedErrors,
                statusCode : HttpStatus.BAD_REQUEST,
                error: 'Bad Request',
            })

        }

        if (this.options.transform) {
            return object;
        }
        return value;
    }

    private toValidate(metatype: Function) {
        const types: Function[] = [String, Boolean, Number, Array, Object];
        return !types.includes(metatype)
    }

}