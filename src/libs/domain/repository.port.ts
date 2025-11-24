import { Option } from 'oxide.ts';

/*  Most of repositories will probably need generic 
    save/find/delete operations, so it's easier
    to have some shared interfaces.
    More specific queries should be defined
    in a respective repository.
*/

export enum Operator {
  EQUALS = 'EQUALS',
  NOT_EQUALS = 'NOT_EQUALS',
  IN = 'IN',
  NOT_IN = 'NOT_IN',
  BETWEEN = 'BETWEEN',
  LESS_THAN = 'LESS_THAN',
  LESS_THAN_OR_EQUAL = 'LESS_THAN_OR_EQUAL',
  GREATER_THAN = 'GREATER_THAN',
  GREATER_THAN_OR_EQUAL = 'GREATER_THAN_OR_EQUAL',
  CONTAINS = 'CONTAINS',
  NOT_CONTAINS = 'NOT_CONTAINS',
  STARTS_WITH = 'STARTS_WITH',
  ENDS_WITH = 'ENDS_WITH',
  NULL = 'NULL',
  NOT_NULL = 'NOT_NULL',
}

export class Paginated<T> {
  readonly count: number;
  readonly limit: number;
  readonly page: number;
  readonly data: readonly T[];

  constructor(props: Paginated<T>) {
    this.count = props.count;
    this.limit = props.limit;
    this.page = props.page;
    this.data = props.data;
  }
}

export type OrderBy<T> = { field: keyof T | true; param: 'ASC' | 'DESC' };
export type FilterBy<T> = {
  field: keyof T;
  operator: Operator;
  value:
    | string
    | string[]
    | number
    | number[]
    | Date
    | Date[]
    | boolean
    | boolean[]
    | undefined;
}[];

export type PaginatedQueryParams<T> = {
  limit?: number;
  page?: number;
  filterBy?: FilterBy<T>;
  orderBy: OrderBy<T>;
};

export interface RepositoryPort<Entity> {
  insert(entity: Entity | Entity[]): Promise<void>;
  save(entity: Entity): Promise<void>;
  findOneById(id: string): Promise<Option<Entity>>;
  findManyByCondition<T>(
    column: keyof T,
    value: string | string[],
  ): Promise<Entity[]>;
  findAll(): Promise<Entity[]>;
  findAllPaginated<T>(
    params: PaginatedQueryParams<T>,
  ): Promise<Paginated<Entity>>;
  delete(entity: Entity): Promise<boolean>;

  transaction<T>(handler: () => Promise<T>): Promise<T>;
}
