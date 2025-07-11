import {
    Injectable,
    InternalServerErrorException,
} from '@nestjs/common';
import {
    DataSource,
    Repository,
    FindManyOptions,
    FindOneOptions,
    FindOptionsWhere,
    EntityManager,
    ObjectLiteral,
    DeepPartial,
} from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';

@Injectable()
export class DatabaseService {
    constructor(private readonly dataSource: DataSource) {}

    getRepository<T extends ObjectLiteral>(entity: new () => T): Repository<T> {
        return this.dataSource.getRepository(entity);
    }

    async findOne<T extends ObjectLiteral>(
        entity: new () => T,
        options: FindOneOptions<T> | FindOptionsWhere<T>,
        manager?: EntityManager,
    ): Promise<T | null> {
        const repo = (manager ?? this.dataSource).getRepository(entity);
        if ('where' in options) return repo.findOne(options as FindOneOptions<T>);
        return repo.findOne({ where: options as FindOptionsWhere<T> });
    }

    async findByUnique<T extends ObjectLiteral>(
        entity: new () => T,
        where: FindOptionsWhere<T>,
        manager?: EntityManager,
    ): Promise<T | null> {
        return (manager ?? this.dataSource).getRepository(entity).findOne({ where });
    }

    async findMany<T extends ObjectLiteral>(
        entity: new () => T,
        options?: FindManyOptions<T>,
        manager?: EntityManager,
    ): Promise<T[]> {
        return (manager ?? this.dataSource).getRepository(entity).find(options);
    }

    async paginate<T extends ObjectLiteral>(
        entity: new () => T,
        options: {
            page: number;
            limit: number;
            where?: FindOptionsWhere<T>;
            order?: FindManyOptions<T>['order'];
        },
        manager?: EntityManager,
    ): Promise<{ data: T[]; total: number; page: number; limit: number }> {
        const { page, limit, where, order } = options;
        const repo = (manager ?? this.dataSource).getRepository(entity);

        const [data, total] = await repo.findAndCount({
            where,
            order,
            take: limit,
            skip: (page - 1) * limit,
        });

        return { data, total, page, limit };
    }

    async save<T extends ObjectLiteral>(
        entity: new () => T,
        data: DeepPartial<T> | DeepPartial<T>[],
        manager?: EntityManager,
    ): Promise<T | T[]> {
        const repo = (manager ?? this.dataSource).getRepository(entity);

        if (Array.isArray(data)) {
            return repo.save(data as DeepPartial<T>[]);
        } else {
            return repo.save(data as DeepPartial<T>);
        }
    }

    async update<T extends ObjectLiteral>(
        entity: new () => T,
        criteria: FindOptionsWhere<T>,
        partialEntity: QueryDeepPartialEntity<T>,
        manager?: EntityManager,
    ): Promise<void> {
        await (manager ?? this.dataSource).getRepository(entity).update(criteria, partialEntity);
    }

    async upsert<T extends ObjectLiteral>(
        entity: new () => T,
        data: QueryDeepPartialEntity<T>,
        conflictPaths: (keyof T)[],
        manager?: EntityManager,
    ): Promise<void> {
        await (manager ?? this.dataSource)
            .getRepository(entity)
            .upsert(data, conflictPaths.map(String)); // ensure string[]
    }

    async delete<T extends ObjectLiteral>(
        entity: new () => T,
        criteria: FindOptionsWhere<T>,
        manager?: EntityManager,
    ): Promise<void> {
        await (manager ?? this.dataSource).getRepository(entity).delete(criteria);
    }

    async softDelete<T extends ObjectLiteral>(
        entity: new () => T,
        criteria: FindOptionsWhere<T>,
        manager?: EntityManager,
    ): Promise<void> {
        await (manager ?? this.dataSource).getRepository(entity).softDelete(criteria);
    }

    async count<T extends ObjectLiteral>(
        entity: new () => T,
        where?: FindOptionsWhere<T>,
        manager?: EntityManager,
    ): Promise<number> {
        return (manager ?? this.dataSource).getRepository(entity).count({ where });
    }

    async exists<T extends ObjectLiteral>(
        entity: new () => T,
        where: FindOptionsWhere<T>,
        manager?: EntityManager,
    ): Promise<boolean> {
        const count = await this.count(entity, where, manager);
        return count > 0;
    }

    async withTransaction<T>(operation: (manager: EntityManager) => Promise<T>): Promise<T> {
        try {
            return await this.dataSource.transaction(operation);
        } catch (err: any) {
            throw new InternalServerErrorException('Transaction failed', err?.message || err);
        }
    }
}
