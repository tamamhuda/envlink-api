import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';

declare module 'typeorm' {
  interface Repository<Entity> {
    getOrThrow(conditions: any, error?: Error): Promise<Entity>;
  }
}

Repository.prototype.getOrThrow = async function (
  conditions: any,
  error?: Error,
) {
  const entity = await this.findOne({ where: conditions });
  if (!entity) throw error ?? new NotFoundException('Entity not found');
  return entity;
};
