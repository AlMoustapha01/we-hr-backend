import { BaseEntityProps } from './entity.base';
import { OrderBy, PaginatedQueryParams } from './repository.port';

/**
 * Base class for regular queries
 */
export abstract class QueryBase {}

/**
 * Base class for paginated queries
 */
export abstract class PaginatedQueryBase<P> extends QueryBase {
  limit: number;
  offset: number;
  orderBy: OrderBy<P extends BaseEntityProps ? P : never>;
  page: number;

  constructor(props: PaginatedParams<PaginatedQueryBase<P>, P>) {
    super();
    this.limit = props.limit || 20;
    this.offset = props.page ? props.page * this.limit : 0;
    this.page = props.page || 0;
    this.orderBy = props.orderBy || { field: true, param: 'DESC' };
  }
}

// Paginated query parameters
export type PaginatedParams<T, P> = Omit<
  T,
  'limit' | 'offset' | 'orderBy' | 'page'
> &
  Partial<Omit<PaginatedQueryParams<P>, 'offset'>>;
