import { BadRequestException, Injectable, type PipeTransform, type ArgumentMetadata } from '@nestjs/common';
import type { z } from 'zod';

type ZodSchemaHolder = { schema?: z.ZodType };

@Injectable()
export class ZodValidationPipe implements PipeTransform {
  transform(value: unknown, metadata: ArgumentMetadata): unknown {
    if (metadata.type !== 'body') {
      return value;
    }
    const ctor = metadata.metatype as ZodSchemaHolder | null | undefined;
    const schema = ctor?.schema;
    if (!schema) {
      return value;
    }
    const parsed = schema.safeParse(value);
    if (!parsed.success) {
      throw new BadRequestException();
    }
    return parsed.data;
  }
}
