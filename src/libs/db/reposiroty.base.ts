import { Propagation, runInTransaction } from 'typeorm-transactional';
import { LoggerPort } from '../ports/logger.port';
import { ObjectLiteral, Repository } from 'typeorm';
import { None, Option, Some } from 'oxide.ts';
import { RequestContextService } from '../application/context/AppRequestContext';
import {
  Operator,
  Paginated,
  PaginatedQueryParams,
  RepositoryPort,
} from '../domain/repository.port';
import { Mapper } from '../domain/mapper.interface';
import { ConflictException } from '../exceptions';
import {
  DATABASE_FOREIGN_KEY_VIOLATION_CODE,
  DATABASE_UNIQUE_VIOLATION_CODE,
} from '../exceptions/database.exceptions.code';
import { BaseEntity } from '../domain';

export abstract class RepositoryBase<
  Aggregate extends BaseEntity<any>,
  DbEntity extends ObjectLiteral,
> implements RepositoryPort<Aggregate>
{
  protected abstract tableName: string;

  constructor(
    private readonly repository: Repository<DbEntity>,
    protected readonly mapper: Mapper<Aggregate, DbEntity>,
    protected readonly logger: LoggerPort,
  ) {}

  async insert(entity: Aggregate | Aggregate[]): Promise<void> {
    const entities = Array.isArray(entity) ? entity : [entity];

    entities.forEach((entity) => entity.validate());

    this.logger.debug(
      `[${RequestContextService.getRequestId() || 'unknown'}] writing ${
        entities.length
      } entities to "${this.tableName}" table: ${entities
        .map((e) => e.id)
        .join(', ')}`,
    );

    const records = entities.map((entity) => this.mapper.toPersistence(entity));

    try {
      await this.repository
        .createQueryBuilder(this.tableName)
        .insert()
        .values(records)
        .execute();
    } catch (error) {
      if (
        error.code === DATABASE_UNIQUE_VIOLATION_CODE ||
        error.code === DATABASE_FOREIGN_KEY_VIOLATION_CODE
      ) {
        this.logger.debug(
          `[${RequestContextService.getRequestId() || 'unknown'}] ${error.detail}`,
        );
        throw new ConflictException('Record already exists', error);
      }
      this.logger.error(
        `[${RequestContextService.getRequestId() || 'unknown'}] ${error.code} ${error.detail}`,
      );
      throw error;
    }
  }

  async findOneById(id: string): Promise<Option<Aggregate>> {
    const result = await this.repository
      .createQueryBuilder(this.tableName)
      .where(`${this.tableName}.id = :id`, { id })
      .getOne();

    return result ? Some(this.mapper.toDomain(result)) : None;
  }

  async findAll(): Promise<Aggregate[]> {
    const results = await this.repository
      .createQueryBuilder(this.tableName)
      .getMany();

    return results.map((result) => this.mapper.toDomain(result));
  }

  async findManyByCondition<T>(
    column: keyof T,
    value: string,
  ): Promise<Aggregate[]> {
    const results = await this.repository
      .createQueryBuilder(this.tableName)
      .where(`${this.tableName}.${String(column)}= :value`, { value })
      .getMany();

    return results.map((result) => this.mapper.toDomain(result));
  }

  async findAllPaginated<T>(
    params: PaginatedQueryParams<T>,
  ): Promise<Paginated<Aggregate>> {
    this.logger.debug(
      `[${RequestContextService.getRequestId() || 'unknown'}] findAllPaginated: ${JSON.stringify(params)}`,
    );
    const page = params.page ?? 1;
    const limit = params.limit ?? 10;

    const countQuery = this.repository.createQueryBuilder(this.tableName);

    const query = this.repository
      .createQueryBuilder(this.tableName)
      .skip((page - 1) * limit)
      .take(limit);

    // Apply ordering if provided
    if (params.orderBy?.field) {
      const orderField =
        params.orderBy.field === true
          ? `${this.tableName}.id` // Default ordering by ID
          : `${this.tableName}.${String(params.orderBy.field)}`;

      query.orderBy(orderField, params.orderBy.param ?? 'ASC');
    }

    // Apply filtering if filters exist
    if (params.filterBy?.length) {
      params.filterBy.forEach((filter, index) => {
        const paramKey = `filter${index}`;
        const whereMethod = index === 0 ? 'where' : 'andWhere';
        const fieldPath = `${this.tableName}.${String(filter.field)}`;

        switch (filter.operator) {
          case Operator.EQUALS:
          case Operator.IN:
            query[whereMethod](`${fieldPath} IN (:...${paramKey})`, {
              [paramKey]: Array.isArray(filter.value)
                ? filter.value
                : [filter.value],
            });
            countQuery[whereMethod](`${fieldPath} IN (:...${paramKey})`, {
              [paramKey]: Array.isArray(filter.value)
                ? filter.value
                : [filter.value],
            });
            break;

          case Operator.NOT_EQUALS:
          case Operator.NOT_IN:
            query[whereMethod](`${fieldPath} NOT IN (:...${paramKey})`, {
              [paramKey]: Array.isArray(filter.value)
                ? filter.value
                : [filter.value],
            });
            countQuery[whereMethod](`${fieldPath} NOT IN (:...${paramKey})`, {
              [paramKey]: Array.isArray(filter.value)
                ? filter.value
                : [filter.value],
            });
            break;

          case Operator.LESS_THAN:
            query[whereMethod](`${fieldPath} < :${paramKey}`, {
              [paramKey]: filter.value,
            });
            countQuery[whereMethod](`${fieldPath} < :${paramKey}`, {
              [paramKey]: filter.value,
            });
            break;

          case Operator.LESS_THAN_OR_EQUAL:
            query[whereMethod](`${fieldPath} <= :${paramKey}`, {
              [paramKey]: filter.value,
            });
            countQuery[whereMethod](`${fieldPath} <= :${paramKey}`, {
              [paramKey]: filter.value,
            });
            break;

          case Operator.GREATER_THAN:
            query[whereMethod](`${fieldPath} > :${paramKey}`, {
              [paramKey]: filter.value,
            });
            countQuery[whereMethod](`${fieldPath} > :${paramKey}`, {
              [paramKey]: filter.value,
            });
            break;

          case Operator.GREATER_THAN_OR_EQUAL:
            query[whereMethod](`${fieldPath} >= :${paramKey}`, {
              [paramKey]: filter.value,
            });
            countQuery[whereMethod](`${fieldPath} >= :${paramKey}`, {
              [paramKey]: filter.value,
            });
            break;

          case Operator.CONTAINS:
            query[whereMethod](`${fieldPath} LIKE :${paramKey}`, {
              [paramKey]: `%${String(filter.value)}%`,
            });
            countQuery[whereMethod](`${fieldPath} LIKE :${paramKey}`, {
              [paramKey]: `%${String(filter.value)}%`,
            });
            break;

          case Operator.NOT_CONTAINS:
            query[whereMethod](`${fieldPath} NOT LIKE :${paramKey}`, {
              [paramKey]: `%${String(filter.value)}%`,
            });
            countQuery[whereMethod](`${fieldPath} NOT LIKE :${paramKey}`, {
              [paramKey]: `%${String(filter.value)}%`,
            });
            break;

          case Operator.STARTS_WITH:
            query[whereMethod](`${fieldPath} LIKE :${paramKey}`, {
              [paramKey]: `${String(filter.value)}%`,
            });
            countQuery[whereMethod](`${fieldPath} LIKE :${paramKey}`, {
              [paramKey]: `${String(filter.value)}%`,
            });
            break;

          case Operator.ENDS_WITH:
            query[whereMethod](`${fieldPath} LIKE :${paramKey}`, {
              [paramKey]: `%${String(filter.value)}`,
            });
            countQuery[whereMethod](`${fieldPath} LIKE :${paramKey}`, {
              [paramKey]: `%${String(filter.value)}`,
            });
            break;

          case Operator.NULL:
            query[whereMethod](`${fieldPath} IS NULL`);
            countQuery[whereMethod](`${fieldPath} IS NULL`);
            break;

          case Operator.NOT_NULL:
            query[whereMethod](`${fieldPath} IS NOT NULL`);
            countQuery[whereMethod](`${fieldPath} IS NOT NULL`);
            break;

          case Operator.BETWEEN: {
            if (!Array.isArray(filter.value) || filter.value.length !== 2) {
              throw new Error(
                'BETWEEN operator requires an array with exactly 2 values',
              );
            }
            const startParam = `${paramKey}Start`;
            const endParam = `${paramKey}End`;
            query[whereMethod](
              `${fieldPath} BETWEEN :${startParam} AND :${endParam}`,
              {
                [startParam]: filter.value[0],
                [endParam]: filter.value[1],
              },
            );
            countQuery[whereMethod](
              `${fieldPath} BETWEEN :${startParam} AND :${endParam}`,
              {
                [startParam]: filter.value[0],
                [endParam]: filter.value[1],
              },
            );
            break;
          }

          default:
            throw new Error(`Unsupported operator: ${String(filter.operator)}`);
        }
      });
    }

    const results = await query.getMany();

    const entities = results.map((result) => this.mapper.toDomain(result));

    const count = await countQuery.getCount();

    return new Paginated({
      data: entities,
      limit: limit,
      page: page,
      count: count,
    });
  }

  async save(entity: Aggregate): Promise<void> {
    entity.validate();
    const dbModel = this.mapper.toPersistence(entity);

    this.logger.debug(
      `[${RequestContextService.getRequestId() || 'unknown'}] updating entity ${
        entity.id
      } in "${this.tableName}" table`,
    );

    await this.repository.save(dbModel);
  }

  async delete(entity: Aggregate): Promise<boolean> {
    entity.validate();
    const dbModel = this.mapper.toPersistence(entity);

    this.logger.debug(
      `[${RequestContextService.getRequestId()}] deleting entities ${
        entity.id
      } from ${this.tableName}`,
    );

    const result = await this.repository
      .createQueryBuilder(this.tableName)
      .delete()
      .where('id = :id', { id: dbModel.id })
      .execute();

    return (result.affected ?? 0) > 0;
  }

  async transaction<T>(handler: () => Promise<T>): Promise<T> {
    return runInTransaction(handler, { propagation: Propagation.REQUIRES_NEW });
  }
}
