import type { FieldErrors, FieldValues, Resolver } from 'react-hook-form';
import type z from 'zod';

/**
 * Zod v4 resolver for react-hook-form
 * Strictly typed and TS-safe
 */
export function zodV4Resolver<
  T extends z.ZodTypeAny,
  TFieldValues extends FieldValues = z.infer<T> extends FieldValues ? z.infer<T> : FieldValues,
>(schema: T): Resolver<TFieldValues> {
  return async (values) => {
    const result = schema.safeParse(values);

    if (result.success) {
      return {
        values: result.data as TFieldValues,
        errors: {},
      };
    }

    const errors: FieldErrors<TFieldValues> = {} as FieldErrors<TFieldValues>;

    for (const issue of result.error.issues) {
      const path = issue.path.join('.') as keyof FieldErrors<TFieldValues>;

      if (path && !errors[path]) {
        (errors as Record<string, { type: string; message: string }>)[path as string] = {
          type: issue.code,
          message: issue.message,
        };
      }
    }

    return {
      values: {} as Record<string, never>,
      errors,
    };
  };
}
