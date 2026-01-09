import z, { ZodEffects } from 'zod';
import { CamelCasedPropertiesDeep, SnakeCasedPropertiesDeep } from 'type-fest';
import camelcaseKeys from 'camelcase-keys';
import snakecaseKeys from 'snakecase-keys';

export const zodToCamelCase = <T extends z.ZodTypeAny>(
  zod: T,
): ZodEffects<z.ZodTypeAny, CamelCasedPropertiesDeep<T['_output']>> =>
  zod.transform(
    (val) => camelcaseKeys(val, { deep: true }) as CamelCasedPropertiesDeep<T>,
  );

export const zodToSnakeCase = <T extends z.ZodTypeAny>(
  zod: T,
): ZodEffects<z.ZodTypeAny, SnakeCasedPropertiesDeep<T['_output']>> =>
  zod.transform(
    (val) => snakecaseKeys(val, { deep: true }) as SnakeCasedPropertiesDeep<T>,
  );
