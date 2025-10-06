import { Repository, FindOptionsWhere, ObjectLiteral } from 'typeorm';
import { NotFoundException } from '@nestjs/common';

declare module 'typeorm' {
  interface Repository<Entity extends ObjectLiteral> {
    getOrThrow(
      this: Repository<Entity>,
      conditions: FindOptionsWhere<Entity>,
      error?: Error,
    ): Promise<Entity>;
  }
}

Repository.prototype.getOrThrow = async function <Entity extends ObjectLiteral>(
  this: Repository<Entity>,
  conditions: FindOptionsWhere<Entity>,
  error?: Error,
): Promise<Entity> {
  const entity = await this.findOne({ where: conditions });
  if (!entity) throw error ?? new NotFoundException('Entity not found');
  return entity;
};
